import os
import tempfile
from functools import lru_cache

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


class TranscriptResponse(BaseModel):
    text: str = Field(min_length=1)
    provider: str
    language_detected: str | None = None


class InfoResponse(BaseModel):
    model_path: str
    device: str
    compute_type: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "stt-service"}


@lru_cache(maxsize=1)
def get_asr():
    if torch is None or AutoModelForSpeechSeq2Seq is None or AutoProcessor is None or pipeline is None:
        raise RuntimeError("transformers/torch are not installed")

    model_path = os.environ.get("MODEL_PATH", "/models/whisper-large-v3-turbo")
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


@app.get("/info", response_model=InfoResponse)
def info() -> InfoResponse:
    model_path = os.environ.get("MODEL_PATH", "/models/whisper-large-v3-turbo")
    device = os.environ.get("DEVICE", "cpu")
    compute_type = os.environ.get("COMPUTE_TYPE", "int8")
    _ = get_asr()
    return InfoResponse(model_path=model_path, device=device, compute_type=compute_type)


@app.post("/stt/transcribe", response_model=TranscriptResponse)
async def transcribe(
    file: UploadFile = File(...),
    language: str = "ru",
    task: str = "transcribe",
    beam_size: int = 5,
) -> TranscriptResponse:
    try:
        asr, processor, _torch_device = get_asr()

        suffix = ""
        if file.filename:
            _, ext = os.path.splitext(file.filename)
            suffix = ext

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            tmp.write(await file.read())

        try:
            forced_decoder_ids = None
            if language:
                forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task=task)

            result = asr(
                tmp_path,
                generate_kwargs={
                    **({"forced_decoder_ids": forced_decoder_ids} if forced_decoder_ids is not None else {}),
                    "num_beams": beam_size,
                },
            )
            text = (result.get("text") or "").strip()
            if not text:
                raise RuntimeError("Empty transcript")

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
        raise HTTPException(status_code=500, detail=str(e)) from e
