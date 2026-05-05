# DMIS MVP

Monorepo MVP for a controlled AI-driven document workflow system.

## Modules

- `backend` - Spring Boot core business logic, ACL, audit, orchestration.
- `frontend` - React TypeScript workspace UI.
- `ai-service` - Python LLM inference service for RAG completion.
- `embeddings-service` - Python embeddings service for document indexing and retrieval.
- `stt-service` - Python STT service (Whisper).
- `infra` - Local infrastructure manifests.
- `docs` - API and architecture notes.

Canonical service contour is documented in `docs/architecture/service-contour.md`.

## Core Flow

All write actions follow:

`intent -> entities -> ACL -> draft -> confirmation -> execution -> audit`

## Quick Start (docker-first)

From the **repository root**:

1. `cd infra && cp .env.example .env`
2. Fill required secrets in `infra/.env`:
   - `DB_PASSWORD` and `POSTGRES_PASSWORD` (keep equal unless you intentionally split DB users)
   - `JWT_SECRET`
   - `MINIO_SECRET_KEY`
   - `MINIO_ROOT_PASSWORD`
   - `OPENROUTER_API_KEY` (required when `AI_PROVIDER=openrouter`)
3. `make up` (runs `docker compose up -d --build` in `infra/`)
4. `make smoke` (runs `infra/smoke.sh`)
5. Open frontend: `http://localhost:5173`
6. Use demo login: `admin@dmis.local` / `demo`

Shut down: `make down` from the repo root.

For a clean restart from zero data:

- `cd infra && docker compose down -v`
- `make up`
- `make smoke`

### Local frontend dev (`npm run dev`)

Run the backend on `:8080`, then in `frontend/` run `npm run dev`. The UI uses `VITE_API_BASE_URL` (defaults to `http://localhost:8080/api`); CORS is enabled for typical Vite dev origins. Vite also proxies `/api` to `http://localhost:8080` for optional same-origin setups.

### Health checks (smoke)

- Backend: `GET http://localhost:8080/api/health`

## Backend profiles

- `demo` (default in `infra/.env.example`) - enables demo bootstrap users.
- `dev` - local developer profile.
- `test` - integration/unit test profile.

Profile can be switched with `SPRING_PROFILES_ACTIVE`.

## Runtime endpoints

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- AI service: `http://localhost:8002`
- Embeddings service: `http://localhost:8001`
- STT service: `http://localhost:8000`

Per-service `.env.example` stubs (for running containers or Python services outside compose) live next to each service; the full stack list remains in `infra/.env.example`.
