#!/usr/bin/env bash
set -euo pipefail

BASE_BACKEND="${BASE_BACKEND:-http://localhost:8080}"
BASE_MCP="${BASE_MCP:-http://localhost:8090}"
BASE_STT="${BASE_STT:-http://localhost:8000}"
BASE_EMBEDDINGS="${BASE_EMBEDDINGS:-http://localhost:8001}"
BASE_AI="${BASE_AI:-http://localhost:8002}"
BASE_FRONTEND="${BASE_FRONTEND:-http://localhost:5173}"

wait_for() {
  local url="$1"
  local name="$2"
  local max_attempts="${3:-30}"
  local sleep_seconds="${4:-2}"
  local attempt=1
  while (( attempt <= max_attempts )); do
    if curl -fsS "$url" >/dev/null; then
      echo "OK: ${name}"
      return 0
    fi
    sleep "$sleep_seconds"
    ((attempt++))
  done
  echo "FAILED: ${name} (${url})"
  return 1
}

echo "Checking service health..."
wait_for "${BASE_BACKEND}/api/health" "backend /api/health"
wait_for "${BASE_MCP}/resources/health" "mcp /resources/health"
wait_for "${BASE_STT}/health" "stt-service /health"
wait_for "${BASE_EMBEDDINGS}/health" "embeddings-service /health"
wait_for "${BASE_AI}/health" "ai-service /health"
wait_for "${BASE_FRONTEND}/" "frontend /"

echo "Login + flow smoke scenario..."
LOGIN_JSON=$(curl -fsS -X POST "${BASE_BACKEND}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dmis.local","password":"demo"}')

TOKEN=$(echo "$LOGIN_JSON" | sed -E 's/.*"token":"([^"]+)".*/\1/')

curl -fsS "${BASE_BACKEND}/api/users/me" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

ACTION_JSON=$(curl -fsS -X POST "${BASE_BACKEND}/api/actions/draft" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"intent":"send_mail","entities":{"to":"demo@example.com"}}')

ACTION_ID=$(echo "$ACTION_JSON" | sed -E 's/.*"id":"([^"]+)".*/\1/')
test -n "${ACTION_ID}"

curl -fsS "${BASE_BACKEND}/api/audit" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

echo "Smoke passed."
