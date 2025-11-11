# Getting Started

**INFRATEL IAMS Web Application**
**Last Updated:** November 3, 2025

---

## Welcome

Welcome to the INFRATEL IAMS (Integrated Audit and Risk Management System) development guide. This document will help you get started with development.

---

## Prerequisites

### Required
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended) or any code editor

### Recommended
- **Postman** for API testing
- **React Developer Tools** browser extension
- **Database GUI** (e.g., DBeaver, pgAdmin)

---

## Quick Start (5 minutes)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/infratel-iams-web-app.git
cd infratel-iams-web-app

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your settings
nano .env.local
```

**.env.local:**
```env
BASE_URL=https://iams-dev.infratel.co.zm
AUTH_SECRET=your-32-plus-character-secret-key
POCKET_BASE_URL=https://pocketbase-dev.infratel.co.zm
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Login

**Default credentials:**
- Username: `admin`
- Password: `Admin@123`

---

## Project Structure

```
infratel-iams-web-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login page
│   │   └── otp/                  # OTP verification
│   ├── (private)/                # Admin routes
│   │   └── admin/                # Admin dashboard
│   ├── dashboard/                # Main dashboard
│   │   ├── home/                 # Dashboard home
│   │   ├── (modules)/            # Feature modules
│   │   │   ├── risks/            # Risk management
│   │   │   └── audit/            # Audit management
│   │   ├── profile/              # User profile
│   │   └── system-configs/       # System configuration
│   ├── _actions/                 # Server Actions
│   └── api/                      # API routes
│
├── components/                   # React components
│   ├── ui/                       # UI primitives
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── dialogs/                  # Dialog components
│
├── lib/                          # Utilities & helpers
│   ├── types/                    # TypeScript types
│   ├── session.ts                # Session management
│   ├── constants.ts              # Constants
│   └── utils.ts                  # Utility functions
│
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
└── docs/                         # Documentation
```

---

## Development Workflow

### Creating a New Feature

**1. Create Server Action** (`app/_actions/feature-actions.ts`):

```typescript
export async function getFeatures(): Promise<APIResponse> {
  const url = `/api/v1/features`;

  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response.data, "Features retrieved");
  } catch (error: Error | any) {
    return handleError(error, "GET", url);
  }
}
```

**2. Create Page** (`app/dashboard/features/page.tsx`):

```typescript
import { getFeatures } from '@/app/_actions/feature-actions';

export default async function FeaturesPage() {
  const response = await getFeatures();

  if (!response.success) {
    return <Error message={response.message} />;
  }

  return <FeaturesList features={response.data} />;
}
```

**3. Create Client Component** (`app/dashboard/features/_components/features-list.tsx`):

```typescript
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export function FeaturesList({ features }) {
  const { data, isLoading } = useQuery({
    queryKey: ['features'],
    queryFn: getFeatures,
    initialData: features
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      {data.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
```

### Adding a New API Endpoint

**1. Define Server Action:**

```typescript
// app/_actions/resource-actions.ts
export async function createResource(data: ResourceInput): Promise<APIResponse> {
  const url = `/api/v1/resources`;

  if (!data.name) {
    return handleBadRequest("Name is required");
  }

  try {
    const response = await authenticatedApiClient({
      url,
      method: "POST",
      data
    });

    return successResponse(response.data, "Resource created");
  } catch (error: Error | any) {
    return handleError(error, "POST", url);
  }
}
```

**2. Add Type Definition:**

```typescript
// lib/types/resource.ts
export interface Resource {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceInput {
  name: string;
  description: string;
}
```

**3. Use in Component:**

```typescript
const mutation = useMutation({
  mutationFn: createResource,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
    toast.success("Resource created");
  }
});
```

---

## Common Tasks

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Building

```bash
npm run build
```

---

## Code Style Guide

### File Naming

- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** kebab-case (`api-client.ts`)
- **Types:** kebab-case (`user-types.ts`)

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface Props {
  title: string;
  onSave: () => void;
}

// 3. Component
export function MyComponent({ title, onSave }: Props) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Handlers
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Save</Button>
    </div>
  );
}
```

### TypeScript Conventions

- Use interfaces over types when possible
- Always define return types for functions
- Avoid `any` - use `unknown` if type is truly unknown
- Use const assertions for literals

---

## Debugging

### Browser DevTools

1. **React DevTools**
   - Inspect component hierarchy
   - View props and state
   - Profile performance

2. **Network Tab**
   - Monitor API calls
   - Check request/response
   - Verify headers

3. **Console**
   - View logs
   - Check errors
   - Test functions

### VS Code Debugging

**.vscode/launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229
    }
  ]
}
```

### Server Action Debugging

Add `console.log` in server actions:

```typescript
export async function myAction(data) {
  console.log('[myAction] Input:', data);

  const response = await apiCall();
  console.log('[myAction] Response:', response);

  return response;
}
```

View logs in terminal where `npm run dev` is running.

---

## Database Access

### Using Postman

1. Import collection: `docs/IAMS_API_POSTMAN_COLLECTION.json`
2. Set environment:
   - `BASE_URL`: `https://iams-dev.infratel.co.zm`
   - `TOKEN`: Get from login response
3. Test endpoints

### Direct SQL (Backend Team Only)

Contact backend team for database access.

---

## Environment Variables

### Development (.env.local)

```env
BASE_URL=https://iams-dev.infratel.co.zm
AUTH_SECRET=dev-secret-32-plus-characters
POCKET_BASE_URL=https://pocketbase-dev.infratel.co.zm
NODE_ENV=development
```

### Production (.env.production)

```env
BASE_URL=https://iams.infratel.co.zm
AUTH_SECRET=production-secret-keep-this-safe
POCKET_BASE_URL=https://pocketbase.infratel.co.zm
NODE_ENV=production
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript check

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open database GUI
```

---

## Getting Help

### Documentation

- [Architecture](ARCHITECTURE.md) - System architecture overview
- [Authentication](AUTHENTICATION.md) - Auth & session management
- [Features](FEATURES.md) - Features documentation
- [API Guide](API_GUIDE.md) - API integration guide
- [Deployment](DEPLOYMENT.md) - Deployment guide

### Code Examples

Look at existing implementations:
- **Risk Module:** `app/dashboard/(modules)/risks/`
- **Audit Module:** `app/dashboard/(modules)/audit/`
- **System Config:** `app/dashboard/system-configs/`

### Community

- **Slack:** #infratel-iams channel
- **Email:** dev-team@infratel.co.zm
- **Issues:** GitHub Issues

---

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

### API Connection Failed

- Verify `BASE_URL` in `.env.local`
- Check backend server is running
- Verify network connectivity

### Authentication Errors

- Clear browser cookies
- Check `AUTH_SECRET` matches backend
- Verify token hasn't expired

---

## Next Steps

1. **Explore the codebase** - Browse existing features
2. **Read documentation** - Understand architecture
3. **Pick a task** - Start with small bugs or features
4. **Ask questions** - Use Slack or email
5. **Submit PR** - Follow contribution guidelines

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated:** November 3, 2025
**Maintained by:** Development Team
