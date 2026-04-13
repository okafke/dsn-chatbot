#!/usr/bin/env bash
# post-start.sh — runs every time the devcontainer starts (including rebuilds).
set -euo pipefail

echo "🚀 DSN Chatbot devcontainer started."
echo ""
echo "  PostgreSQL is available at db:5432 (user: chatbot, db: chatbot)"
echo ""
echo "  Quick start:"
echo "    Terminal 1:  cd backend  && make run       # FastAPI on :8000"
echo "    Terminal 2:  cd frontend && npm run dev    # Vite on :5173"
echo ""
