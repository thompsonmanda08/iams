# INFRATEL IAMS Documentation

**Last Updated:** November 3, 2025

Welcome to the INFRATEL IAMS (Integrated Audit and Risk Management System) documentation.

---

## Quick Navigation

### 🚀 For New Developers

**Start here:**
1. [Getting Started](GETTING_STARTED.md) - Setup and quick start guide
2. [Architecture](ARCHITECTURE.md) - Understand the system architecture
3. [Authentication](AUTHENTICATION.md) - Learn about authentication & sessions

### 📚 Core Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [Getting Started](GETTING_STARTED.md) | Setup, quick start, common tasks | All developers |
| [Architecture](ARCHITECTURE.md) | System architecture, tech stack, patterns | All developers |
| [Authentication](AUTHENTICATION.md) | Auth flow, session management, security | Backend & frontend |
| [Features](FEATURES.md) | Feature documentation, usage examples | All developers, QA |
| [API Guide](API_GUIDE.md) | API endpoints, integration patterns | Frontend developers |
| [Deployment](DEPLOYMENT.md) | Deployment guide, configuration | DevOps, backend |

---

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── GETTING_STARTED.md           # ⭐ Start here for new developers
├── ARCHITECTURE.md              # System architecture overview
├── AUTHENTICATION.md            # Authentication & session management
├── FEATURES.md                  # Features documentation
├── API_GUIDE.md                 # API integration guide
├── DEPLOYMENT.md                # Deployment guide
│
├── WORKFLOW_*.md               # Workflow system documentation
├── MIGRATION_SUMMARY.md        # Migration guides
├── TEMPLATE_USAGE_GUIDE.md     # Template system guide
├── MFA_OTP_IMPLEMENTATION.md   # MFA implementation details
├── SESSION_MANAGEMENT_AUDIT.md # Session management details
├── FRONTEND_API_GUIDE.md       # Extended API guide
│
└── archive/                    # 📦 Historical documents
    ├── SESSION_SUMMARY.md
    ├── IMPLEMENTATION_REPORT.md
    ├── *_AUDIT_*.md
    ├── *_FIXES_*.md
    └── ... (old implementation docs)
```

---

## Quick Reference

### Common Tasks

| Task | Documentation |
|------|---------------|
| Setting up development environment | [Getting Started](GETTING_STARTED.md#quick-start-5-minutes) |
| Understanding authentication flow | [Authentication](AUTHENTICATION.md#authentication-flow) |
| Integrating an API endpoint | [API Guide](API_GUIDE.md#server-actions-pattern) |
| Deploying to production | [Deployment](DEPLOYMENT.md#deployment-options) |
| Adding a new feature | [Getting Started](GETTING_STARTED.md#creating-a-new-feature) |
| Configuring permissions | [Features](FEATURES.md#role-based-access-control-rbac) |
| Setting up workflows | [Features](FEATURES.md#workflow-administration) |

### Technology Stack

- **Framework:** Next.js 16.0 with App Router
- **UI:** React 19, TypeScript 5.8, Tailwind CSS 4.1
- **State:** TanStack React Query, Zustand
- **Auth:** JWT with encrypted session cookies
- **API:** Next.js Server Actions, Axios

See [Architecture](ARCHITECTURE.md#technology-stack) for complete stack.

---

## Feature Documentation

### Risk Management
- [Risk Registers](FEATURES.md#risk-registers)
- [Risk Assessment](FEATURES.md#risk-assessment)
- [KRI Management](FEATURES.md#key-risk-indicators-kri)
- [Risk Actions](FEATURES.md#risk-mitigation-actions)
- [Heat Maps](FEATURES.md#risk-heat-map)

### Audit Management
- [Audit Planning](FEATURES.md#audit-planning)
- [Audit Execution](FEATURES.md#audit-execution)
- [Findings Management](FEATURES.md#audit-execution)
- [Reports](FEATURES.md#audit-reporting)

### System Configuration
- [Organization Structure](FEATURES.md#organization-structure)
- [RBAC](FEATURES.md#role-based-access-control-rbac)
- [Workflow Engine](FEATURES.md#workflow-administration)

---

## API Integration

### Quick Start

```typescript
// 1. Create Server Action
export async function getResources(): Promise<APIResponse> {
  const url = `/api/v1/resources`;
  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response.data, "Success");
  } catch (error) {
    return handleError(error, "GET", url);
  }
}

