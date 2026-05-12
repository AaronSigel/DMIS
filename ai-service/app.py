import asyncio
import json
import os
from typing import Any, AsyncIterator, Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field


app = FastAPI(title="DMIS AI Service")

# Совпадают с com.dmis.backend.actions.application.dto.ActionDtos (контракт backend).
SEND_EMAIL_INTENT = "send_email"
CREATE_CALENDAR_EVENT_INTENT = "create_calendar_event"
UPDATE_DOCUMENT_TAGS_INTENT = "update_document_tags"
RESCHEDULE_CALENDAR_EVENT_INTENT = "reschedule_calendar_event"
PREPARE_MEETING_AGENDA_INTENT = "prepare_meeting_agenda"
SUGGEST_MEETING_SLOTS_INTENT = "suggest_meeting_slots"

Provider = Literal["openrouter", "local"]


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    contextChunks: list[str] = Field(default_factory=list)
    systemPrompt: str | None = None
    temperature: float | None = None
    maxTokens: int | None = None
    traceId: str | None = None


class ChatResponse(BaseModel):
    answer: str = Field(min_length=1)
    model: str
    provider: Provider


class StructuredChatRequest(BaseModel):
    question: str = Field(min_length=1)
    systemPrompt: str | None = None
    temperature: float | None = None
    maxTokens: int | None = None
    traceId: str | None = None
    responseSchema: dict[str, Any] | None = None


class StructuredChatResponse(BaseModel):
    status: Literal["ok", "error"]
    structured: dict[str, Any] | None = None
    provider: Provider
    model: str
    error: str | None = None


def _provider() -> Provider:
    return (os.environ.get("AI_PROVIDER", "openrouter") or "openrouter").strip().lower()  # type: ignore[return-value]


def _model() -> str:
    return (os.environ.get("AI_MODEL") or "openai/gpt-4o-mini").strip()


