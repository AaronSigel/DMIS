ARG PYTHON_IMAGE=python:3.12-slim
ARG RUNTIME_BASE_IMAGE=base

FROM ${PYTHON_IMAGE} AS base
WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"
RUN pip install --no-cache-dir -r requirements.txt

FROM ${RUNTIME_BASE_IMAGE} AS runtime
WORKDIR /app
ENV PATH="/opt/venv/bin:${PATH}"
COPY app.py .
ENV MODEL_PATH=/models/bge-m3
ENV MODEL_RERANKER_PATH=/models/bge-reranker
EXPOSE 8001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]

