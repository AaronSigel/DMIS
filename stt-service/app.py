import os
import tempfile
import time
from collections import deque
from functools import lru_cache
from statistics import median

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

try:
    import torch
    from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
except Exception:  # pragma: no cover
    torch = None  # type: ignore[assignment]
    AutoModelForSpeechSeq2Seq = None  # type: ignore[assignment]
    AutoProcessor = None  # type: ignore[assignment]
    pipeline = None  # type: ignore[assignment]


app = FastAPI(title="DMIS STT Service")
TRANSCRIBE_LATENCIES_MS = deque(maxlen=200)


def _read_int_env(name: str, default: int) -> int:
    raw = os.environ.get(name, str(default))
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value > 0 else default


def _resolve_profile(profile: str | None) -> str:
    normalized = (profile or os.environ.get("STT_PROFILE", "fast")).strip().lower()
    if normalized not in {"fast", "accurate"}:
        return "fast"
    return normalized


def _resolve_beam_size(profile: str, explicit_beam_size: int | None) -> int:
    if explicit_beam_size is not None and explicit_beam_size > 0:
        return explicit_beam_size
    if profile == "accurate":
        return _read_int_env("STT_BEAM_SIZE_ACCURATE", 3)
    return _read_int_env("STT_BEAM_SIZE_FAST", 1)


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, min(len(ordered) - 1, int(round((percentile / 100.0) * (len(ordered) - 1)))))
    return ordered[index]


class TranscriptResponse(BaseModel):
    text: str = Field(min_length=1)
    provider: str
    language_detected: str | None = None


class InfoResponse(BaseModel):
    model_path_fast: str
    model_path_accurate: str
    device: str
    compute_type: str
    default_profile: str
    beam_size_fast: int
    beam_size_accurate: int
    latency_p50_ms: float = 0
    latency_p95_ms: float = 0
    latency_p99_ms: float = 0
    latency_median_ms: float = 0


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "stt-service"}


def _build_asr(model_path: str):
    if torch is None or AutoModelForSpeechSeq2Seq is None or AutoProcessor is None or pipeline is None:
        raise RuntimeError("transformers/torch are not installed")

    if not os.path.exists(model_path):
        raise RuntimeError(f"Model path not found: {model_path}")

    device = os.environ.get("DEVICE", "cpu")
    torch_device = "cuda" if device.startswith("cuda") and torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if torch_device == "cuda" else torch.float32

    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        model_path,
        torch_dtype=torch_dtype,
        low_cpu_mem_usage=True,
        use_safetensors=True,
    )
    processor = AutoProcessor.from_pretrained(model_path)

    asr = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        device=0 if torch_device == "cuda" else -1,
    )
    return asr, processor, torch_device


@lru_cache(maxsize=2)
def get_asr(model_path: str):
    return _build_asr(model_path)


def _resolve_model_path(profile: str) -> str:
    if profile == "accurate":
        return os.environ.get("MODEL_PATH_ACCURATE", os.environ.get("MODEL_PATH", "/models/whisper-medium"))
    return os.environ.get("MODEL_PATH_FAST", "/models/whisper-small")


@app.get("/info", response_model=InfoResponse)
def info() -> InfoResponse:
    model_path_fast = _resolve_model_path("fast")
    model_path_accurate = _resolve_model_path("accurate")
    device = os.environ.get("DEVICE", "cpu")
    compute_type = os.environ.get("COMPUTE_TYPE", "int8")
    _ = get_asr(model_path_fast)
    _ = get_asr(model_path_accurate)
    latency_values = list(TRANSCRIBE_LATENCIES_MS)
    return InfoResponse(
        model_path_fast=model_path_fast,
        model_path_accurate=model_path_accurate,
        device=device,
        compute_type=compute_type,
        default_profile=_resolve_profile(None),
        beam_size_fast=_read_int_env("STT_BEAM_SIZE_FAST", 1),
        beam_size_accurate=_read_int_env("STT_BEAM_SIZE_ACCURATE", 3),
        latency_p50_ms=round(_percentile(latency_values, 50), 2),
        latency_p95_ms=round(_percentile(latency_values, 95), 2),
        latency_p99_ms=round(_percentile(latency_values, 99), 2),
        latency_median_ms=round(median(latency_values), 2) if latency_values else 0,
    )


@app.post("/stt/transcribe", response_model=TranscriptResponse)
async def transcribe(
    file: UploadFile = File(...),
    language: str = "ru",
    profile: str | None = None,
    task: str = "transcribe",
    beam_size: int | None = None,
) -> TranscriptResponse:
    request_started = time.perf_counter()
    try:
        resolved_profile = _resolve_profile(profile)
        model_path = _resolve_model_path(resolved_profile)
        asr, processor, _torch_device = get_asr(model_path)
        resolved_beam_size = _resolve_beam_size(resolved_profile, beam_size)

        suffix = ""
        if file.filename:
            _, ext = os.path.splitext(file.filename)
            suffix = ext

        io_started = time.perf_counter()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                tmp.write(chunk)
        io_elapsed_ms = (time.perf_counter() - io_started) * 1000

        try:
            forced_decoder_ids = None
            if language:
                forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task=task)

            inference_started = time.perf_counter()
            result = asr(
                tmp_path,
                generate_kwargs={
                    **({"forced_decoder_ids": forced_decoder_ids} if forced_decoder_ids is not None else {}),
                    "num_beams": resolved_beam_size,
                },
            )
            inference_elapsed_ms = (time.perf_counter() - inference_started) * 1000
            text = (result.get("text") or "").strip()
            if not text:
                raise RuntimeError("Empty transcript")

            total_elapsed_ms = (time.perf_counter() - request_started) * 1000
            TRANSCRIBE_LATENCIES_MS.append(total_elapsed_ms)
            print(
                f"stt_transcribe profile={resolved_profile} model_path={model_path} num_beams={resolved_beam_size} "
                f"io_ms={io_elapsed_ms:.2f} asr_ms={inference_elapsed_ms:.2f} total_ms={total_elapsed_ms:.2f}"
            )
            return TranscriptResponse(
                text=text,
                provider="transformers-whisper",
                language_detected=None,
            )
        finally:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
    except Exception as e:
        total_elapsed_ms = (time.perf_counter() - request_started) * 1000
        TRANSCRIBE_LATENCIES_MS.append(total_elapsed_ms)
        raise HTTPException(status_code=500, detail=str(e)) from e
