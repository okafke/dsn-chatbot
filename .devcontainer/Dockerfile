FROM mcr.microsoft.com/devcontainers/python:1-3.12-bookworm

# Remove the stale Yarn repo that ships with the base image (expired GPG key)
RUN rm -f /etc/apt/sources.list.d/yarn.list 2>/dev/null; \
    apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Pre-install Python backend dependencies so container startup is fast
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt \
    && pip install --no-cache-dir ruff mypy pytest pytest-asyncio httpx coverage pip-tools pre-commit

# Node.js is added via the devcontainer "features" in devcontainer.json
