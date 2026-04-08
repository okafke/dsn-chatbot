# DSN Chatbot

Chatbot for the Digital Science Night 2026.

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

---

## Deployment Without a Domain (HTTP only)

If you're deploying to a server without a domain name, you access the app via the server's IP address over HTTP.

### Configuration

In your `.env`:

```env
CORS_ORIGINS=http://YOUR_SERVER_IP
# Leave APP_DOMAIN commented out
```

Run `docker compose up --build -d` and access the app at `http://YOUR_SERVER_IP`.

> ⚠️ **Security note:** Without HTTPS, traffic (including passwords and JWT tokens) is sent in plain text. This is fine for local/private network use, but not recommended for public internet deployment. Consider setting up a domain with HTTPS (see below) or using a VPN/SSH tunnel.

---

## Deployment With a Domain (HTTPS)

If you have a domain name pointing to your server, you can enable HTTPS with free Let's Encrypt certificates.

### Prerequisites

- A domain name with DNS A record pointing to your server's IP (e.g., `chat.example.com`)
- Ports 80 and 443 open in your firewall

### Step 1: Configure

In your `.env`:

```env
APP_DOMAIN=chat.example.com
CORS_ORIGINS=https://chat.example.com
```

### Step 2: Start the stack (HTTP first)

```bash
docker compose up --build -d
```

### Step 3: Obtain SSL certificate with Certbot

```bash
docker run --rm \
  -v dsn-chatbot_certbot_www:/var/www/certbot \
  -v dsn-chatbot_certbot_certs:/etc/letsencrypt \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d chat.example.com
```

> **Note:** Replace `dsn-chatbot` in the volume names with your Docker Compose project name (usually the directory name). Check with `docker volume ls`.

### Step 4: Enable HTTPS in Nginx

```bash
# Generate the SSL config from the template
export APP_DOMAIN=chat.example.com
envsubst '${APP_DOMAIN}' < nginx/conf.d/ssl.conf.template > nginx/conf.d/ssl.conf

# Remove the HTTP-only config (the SSL config handles HTTP→HTTPS redirect)
rm nginx/conf.d/default.conf

# Restart Nginx
docker compose restart nginx
```

Your app is now available at **https://chat.example.com** 🎉

### Step 5: Automatic certificate renewal

```bash
crontab -e

# Add this line (renews at 3 AM daily)
0 3 * * * docker run --rm -v dsn-chatbot_certbot_www:/var/www/certbot -v dsn-chatbot_certbot_certs:/etc/letsencrypt certbot/certbot renew --quiet && docker compose -f /path/to/dsn-chatbot/docker-compose.yml restart nginx
```

---

## Project Structure

```
dsn-chatbot/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Settings (env vars)
│   │   ├── database.py        # SQLAlchemy async setup
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routers/           # API route handlers
│   │   ├── services/          # Business logic
│   │   └── llm/               # LLM provider abstraction
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # Vue.js 3 + TypeScript frontend
│   ├── src/
│   │   ├── views/             # Page components
│   │   ├── components/        # Reusable UI components
│   │   ├── stores/            # Pinia state management
│   │   ├── services/          # API client + SSE handling
│   │   ├── router/            # Vue Router with auth guards
│   │   └── types/             # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf             # SPA serving config
├── nginx/                      # Reverse proxy config
│   ├── nginx.conf
│   └── conf.d/
│       ├── default.conf       # HTTP config (default)
│       └── ssl.conf.template  # HTTPS template (for domain use)
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Documentation

Once running, visit **http://localhost/api/docs** for interactive Swagger UI.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/chat` | Send message (SSE streaming response) |
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/{id}` | Get conversation detail |
| GET | `/api/health` | Health check |

## Adding a New LLM Provider

The backend uses a provider abstraction layer. To add a new provider (e.g., Anthropic):

1. Create `backend/app/llm/anthropic_provider.py` implementing the `LLMProvider` interface
2. Register it in `backend/app/llm/factory.py`
3. Set `LLM_PROVIDER=anthropic` in your `.env`

See `backend/app/llm/base.py` for the interface definition.

## Troubleshooting

### Certbot volume names

If Certbot can't find the volumes, list them:

```bash
docker volume ls | grep certbot
```

### SSE not streaming

The Nginx config includes `proxy_buffering off;` and the backend sends `X-Accel-Buffering: no`. If streaming still doesn't work, check that no other proxy is buffering.

### Database connection issues

```bash
docker compose ps        # Check service status
docker compose logs db   # Check PostgreSQL logs
```
