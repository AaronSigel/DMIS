#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${INFRA_DIR}/.env"
MAIN_COMPOSE_FILE="${INFRA_DIR}/docker-compose.yml"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/stack.sh <command> [extra docker compose args...]

Commands:
  up       Start full DMIS lightweight stack
  down     Stop full DMIS stack
  ps       Show containers status for full stack
  logs     Show logs for full stack
  pull     Pull images for full stack
  config   Validate and print merged docker compose config

Examples:
  ./scripts/stack.sh up -d --build
  ./scripts/stack.sh down
  ./scripts/stack.sh logs -f backend mailpit
EOF
}

require_file() {
  local file_path="$1"
  local help_hint="$2"

  if [[ ! -f "${file_path}" ]]; then
    echo "Missing required file: ${file_path}" >&2
    echo "${help_hint}" >&2
    exit 1
  fi
}

command_name="${1:-}"
if [[ -z "${command_name}" ]]; then
  usage
  exit 1
fi
shift || true

require_file "${ENV_FILE}" "Create it from template: cd infra && cp .env.example .env"
require_file "${MAIN_COMPOSE_FILE}" "Main compose file is required."

COMPOSE_ARGS=(
  --env-file "${ENV_FILE}"
  -f "${MAIN_COMPOSE_FILE}"
)

case "${command_name}" in
  up|down|ps|logs|pull|config)
    docker compose "${COMPOSE_ARGS[@]}" "${command_name}" "$@"
    ;;
  *)
    echo "Unknown command: ${command_name}" >&2
    usage
    exit 1
    ;;
esac
