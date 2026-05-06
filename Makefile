.PHONY: up down smoke test build lint daily-summary

up:
	cd infra && docker compose up -d --build

down:
	cd infra && docker compose down

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
