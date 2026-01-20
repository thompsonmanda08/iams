# 02 - Getting Started

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier works)
- Code editor (VS Code recommended)

## Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd infratel-iams-web-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

## Environment Configuration

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to find these:**
1. Go to [supabase.com](https://supabase.com)
2. Navigate to Project Settings > API
3. Copy the values

## Database Setup

```bash
# Run migrations (if using Supabase CLI)
npx supabase db push

# Or manually execute SQL from migrations/ folder
# in your Supabase SQL editor
```

## Running Locally

```bash
# Development server
npm run dev

# Open browser
http://localhost:3000
```

## First Login

1. Navigate to `http://localhost:3000`
2. Use default credentials (if seeded) or create account
3. Complete MFA setup if enabled
4. You'll land on the dashboard

## Project Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Supabase connection issues:**
- Verify environment variables
- Check Supabase project status
- Ensure RLS policies are configured

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

## Next Steps

Continue to → [03-architecture.md](03-architecture.md)
