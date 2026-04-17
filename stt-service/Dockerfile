ARG PYTHON_IMAGE=python:3.12-slim
ARG RUNTIME_BASE_IMAGE=base

FROM ${PYTHON_IMAGE} AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch

FROM ${RUNTIME_BASE_IMAGE} AS runtime
WORKDIR /app
ENV PATH="/opt/venv/bin:${PATH}"
COPY app.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
