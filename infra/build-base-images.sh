#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REGISTRY_PREFIX="${REGISTRY_PREFIX:-dmis}"
TAG="${TAG:-latest}"

echo "Building base images (REGISTRY_PREFIX=${REGISTRY_PREFIX}, TAG=${TAG})"

docker build \
  --target base \
  -t "${REGISTRY_PREFIX}/backend-base:${TAG}" \
  "${ROOT_DIR}/backend"

docker build \
  --target base \
  -t "${REGISTRY_PREFIX}/mcp-base:${TAG}" \
  "${ROOT_DIR}/mcp"

docker build \
  --target base \
  -t "${REGISTRY_PREFIX}/frontend-base:${TAG}" \
  "${ROOT_DIR}/frontend"

docker build \
  --target base \
  -t "${REGISTRY_PREFIX}/stt-service-base:${TAG}" \
  "${ROOT_DIR}/stt-service"

docker build \
  --target base \
  -t "${REGISTRY_PREFIX}/embeddings-service-base:${TAG}" \
  "${ROOT_DIR}/embeddings-service"

docker build \
  --target base \
  -t "${REGISTRY_PREFIX}/ai-service-base:${TAG}" \
  "${ROOT_DIR}/ai-service"

echo "Done."
