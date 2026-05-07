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

## Frontend layout

`frontend/src/` follows the target layered layout (see also `App.tsx` header
comment):

- `pages/` — top-level screens (`LoginPage`, `WorkspacePage`, `DashboardPage`,
  `DocumentCardPage`, `SettingsPage`, `StaticPage`).
- `features/` — feature-scoped business logic and UI:
  - `auth/` — `useSession` hook and related auth helpers.
  - `assistant/` — AI side panel, citations.
  - `documents/` — document list/table and operations.
  - `actions/` — AI action cards and confirmation flow.
- `shared/` — reusable infrastructure:
  - `api/` — `apiClient` wrappers, React Query client, Zod schemas.
  - `ui/` — UI primitives (`Avatar`, `StatusBadge`, toast, etc.).
  - `sse/` — SSE hooks for assistant streaming.
  - `store/` — Zustand stores (UI state only).
- `entities/` — domain types (`DocumentView`, `Citation`, etc.).

`App.tsx` is intentionally thin: it only wires providers and toggles
`LoginPage` / `WorkspacePage` based on `useSession` state. All screen-level
business logic lives in `features/` or the corresponding `pages/` entry.

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

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Jobs:
- `backend` - `cd backend && ./mvnw -B test` (blocking).
- `frontend` - `cd frontend && npm ci && npm run typecheck && npm run build` (blocking).
- `infra-validate` - `docker compose -f infra/docker-compose.yml config` (blocking).
- `db-migrations` - applies Flyway migrations on a clean Postgres (blocking).
- `lint` - runs frontend eslint and backend checkstyle as informational checks (`continue-on-error: true`).

Merge is blocked by failing `backend`, `frontend`, `infra-validate`, and `db-migrations` jobs.
`lint` is visible in logs but does not block merge.

### Frontend bundle report (informational)

- In `frontend` job CI runs `npm run build:report` after build and writes table to GitHub Actions Summary.
- The report shows chunk sizes (`raw` and `gzip`) and total gzip to detect abnormal growth.
- There is no hard budget gate: bundle size itself does not fail the pipeline.
- Local run: `cd frontend && npm run build:report`.
- Detailed visualizer output is created locally at `frontend/dist/stats.html`.

Local reproduction:
- Backend tests: `cd backend && ./mvnw -B test`
- Frontend build: `cd frontend && npm ci && npm run typecheck && npm run build`
- Frontend bundle report: `cd frontend && npm ci && npm run build:report`
- Frontend lint: `cd frontend && npm ci && npm run lint`
- Backend checkstyle: `cd backend && ./mvnw -B checkstyle:check`
- Compose validation: `docker compose -f infra/docker-compose.yml config`
- Migrations: `cd backend && ./mvnw -B flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/dmis_ci -Dflyway.user=dmis -Dflyway.password=dmis -Dflyway.locations=classpath:db/migration/common,classpath:db/migration/postgresql`
