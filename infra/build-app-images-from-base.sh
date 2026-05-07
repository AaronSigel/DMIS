#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REGISTRY_PREFIX="${REGISTRY_PREFIX:-dmis}"
TAG="${TAG:-latest}"

echo "Building app images from base (REGISTRY_PREFIX=${REGISTRY_PREFIX}, TAG=${TAG})"

docker build \
  --build-arg BUILD_BASE_IMAGE="${REGISTRY_PREFIX}/backend-base:${TAG}" \
  -t "${REGISTRY_PREFIX}/backend:${TAG}" \
  "${ROOT_DIR}/backend"

docker build \
  --build-arg BUILD_BASE_IMAGE="${REGISTRY_PREFIX}/frontend-base:${TAG}" \
  -t "${REGISTRY_PREFIX}/frontend:${TAG}" \
  "${ROOT_DIR}/frontend"

docker build \
  --build-arg RUNTIME_BASE_IMAGE="${REGISTRY_PREFIX}/stt-service-base:${TAG}" \
  -t "${REGISTRY_PREFIX}/stt-service:${TAG}" \
  "${ROOT_DIR}/stt-service"

docker build \
  --build-arg RUNTIME_BASE_IMAGE="${REGISTRY_PREFIX}/embeddings-service-base:${TAG}" \
  -t "${REGISTRY_PREFIX}/embeddings-service:${TAG}" \
  "${ROOT_DIR}/embeddings-service"

docker build \
  --build-arg RUNTIME_BASE_IMAGE="${REGISTRY_PREFIX}/ai-service-base:${TAG}" \
  -t "${REGISTRY_PREFIX}/ai-service:${TAG}" \
  "${ROOT_DIR}/ai-service"

echo "Done."
