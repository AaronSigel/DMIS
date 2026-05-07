# DMIS Stage Smoke Runbook (MVP)

Короткий runbook для smoke-проверки stage-like окружения (одна VM) через `docker compose`.

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

Остановка:

```bash
cd infra
docker compose down
```

Полный сброс данных (только при необходимости):

```bash
cd infra
docker compose down -v
```

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
5. Проверить observability endpoints:
   - Prometheus: `http://<vm-host>:9090`
   - Grafana: `http://<vm-host>:3000`
6. Проверить, что backend в `healthy`:
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
   docker compose logs --tail=200 postgres minio ai-service embeddings-service clamav
   ```
3. Перезапуск проблемного сервиса:
   ```bash
   cd infra
   docker compose restart <service_name>
   ```
