# DSN Chatbot

Chatbot for the Digital Science Night 2026.
Contains a few games that you can play against an LLM:
- LLM acts as sad robot, cheer him up!
- LLM acts as lazy robot, and tries to find the laziest way to solve your task.
- CTF, try to prompt inject an LLM to get a secret and reach the leaderboards.

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- An OpenAI API key

### 1. Clone and configure

```bash
git clone https://github.com/okafke/dsn-chatbot.git
cd dsn-chatbot
cp .env.example .env
```

Edit `.env` and set **at minimum** these values:

```env
POSTGRES_PASSWORD=your-secure-db-password
JWT_SECRET_KEY=<generate-a-random-secret>
OPENAI_API_KEY=sk-your-openai-api-key
```

Generate secure secrets:

```bash
# Generate JWT secret
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Generate DB password
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Start the stack

```bash
docker compose up --build -d
```

### 3. Open the app

Navigate to **http://localhost** in your browser. Register a new account and start chatting!

### 4. View logs

```bash
docker compose logs -f backend   # Backend logs
docker compose logs -f           # All services
```
