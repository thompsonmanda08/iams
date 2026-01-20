# 15 - Security

## Overview

INFRATEL IAMS implements defense-in-depth security:
- Authentication & authorization
- Row-Level Security (RLS)
- Input validation
- OWASP Top 10 protections
- Security monitoring

## Authentication Security

### Password Requirements

```typescript
// Minimum requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true
};
```

### Multi-Factor Authentication (MFA)

**Enforce for privileged roles:**
```typescript
export async function requireMFA(user: User) {
  if (["admin", "auditor"].includes(user.role) && !user.mfa_enabled) {
    throw new Error("MFA required for this role");
  }
}
```

### Session Management

**Configuration:**
```typescript
const SESSION_CONFIG = {
  maxAge: 30 * 60, // 30 minutes
  updateAge: 5 * 60, // Refresh every 5 minutes
  secure: true, // HTTPS only
  httpOnly: true, // No JavaScript access
  sameSite: "strict" // CSRF protection
};
```

**Auto-logout on inactivity:**
```typescript
import { useIdleTimer } from "react-idle-timer";

const { isIdle } = useIdleTimer({
  timeout: 15 * 60 * 1000, // 15 minutes
  onIdle: () => {
    logout();
    router.push("/login");
  }
});
```

## Authorization

### Row-Level Security (RLS)

**Enable on all tables:**
```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
```

**Example policies:**
```sql
-- Users can only read their organization's data
CREATE POLICY "org_read_policy" ON reports
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
    AND organization_id = reports.organization_id
  )
);

-- Users can only update their own records
CREATE POLICY "owner_update_policy" ON reports
FOR UPDATE USING (created_by = auth.uid());

-- Admins can do anything
CREATE POLICY "admin_all_policy" ON reports
FOR ALL USING (
  (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
);
```

### Role-Based Access Control

```typescript
// Middleware authorization
export async function requireRole(allowedRoles: string[]) {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;

  const userRole = user?.user_metadata?.role;

  if (!allowedRoles.includes(userRole)) {
    throw new Error("Insufficient permissions");
  }
}

// Usage in Server Actions
export async function deleteAuditPlan(planId: string) {
  await requireRole(["admin", "auditor"]);

  // ... perform deletion
}
```

## Input Validation

### Server-Side Validation

**Use Zod for schema validation:**
```typescript
import { z } from "zod";

const reportSchema = z.object({
  title: z.string().min(1).max(200),
  entity_id: z.string().uuid(),
  entity_type: z.enum(["audit_plan", "risk"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  report_content: z.object({
    sections: z.array(z.any())
  })
});

export async function createReport(input: unknown) {
  // Validate input
  const validatedInput = reportSchema.parse(input);

  // ... create report
}
```

### SQL Injection Prevention

**Always use parameterized queries:**
```typescript
// ✅ GOOD - Parameterized
const { data } = await supabase
  .from("reports")
  .select("*")
  .eq("id", reportId);

// ❌ BAD - String concatenation
const query = `SELECT * FROM reports WHERE id = '${reportId}'`;
```

### XSS Prevention

**Sanitize HTML input:**
```typescript
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
    ALLOWED_ATTR: []
  });
}

// Usage
const cleanContent = sanitizeHTML(userInput);
```

**React automatically escapes:**
```typescript
// Safe - React escapes by default
<div>{userInput}</div>

// Dangerous - only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

## CSRF Protection

**Enabled by default in Next.js Server Actions.**

Additional measures:
```typescript
// Verify origin header
export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin && new URL(origin).host !== host) {
    return new NextResponse("CSRF detected", { status: 403 });
  }

  return NextResponse.next();
}
```

## Secrets Management

### Environment Variables

**Never commit secrets:**
```bash
# .gitignore
.env
.env.local
.env.production
```

**Use different keys per environment:**
```env
# Development
SUPABASE_SERVICE_ROLE_KEY=dev_key_xxx

# Production
SUPABASE_SERVICE_ROLE_KEY=prod_key_xxx
```

### Rotate Keys Regularly

```typescript
// Audit key usage
export async function auditAPIKeys() {
  // Log all API calls
  // Monitor for unusual patterns
  // Alert on suspicious activity
}
```

## File Upload Security

### Validate File Types

```typescript
const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadFile(file: File) {
  // Validate type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(fileName, file);

  if (error) throw error;
  return data;
}
```

### Scan Uploaded Files

```typescript
// Integrate virus scanning
export async function scanFile(filePath: string) {
  // Use ClamAV or similar
  const isClean = await virusScanner.scan(filePath);

  if (!isClean) {
    await deleteFile(filePath);
    throw new Error("Malicious file detected");
  }
}
```

## Rate Limiting

### API Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s") // 10 requests per 10 seconds
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  return NextResponse.next();
}
```

## Security Headers

**File:** `next.config.js`

```javascript
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};
```

## Logging & Monitoring

### Audit Logging

```typescript
// Log all critical actions
export async function auditLog(action: string, details: any) {
  const supabase = createClient();

  await supabase.from("audit_logs").insert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    action,
    details,
    ip_address: request.ip,
    user_agent: request.headers.get("user-agent"),
    timestamp: new Date().toISOString()
  });
}

// Usage
await auditLog("report.publish", { reportId });
await auditLog("user.login", { method: "password" });
await auditLog("settings.update", { changes });
```

### Security Monitoring

```typescript
// Monitor failed login attempts
export async function checkFailedLogins(userId: string) {
  const recentFails = await getFailedLoginCount(userId, "1 hour");

  if (recentFails >= 5) {
    // Lock account
    await lockAccount(userId);

    // Alert admin
    await sendAlert({
      type: "security",
      message: `Account ${userId} locked due to failed logins`
    });
  }
}
```

## Data Encryption

### At Rest

Supabase encrypts data at rest by default using AES-256.

### In Transit

All connections use TLS 1.3:
```typescript
// Enforce HTTPS
export async function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(`https://${request.headers.get("host")}${request.url}`);
  }

  return NextResponse.next();
}
```

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] Input validation on all endpoints
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] MFA enforced for admins
- [ ] Session timeout configured
- [ ] Audit logging implemented
- [ ] File upload validation
- [ ] Secrets not in source code
- [ ] HTTPS enforced
- [ ] Regular security audits scheduled

## Security Incident Response

1. **Detect:** Monitor logs for anomalies
2. **Contain:** Lock affected accounts, revoke tokens
3. **Investigate:** Review audit logs
4. **Remediate:** Patch vulnerabilities
5. **Document:** Record incident details
6. **Review:** Update security measures

## Next Steps

Continue to → [16-testing.md](16-testing.md)
