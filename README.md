# DMIS MVP

Monorepo MVP for a controlled AI-driven document workflow system.

## Modules

- `backend` - Spring Boot core business logic, ACL, audit, orchestration.
- `frontend` - React TypeScript workspace UI.
- `mcp` - MCP tools facade over backend HTTP API.
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

1. `cd infra`
2. `cp .env.example .env`
3. Fill required secrets in `.env`:
   - `DB_PASSWORD` and `POSTGRES_PASSWORD` (keep equal unless you intentionally split DB users)
   - `JWT_SECRET`
   - `MINIO_SECRET_KEY`
   - `MINIO_ROOT_PASSWORD`
   - `OPENROUTER_API_KEY` (required when `AI_PROVIDER=openrouter`)
4. `docker compose up --build`
5. Run startup smoke-check: `bash smoke.sh`
6. Open frontend: `http://localhost:5173`
7. Use demo login: `admin@dmis.local` / `demo`

For a clean restart from zero data:

- `docker compose down -v`
- `docker compose up --build`
- `bash smoke.sh`

## Backend profiles

- `demo` (default in `infra/.env.example`) - enables demo bootstrap users.
- `dev` - local developer profile.
- `test` - integration/unit test profile.

Profile can be switched with `SPRING_PROFILES_ACTIVE`.

## Runtime endpoints

- Frontend: `http://localhost:5173`
- MCP: `http://localhost:8090`
- Backend: `http://localhost:8080`
- AI service: `http://localhost:8002`
- Embeddings service: `http://localhost:8001`
- STT service: `http://localhost:8000`
