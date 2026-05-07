#!/usr/bin/env bash
#
# DMIS: резервное копирование Postgres и MinIO для стенда docker compose (одна VM).
#
# Назначение
#   - Postgres: pg_dump из контейнера сервиса postgres -> gzip в каталог BACKUP_DIR/postgres.
#   - MinIO: снимок бакета через mc mirror в каталог BACKUP_DIR/minio (новый подкаталог на каждый запуск).
#   - Retention: удаление дампов и каталогов MinIO старше RETENTION_DAYS (по умолчанию 7 дней).
#
# Установка
#   cp infra/.env.example infra/.env   # задать POSTGRES_*, MINIO_ROOT_PASSWORD и пр.
#
# Запуск (из корня репозитория или любого каталога):
#   bash infra/scripts/backup.sh
#   bash infra/scripts/backup.sh --dry-run
#   RETENTION_DAYS=14 bash infra/scripts/backup.sh
#
# Переменные окружения (опционально)
#   BACKUP_DIR        каталог для дампов (по умолчанию: <infra>/backups)
#   RETENTION_DAYS    сколько дней хранить старые файлы/каталоги (по умолчанию: 7)
#   COMPOSE_PROJECT_DIR  каталог с docker-compose.yml (по умолчанию: родитель scripts/, т.е. infra/)
#   COMPOSE_NETWORK   docker-сеть compose-проекта для mc (по умолчанию: infra_default)
#   POSTGRES_DB       имя БД (по умолчанию: dmis)
#   POSTGRES_USER     пользователь БД (по умолчанию: dmis)
#   MINIO_BUCKET      имя бакета (по умолчанию: dmis-documents)
#   MINIO_ROOT_USER / MINIO_ROOT_PASSWORD — из infra/.env (пароли в скрипт не вшиваются)
#
# Восстановление Postgres (пример)
#   gunzip -c backups/postgres/dmis-YYYYMMDDTHHMMSSZ.sql.gz | \
#     docker compose -f infra/docker-compose.yml exec -T postgres \
#     psql -U dmis -d dmis -v ON_ERROR_STOP=1
#
# Восстановление MinIO (пример: залить снимок обратно в бакет)
#   docker run --rm --network infra_default \
#     -e MINIO_ROOT_USER -e MINIO_ROOT_PASSWORD -e MINIO_BUCKET \
#     -v "$(pwd)/backups/minio/dmis-documents-TS:/restore:ro" \
#     minio/mc:latest \
#     sh -ec 'mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" && \
#             mc mirror --overwrite "/restore" "local/${MINIO_BUCKET}"'
#
set -euo pipefail
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

COMPOSE_PROJECT_DIR="${COMPOSE_PROJECT_DIR:-${INFRA_DIR}}"
COMPOSE_FILE="${COMPOSE_PROJECT_DIR}/docker-compose.yml"
BACKUP_DIR="${BACKUP_DIR:-${INFRA_DIR}/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
COMPOSE_NETWORK="${COMPOSE_NETWORK:-infra_default}"

POSTGRES_DB="${POSTGRES_DB:-dmis}"
POSTGRES_USER="${POSTGRES_USER:-dmis}"
MINIO_BUCKET="${MINIO_BUCKET:-dmis-documents}"

DRY_RUN=0
DO_POSTGRES=1
DO_MINIO=1

log() {
  printf '[backup] %s\n' "$*"
}

err() {
  printf '[backup] ERROR: %s\n' "$*" >&2
}

usage() {
  cat <<'USAGE'
DMIS backup: Postgres (pg_dump) + MinIO (mc mirror) + retention.

Usage:
  bash infra/scripts/backup.sh [options]

Options:
  --dry-run        Print planned commands; no filesystem/docker changes.
  --postgres-only  Backup Postgres only.
  --minio-only     Backup MinIO only.
  -h, --help       Show this help.

Environment:
  See header comments in this script (BACKUP_DIR, RETENTION_DAYS, COMPOSE_NETWORK, ...).
  Copy infra/.env.example to infra/.env for secrets.

USAGE
}

parse_args() {
  while (($# > 0)); do
    case "$1" in
      --dry-run)
        DRY_RUN=1
        ;;
      --postgres-only)
        DO_MINIO=0
        ;;
      --minio-only)
        DO_POSTGRES=0
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        err "unknown argument: $1"
        printf 'Try: %s --help\n' "$0" >&2
        exit 2
        ;;
    esac
    shift
  done
}

