# INFRATEL IAMS Documentation

**Last Updated:** November 11, 2025
**Status:** ✅ Reorganized & Consolidated

Welcome to the INFRATEL IAMS (Integrated Audit and Risk Management System) documentation. This folder contains organized, consolidated documentation by topic and feature.

---

## 📍 START HERE

**For all developers, read these first:**

1. ⭐ **[CURRENT_IMPLEMENTATION.md](CURRENT_IMPLEMENTATION.md)** - Audit of what's actually implemented
2. 📋 **[RECOMMENDATIONS_FOR_FUTURE.md](RECOMMENDATIONS_FOR_FUTURE.md)** - Future roadmap with effort estimates

---

## 📂 Documentation by Category

### 🏗️ Architecture & Setup - [architecture/](architecture/)

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) - System architecture, tech stack, folder structure
- [AUTHENTICATION.md](architecture/AUTHENTICATION.md) - Auth flows, session management, security
- [MFA_OTP_IMPLEMENTATION.md](architecture/MFA_OTP_IMPLEMENTATION.md) - Multi-factor authentication details

### 🚀 Getting Started - [development/](development/)

- [GETTING_STARTED.md](development/GETTING_STARTED.md) - Quick start, setup, environment config
- [TEMPLATE_USAGE_GUIDE.md](development/TEMPLATE_USAGE_GUIDE.md) - Using template system
- [MIGRATION_SUMMARY.md](development/MIGRATION_SUMMARY.md) - Migration guides

### 🔌 API Integration - [api/](api/)

- **[INTEGRATION_GUIDE.md](api/INTEGRATION_GUIDE.md)** - Consolidated API reference (159+ endpoints, all modules)

### 🎯 Feature Guides - [features/](features/)

- **[Audit Plans](features/audit-plans/)** - 🟠 85% Complete
- **[Budgets](features/budgets/)** - ✅ 100% Complete
- **[Risk Management](features/risk-management/)** - ✅ 100% Complete
- **[Workflows](features/workflows/)**
  - 📊 [WORKFLOW_README.md](features/workflows/WORKFLOW_README.md) - Navigation hub for workflow docs
  - 📈 [WORKFLOW_STATUS.md](features/workflows/WORKFLOW_STATUS.md) - Implementation status (67% complete)
  - 🛠️ [WORKFLOW_IMPLEMENTATION_GUIDE.md](features/workflows/WORKFLOW_IMPLEMENTATION_GUIDE.md) - Step-by-step UI guide
  - 🔍 [WORKFLOW_EDITOR_AUDIT.md](features/workflows/WORKFLOW_EDITOR_AUDIT.md) - Complete data flow reference
- **[Admin](features/admin/)** - ✅ 95% Complete
- [FEATURES_OVERVIEW.md](features/FEATURES_OVERVIEW.md) - High-level feature matrix

### 🔒 Security - [security/](security/)

- [SESSION_MANAGEMENT.md](security/SESSION_MANAGEMENT.md) - Session handling, screen lock, multi-tab sync

### 📦 Deployment - [deployment/](deployment/)

- [DEPLOYMENT.md](deployment/DEPLOYMENT.md) - Deployment options, configuration, production setup

---

## 📊 Status Overview

| Component | Status | Documentation |
|-----------|--------|---|
| Authentication | ✅ Complete | [architecture/AUTHENTICATION.md](architecture/AUTHENTICATION.md) |
| Session Management | ✅ Complete | [security/SESSION_MANAGEMENT.md](security/SESSION_MANAGEMENT.md) |
| Audit Plans | 🟠 85% | [features/audit-plans/](features/audit-plans/) |
| Risk Management | ✅ 100% | [features/risk-management/](features/risk-management/) |
| Budgets | ✅ 100% | [features/budgets/](features/budgets/) |
| Admin/Config | ✅ 95% | [features/admin/](features/admin/) |
| Workflows - Backend | ✅ 100% | [features/workflows/WORKFLOW_STATUS.md](features/workflows/WORKFLOW_STATUS.md) |
| Workflows - UI | 🟡 50% | [features/workflows/WORKFLOW_IMPLEMENTATION_GUIDE.md](features/workflows/WORKFLOW_IMPLEMENTATION_GUIDE.md) |
| API Integration | ✅ 113% | [api/INTEGRATION_GUIDE.md](api/INTEGRATION_GUIDE.md) |
| Testing | ❌ None | [RECOMMENDATIONS_FOR_FUTURE.md](RECOMMENDATIONS_FOR_FUTURE.md) |

