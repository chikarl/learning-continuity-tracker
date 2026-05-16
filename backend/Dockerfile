FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system appgroup \
    && adduser --system --ingroup appgroup appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

# Cloud Run sets PORT env variable; default to 8080 for standard compliance
ENV PORT=8080
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
