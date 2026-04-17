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
2. `docker compose up --build`
3. Open frontend: `http://localhost:5173`
4. Use demo login: `admin@dmis.local` / `demo`

## Runtime endpoints

- Frontend: `http://localhost:5173`
- MCP: `http://localhost:8090`
- Backend: `http://localhost:8080`
- AI service: `http://localhost:8002`
- Embeddings service: `http://localhost:8001`
- STT service: `http://localhost:8000`
