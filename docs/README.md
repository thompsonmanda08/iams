# INFRATEL IAMS Documentation

**Version:** 2.0
**Last Updated:** January 2026
**Status:** Production Ready

## Quick Navigation

### 🚀 Getting Started
1. [01 - Overview](01-overview.md) - What is INFRATEL IAMS?
2. [02 - Getting Started](02-getting-started.md) - Installation & setup
3. [03 - Architecture](03-architecture.md) - System design & structure
4. [04 - Authentication](04-authentication.md) - Login, MFA, security

### 📚 Core Documentation
5. [05 - Database](05-database.md) - Schema & Supabase integration
6. [06 - API Integration](06-api-integration.md) - Server actions & patterns
7. [07 - Audit Module](07-audit-module.md) - Audit management
8. [08 - Risk Module](08-risk-module.md) - Risk management
9. [09 - Reports Module](09-reports-module.md) - Report builder & PDF
10. [10 - Workflows](10-workflows.md) - Workflow engine

### 🛠️ Development
11. [11 - Admin & Config](11-admin-config.md) - System settings
12. [12 - UI Components](12-ui-components.md) - Component library
13. [13 - State Management](13-state-management.md) - React Query & Zustand
14. [14 - Deployment](14-deployment.md) - Production setup

### 🔒 Operations
15. [15 - Security](15-security.md) - Security best practices
16. [16 - Testing](16-testing.md) - Testing strategy (TBD)
17. [17 - Troubleshooting](17-troubleshooting.md) - Common issues
18. [18 - Contributing](18-contributing.md) - Development guidelines

### 📖 Reference
19. [19 - API Reference](19-api-reference.md) - Complete API docs
20. [20 - Changelog](20-changelog.md) - Version history

## Quick Start (30 seconds)

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run
npm run dev

# 4. Open
http://localhost:3000
```

## For Different Roles

**New Developer?**
→ Start with [01 - Overview](01-overview.md)

**Setting up locally?**
→ Follow [02 - Getting Started](02-getting-started.md)

**Working on a feature?**
→ Check module docs ([07-audit](07-audit-module.md), [08-risk](08-risk-module.md), [09-reports](09-reports-module.md))

**Deploying to production?**
→ Read [14 - Deployment](14-deployment.md)

**Fixing a bug?**
→ See [17 - Troubleshooting](17-troubleshooting.md)

## Documentation Philosophy

Each document is:
- **Focused** - One topic per file
- **Sequential** - Numbered for logical progression
- **Concise** - Straight to the point
- **Actionable** - Code examples and commands

## Need Help?

1. Check [17 - Troubleshooting](17-troubleshooting.md)
2. Search this documentation
3. Check the codebase examples
4. Contact the development team

## Contributing

See [18 - Contributing](18-contributing.md) for guidelines on:
- Code standards
- Pull request process
- Documentation updates
- Testing requirements