// 2. Use in Component
const { data } = useQuery({
  queryKey: ['resources'],
  queryFn: getResources
});
```

See [API Guide](API_GUIDE.md) for complete reference.

---

## Authentication

### Login Flow

```
Login → [MFA?] → OTP Verification → Initialize Setup → Dashboard
```

**Quick Links:**
- [Authentication Flow](AUTHENTICATION.md#authentication-flow)
- [Session Management](AUTHENTICATION.md#session-management)
- [MFA Implementation](AUTHENTICATION.md#multi-factor-authentication-mfa)
- [Security](AUTHENTICATION.md#security-best-practices)

---

## Deployment

### Quick Deploy

```bash
# Build
npm run build

# Start
npm run start
```

**Deployment Options:**
- [Vercel](DEPLOYMENT.md#option-1-vercel-recommended)
- [Docker](DEPLOYMENT.md#option-2-docker)
- [VPS/Server](DEPLOYMENT.md#option-3-traditional-vpsserver)

See [Deployment Guide](DEPLOYMENT.md) for details.

---

## Development Guidelines

### Code Style

- **Components:** PascalCase (`UserProfile.tsx`)
- **Files:** kebab-case (`api-client.ts`)
- **Server Actions:** camelCase functions
- **Types:** Interfaces over types

### Best Practices

1. **Always use Server Actions** for API calls
2. **Type everything** with TypeScript
3. **Handle errors** gracefully
4. **Show loading states** during async operations
5. **Invalidate cache** after mutations
6. **Follow existing patterns** in the codebase

See [Getting Started](GETTING_STARTED.md#code-style-guide) for complete guidelines.

---

## Testing

### Running Tests

```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run type-check     # TypeScript check
npm run lint           # Lint code
```

### Manual Testing

- **Login Flow:** Test with/without MFA
- **CRUD Operations:** Create, read, update, delete
- **Permissions:** Test role-based access
- **Workflows:** Test state transitions
- **Error Handling:** Test error scenarios

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `npx kill-port 3000` |
| Module not found | `rm -rf .next node_modules && npm install` |
| API connection failed | Check `BASE_URL` in `.env.local` |
| Auth errors | Clear cookies, check `AUTH_SECRET` |
| Build errors | Run `npm run type-check` |

See [Getting Started](GETTING_STARTED.md#common-issues) for more.

---

## Getting Help

### Resources

- **Documentation:** This folder
- **Code Examples:** Browse `app/` directory
- **Slack:** #infratel-iams channel
- **Email:** dev-team@infratel.co.zm

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Contributing

### Before You Start

1. Read [Getting Started](GETTING_STARTED.md)
2. Understand [Architecture](ARCHITECTURE.md)
3. Follow code style guidelines
4. Test your changes

### Submitting Changes

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Submit pull request

---

## Archive

Historical documentation has been moved to `archive/` folder:

- Session summaries
- Implementation reports
- Audit reports
- Progress tracking docs
- Old fix plans

These are kept for reference but superseded by current documentation.

---

## Document Maintenance

### When to Update

- **Getting Started:** When setup process changes
- **Architecture:** When tech stack or patterns change
- **Authentication:** When auth flow changes
- **Features:** When features are added/changed
- **API Guide:** When endpoints change
- **Deployment:** When deployment process changes

### Last Updated

- Getting Started: November 3, 2025
- Architecture: November 3, 2025
- Authentication: November 3, 2025
- Features: November 3, 2025
- API Guide: November 3, 2025
- Deployment: November 3, 2025

---

## Feedback

Have suggestions for improving documentation?

- Open GitHub issue
- Message on Slack
- Email dev-team@infratel.co.zm

---

**Maintained by:** Development Team
**Last Updated:** November 3, 2025