def _openrouter_headers() -> dict[str, str]:
    api_key = (os.environ.get("OPENROUTER_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not set")
    headers: dict[str, str] = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    app_url = (os.environ.get("OPENROUTER_APP_URL") or "").strip()
    if app_url:
        headers["HTTP-Referer"] = app_url
    app_title = (os.environ.get("OPENROUTER_APP_TITLE") or "").strip()
    if app_title:
        headers["X-Title"] = app_title
    return headers


def _build_messages(req: ChatRequest) -> list[dict[str, str]]:
    system = req.systemPrompt or (
        "Ты корпоративный помощник системы документооборота. "
        "Отвечай строго на основании предоставленного контекста. "
        "Если в контексте нет ответа — так и скажи. "
        "По возможности ссылайся на источники как [1], [2], [3] по порядку чанков."
    )
    context = "\n\n".join(
        f"[{idx + 1}] {chunk.strip()}" for idx, chunk in enumerate(req.contextChunks) if chunk.strip()
    ).strip()
    user = req.question.strip()
    if context:
        user = f"Вопрос:\n{user}\n\nКонтекст:\n{context}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _extract_json_object(raw: str) -> dict[str, Any]:
    trimmed = (raw or "").strip()
    if not trimmed:
        raise RuntimeError("Empty completion")
    start = trimmed.find("{")
    end = trimmed.rfind("}")
    if start < 0 or end <= start:
        raise RuntimeError("Completion is not JSON object")
    return json.loads(trimmed[start : end + 1])


def _default_structured_system_prompt() -> str:
    """Дефолт при отсутствии systemPrompt (прямой вызов API). Должен совпадать по смыслу с AiServiceIntentParserAdapter."""
    return (
        "Ты извлекаешь действие для корпоративной системы документооборота.\n"
        "Доступны только intent:\n"
        f"- {SEND_EMAIL_INTENT} — отправить письмо\n"
        f"- {CREATE_CALENDAR_EVENT_INTENT} — создать событие календаря\n"
        f"- {UPDATE_DOCUMENT_TAGS_INTENT} — обновить теги документа\n"
        f"- {RESCHEDULE_CALENDAR_EVENT_INTENT} — перенести событие календаря\n"
        f"- {PREPARE_MEETING_AGENDA_INTENT} — сгенерировать повестку встречи по документам\n"
        f"- {SUGGEST_MEETING_SLOTS_INTENT} — найти свободные слоты для встречи\n"
        "Верни только структурированный JSON с полями intent и entities.\n"
        f"Для {SEND_EMAIL_INTENT} entities: to, subject, body, опционально attachmentDocumentIds (массив id документов).\n"
        f"Для {CREATE_CALENDAR_EVENT_INTENT} entities: title, attendees (массив email), startIso, endIso.\n"
        f"Для {UPDATE_DOCUMENT_TAGS_INTENT} entities: documentId, tags (массив строк).\n"
        f"Для {RESCHEDULE_CALENDAR_EVENT_INTENT} entities: eventId, опционально title, startIso, endIso.\n"
        f"Для {PREPARE_MEETING_AGENDA_INTENT} entities: eventId, опционально extraDocumentIds (массив id документов).\n"
        f"Для {SUGGEST_MEETING_SLOTS_INTENT} entities: attendeeEmails (массив email), fromIso, toIso, slotMinutes (целое число минут).\n"
        "Не используй пустые строки и пустые массивы как валидные значения entities.\n"
        "Если данных недостаточно, верни наиболее вероятный intent, но заполняй entities только содержательными значениями."
    )


def _iso_example_pair() -> tuple[str, str]:
    return ("2026-05-10T10:00:00Z", "2026-05-10T11:00:00Z")


def _build_structured_fallback(question: str) -> dict[str, Any]:
    """Локальный провайдер (MVP): эвристики + заглушки, достаточные для прохождения валидации backend при smoke-тестах."""
    q = question.strip()
    lower = q.lower()
    start_iso, end_iso = _iso_example_pair()

    if any(
        w in lower
        for w in (
            "слот",
            "свободн",
            "окно для встреч",
            "availability",
            "free/busy",
            "подбери время",
        )
    ):
        return {
            "intent": SUGGEST_MEETING_SLOTS_INTENT,
            "entities": {
                "attendeeEmails": ["colleague@example.com"],
                "fromIso": start_iso,
                "toIso": "2026-05-17T18:00:00Z",
                "slotMinutes": 30,
            },
        }

    if "повестк" in lower or "agenda" in lower:
        return {
            "intent": PREPARE_MEETING_AGENDA_INTENT,
            "entities": {"eventId": "evt-local-placeholder", "extraDocumentIds": []},
        }

    if any(w in lower for w in ("перенес", "reschedule", "перенести", "перенеси")):
        return {
            "intent": RESCHEDULE_CALENDAR_EVENT_INTENT,
            "entities": {
                "eventId": "evt-local-placeholder",
                "startIso": start_iso,
                "endIso": end_iso,
            },
        }

    if any(w in lower for w in ("пись", "email", "mail", "напиши")):
        return {
            "intent": SEND_EMAIL_INTENT,
            "entities": {
                "to": "recipient@example.com",
                "subject": "Тема",
                "body": q or "Текст письма",
                "attachmentDocumentIds": [],
            },
        }

    if any(w in lower for w in ("встреч", "календар", "meeting")):
        return {
            "intent": CREATE_CALENDAR_EVENT_INTENT,
            "entities": {
                "title": q or "Встреча",
                "attendees": ["attendee@example.com"],
                "startIso": start_iso,
                "endIso": end_iso,
            },
        }

    if any(w in lower for w in ("тег", "tag", "теги")):
        return {
            "intent": UPDATE_DOCUMENT_TAGS_INTENT,
            "entities": {"documentId": "doc-local-placeholder", "tags": ["draft"]},
        }

    return {
        "intent": UPDATE_DOCUMENT_TAGS_INTENT,
        "entities": {"documentId": "doc-local-placeholder", "tags": ["draft"]},
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-service"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    provider = _provider()
    model = _model()
    try:
        if provider == "openrouter":
            payload: dict[str, Any] = {
                "model": model,
                "messages": _build_messages(req),
            }
            if req.temperature is not None:
                payload["temperature"] = req.temperature
            if req.maxTokens is not None:
                payload["max_tokens"] = req.maxTokens

            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
                r = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=_openrouter_headers(),
                    json=payload,
                )
                r.raise_for_status()
                data = r.json()
                content = (
                    (((data.get("choices") or [{}])[0]).get("message") or {}).get("content") or ""
                ).strip()
                if not content:
                    raise RuntimeError("Empty completion")
                return ChatResponse(answer=content, model=model, provider=provider)

        if provider == "local":
            # Minimal local implementation (MVP): provide a deterministic answer based on top context.
            # This keeps the contract stable; replace with a real local model runtime later.
            if not req.contextChunks:
                raise RuntimeError("No context chunks provided for local provider")
            snippet = (req.contextChunks[0] or "").strip()
            if not snippet:
                raise RuntimeError("Empty context chunk")
            answer = ("Ответ на основе контекста (локальный режим, MVP):\n" + snippet[:800]).strip()
            return ChatResponse(answer=answer, model=model, provider=provider)

        raise RuntimeError(f"Unknown AI_PROVIDER: {provider}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/v2/chat/structured", response_model=StructuredChatResponse)
async def chat_structured(req: StructuredChatRequest) -> StructuredChatResponse:
    provider = _provider()
    model = _model()
    try:
        if provider == "openrouter":
            system = req.systemPrompt or _default_structured_system_prompt()
            payload: dict[str, Any] = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": req.question.strip()},
                ],
            }
            if req.temperature is not None:
                payload["temperature"] = req.temperature
            if req.maxTokens is not None:
                payload["max_tokens"] = req.maxTokens
            if req.responseSchema is not None:
                payload["response_format"] = {
                    "type": "json_schema",
                    "json_schema": req.responseSchema,
                }
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=_openrouter_headers(),
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                content = (
                    (((data.get("choices") or [{}])[0]).get("message") or {}).get("content") or ""
                ).strip()
                structured = _extract_json_object(content)
                return StructuredChatResponse(
                    status="ok",
                    structured=structured,
                    provider=provider,
                    model=model,
                )
        if provider == "local":
            return StructuredChatResponse(
                status="ok",
                structured=_build_structured_fallback(req.question),
                provider=provider,
                model=model,
            )
        return StructuredChatResponse(
            status="error",
            structured=None,
            provider=provider,
            model=model,
            error=f"Unknown AI_PROVIDER: {provider}",
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from model: {e}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


def _sse(data: dict[str, Any]) -> bytes:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    provider = _provider()
    model = _model()

    async def gen() -> AsyncIterator[bytes]:
        try:
            if provider == "openrouter":
                payload: dict[str, Any] = {
                    "model": model,
                    "stream": True,
                    "messages": _build_messages(req),
                }
                if req.temperature is not None:
                    payload["temperature"] = req.temperature
                if req.maxTokens is not None:
                    payload["max_tokens"] = req.maxTokens

                async with httpx.AsyncClient(timeout=None) as client:
                    async with client.stream(
                        "POST",
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=_openrouter_headers(),
                        json=payload,
                    ) as r:
                        r.raise_for_status()
                        line_iterator = r.aiter_lines().__aiter__()
                        while True:
                            try:
                                line = await asyncio.wait_for(line_iterator.__anext__(), timeout=15.0)
                            except TimeoutError:
                                # Keepalive для прокси/клиентов во время пауз между токенами.
                                yield b": ping\n\n"
                                continue
                            except StopAsyncIteration:
                                break
                            if not line:
                                continue
                            if not line.startswith("data:"):
                                continue
                            raw = line[len("data:") :].strip()
                            if raw == "[DONE]":
                                break
                            try:
                                data = json.loads(raw)
                            except json.JSONDecodeError:
                                continue
                            choice = ((data.get("choices") or [{}])[0]) or {}
                            delta = (choice.get("delta") or {}).get("content")
                            if delta:
                                yield _sse({"delta": delta})
                yield _sse({"done": True, "provider": provider, "model": model})
                return

            if provider == "local":
                # Minimal streaming: one delta with a computed answer, then done.
                resp = await chat(req)
                yield _sse({"delta": resp.answer})
                yield _sse({"done": True, "provider": provider, "model": model})
                return

            raise RuntimeError(f"Unknown AI_PROVIDER: {provider}")
        except httpx.HTTPError as e:
            yield _sse({"error": str(e), "provider": provider, "model": model})
            yield _sse({"done": True, "provider": provider, "model": model})
        except Exception as e:
            yield _sse({"error": str(e), "provider": provider, "model": model})
            yield _sse({"done": True, "provider": provider, "model": model})

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
