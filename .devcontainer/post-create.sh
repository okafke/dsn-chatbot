#!/usr/bin/env bash
# post-create.sh — runs once after the devcontainer is first created.
set -euo pipefail

echo "🔧 Setting up DSN Chatbot development environment..."

# ── Backend ──────────────────────────────────────────────────────────────────
echo "📦 Installing backend dependencies (editable + dev extras)..."
cd /workspace/backend
pip install -e ".[dev]"

# ── Frontend ─────────────────────────────────────────────────────────────────
echo "📦 Installing frontend dependencies..."
cd /workspace/frontend
npm install

# ── Environment file ─────────────────────────────────────────────────────────
if [ ! -f /workspace/.env ]; then
  echo "📝 Creating .env from .env.example..."
  cp /workspace/.env.example /workspace/.env
  echo "   ⚠️  Remember to set your OPENAI_API_KEY in .env"
fi

echo ""
echo "✅ Development environment ready!"
echo ""
echo "  Backend:   cd backend && make run        (http://localhost:8000)"
echo "  Frontend:  cd frontend && npm run dev    (http://localhost:5173)"
echo "  Tests:     cd backend && make test"
echo ""
