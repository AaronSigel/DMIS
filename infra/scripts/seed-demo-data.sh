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
#   DMIS_SEED_ASSISTANT_RAG=1 — опционально отправляет один RAG-запрос в демо-тред

set -euo pipefail

BASE_BACKEND="${BASE_BACKEND:-http://localhost:8080}"
DMIS_SEED_DOMAIN="${DMIS_SEED_DOMAIN:-${DMIS_DEMO_EMAIL_DOMAIN:-example.com}}"
SMTP_HOST="${SMTP_HOST:-127.0.0.1}"
SMTP_PORT="${SMTP_PORT:-1025}"

CAL_SEED_TITLE='DMIS seed — planning sync'
MAIL_MARK='[DMIS seed]'

CREATED_DOCS=0
SKIPPED_DOCS=0
CREATED_EVENTS=0
SKIPPED_EVENTS=0
CREATED_MAILS=0
SKIPPED_MAILS=0
CREATED_DRAFTS=0
SKIPPED_DRAFTS=0
CREATED_THREADS=0
SKIPPED_THREADS=0
CREATED_ACTIONS=0
SKIPPED_ACTIONS=0

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

document_id_by_marker() {
  local token="$1" marker="$2"
  curl -fsS "${BASE_BACKEND}/api/documents?page=0&size=100" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
m = sys.argv[1]
d = json.load(sys.stdin)
for it in d.get(\"content\", []):
    if m in (it.get(\"title\") or \"\") or m in (it.get(\"fileName\") or \"\"):
        print(it.get(\"id\") or \"\")
        sys.exit(0)
sys.exit(1)" "$marker"
}

echo "Seeding documents (idempotent)..."
if ! doc_exists "$ADMIN_TOKEN" "dmis-seed-admin-brief.txt"; then
  upload_txt "$ADMIN_TOKEN" "dmis-seed-admin-brief.txt" "Краткая справка для демо (admin). Сгенерировано seed-demo-data."
  CREATED_DOCS=$((CREATED_DOCS + 1))
  echo "  uploaded admin brief"
else
  SKIPPED_DOCS=$((SKIPPED_DOCS + 1))
  echo "  skip admin document (already present)"
fi

ANALYST_TOKEN=$(api_login "${analyst_email}")
if ! doc_exists "$ANALYST_TOKEN" "dmis-seed-analyst-notes.txt"; then
  upload_txt "$ANALYST_TOKEN" "dmis-seed-analyst-notes.txt" "Заметки аналитика для демо. Сгенерировано seed-demo-data."
  CREATED_DOCS=$((CREATED_DOCS + 1))
  echo "  uploaded analyst notes"
else
  SKIPPED_DOCS=$((SKIPPED_DOCS + 1))
  echo "  skip analyst document (already present)"
fi

REVIEWER_TOKEN=""
if tok=$(api_login_optional "${reviewer_email}"); then
  REVIEWER_TOKEN="$tok"
fi
if [[ -n "${REVIEWER_TOKEN}" ]]; then
  if ! doc_exists "$REVIEWER_TOKEN" "dmis-seed-reviewer-checklist.txt"; then
    upload_txt "$REVIEWER_TOKEN" "dmis-seed-reviewer-checklist.txt" "Чеклист ревьюера для демо. Сгенерировано seed-demo-data."
    CREATED_DOCS=$((CREATED_DOCS + 1))
    echo "  uploaded reviewer checklist"
  else
    SKIPPED_DOCS=$((SKIPPED_DOCS + 1))
    echo "  skip reviewer document (already present)"
  fi
else
  echo "  skip reviewer document (нет входа для ${reviewer_email} — выполните пересборку backend: cd infra && docker compose up -d --build backend)"
fi

if ! doc_exists "$ADMIN_TOKEN" "dmis-seed-policy.txt"; then
  upload_txt "$ADMIN_TOKEN" "dmis-seed-policy.txt" "Политика обработки документов: входящие письма сохраняются как документы, доступ проверяется backend ACL, изменения фиксируются в audit."
  CREATED_DOCS=$((CREATED_DOCS + 1))
  echo "  uploaded policy document"
else
  SKIPPED_DOCS=$((SKIPPED_DOCS + 1))
  echo "  skip policy document (already present)"
fi

if ! doc_exists "$ANALYST_TOKEN" "dmis-seed-meeting-notes.txt"; then
  upload_txt "$ANALYST_TOKEN" "dmis-seed-meeting-notes.txt" "Заметки к встрече: проверить календарь, входящие письма, создание черновика и ответ ассистента по документам."
  CREATED_DOCS=$((CREATED_DOCS + 1))
  echo "  uploaded meeting notes"
else
  SKIPPED_DOCS=$((SKIPPED_DOCS + 1))
  echo "  skip meeting notes (already present)"
fi

calendar_event_exists() {
  local token="$1" title="$2"
  curl -fsS "${BASE_BACKEND}/api/calendar/events" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
title = sys.argv[1]
for ev in json.load(sys.stdin):
    if (ev.get(\"title\") or \"\") == title:
        sys.exit(0)
sys.exit(1)" "${title}"
}

calendar_event_id_by_title() {
  local token="$1" title="$2"
  curl -fsS "${BASE_BACKEND}/api/calendar/events" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
title = sys.argv[1]
for ev in json.load(sys.stdin):
    if (ev.get(\"title\") or \"\") == title:
        print(ev.get(\"id\") or \"\")
        sys.exit(0)
sys.exit(1)" "${title}"
}

calendar_event_has_attachment() {
  local token="$1" event_id="$2" document_id="$3"
  curl -fsS "${BASE_BACKEND}/api/calendar/events/${event_id}" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
document_id = sys.argv[1]
event = json.load(sys.stdin)
for attachment in event.get(\"attachments\", []):
    if (attachment.get(\"documentId\") or \"\") == document_id:
        sys.exit(0)
sys.exit(1)" "${document_id}"
}

create_calendar_event() {
  local token="$1" title="$2" attendees_json="$3" start_iso="$4" end_iso="$5" description="$6"
  if calendar_event_exists "$token" "$title"; then
    SKIPPED_EVENTS=$((SKIPPED_EVENTS + 1))
    echo "  skip calendar event '${title}' (already present)"
    return 0
  fi
  curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/calendar/events" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d @- <<EOF
{"title":"${title}","attendees":${attendees_json},"startIso":"${start_iso}","endIso":"${end_iso}","description":"${description}"}
EOF
  CREATED_EVENTS=$((CREATED_EVENTS + 1))
  echo "  created calendar event '${title}'"
}

echo "Seeding calendar (idempotent)..."
create_calendar_event "$ADMIN_TOKEN" "${CAL_SEED_TITLE}" "[\"${analyst_email}\"]" "2026-06-10T09:00:00Z" "2026-06-10T10:30:00Z" "Демо-событие из seed-demo-data.sh"
create_calendar_event "$ADMIN_TOKEN" "DMIS seed — archive review" "[\"${reviewer_email}\",\"${manager_email}\"]" "2026-05-12T13:00:00Z" "2026-05-12T14:00:00Z" "Разбор архивных документов и чеклиста ревьюера."
create_calendar_event "$ADMIN_TOKEN" "DMIS seed — inbox triage" "[\"${analyst_email}\",\"${manager_email}\"]" "2026-05-20T08:30:00Z" "2026-05-20T09:00:00Z" "Проверка входящих писем и создания события из письма."
create_calendar_event "$ANALYST_TOKEN" "DMIS seed — analyst focus" "[\"${admin_email}\"]" "2026-05-21T11:00:00Z" "2026-05-21T12:00:00Z" "Личное событие аналитика для проверки календаря разных пользователей."

if event_id=$(calendar_event_id_by_title "$ADMIN_TOKEN" "${CAL_SEED_TITLE}") && doc_id=$(document_id_by_marker "$ADMIN_TOKEN" "dmis-seed-policy.txt") && ! calendar_event_has_attachment "$ADMIN_TOKEN" "$event_id" "$doc_id"; then
  curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/calendar/events/${event_id}/attachments" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"documentId\":\"${doc_id}\",\"role\":\"AGENDA\"}" || true
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

send_smtp_message() {
  export SEED_SMTP_HOST="$SMTP_HOST"
  export SEED_SMTP_PORT="$SMTP_PORT"
  export SEED_FROM="external-sender@${DMIS_SEED_DOMAIN}"
  export SEED_TO="$1"
  export SEED_SUBJECT="$2"
  export SEED_BODY="$3"
  python3 <<'PY'
import os
import smtplib
from email.message import EmailMessage

host = os.environ["SEED_SMTP_HOST"]
port = int(os.environ["SEED_SMTP_PORT"])
sender = os.environ["SEED_FROM"]
to_addr = os.environ["SEED_TO"]
subject = os.environ["SEED_SUBJECT"]
body = os.environ["SEED_BODY"]
with smtplib.SMTP(host, port) as smtp:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_addr
    msg.set_content(body)
    smtp.send_message(msg)
PY
}

seed_mail_message() {
  local mailbox="$1" subject="$2" body="$3"
  if mail_inbox_has_subject "$mailbox" "$subject"; then
    SKIPPED_MAILS=$((SKIPPED_MAILS + 1))
    echo "  skip mail '${subject}' for ${mailbox} (already present)"
    return 0
  fi
  send_smtp_message "$mailbox" "$subject" "$body"
  CREATED_MAILS=$((CREATED_MAILS + 1))
  echo "  sent mail '${subject}' to ${mailbox}"
}

echo "Seeding Mailpit messages (idempotent)..."
seed_mail_message "${admin_email}" "${MAIL_MARK} admin welcome" "Демо-входящее для ${admin_email}. Встреча: 12 июня 2026, 14:00–15:00, переговорная А."
seed_mail_message "${analyst_email}" "${MAIL_MARK} analyst memo" "Коллеги, напоминаю про согласование отчёта до пятницы."
seed_mail_message "${manager_email}" "${MAIL_MARK} manager ping" "Статус по проекту DMIS: готовы к демо после make seed-demo."
seed_mail_message "${reviewer_email}" "${MAIL_MARK} reviewer checklist" "Пожалуйста, проверьте чеклист ревьюера и отметьте спорные пункты до 20 мая 2026."
seed_mail_message "${admin_email}" "${MAIL_MARK} calendar candidate" "Прошу создать встречу 21 мая 2026 с 16:00 до 16:45 по обсуждению входящих писем."
seed_mail_message "${analyst_email}" "${MAIL_MARK} document request" "Нужна краткая выжимка по политике обработки документов и привязке файлов к событиям календаря."

mail_draft_exists() {
  local token="$1" subject="$2"
  curl -fsS -G "${BASE_BACKEND}/api/mail/messages" \
    --data-urlencode "folder=DRAFT" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
sub = sys.argv[1]
for m in json.load(sys.stdin):
    if (m.get(\"subject\") or \"\") == sub:
        sys.exit(0)
sys.exit(1)" "$subject"
}

create_mail_draft() {
  local token="$1" to_addr="$2" subject="$3" body="$4" attachments_json="${5:-[]}"
  if mail_draft_exists "$token" "$subject"; then
    SKIPPED_DRAFTS=$((SKIPPED_DRAFTS + 1))
    echo "  skip mail draft '${subject}' (already present)"
    return 0
  fi
  curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/mail/drafts" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d @- <<EOF
{"to":"${to_addr}","subject":"${subject}","body":"${body}","attachmentDocumentIds":${attachments_json}}
EOF
  CREATED_DRAFTS=$((CREATED_DRAFTS + 1))
  echo "  created mail draft '${subject}'"
}

echo "Seeding mail drafts (idempotent)..."
policy_doc_id=""
if policy_doc_id=$(document_id_by_marker "$ADMIN_TOKEN" "dmis-seed-policy.txt"); then
  create_mail_draft "$ADMIN_TOKEN" "${analyst_email}" "${MAIL_MARK} draft policy follow-up" "Аналитик, посмотрите вложенную политику и подготовьте вопросы к встрече." "[\"${policy_doc_id}\"]"
else
  create_mail_draft "$ADMIN_TOKEN" "${analyst_email}" "${MAIL_MARK} draft policy follow-up" "Аналитик, посмотрите политику и подготовьте вопросы к встрече."
fi
create_mail_draft "$ADMIN_TOKEN" "${manager_email}" "${MAIL_MARK} draft demo summary" "Менеджер, ниже краткий статус demo-стенда: документы, почта, календарь и ассистент готовы к проверке."

thread_id_by_title() {
  local token="$1" title="$2"
  curl -fsS "${BASE_BACKEND}/api/assistant/threads" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
title = sys.argv[1]
for t in json.load(sys.stdin):
    if (t.get(\"title\") or \"\") == title:
        print(t.get(\"id\") or \"\")
        sys.exit(0)
sys.exit(1)" "$title"
}

create_thread() {
  local token="$1" title="$2"
  if thread_id_by_title "$token" "$title" >/dev/null; then
    SKIPPED_THREADS=$((SKIPPED_THREADS + 1))
    echo "  skip assistant thread '${title}' (already present)"
    return 0
  fi
  local out thread_id
  out=$(curl -fsS -X POST "${BASE_BACKEND}/api/assistant/threads" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"${title}\"}")
  thread_id=$(echo "$out" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
  if [[ -n "${policy_doc_id}" && "$token" == "$ADMIN_TOKEN" ]]; then
    curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/assistant/threads/${thread_id}/documents" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      -d "{\"documentId\":\"${policy_doc_id}\"}" || true
  fi
  CREATED_THREADS=$((CREATED_THREADS + 1))
  echo "  created assistant thread '${title}'"
}

thread_has_message() {
  local token="$1" thread_id="$2" marker="$3"
  curl -fsS "${BASE_BACKEND}/api/assistant/threads/${thread_id}" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
marker = sys.argv[1]
d = json.load(sys.stdin)
for m in d.get(\"messages\", []):
    if marker in (m.get(\"content\") or \"\"):
        sys.exit(0)
sys.exit(1)" "$marker"
}

seed_optional_rag_message() {
  if [[ "${DMIS_SEED_ASSISTANT_RAG:-0}" != "1" ]]; then
    echo "  skip optional RAG message (DMIS_SEED_ASSISTANT_RAG is not 1)"
    return 0
  fi
  local title="[DMIS seed] Вопрос по NDA"
  local thread_id
  if ! thread_id=$(thread_id_by_title "$ADMIN_TOKEN" "$title"); then
    echo "  skip optional RAG message (thread not found)"
    return 0
  fi
  if thread_has_message "$ADMIN_TOKEN" "$thread_id" "DMIS seed RAG"; then
    echo "  skip optional RAG message (already present)"
    return 0
  fi
  if curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/assistant/threads/${thread_id}/messages" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"question":"DMIS seed RAG: кратко перескажи, что важно в NDA и политике обработки документов.","documentIds":[],"knowledgeSourceIds":["documents"],"ideologyProfileId":"balanced"}'; then
    echo "  sent optional RAG message"
  else
    echo "  skip optional RAG message (AI/RAG service is not ready)"
  fi
}

echo "Seeding assistant threads (idempotent)..."
create_thread "$ADMIN_TOKEN" "[DMIS seed] Вопрос по NDA"
create_thread "$ADMIN_TOKEN" "[DMIS seed] Подготовка к встрече"
seed_optional_rag_message

action_draft_exists() {
  local token="$1" subject="$2"
  curl -fsS "${BASE_BACKEND}/api/actions" \
    -H "Authorization: Bearer ${token}" \
    | python3 -c "import json,sys
subject = sys.argv[1]
for action in json.load(sys.stdin):
    entities = action.get(\"entities\") or {}
    if action.get(\"intent\") == \"send_email\" and action.get(\"status\") == \"DRAFT\" and entities.get(\"subject\") == subject:
        sys.exit(0)
sys.exit(1)" "$subject"
}

echo "Seeding AI action draft (idempotent)..."
ACTION_SUBJECT="${MAIL_MARK} pending action"
if action_draft_exists "$ADMIN_TOKEN" "$ACTION_SUBJECT"; then
  SKIPPED_ACTIONS=$((SKIPPED_ACTIONS + 1))
  echo "  skip AI action draft (already present)"
else
  curl -fsS -o /dev/null -X POST "${BASE_BACKEND}/api/actions/draft" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d @- <<EOF
{"intent":"send_email","entities":{"type":"send_email","to":"${analyst_email}","subject":"${ACTION_SUBJECT}","body":"Демо-действие ожидает подтверждения и не выполняется seed-скриптом."}}
EOF
  CREATED_ACTIONS=$((CREATED_ACTIONS + 1))
  echo "  created AI action draft"
fi

echo "Seed demo data finished."
echo "Summary:"
echo "  documents: created=${CREATED_DOCS}, skipped=${SKIPPED_DOCS}"
echo "  calendar events: created=${CREATED_EVENTS}, skipped=${SKIPPED_EVENTS}"
echo "  mail messages: created=${CREATED_MAILS}, skipped=${SKIPPED_MAILS}"
echo "  mail drafts: created=${CREATED_DRAFTS}, skipped=${SKIPPED_DRAFTS}"
echo "  assistant threads: created=${CREATED_THREADS}, skipped=${SKIPPED_THREADS}"
echo "  AI action drafts: created=${CREATED_ACTIONS}, skipped=${SKIPPED_ACTIONS}"
