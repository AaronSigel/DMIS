import json
import os
from typing import Any, AsyncIterator, Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field


app = FastAPI(title="DMIS AI Service")


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
                        async for line in r.aiter_lines():
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

    return StreamingResponse(gen(), media_type="text/event-stream")
