FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app files
COPY backend/app ./app

# Expose server port
EXPOSE 8000

# Start ASGI application binding to dynamic PORT (e.g. Railway or Render)
CMD uvicorn app.main:sio_asgi --host 0.0.0.0 --port ${PORT:-8000}
