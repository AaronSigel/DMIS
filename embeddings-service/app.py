import os
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer


app = FastAPI(title="DMIS Embeddings Service")


class EmbedRequest(BaseModel):
    texts: list[str] = Field(min_length=1)
    normalize: bool = True


class EmbedResponse(BaseModel):
    model: str
    dimension: int
    embeddings: list[list[float]]


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    model_path = os.environ.get("MODEL_PATH", "/models/bge-m3")
    if not os.path.exists(model_path):
        raise RuntimeError(f"Model path not found: {model_path}")
    return SentenceTransformer(model_path)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "embeddings-service"}


@app.get("/info")
def info() -> dict[str, str | int]:
    model_path = os.environ.get("MODEL_PATH", "/models/bge-m3")
    model = get_model()
    return {
        "model": model_path,
        "dimension": model.get_sentence_embedding_dimension(),
    }


@app.post("/embed", response_model=EmbedResponse)
def embed(payload: EmbedRequest) -> EmbedResponse:
    try:
        model_path = os.environ.get("MODEL_PATH", "/models/bge-m3")
        model = get_model()
        vectors = model.encode(payload.texts, normalize_embeddings=payload.normalize)
        embeddings = vectors.tolist()
        return EmbedResponse(
            model=model_path,
            dimension=model.get_sentence_embedding_dimension(),
            embeddings=embeddings,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

