# 14 - Deployment

## Overview

Deploy INFRATEL IAMS to production with Vercel and Supabase.

## Prerequisites

- Vercel account
- Supabase production project
- GitHub repository
- Domain (optional)

## Production Checklist

### 1. Environment Variables

**Required variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Next.js
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional
SENTRY_DSN=your_sentry_dsn
```

### 2. Database Setup

```bash
# Run migrations on production database
npx supabase db push --db-url postgresql://...

# Enable Row-Level Security
# Verify all RLS policies are active
```

### 3. Build Configuration

**File:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["your-project.supabase.co"]
  },
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig;
```

### 4. Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select repository

2. **Configure Build Settings:**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Navigate to Project Settings > Environment Variables
   - Add all required variables
   - Select Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Access deployment URL

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## Supabase Production Setup

### 1. Create Production Project

```bash
# Create new project at supabase.com
# Note: Production project URL and keys
```

### 2. Apply Migrations

```bash
# Link to production project
npx supabase link --project-ref your-project-ref

# Push schema
npx supabase db push
```

### 3. Configure Authentication

```sql
-- Set up auth providers
-- Configure email templates
-- Set JWT expiration
-- Enable MFA
```

### 4. Enable RLS

```sql
-- Verify all tables have RLS enabled
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plans ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### 5. Storage Setup

```bash
# Create storage buckets
# Set up bucket policies
# Configure file size limits
```

## Domain Configuration

### Custom Domain on Vercel

1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`

   OR

   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

4. Wait for DNS propagation (up to 48 hours)

## Performance Optimization

### 1. Image Optimization

```typescript
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>
```

### 2. Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from "next/dynamic";

const ReportBuilder = dynamic(() => import("@/components/reports/report-builder"), {
  loading: () => <LoadingSpinner />
});
```

### 3. React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3
    }
  }
});
```

### 4. Database Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_reports_entity_id ON reports(entity_id);
CREATE INDEX idx_findings_audit_plan_id ON findings(audit_plan_id);
CREATE INDEX idx_reports_status ON reports(status);
```

## Monitoring

### 1. Vercel Analytics

Enable in Project Settings > Analytics.

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

**File:** `sentry.client.config.js`

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});
```

### 3. Supabase Monitoring

- Check Database > Reports
- Monitor API usage
- Review error logs

## Backup Strategy

### Database Backups

Supabase Pro includes automatic daily backups. For additional safety:

```bash
# Manual backup
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Restore
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

### Storage Backups

```bash
# Backup storage buckets
npx supabase storage export bucket-name ./backup
```

## CI/CD Pipeline

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

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
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

## Rollback Procedure

### Vercel Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database Rollback

```bash
# Restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

## Security Checklist

- [ ] All environment variables set
- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] MFA enforced for admins
- [ ] Security headers configured

## Post-Deployment

1. **Smoke Test:**
   - Login
   - Create audit plan
   - Generate report
   - Test workflows

2. **Monitor:**
   - Check error rates
   - Review performance metrics
   - Monitor database load

3. **Document:**
   - Production URL
   - Admin credentials
   - Deployment date
   - Known issues

## Next Steps

Continue to → [15-security.md](15-security.md)