load_env() {
  local env_file="${INFRA_DIR}/.env"
  if [[ -f "${env_file}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${env_file}"
    set +a
    return 0
  fi
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    log "WARN: ${env_file} not found; dry-run will use placeholders for secrets"
    return 0
  fi
  err "file not found: ${env_file}"
  err "Copy infra/.env.example to infra/.env and set secrets."
  exit 1
}

ensure_dirs() {
  local pg_dir="${BACKUP_DIR}/postgres"
  local mn_dir="${BACKUP_DIR}/minio"
  local gi="${BACKUP_DIR}/.gitignore"

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    log "+ mkdir -p ${pg_dir} ${mn_dir}"
    if [[ ! -f "${gi}" ]]; then
      log "+ printf '*\\n!.gitignore\\n' > ${gi}"
    fi
    return 0
  fi

  mkdir -p "${pg_dir}" "${mn_dir}"
  if [[ ! -f "${gi}" ]]; then
    printf '*\n!.gitignore\n' >"${gi}"
  fi
}

backup_postgres() {
  local ts="$1"
  local out="${BACKUP_DIR}/postgres/dmis-${ts}.sql.gz"

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    log "+ (cd ${COMPOSE_PROJECT_DIR} && docker compose exec -T postgres pg_dump -U \"${POSTGRES_USER}\" -d \"${POSTGRES_DB}\" ...) | gzip -9 > ${out}"
    return 0
  fi

  log "Postgres dump -> ${out}"
  (
    cd "${COMPOSE_PROJECT_DIR}"
    docker compose exec -T postgres \
      pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
      --format=plain --no-owner --no-privileges
  ) | gzip -9 >"${out}"
}

backup_minio() {
  local ts="$1"
  local dest_name="${MINIO_BUCKET}-${ts}"
  local dest_path="${BACKUP_DIR}/minio/${dest_name}"

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    log "+ docker run --rm --network ${COMPOSE_NETWORK} \\"
    log "+   -e MINIO_ROOT_USER=${MINIO_ROOT_USER:-minio} -e MINIO_ROOT_PASSWORD=*** \\"
    log "+   -e MINIO_BUCKET=${MINIO_BUCKET} -e DEST=/backups/${dest_name} \\"
    log "+   -v ${BACKUP_DIR}/minio:/backups minio/mc:latest \\"
    log "+   sh -ec 'mc alias set local http://minio:9000 \"\$MINIO_ROOT_USER\" \"\$MINIO_ROOT_PASSWORD\" && mc mirror --quiet \"local/${MINIO_BUCKET}\" \"\$DEST\"'"
    return 0
  fi

  if [[ -z "${MINIO_ROOT_PASSWORD:-}" ]]; then
    err "MINIO_ROOT_PASSWORD is not set"
    exit 1
  fi

  log "MinIO mirror -> ${dest_path}"
  docker run --rm \
    --network "${COMPOSE_NETWORK}" \
    -e MINIO_ROOT_USER="${MINIO_ROOT_USER:-minio}" \
    -e MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
    -e MINIO_BUCKET="${MINIO_BUCKET}" \
    -e "DEST=/backups/${dest_name}" \
    -v "${BACKUP_DIR}/minio:/backups" \
    minio/mc:latest \
    sh -ec 'mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" && mc mirror --quiet "local/${MINIO_BUCKET}" "${DEST}"'
}

apply_retention() {
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    log "+ find ${BACKUP_DIR}/postgres -name 'dmis-*.sql.gz' -type f -mtime +${RETENTION_DAYS} -print -delete"
    log "+ find ${BACKUP_DIR}/minio -mindepth 1 -maxdepth 1 -type d -mtime +${RETENTION_DAYS} -print -exec rm -rf {} +"
    return 0
  fi

  log "Retention: deleting postgres dumps older than ${RETENTION_DAYS} days"
  find "${BACKUP_DIR}/postgres" -name 'dmis-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -print -delete || true

  log "Retention: deleting minio snapshots older than ${RETENTION_DAYS} days"
  find "${BACKUP_DIR}/minio" -mindepth 1 -maxdepth 1 -type d -mtime "+${RETENTION_DAYS}" -print -exec rm -rf {} + || true
}

main() {
  parse_args "$@"
  load_env

  local ts
  ts="$(date -u +%Y%m%dT%H%M%SZ)"

  if [[ ! -f "${COMPOSE_FILE}" ]]; then
    err "compose file not found: ${COMPOSE_FILE}"
    exit 1
  fi

  ensure_dirs

  if [[ "${DO_POSTGRES}" -eq 1 ]]; then
    backup_postgres "${ts}"
  else
    log "SKIP: postgres (--minio-only)"
  fi

  if [[ "${DO_MINIO}" -eq 1 ]]; then
    backup_minio "${ts}"
  else
    log "SKIP: minio (--postgres-only)"
  fi

  apply_retention

  log "Done."
}

main "$@"
