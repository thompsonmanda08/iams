# Deployment Guide

**INFRATEL IAMS Web Application**
**Last Updated:** November 3, 2025

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to backend API
- PocketBase instance (for file uploads)
- Environment variables configured

---

## Environment Configuration

### Development Environment

Create `.env.local`:

```env
# API Configuration
BASE_URL=https://iams-dev.infratel.co.zm
POCKET_BASE_URL=https://pocketbase-dev.infratel.co.zm

# Authentication
AUTH_SECRET=your-32-plus-character-secret-key-here

# Application
NEXT_PUBLIC_APP_NAME=INFRATEL IAMS
NODE_ENV=development
```

### Production Environment

Create `.env.production`:

```env
# API Configuration
BASE_URL=https://iams.infratel.co.zm
POCKET_BASE_URL=https://pocketbase.infratel.co.zm

# Authentication
AUTH_SECRET=your-production-secret-key-32-plus-characters

# Application
NEXT_PUBLIC_APP_NAME=INFRATEL IAMS
NODE_ENV=production
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/infratel-iams-web-app.git
cd infratel-iams-web-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Building for Production

### 1. Build Application

```bash
npm run build
# or
yarn build
```

This creates optimized production build in `.next` folder.

### 2. Test Production Build Locally

```bash
npm run start
# or
yarn start
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Steps:**

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

**Environment Variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add all variables from `.env.production`
- Redeploy

**Custom Domain:**
```bash
vercel domains add iams.infratel.co.zm
```

### Option 2: Docker

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and Run:**

```bash
# Build image
docker build -t infratel-iams-web .

# Run container
docker run -p 3000:3000 \
  -e BASE_URL=https://iams.infratel.co.zm \
  -e AUTH_SECRET=your-secret \
  infratel-iams-web
```

**Docker Compose:**

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BASE_URL=https://iams.infratel.co.zm
      - AUTH_SECRET=${AUTH_SECRET}
      - POCKET_BASE_URL=${POCKET_BASE_URL}
    restart: unless-stopped
```

### Option 3: Traditional VPS/Server

**Requirements:**
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

**PM2 Setup:**

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "infratel-iams" -- start

# Save PM2 configuration
pm2 save

# Auto-start on reboot
pm2 startup
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name iams.infratel.co.zm;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL with Let's Encrypt:**

```bash
sudo certbot --nginx -d iams.infratel.co.zm
```

---

## Database & Backend Setup

### Backend API

Ensure backend API is running and accessible:

```bash
curl https://iams-dev.infratel.co.zm/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### PocketBase

1. Download PocketBase from [pocketbase.io](https://pocketbase.io)
2. Extract and run:
   ```bash
   ./pocketbase serve
   ```
3. Access admin panel: `http://localhost:8090/_/`
4. Create `temp_files` collection
5. Configure authentication

---

## Post-Deployment Checklist

### Security

- [ ] All environment variables set correctly
- [ ] `AUTH_SECRET` is strong (32+ characters)
- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] CORS settings verified
- [ ] Rate limiting enabled

### Performance

- [ ] Static assets cached
- [ ] Images optimized
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured (if applicable)
- [ ] Database indexes created

### Monitoring

- [ ] Error tracking configured (Sentry)
- [ ] Analytics enabled (Google Analytics)
- [ ] Uptime monitoring setup
- [ ] Log aggregation configured

### Testing

- [ ] Login flow tested
- [ ] MFA flow tested
- [ ] All main features accessible
- [ ] Mobile responsive verified
- [ ] Cross-browser tested
- [ ] API endpoints responsive

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | Yes | Backend API base URL |
| `AUTH_SECRET` | Yes | JWT encryption secret (32+ chars) |
| `POCKET_BASE_URL` | Yes | PocketBase instance URL |
| `NEXT_PUBLIC_APP_NAME` | No | Application name |
| `NODE_ENV` | Yes | Environment (development/production) |

---

## CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Troubleshooting

### Build Errors

**Issue:** TypeScript errors during build

```bash
# Check tsconfig.json
# Ensure typescript.ignoreBuildErrors is set if needed
```

**Issue:** Module not found

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Runtime Errors

**Issue:** 500 Internal Server Error

- Check environment variables are set
- Verify BASE_URL is accessible
- Check server logs

**Issue:** Authentication fails

- Verify AUTH_SECRET matches backend
- Check token expiration settings
- Clear browser cookies

**Issue:** API calls failing

- Verify BASE_URL is correct
- Check CORS settings on backend
- Ensure network connectivity

---

## Monitoring & Logging

### Application Logs

**PM2 Logs:**
```bash
pm2 logs infratel-iams
```

**Docker Logs:**
```bash
docker logs infratel-iams-web
```

### Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## Backup & Recovery

### Database Backup

Backend team handles database backups.

### Configuration Backup

```bash
# Backup environment variables
cp .env.production .env.production.backup

# Backup PM2 configuration
pm2 save
```

### Recovery Steps

1. Restore environment variables
2. Reinstall dependencies: `npm ci`
3. Rebuild application: `npm run build`
4. Restart services: `pm2 restart all`

---

## Scaling

### Horizontal Scaling

**Load Balancer Setup:**

```nginx
upstream infratel_iams {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://infratel_iams;
    }
}
```

### Vertical Scaling

**Increase PM2 instances:**

```bash
pm2 start npm --name "infratel-iams" -i max -- start
```

---

## Performance Optimization

### Caching Strategy

- Static assets: 1 year
- API responses: 5 minutes
- User session: 1 hour

### CDN Configuration

Use Cloudflare or similar for:
- Static asset delivery
- DDoS protection
- SSL/TLS encryption
- Global caching

---

## References

- [Architecture Overview](ARCHITECTURE.md)
- [Getting Started](GETTING_STARTED.md)
- [API Guide](API_GUIDE.md)
- [Features Documentation](FEATURES.md)

---

**Last Updated:** November 3, 2025
**Maintained by:** Development Team
