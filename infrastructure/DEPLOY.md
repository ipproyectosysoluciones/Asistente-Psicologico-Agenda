# Railway Production Deployment

## Local Development

```bash
# Start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

## Production (without PostgreSQL - use Railway's)

### 1. n8n

```bash
docker run -d \
  --name asistente-n8n \
  -p 5678:5678 \
  -e DB_TYPE=postgresdb \
  -e DB_POSTGRESDB_HOST=host.railway.app \
  -e DB_POSTGRESDB_PORT=5432 \
  -e DB_POSTGRESDB_DATABASE=railway \
  -e DB_POSTGRESDB_USER=postgres \
  -e DB_POSTGRESDB_PASSWORD=password \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_secure_password \
  -e WEBHOOK_URL=https://your-app.railway.app \
  n8nio/n8n:latest
```

### 2. Bot

```bash
cd bot
docker build -t asistente-bot .
docker run -d \
  --name asistente-bot \
  -e DATABASE_URL=postgresql://user:pass@host:5432/dbname \
  -e DEFAULT_PSYCHOLOGIST_ID=uuid \
  asistente-bot
```

### 3. Dashboard

```bash
cd dashboard
docker build -t asistente-dashboard .
docker run -d \
  --name asistente-dashboard \
  -p 80:80 \
  -e VITE_API_URL=https://your-n8n.railway.app \
  -e VITE_AUTH_USER=admin \
  -e VITE_AUTH_PASS=your_secure_password \
  asistente-dashboard
```

## Environment Variables Required

### Railway Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@host:5432/db` |
| `N8N_WEBHOOK_URL` | n8n public URL | `https://your-n8n.railway.app` |
| `BOT_WHATSAPP_SESSION` | WPPConnect session | (session tokens) |
| `DASHBOARD_AUTH_USER` | Dashboard user | `admin` |
| `DASHBOARD_AUTH_PASS` | Dashboard password | (secure) |

## Docker Hub Images

After building, push to Docker Hub:

```bash
# Login
docker login -u your-username

# Tag
docker tag asistente-bot:latest your-username/asistente-bot:latest
docker tag asistente-dashboard:latest your-username/asistente-dashboard:latest

# Push
docker push your-username/asistente-bot:latest
docker push your-username/asistente-dashboard:latest
```

## Quick Deploy Commands

### Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy n8n
railway run --service n8n -- npm start

# Deploy bot
cd bot && railway up --service bot

# Deploy dashboard  
cd dashboard && railway up --service dashboard
```

## Troubleshooting

### Bot connection issues
- Check WPPConnect session
- Logs: `docker logs asistente-bot`

### n8n API not responding
- Check webhook URLs match
- Logs: `docker logs asistente-n8n`

### Database connection
- Verify DATABASE_URL format
- Check Railway PostgreSQL is running