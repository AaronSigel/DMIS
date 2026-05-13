#!/usr/bin/env bash
# Наполняет локальный demo-стек тестовыми данными через публичный API и SMTP в Mailpit.
#
# Идемпотентность:
# - Документы: имя файла с префиксом dmis-seed-; перед загрузкой проверяется GET /api/documents.
# - Календарь: заголовок «DMIS seed — planning sync»; проверка GET /api/calendar/events.
# - Письма: тема «[DMIS seed] …» на конкретного получателя; перед SMTP проверяется список писем
#   ящика получателя (от имени admin, у которого есть доступ к любому mailbox).
#
# Переменные окружения:
#   BASE_BACKEND       — по умолчанию http://localhost:8080
#   DMIS_SEED_DOMAIN   — домен email (по умолчанию example.com или DMIS_DEMO_EMAIL_DOMAIN)
#   SMTP_HOST          — по умолчанию 127.0.0.1 (с хоста при проброшенном порте mailpit)
#   SMTP_PORT          — по умолчанию 1025

set -euo pipefail

BASE_BACKEND="${BASE_BACKEND:-http://localhost:8080}"
DMIS_SEED_DOMAIN="${DMIS_SEED_DOMAIN:-${DMIS_DEMO_EMAIL_DOMAIN:-example.com}}"
SMTP_HOST="${SMTP_HOST:-127.0.0.1}"
SMTP_PORT="${SMTP_PORT:-1025}"

CAL_SEED_TITLE='DMIS seed — planning sync'
MAIL_MARK='[DMIS seed]'

