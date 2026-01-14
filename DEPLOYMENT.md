# Deployment Guide - Churro Chat

This guide covers how to set up and run Churro Chat in isolated, reproducible environments.

## Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Usually included with Docker Desktop
- **nvm** (optional): [Install nvm](https://github.com/nvm-sh/nvm) for local Node.js version management

---

## Option 1: Docker (Recommended for Deployment)

### Quick Start - Development

```bash
# Start development server with hot reload
docker compose up dev

# Access the app at http://localhost:3000
```

### Quick Start - Production

```bash
# Build and run production image
docker compose up prod

# Or build manually for deployment elsewhere
docker build --target production -t churro-chat:latest .
```

### Common Docker Commands

```bash
# Run in background (detached mode)
docker compose up -d dev

# View logs
docker compose logs -f dev

# Stop all services
docker compose down

# Rebuild after changing dependencies (package.json)
docker compose build --no-cache dev

# Clean up everything (images, volumes, etc.)
docker compose down --rmi all --volumes
```

### Deploying to Production

#### Option A: Docker on a VPS (DigitalOcean, Linode, AWS EC2, etc.)

```bash
# On your server
git clone <your-repo>
cd churro-chat/examples/poc-demo
docker compose up -d prod
```

#### Option B: Container Registries (Docker Hub, AWS ECR, GCR)

```bash
# Build and tag
docker build --target production -t yourusername/churro-chat:latest .

# Push to registry
docker push yourusername/churro-chat:latest

# Pull and run on any server
docker pull yourusername/churro-chat:latest
docker run -d -p 3000:3000 yourusername/churro-chat:latest
```

#### Option C: Platform-as-a-Service

Most PaaS providers auto-detect the Dockerfile:

- **Railway**: `railway up`
- **Render**: Connect repo, auto-deploys
- **Fly.io**: `fly launch && fly deploy`
- **Google Cloud Run**: `gcloud run deploy`

---

## Option 2: nvm (For Local Development)

If you prefer running Node.js directly without Docker:

```bash
# Install the correct Node.js version
nvm install
nvm use

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The `.nvmrc` file ensures all developers use Node.js v20.

---

## Environment Variables

For production deployments, you may want to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port (if customizing) | `3000` |

Create a `.env` file for local overrides (never commit this):

```bash
# .env
NODE_ENV=development
```

---

## File Locations

Place these files in `examples/poc-demo/`:

```
examples/poc-demo/
├── .nvmrc              # Node.js version for nvm
├── .dockerignore       # Files to exclude from Docker builds
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Docker Compose configuration
├── DEPLOYMENT.md       # This file
├── package.json
├── src/
└── ...
```

---

## Troubleshooting

### Port already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Or use a different port
docker compose run -p 3001:3000 dev
```

### Node modules issues after switching branches
```bash
# Rebuild without cache
docker compose build --no-cache dev
```

### Container won't start
```bash
# Check logs for errors
docker compose logs dev

# Try interactive mode to debug
docker compose run --rm dev sh
```
