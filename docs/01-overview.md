# 01 - Overview

## What is INFRATEL IAMS?

INFRATEL IAMS (Integrated Audit and Risk Management System) is a comprehensive enterprise platform for managing:
- **Audit Plans** - Plan, execute, and document internal audits
- **Risk Management** - Identify, assess, and mitigate organizational risks
- **Compliance** - Track compliance with ISO 27001, COSO, COBIT, NIST frameworks
- **Reporting** - Generate professional audit and risk reports
- **Workflows** - Automated approval workflows for governance

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Radix UI
- TanStack React Query (state management)
- Zustand (local state)
- React PDF (@react-pdf/renderer)

**Backend:**
- Supabase (PostgreSQL database)
- Next.js Server Actions
- Row-Level Security (RLS)

**Development:**
- ESLint
- Prettier
- Git

## Project Structure

```
infratel-iams-web-app/
├── app/                      # Next.js App Router
│   ├── _actions/            # Server Actions (API layer)
│   ├── dashboard/           # Main dashboard modules
│   │   ├── (modules)/       # Feature modules
│   │   │   ├── audit/       # Audit management
│   │   │   ├── risks/       # Risk management
│   │   │   └── reports/     # Report builder
│   │   └── system-configs/  # Admin settings
│   └── api/                 # API routes
├── components/              # Reusable React components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
│   ├── config/              # Configuration files
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── store/                   # Zustand stores
└── docs/                    # Documentation (you are here)
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run development server
npm run dev

# 4. Open browser
http://localhost:3000
```

## Key Features

- ✅ Multi-framework audit support (ISO 27001, COSO, COBIT, NIST)
- ✅ Dynamic report builder with PDF export
- ✅ Risk assessment and treatment workflows
- ✅ Real-time collaboration
- ✅ Role-based access control
- ✅ Screen lock for security
- ✅ Multi-tenant support

## Status

**Current Version:** 2.0
**Production Ready:** Yes
**Test Coverage:** In Progress
**Documentation:** 90% Complete

## Next Steps

Continue to → [02-getting-started.md](02-getting-started.md)
