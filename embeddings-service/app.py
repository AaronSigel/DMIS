import os
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import CrossEncoder, SentenceTransformer


app = FastAPI(title="DMIS Embeddings Service")


class EmbedRequest(BaseModel):
    texts: list[str] = Field(min_length=1)
    normalize: bool = True


class EmbedResponse(BaseModel):
    model: str
    dimension: int
    embeddings: list[list[float]]


class RerankRequest(BaseModel):
    query: str = Field(min_length=1)
    candidates: list[str] = Field(min_length=1)
    topN: int | None = Field(default=None, ge=1)


class RerankItem(BaseModel):
    index: int
    score: float


class RerankResponse(BaseModel):
    model: str
    results: list[RerankItem]


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    model_path = os.environ.get("MODEL_PATH", "/models/bge-m3")
    if not os.path.exists(model_path):
        raise RuntimeError(f"Model path not found: {model_path}")
    return SentenceTransformer(model_path)


@lru_cache(maxsize=1)
def get_reranker() -> CrossEncoder:
    model_path = os.environ.get("MODEL_RERANKER_PATH", "/models/bge-reranker-v2-m3")
    if not os.path.exists(model_path):
        raise RuntimeError(f"Reranker model path not found: {model_path}")
    return CrossEncoder(model_path)


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


@app.post("/rerank", response_model=RerankResponse)
def rerank(payload: RerankRequest) -> RerankResponse:
    try:
        model_path = os.environ.get("MODEL_RERANKER_PATH", "/models/bge-reranker-v2-m3")
        reranker = get_reranker()
        pairs = [(payload.query, candidate) for candidate in payload.candidates]
        raw_scores = reranker.predict(pairs)
        # sentence-transformers может вернуть numpy array или обычный list.
        # Нормализуем ответ к list[float], чтобы избежать 500 из-за .tolist().
        scores = raw_scores.tolist() if hasattr(raw_scores, "tolist") else list(raw_scores)
        ranked = sorted(
            (RerankItem(index=index, score=float(score)) for index, score in enumerate(scores)),
            key=lambda item: item.score,
            reverse=True,
        )
        if payload.topN is not None:
            ranked = ranked[:payload.topN]
        return RerankResponse(model=model_path, results=ranked)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

