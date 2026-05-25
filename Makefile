.PHONY: up down clean-data smoke seed-demo test build lint daily-summary e2e e2e-headed e2e-install e2e-ai-context

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

seed-demo:
	bash infra/scripts/seed-demo-data.sh

test:
	cd backend && mvn test

build:
	cd backend && mvn package -DskipTests
	cd frontend && npm ci && npm run build

lint:
	cd frontend && npm run lint

daily-summary:
	bash scripts/daily-summary.sh

e2e:
	npm run e2e

e2e-headed:
	npm run e2e:headed

e2e-install:
	npm run e2e:install
	venv/bin/python -m playwright install chromium

e2e-ai-context:
	@$(MAKE) smoke
	PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 API_BASE_URL=http://127.0.0.1:8080 CI=1 \
		./node_modules/.bin/playwright test --config playwright.config.ts
