# DMIS MVP

DMIS — монорепозиторий MVP корпоративной системы информационного документооборота с AI как интерфейсом и контролируемыми действиями.

Проект не является чат-ботом. Все изменения данных проходят через backend и фиксируются в аудите.

Основная цепочка мутаций:

`intent → entities → ACL → draft → confirmation → execution → audit`

Обязательный поток вызовов:

`Frontend → Backend → Services`

Канонический контур сервисов описан в [`docs/architecture/service-contour.md`](docs/architecture/service-contour.md).

## Модули репозитория

- `backend` — Spring Boot: бизнес-логика, ACL, audit, оркестрация.
- `frontend` — React + TypeScript, пользовательский интерфейс.
- `ai-service` — Python-сервис LLM-инференса для чата и RAG.
- `embeddings-service` — Python-сервис эмбеддингов и rerank для поиска.
- `stt-service` — Python-сервис распознавания речи на базе Whisper.
- `infra` — Docker Compose, smoke-проверки, seed-данные, observability.
- `mcp-server` — MCP-инструменты, которые обращаются к системе только через backend API.
- `docs` — заметки по API и архитектуре.
- `e2e` и `playwright-tests` — E2E-проверки.

## Структура frontend

`frontend/src/` следует слоистой структуре, которая также кратко описана в заголовочном комментарии `App.tsx`:

- `pages/` — экраны верхнего уровня (`LoginPage`, `WorkspacePage`, `DashboardPage`, `DocumentCardPage`, `SettingsPage`, `StaticPage`).
- `features/` — бизнес-логика и UI отдельных фич:
  - `auth/` — `useSession` и связанные auth-хелперы;
  - `assistant/` — AI-панель, цитаты, история тредов;
  - `documents/` — список документов и операции с ними;
  - `actions/` — карточки AI-действий и подтверждение;
  - `mail/` — почтовый интерфейс;
  - `calendar/` — календарь и события;
  - `audit/` — журнал аудита.
- `shared/` — переиспользуемая инфраструктура:
  - `api/` — обёртки API-клиента, React Query client, Zod-схемы;
  - `ui/` — UI-примитивы;
  - `sse/` — SSE-хуки для streaming-ответов ассистента;
  - `store/` — Zustand-сторы только для состояния UI.
- `entities/` — типы доменных моделей (`DocumentView`, `Citation` и т. п.).

`App.tsx` остаётся тонким: он подключает провайдеры и переключает `LoginPage` / `WorkspacePage` на основе состояния `useSession`. Экранная бизнес-логика находится в `features/` или соответствующем входе из `pages/`.

## Почта и календарь в локальном стенде

В локальном MVP исходящие письма отправляются через SMTP в Mailpit, а входящие письма и черновики отображаются через backend и Mailpit API. События календаря и free/busy берутся из данных backend в PostgreSQL.

Целевой продакшен-контур для почты и календаря — mailcow + SOGo, но локальный compose-стенд использует Mailpit и хранение событий в БД.

## Быстрый старт через Docker

Из корня репозитория:

1. Скопируйте пример окружения: `cd infra && cp .env.example .env`.
2. Заполните обязательные секреты в `infra/.env`:
   - `DB_PASSWORD` и `POSTGRES_PASSWORD` — держите одинаковыми, если осознанно не разделяете пользователей БД;
   - `JWT_SECRET`;
   - `MINIO_SECRET_KEY`;
   - `MINIO_ROOT_PASSWORD`;
   - `OPENROUTER_API_KEY` — нужен, если `AI_PROVIDER=openrouter`.
3. Запустите стек: `make up`.
4. Проверьте стенд: `make smoke`.
5. Откройте frontend: `http://localhost:5173`.
6. Войдите под демо-пользователем: `admin@example.com` / `demo`.

Дополнительные демо-пользователи используют пароль `demo` и домен из `DMIS_DEMO_EMAIL_DOMAIN` в `infra/.env` (`example.com` по умолчанию): `analyst@…`, `reviewer@…`, `manager@…`.

Подробный runbook для локального стенда находится в [`infra/README.md`](infra/README.md).

### Демо-данные

После `make up` и готовности backend:

```bash
make seed-demo
```

Скрипт [`infra/scripts/seed-demo-data.sh`](infra/scripts/seed-demo-data.sh) идемпотентно создаёт данные для ручной проверки стенда: `.txt` документы в MinIO через API, несколько событий календаря, входящие письма в Mailpit, черновики писем, треды ассистента и один draft AI-действия без выполнения. Повторный запуск не дублирует те же сущности.

После засева в UI можно проверить:

- документы: demo-документы из bootstrap и seed-файлы `dmis-seed-*`;
- почту: входящие с темой `[DMIS seed]` и черновики в папке `DRAFT`;
- календарь: события `DMIS seed — ...` с разными датами и участниками;
- ассистента: `thread-demo-1` с историей и треды `[DMIS seed] ...`;
- действия: draft `send_email`, ожидающий подтверждения.

Для опциональной проверки RAG-запроса в ассистентском треде:

```bash
DMIS_SEED_ASSISTANT_RAG=1 make seed-demo
```

Содержимое Mailpit при пересоздании контейнера без тома сбрасывается.

