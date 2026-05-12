.PHONY: up down clean-data smoke test build lint daily-summary

# Остановка стека: по умолчанию тома PostgreSQL/MinIO/Prometheus/Grafana сохраняются.
# Удалить тома (полный сброс данных): make down CLEAN_DATA=1
# Краткий алиас: make clean-data
up:
	cd infra && docker compose up -d --build

down:
	cd infra && docker compose down $$([ "$(CLEAN_DATA)" = "1" ] && echo "-v" || true)

clean-data:
	@$(MAKE) down CLEAN_DATA=1

smoke:
	bash infra/smoke.sh

test:
	cd backend && mvn test

build:
	cd backend && mvn package -DskipTests
	cd frontend && npm ci && npm run build

lint:
	cd frontend && npm run lint

daily-summary:
	bash scripts/daily-summary.sh
