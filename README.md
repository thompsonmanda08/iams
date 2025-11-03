# INFRATEL IAMS Web Application

Integrated Audit and Risk Management System for enterprise organizations.

**Version:** 1.0.0
**Framework:** Next.js 16.0 | React 19 | TypeScript 5.8

---

## Overview

INFRATEL IAMS is a comprehensive web application for managing organizational risk and audit processes. It provides:

- **Risk Management** - Risk registers, assessments, KRI monitoring, heat maps
- **Audit Management** - Audit planning, execution, findings, reporting
- **Workflow Engine** - Configurable state-based workflows
- **RBAC System** - Role-based access control with department scoping
- **System Configuration** - Organization structure, users, permissions

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/infratel-iams-web-app.git
cd infratel-iams-web-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Login

- **Username:** `admin`
- **Password:** `Admin@123`

---

## Documentation

📚 **[Complete Documentation](docs/README.md)**

### Quick Links

- **[Getting Started](docs/GETTING_STARTED.md)** - Setup and development guide
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture overview
- **[Authentication](docs/AUTHENTICATION.md)** - Auth and session management
- **[Features](docs/FEATURES.md)** - Feature documentation
- **[API Guide](docs/API_GUIDE.md)** - API integration guide
- **[Deployment](docs/DEPLOYMENT.md)** - Deployment guide

---

## Technology Stack

### Frontend
- **Next.js 16.0** with App Router
- **React 19** with TypeScript 5.8
- **Tailwind CSS 4.1** for styling
- **Radix UI** for accessible components
- **TanStack React Query** for server state
- **Zustand** for client state

### Authentication
- **JWT** with HS256 encryption
- **Multi-Factor Authentication** (OTP)
- **Session cookies** (httpOnly, secure)
- **Role-Based Access Control**

### Data Management
- **Server Actions** for API integration
- **Axios** for HTTP requests
- **Zod** for validation
- **React Hook Form** for forms

---

## Features

### Risk Management
- ✅ Risk registers and tracking
- ✅ Inherent and residual risk scoring
- ✅ Key Risk Indicators (KRI)
- ✅ Risk mitigation actions
- ✅ Risk heat maps
- ✅ Risk appetite management
- ✅ Incident tracking

### Audit Management
- ✅ Multi-year audit planning
- ✅ Audit universe management
- ✅ Template-based workpapers
- ✅ Findings management
- ✅ Budget tracking
- ✅ Task management
- ✅ ISO 27001 templates
- ⚠️ Report generation (in progress)

### System Configuration
- ✅ Organization structure (branches, departments)
- ✅ User management
- ✅ Role and permission management
- ✅ Workflow administration
- ✅ Module configuration
- ✅ Dynamic theming

---

## Project Structure

```
infratel-iams-web-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (private)/                # Admin routes
│   ├── dashboard/                # Main dashboard
│   ├── _actions/                 # Server Actions
│   └── api/                      # API routes
│
├── components/                   # React components
│   ├── ui/                       # UI primitives
│   ├── forms/                    # Form components
│   └── layout/                   # Layout components
│
├── lib/                          # Utilities
│   ├── types/                    # TypeScript types
│   └── session.ts                # Session management
│
├── hooks/                        # Custom hooks
├── public/                       # Static assets
└── docs/                         # Documentation
```

---

## Development

### Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm run type-check    # TypeScript type checking
npm run test          # Run tests
```

### Environment Variables

```env
BASE_URL=https://iams-dev.infratel.co.zm
AUTH_SECRET=your-32-plus-character-secret
POCKET_BASE_URL=https://pocketbase-dev.infratel.co.zm
NODE_ENV=development
```

See [.env.example](.env.example) for all available variables.

---

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deployment Options

- **Vercel** (Recommended) - One-click deployment
- **Docker** - Containerized deployment
- **Traditional Server** - VPS/dedicated server with PM2

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

---

## API Integration

The application integrates with backend API at `https://iams-dev.infratel.co.zm/api/v1`

### Authentication Flow

```
Login → [MFA?] → OTP Verification → Initialize Setup → Dashboard
```

### Server Actions Pattern

```typescript
export async function getResource(): Promise<APIResponse> {
  const url = `/api/v1/resource`;
  try {
    const response = await authenticatedApiClient({ url });
    return successResponse(response.data, "Success");
  } catch (error) {
    return handleError(error, "GET", url);
  }
}
```

See [API Guide](docs/API_GUIDE.md) for complete reference.

---

## Security

- ✅ JWT with encrypted session cookies
- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite strict (CSRF protection)
- ✅ Role-based access control
- ✅ Department-scoped permissions
- ✅ Input validation (client & server)
- ✅ MFA with OTP
- ✅ Password change enforcement
- ✅ Idle screen locking

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## Contributing

### Before You Start

1. Read [Getting Started](docs/GETTING_STARTED.md)
2. Understand [Architecture](docs/ARCHITECTURE.md)
3. Follow code style guidelines

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit changes: `git commit -m "Description"`
6. Push: `git push origin feature/your-feature`
7. Create pull request

---

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
npx kill-port 3000
```

**Module not found:**
```bash
rm -rf .next node_modules
npm install
```

**API connection failed:**
- Check `BASE_URL` in `.env.local`
- Verify backend server is running
- Check network connectivity

See [Getting Started](docs/GETTING_STARTED.md#common-issues) for more.

---

## Support

### Documentation
- [Complete Documentation](docs/README.md)
- [Getting Started Guide](docs/GETTING_STARTED.md)
- [API Reference](docs/API_GUIDE.md)

### Contact
- **Email:** dev-team@infratel.co.zm
- **Slack:** #infratel-iams channel

---

## License

Proprietary - INFRATEL

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query)

---

**Version:** 1.0.0
**Last Updated:** November 3, 2025
**Maintained by:** Development Team