### Остановка и сброс данных

Остановить стек из корня репозитория:

```bash
make down
```

По умолчанию тома PostgreSQL, MinIO, Prometheus и Grafana сохраняются.

Полный сброс персистентных данных:

- `make down CLEAN_DATA=1` или `make clean-data` — удаляет тома `postgres_data`, `minio_data`, `prometheus_data`, `grafana_data`;
- затем `make up` и при необходимости `make smoke`.

После полного сброса PostgreSQL поднимается «с нуля»: Flyway создаёт схему заново. В профиле `demo` снова создаются bootstrap-пользователи из `DataBootstrap` (`admin`, `analyst`, `reviewer`, `manager`, пароль `demo`) и базовые демо-данные, но без ваших документов и логов. Mailpit в compose без именованного тома: его содержимое сбрасывается при пересоздании контейнера.

### Локальная разработка frontend

Запустите backend на `:8080`, затем в `frontend/` выполните:

```bash
npm run dev
```

UI использует `VITE_API_BASE_URL` (`http://localhost:8080/api` по умолчанию для локальной разработки). CORS включён для типичных Vite-origin, а Vite также проксирует `/api` на `http://localhost:8080` для сценариев с тем же origin.

## Команды Make

| Команда | Назначение |
| --- | --- |
| `make up` | Собрать и поднять compose-стек. |
| `make down` | Остановить compose-стек без удаления томов. |
| `make clean-data` | Остановить стек и удалить персистентные тома. |
| `make smoke` | Запустить smoke-проверку сервисов и базового сценария. |
| `make seed-demo` | Засеять расширенные демо-данные. |
| `make test` | Запустить backend-тесты. |
| `make build` | Собрать backend и frontend. |
| `make lint` | Запустить frontend lint. |
| `make e2e` | Запустить E2E-тесты. |
| `make e2e-headed` | Запустить E2E-тесты в headed-режиме. |
| `make e2e-install` | Установить зависимости для E2E. |
| `make daily-summary` | Запустить скрипт дневной сводки. |

## Точки доступа

| Сервис | URL |
| --- | --- |
| Интерфейс frontend | `http://localhost:5173` |
| API backend | `http://localhost:8080/api` |
| Проверка backend | `GET http://localhost:8080/api/health` |
| Интерфейс Mailpit | `http://localhost:8025` |
| SMTP Mailpit | `127.0.0.1:1025` |
| MinIO API | `http://localhost:9000` |
| Консоль MinIO | `http://localhost:9001` |
| AI-сервис | `http://localhost:8002` |
| Сервис эмбеддингов | `http://localhost:8001` |
| STT-сервис | `http://localhost:8000` |
| Prometheus | `http://localhost:9090` |
| Grafana | `http://localhost:3000` |

Полный список переменных окружения для compose-стенда находится в [`infra/.env.example`](infra/.env.example). Короткие `.env.example` для запуска отдельных Python-сервисов вне compose лежат рядом с этими сервисами.

## Профили backend

- `demo` — профиль по умолчанию в `infra/.env.example`, включает bootstrap-пользователей и демо-контент.
- `dev` — локальный профиль разработчика.
- `test` — профиль для unit- и integration-тестов.

Профиль переключается через `SPRING_PROFILES_ACTIVE`.

## CI

Файл процесса CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Проверки GitHub Actions:

- `backend` — `cd backend && ./mvnw -B test`, блокирует слияние.
- `frontend` — `cd frontend && npm ci && npm run typecheck && npm run build`, блокирует слияние.
- `infra-validate` — `docker compose -f infra/docker-compose.yml config`, блокирует слияние.
- `db-migrations` — применяет Flyway-миграции на чистом PostgreSQL, блокирует слияние.
- `lint` — запускает frontend eslint и backend checkstyle как информационные проверки (`continue-on-error: true`).

Слияние блокируется падением `backend`, `frontend`, `infra-validate` или `db-migrations`. Проверка `lint` видна в логах, но не блокирует слияние.

### Отчёт о размере frontend-бандла

В CI задача `frontend` после сборки запускает `npm run build:report` и пишет таблицу в GitHub Actions Summary. Отчёт показывает размеры чанков (`raw` и `gzip`) и общий `gzip`, чтобы замечать аномальный рост.

Жёсткого бюджетного порога нет: размер бандла сам по себе не валит пайплайн.

Локальный запуск:

```bash
cd frontend && npm run build:report
```

Детальный отчёт визуализатора локально создаётся в `frontend/dist/stats.html`.

### Локальное воспроизведение CI

- Тесты backend: `cd backend && ./mvnw -B test`
- Сборка frontend: `cd frontend && npm ci && npm run typecheck && npm run build`
- Отчёт о frontend-бандле: `cd frontend && npm ci && npm run build:report`
- Проверка lint frontend: `cd frontend && npm ci && npm run lint`
- Проверка checkstyle backend: `cd backend && ./mvnw -B checkstyle:check`
- Проверка compose: `docker compose -f infra/docker-compose.yml config`
- Миграции: `cd backend && ./mvnw -B flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/dmis_ci -Dflyway.user=dmis -Dflyway.password=dmis -Dflyway.locations=classpath:db/migration/common,classpath:db/migration/postgresql`
