# DMIS Lightweight Runbook (MVP)

Короткий runbook для smoke-проверки lightweight окружения через `docker compose`.

## 1) Подготовка окружения

Из корня репозитория:

```bash
cd infra
cp .env.example .env
```

Заполнить минимум обязательных переменных в `.env`:

- `DB_PASSWORD`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `MINIO_SECRET_KEY`
- `MINIO_ROOT_PASSWORD`
- `OPENROUTER_API_KEY` (если `AI_PROVIDER=openrouter`)

## 2) Запуск / остановка

Запуск:

```bash
cd infra
docker compose up -d --build
```

Единая команда для полного стека (main + lightweight mail/calendar):

```bash
cd infra
./scripts/stack.sh up -d --build
```

Остановка:

```bash
cd infra
docker compose down
```

Остановка полного стека через единый скрипт:

```bash
cd infra
./scripts/stack.sh down
```

Проверка merged-конфига полного стека:

```bash
cd infra
./scripts/stack.sh config
```

Полный сброс персистентных данных (PostgreSQL, MinIO, Prometheus, Grafana):

```bash
# из корня репозитория (по умолчанию make down тома не трогает)
make down CLEAN_DATA=1
# или короткий алиас:
make clean-data
```

Эквивалент: `cd infra && docker compose down -v`. После следующего `make up` Flyway создаёт схему заново.

В профиле **`demo`** при первом старте снова выполняются только автозасев пользователей (`DataBootstrap`) и демо-документов (`demoContentBootstrap`). Если нужна «пустая» БД только со схемой и без демо-контента и без учёток bootstrap — запускайте backend с **`SPRING_PROFILES_ACTIVE=dev`** и создавайте пользователей отдельно (или временно меняйте профиль в `infra/.env`).

## 3) Smoke checklist

Проверять по порядку после `up -d --build`.

1. Убедиться, что контейнеры поднялись:
   ```bash
   cd infra
   docker compose ps
   ```
2. Проверить frontend:
   - Открыть `http://<vm-host>:5173`
3. Проверить backend health:
   ```bash
   curl -fsS "http://<vm-host>:8080/api/health"
   ```
4. Проверить AI-сервисы:
   ```bash
   curl -fsS "http://<vm-host>:8002/health"   # ai-service
   curl -fsS "http://<vm-host>:8001/health"   # embeddings-service
   curl -fsS "http://<vm-host>:8000/health"   # stt-service
   ```
5. Проверить lightweight mail/calendar:
   - Mailpit UI: `http://<vm-host>:8025`
   - Radicale: `http://<vm-host>:5232`
6. Проверить observability endpoints:
   - Prometheus: `http://<vm-host>:9090`
   - Grafana: `http://<vm-host>:3000`
7. Проверить, что backend в `healthy`:
   ```bash
   cd infra
   docker compose ps backend
   ```

## 4) Базовая диагностика при падении smoke

1. Логи backend:
   ```bash
   cd infra
   docker compose logs --tail=200 backend
   ```
2. Логи зависимостей backend:
   ```bash
   cd infra
  docker compose logs --tail=200 postgres minio ai-service embeddings-service clamav mailpit radicale
   ```
3. Перезапуск проблемного сервиса:
   ```bash
   cd infra
   docker compose restart <service_name>
   ```

## 5) MVP smoke (документ → AI → письмо)

Короткий e2e-сценарий для финальной проверки ключевого MVP-пути после `up -d --build`.
Демо-данные засеваются автоматически в профиле `demo` (`DmisBackendApplication.demoContentBootstrap`).

1. Открыть `http://<vm-host>:5173`, войти как `admin@example.com` / `demo`.
2. Перейти в «Документы», нажать кнопку «Архив» — в списке должен остаться
   только `Старый отчёт 2024 Q3` (тег `archive`). URL: `/documents?archive=1`.
   Снять «Архив» — снова видны все демо-документы.
3. Открыть `Контракт NDA с подрядчиком` (карточка документа).
4. На карточке нажать «Спросить AI…» — в правой AI-панели должен появиться
   ответ ассистента.
5. В AI-панели нажать «Создать письмо из ответа AI», ввести получателя
   `@analyst`, нажать «Создать draft», затем «Подтвердить» и «Выполнить».
6. Перейти в «Журнал аудита» (admin) — событие `send_email` со статусом
   `EXECUTED` должно быть в списке.

Если какой-либо шаг падает, см. п.4 «Базовая диагностика».
