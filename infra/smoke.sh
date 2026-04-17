#!/usr/bin/env bash
set -euo pipefail

BASE_BACKEND="${BASE_BACKEND:-http://localhost:8080}"
BASE_MCP="${BASE_MCP:-http://localhost:8090}"
BASE_STT="${BASE_STT:-http://localhost:8000}"
BASE_EMBEDDINGS="${BASE_EMBEDDINGS:-http://localhost:8001}"

echo "Checking service health..."
curl -fsS "${BASE_BACKEND}/api/health" >/dev/null
curl -fsS "${BASE_MCP}/resources/health" >/dev/null
curl -fsS "${BASE_STT}/health" >/dev/null
curl -fsS "${BASE_EMBEDDINGS}/health" >/dev/null

echo "Login + flow smoke scenario..."
LOGIN_JSON=$(curl -fsS -X POST "${BASE_MCP}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dmis.local","password":"demo"}')

TOKEN=$(echo "$LOGIN_JSON" | sed -E 's/.*"token":"([^"]+)".*/\1/')

curl -fsS "${BASE_MCP}/api/users/me" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

ACTION_JSON=$(curl -fsS -X POST "${BASE_MCP}/api/actions/draft" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{"intent":"send_mail","entities":{"to":"demo@example.com"}}')

ACTION_ID=$(echo "$ACTION_JSON" | sed -E 's/.*"id":"([^"]+)".*/\1/')

curl -fsS -X POST "${BASE_MCP}/api/actions/${ACTION_ID}/confirm" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

curl -fsS -X POST "${BASE_MCP}/api/actions/${ACTION_ID}/execute" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

curl -fsS "${BASE_MCP}/api/audit" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

echo "Smoke passed."