---

## 🎯 Quick Start by Role

### New Developer
1. Read [CURRENT_IMPLEMENTATION.md](CURRENT_IMPLEMENTATION.md)
2. Review [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)
3. Follow [development/GETTING_STARTED.md](development/GETTING_STARTED.md)

### Workflow Developer
1. Start with [features/workflows/WORKFLOW_README.md](features/workflows/WORKFLOW_README.md)
2. Check [features/workflows/WORKFLOW_STATUS.md](features/workflows/WORKFLOW_STATUS.md) for what's implemented
3. Follow [features/workflows/WORKFLOW_IMPLEMENTATION_GUIDE.md](features/workflows/WORKFLOW_IMPLEMENTATION_GUIDE.md)
4. Reference [features/workflows/WORKFLOW_EDITOR_AUDIT.md](features/workflows/WORKFLOW_EDITOR_AUDIT.md) for data flow details

### Other Feature Developer
1. Check feature README in [features/](features/)
2. Review [api/INTEGRATION_GUIDE.md](api/INTEGRATION_GUIDE.md)
3. Reference [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)

### API Integration
1. Start with [api/INTEGRATION_GUIDE.md](api/INTEGRATION_GUIDE.md)
2. Browse examples for your module
3. Check `app/_actions/` for patterns

### DevOps/Deployment
1. Read [deployment/DEPLOYMENT.md](deployment/DEPLOYMENT.md)
2. Configure environment
3. Follow deployment steps

---

## 🏗️ Folder Structure

```
docs/
├── README.md
├── CURRENT_IMPLEMENTATION.md       # 📍 What exists
├── RECOMMENDATIONS_FOR_FUTURE.md   # 📋 Future improvements
├── architecture/                   # 🏗️ System design
├── development/                    # 🚀 Setup & development
├── api/                           # 🔌 API reference
├── features/                      # 🎯 Feature guides
├── security/                      # 🔒 Security docs
└── deployment/                    # 📦 Deployment guides
```

---

## 💡 Technology Stack

- **Framework:** Next.js 16.0 (App Router)
- **UI:** React 19, TypeScript 5.8, Tailwind CSS 4.1
- **State:** TanStack React Query v5, Zustand
- **Auth:** JWT with encrypted session cookies
- **API:** Next.js Server Actions, Axios

See [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) for details.

---

## 🚀 Common Tasks

| Task | Link |
|------|------|
| Environment Setup | [development/GETTING_STARTED.md](development/GETTING_STARTED.md) |
| Authentication Flow | [architecture/AUTHENTICATION.md](architecture/AUTHENTICATION.md) |
| API Integration | [api/INTEGRATION_GUIDE.md](api/INTEGRATION_GUIDE.md) |
| Deployment | [deployment/DEPLOYMENT.md](deployment/DEPLOYMENT.md) |
| Workflow Implementation | [features/workflows/WORKFLOW_README.md](features/workflows/WORKFLOW_README.md) |
| Risk Management | [features/risk-management/README.md](features/risk-management/README.md) |
| Audit Plans | [features/audit-plans/README.md](features/audit-plans/README.md) |
| Budgets | [features/budgets/README.md](features/budgets/README.md) |
| Admin Config | [features/admin/README.md](features/admin/README.md) |

---

## ⚡ Quick Commands

```bash
npm run dev              # Development
npm run build            # Build
npm run type-check       # Type checking
npm run lint             # Linting
npm start                # Production
```

---

## 🆘 Help

| Issue | Solution |
|-------|----------|
| Port in use | `npx kill-port 3000` |
| Module not found | `rm -rf .next node_modules && npm install` |
| API fails | Check `BASE_URL` in `.env.local` |
| Build errors | Run `npm run type-check` |
| Auth errors | Clear cookies, verify `AUTH_SECRET` |

---

**Maintained by:** Development Team
**Status:** ✅ Consolidated & Organized
