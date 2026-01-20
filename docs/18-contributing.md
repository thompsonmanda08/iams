# 18 - Contributing

## Code Standards

### TypeScript

- Use strict mode
- Define types for all functions
- Avoid `any` type
- Use interfaces over types for objects
- Export types from dedicated files

```typescript
// ✅ GOOD
interface Report {
  id: string;
  title: string;
  status: ReportStatus;
}

export async function createReport(data: CreateReportInput): Promise<Report> {
  // ...
}

// ❌ BAD
export async function createReport(data: any): Promise<any> {
  // ...
}
```

### React Components

- Use functional components
- Mark client components with `"use client"`
- Keep components focused and small
- Extract reusable logic to hooks
- Use meaningful component names

```typescript
// ✅ GOOD
"use client";

interface ReportBuilderProps {
  report: ReportContent;
  onSave: (report: ReportContent) => void;
}

export function ReportBuilder({ report, onSave }: ReportBuilderProps) {
  // ...
}

// ❌ BAD
export function Component(props: any) {
  // ...
}
```

### Server Actions

- Always include `"use server"` directive
- Validate input with Zod
- Handle errors properly
- Revalidate cache after mutations
- Use descriptive function names

```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().min(1)
});

export async function updateReport(input: unknown) {
  // Validate
  const data = schema.parse(input);

  try {
    // Update
    const result = await supabase
      .from("reports")
      .update(data)
      .eq("id", data.id);

    // Revalidate
    revalidatePath("/dashboard/reports");

    return result;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}
```

### File Naming

- Components: PascalCase (`ReportBuilder.tsx`)
- Utils: kebab-case (`report-utils.ts`)
- Hooks: camelCase with `use` prefix (`useReport.ts`)
- Server actions: kebab-case with `-actions` suffix (`report-actions.ts`)
- Types: kebab-case with `-types` suffix (`report-types.ts`)

### Code Organization

```
feature/
├── _components/        # Feature-specific components
│   ├── feature-list.tsx
│   └── feature-form.tsx
├── [id]/              # Dynamic routes
│   └── page.tsx
└── page.tsx           # Main feature page
```

## Git Workflow

### Branch Naming

```bash
# Feature branches
feat/report-builder
feat/workflow-engine

# Bug fixes
fix/status-sync-issue
fix/cache-invalidation

# Documentation
docs/api-reference
docs/deployment-guide

# Chores
chore/dependency-updates
chore/cleanup-old-code
```

### Commit Messages

Follow conventional commits:

```bash
# Format
<type>(<scope>): <description>

# Examples
feat(reports): add PDF export functionality
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
refactor(api): simplify report actions
chore(deps): upgrade next to 14.2.0
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `chore` - Maintenance
- `test` - Tests
- `perf` - Performance improvements

### Pull Request Process

1. **Create branch:**
   ```bash
   git checkout -b feat/new-feature
   ```

2. **Make changes:**
   - Write code
   - Add tests
   - Update docs

3. **Commit:**
   ```bash
   git add .
   git commit -m "feat(module): add new feature"
   ```

4. **Push:**
   ```bash
   git push origin feat/new-feature
   ```

5. **Create PR:**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Request reviewers

6. **Address feedback:**
   - Make requested changes
   - Push updates
   - Re-request review

7. **Merge:**
   - Squash commits if needed
   - Delete branch after merge

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactor
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
- [ ] Related issues linked

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

## Code Review Guidelines

### As a Reviewer

- Be respectful and constructive
- Focus on code, not author
- Ask questions rather than demand changes
- Approve when satisfied
- Block if critical issues exist

**Check for:**
- Code correctness
- Type safety
- Error handling
- Security issues
- Performance implications
- Test coverage
- Documentation

### As an Author

- Respond to all comments
- Explain decisions when needed
- Make requested changes
- Thank reviewers
- Don't take feedback personally

## Testing Requirements

### Before Submitting PR

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Unit tests
npm run test

# Build
npm run build
```

### Test Coverage

- Aim for 80% coverage
- Test critical paths
- Test error cases
- Test edge cases

## Documentation

### Update Documentation When:

- Adding new features
- Changing APIs
- Fixing bugs
- Modifying architecture

### Documentation Guidelines

- Write in active voice
- Be concise and clear
- Include code examples
- Keep structure consistent
- Update table of contents

## Security

### Before Committing:

- [ ] No secrets in code
- [ ] Environment variables used
- [ ] Input validation added
- [ ] SQL injection prevented
- [ ] XSS protection in place
- [ ] RLS policies updated

## Performance

### Best Practices:

- Use React Query caching
- Implement pagination
- Optimize images
- Minimize bundle size
- Use dynamic imports
- Add database indexes

## Accessibility

### Requirements:

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast (WCAG AA)

## Issue Reporting

### Bug Reports Should Include:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 11
- Browser: Chrome 120
- Version: 2.0

## Screenshots
[If applicable]

## Additional Context
Any other relevant information
```

## Feature Requests

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any other relevant information
```

## Questions?

- Check documentation first
- Search existing issues
- Ask in team chat
- Create discussion thread

## Next Steps

Continue to → [19-api-reference.md](19-api-reference.md)