wait_for() {
  local url="$1"
  local name="$2"
  local max_attempts="${3:-40}"
  local sleep_seconds="${4:-2}"
  local attempt=1
  while (( attempt <= max_attempts )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "OK: ${name}"
      return 0
    fi
    sleep "$sleep_seconds"
    ((attempt++))
  done
  echo "FAILED: ${name} (${url})"
  return 1
}

json_token() {
  python3 -c 'import json,sys; print(json.loads(sys.stdin.read())["token"])'
}

# Логин с повтором при HTTP 429 (rate limit на /api/auth/login).
api_login() {
  local email="$1"
  local attempt=1
  local max=10
  local out ec body
  while (( attempt <= max )); do
    out=$(curl -sS -w '\n%{http_code}' -X POST "${BASE_BACKEND}/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${email}\",\"password\":\"demo\"}")
    ec=$(echo "$out" | tail -n1)
    body=$(echo "$out" | sed '$d')
    if [[ "$ec" == "200" ]]; then
      echo "$body" | json_token
      return 0
    fi
    if [[ "$ec" == "429" ]]; then
      sleep $(( 2 + attempt ))
      ((attempt++))
      continue
    fi
    echo "Login failed for ${email}: HTTP ${ec}" >&2
    return 1
  done
  echo "Login failed for ${email}: too many 429 responses" >&2
  return 1
}

# Как api_login, но при окончательной неудаче — код 1 (для опциональных учёток после обновления DataBootstrap).
api_login_optional() {
  local email="$1"
  local attempt=1
  local max=10
  local out ec body
  while (( attempt <= max )); do
    out=$(curl -sS -w '\n%{http_code}' -X POST "${BASE_BACKEND}/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${email}\",\"password\":\"demo\"}")
    ec=$(echo "$out" | tail -n1)
    body=$(echo "$out" | sed '$d')
    if [[ "$ec" == "200" ]]; then
      echo "$body" | json_token
      return 0
    fi
    if [[ "$ec" == "429" ]]; then
      sleep $(( 2 + attempt ))
      ((attempt++))
      continue
    fi
    return 1
  done
  return 1
}

echo "Waiting for backend..."
wait_for "${BASE_BACKEND}/api/health" "backend /api/health"

admin_email="admin@${DMIS_SEED_DOMAIN}"
analyst_email="analyst@${DMIS_SEED_DOMAIN}"
reviewer_email="reviewer@${DMIS_SEED_DOMAIN}"
manager_email="manager@${DMIS_SEED_DOMAIN}"

echo "Login (admin)..."
ADMIN_TOKEN=$(api_login "${admin_email}")

doc_exists() {
  local token="$1" marker="$2"
  curl -fsS "${BASE_BACKEND}/api/documents?page=0&size=100" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
m = sys.argv[1]
d = json.load(sys.stdin)
for it in d.get(\"content\", []):
    if m in (it.get(\"title\") or \"\") or m in (it.get(\"fileName\") or \"\"):
        sys.exit(0)
sys.exit(1)" "$marker"
}

upload_txt() {
  local token="$1" fname="$2" body="$3"
  local tmp
  tmp="$(mktemp)"
  printf '%s' "$body" >"$tmp"
  curl -fsS -X POST "${BASE_BACKEND}/api/documents" \
    -H "Authorization: Bearer ${token}" \
    -F "file=@${tmp};type=text/plain;filename=${fname}" >/dev/null
  rm -f "$tmp"
}

echo "Seeding documents (idempotent)..."
if ! doc_exists "$ADMIN_TOKEN" "dmis-seed-admin-brief.txt"; then
  upload_txt "$ADMIN_TOKEN" "dmis-seed-admin-brief.txt" "Краткая справка для демо (admin). Сгенерировано seed-demo-data."
  echo "  uploaded admin brief"
else
  echo "  skip admin document (already present)"
fi

ANALYST_TOKEN=$(api_login "${analyst_email}")
if ! doc_exists "$ANALYST_TOKEN" "dmis-seed-analyst-notes.txt"; then
  upload_txt "$ANALYST_TOKEN" "dmis-seed-analyst-notes.txt" "Заметки аналитика для демо. Сгенерировано seed-demo-data."
  echo "  uploaded analyst notes"
else
  echo "  skip analyst document (already present)"
fi

REVIEWER_TOKEN=""
if tok=$(api_login_optional "${reviewer_email}"); then
  REVIEWER_TOKEN="$tok"
fi
if [[ -n "${REVIEWER_TOKEN}" ]]; then
  if ! doc_exists "$REVIEWER_TOKEN" "dmis-seed-reviewer-checklist.txt"; then
    upload_txt "$REVIEWER_TOKEN" "dmis-seed-reviewer-checklist.txt" "Чеклист ревьюера для демо. Сгенерировано seed-demo-data."
    echo "  uploaded reviewer checklist"
  else
    echo "  skip reviewer document (already present)"
  fi
else
  echo "  skip reviewer document (нет входа для ${reviewer_email} — выполните пересборку backend: cd infra && docker compose up -d --build backend)"
fi

calendar_seed_needed() {
  curl -fsS "${BASE_BACKEND}/api/calendar/events" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | python3 -c "import json,sys
title = sys.argv[1]
for ev in json.load(sys.stdin):
    if (ev.get(\"title\") or \"\") == title:
        sys.exit(1)
sys.exit(0)" "${CAL_SEED_TITLE}"
}

echo "Seeding calendar (idempotent)..."
if calendar_seed_needed; then
  curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/calendar/events" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d @- <<EOF
{"title":"${CAL_SEED_TITLE}","attendees":["${analyst_email}"],"startIso":"2026-06-10T09:00:00Z","endIso":"2026-06-10T10:30:00Z","description":"Демо-событие из seed-demo-data.sh"}
EOF
  echo "  created calendar event"
else
  echo "  skip calendar event (already present)"
fi

mail_inbox_has_subject() {
  local mailbox="$1" subject_sub="$2"
  curl -fsS -G "${BASE_BACKEND}/api/mail/messages" \
    --data-urlencode "mailbox=${mailbox}" \
    --data-urlencode "folder=inbox" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    | python3 -c "import json,sys
sub = sys.argv[1]
for m in json.load(sys.stdin):
    if sub in (m.get(\"subject\") or \"\"):
        sys.exit(0)
sys.exit(1)" "$subject_sub"
}

send_smtp_seed() {
  export SEED_SMTP_HOST="$SMTP_HOST"
  export SEED_SMTP_PORT="$SMTP_PORT"
  export SEED_FROM="external-sender@${DMIS_SEED_DOMAIN}"
  python3 <<'PY'
import os
import smtplib
from email.message import EmailMessage

host = os.environ["SEED_SMTP_HOST"]
port = int(os.environ["SEED_SMTP_PORT"])
sender = os.environ["SEED_FROM"]
messages = [
    (os.environ["TO1"], os.environ["SUB1"], os.environ["BODY1"]),
    (os.environ["TO2"], os.environ["SUB2"], os.environ["BODY2"]),
    (os.environ["TO3"], os.environ["SUB3"], os.environ["BODY3"]),
]
with smtplib.SMTP(host, port) as smtp:
    for to_addr, subject, body in messages:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to_addr
        msg.set_content(body)
        smtp.send_message(msg)
PY
}

echo "Seeding Mailpit messages (idempotent)..."
SUB1="${MAIL_MARK} admin welcome"
SUB2="${MAIL_MARK} analyst memo"
SUB3="${MAIL_MARK} manager ping"
if mail_inbox_has_subject "${admin_email}" "${MAIL_MARK}"; then
  echo "  skip mail (seed messages already in admin inbox)"
else
  export TO1="${admin_email}"
  export SUB1="${SUB1}"
  export BODY1="Демо-входящее для ${admin_email}. Встреча: 12 июня 2026, 14:00–15:00, переговорная А."
  export TO2="${analyst_email}"
  export SUB2="${SUB2}"
  export BODY2="Коллеги, напоминаю про согласование отчёта до пятницы."
  export TO3="${manager_email}"
  export SUB3="${SUB3}"
  export BODY3="Статус по проекту DMIS: готовы к демо после make seed-demo."
  send_smtp_seed
  echo "  sent 3 messages via SMTP"
fi

echo "Seed demo data finished."
