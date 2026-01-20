# 16 - Testing

## Overview

Testing strategy for INFRATEL IAMS:
- Unit tests
- Integration tests
- End-to-end tests
- Manual testing

**Status:** Testing framework setup in progress.

## Testing Stack

**Planned tools:**
- **Vitest** - Unit and integration tests
- **React Testing Library** - Component tests
- **Playwright** - End-to-end tests
- **MSW** - API mocking

## Setup (To Be Implemented)

### Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D msw
```

### Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  }
});
```

**File:** `test/setup.ts`

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

## Unit Tests

### Testing Server Actions

```typescript
// app/_actions/__tests__/reports-actions.test.ts
import { describe, it, expect, vi } from "vitest";
import { createReport } from "../reports-actions";

describe("createReport", () => {
  it("should create a report", async () => {
    const input = {
      title: "Test Report",
      entity_id: "123",
      entity_type: "audit_plan",
      report_content: { sections: [] }
    };

    const result = await createReport(input);

    expect(result.title).toBe("Test Report");
    expect(result.entity_id).toBe("123");
  });

  it("should throw error for invalid input", async () => {
    const input = {
      title: "",
      entity_id: "invalid",
      entity_type: "unknown"
    };

    await expect(createReport(input)).rejects.toThrow();
  });
});
```

### Testing Utilities

```typescript
// lib/utils/__tests__/report-utils.test.ts
import { describe, it, expect } from "vitest";
import { calculateReportStats } from "../report-utils";

describe("calculateReportStats", () => {
  it("should calculate correct statistics", () => {
    const report = {
      sections: [
        { type: "text", content: "..." },
        { type: "table", rows: 5 }
      ]
    };

    const stats = calculateReportStats(report);

    expect(stats.sectionCount).toBe(2);
    expect(stats.hasTable).toBe(true);
  });
});
```

## Component Tests

### Testing UI Components

```typescript
// components/ui/__tests__/button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";

describe("Button", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when loading", () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
```

### Testing Report Components

```typescript
// components/reports/__tests__/report-builder.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportBuilder } from "../report-builder";

describe("ReportBuilder", () => {
  it("should render report sections", () => {
    const report = {
      title: "Test Report",
      sections: [
        { id: "1", title: "Section 1", type: "text" },
        { id: "2", title: "Section 2", type: "table" }
      ]
    };

    render(<ReportBuilder report={report} />);

    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });

  it("should hide save button when published", () => {
    const report = {
      title: "Test Report",
      status: "PUBLISHED",
      sections: []
    };

    render(<ReportBuilder report={report} />);

    expect(screen.queryByText("Save Draft")).not.toBeInTheDocument();
  });
});
```

## Integration Tests

### Testing with Mock API

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/reports/:id", ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: "Mock Report",
      status: "DRAFT"
    });
  }),

  http.post("/api/reports", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: "new-id",
      ...body
    });
  })
];
```

```typescript
// test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

## End-to-End Tests

### Playwright Setup

**File:** `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run dev",
    port: 3000
  }
});
```

### E2E Test Examples

```typescript
// e2e/report-creation.spec.ts
import { test, expect } from "@playwright/test";

test("should create new report", async ({ page }) => {
  await page.goto("/dashboard/reports");

  // Click create button
  await page.click("text=Create Report");

  // Fill form
  await page.fill('input[name="title"]', "Test Report");
  await page.selectOption('select[name="entity_type"]', "audit_plan");

  // Submit
  await page.click('button[type="submit"]');

  // Verify creation
  await expect(page).toHaveURL(/\/dashboard\/reports\/\w+/);
  await expect(page.locator("h1")).toContainText("Test Report");
});

test("should publish report", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // Navigate to report
  await page.goto("/dashboard/reports/test-report-id");

  // Publish
  await page.click("text=Publish");
  await page.click("text=Confirm");

  // Verify status
  await expect(page.locator('[data-testid="status-badge"]')).toContainText("PUBLISHED");
});
```

## Test Coverage

```bash
# Run tests with coverage
npm run test:coverage

# Coverage report
vitest --coverage
```

**Target coverage:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Test Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Testing Best Practices

1. **Test user behavior, not implementation**
2. **Use meaningful test descriptions**
3. **Avoid testing implementation details**
4. **Mock external dependencies**
5. **Keep tests isolated**
6. **Use data-testid for stable selectors**
7. **Test error states**
8. **Test loading states**
9. **Test accessibility**

## Manual Testing Checklist

### Before Each Release

- [ ] Login/logout flow
- [ ] Create audit plan
- [ ] Add findings
- [ ] Generate report
- [ ] Save draft
- [ ] Publish report
- [ ] PDF export
- [ ] Screen lock
- [ ] MFA setup
- [ ] User management
- [ ] Workflow approval
- [ ] Risk assessment
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness

## CI/CD Integration

**File:** `.github/workflows/test.yml`

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Next Steps

Continue to → [17-troubleshooting.md](17-troubleshooting.md)
