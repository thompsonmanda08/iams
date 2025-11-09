# Template and Category Fetching Guide

This guide explains how to fetch workpaper templates and categories from the database using TanStack Query and server actions.

## Overview

The system now supports **database-first** data fetching with static fallbacks. Templates and categories are fetched from the database, with the static ISO 27001:2022 template serving as a fallback when DB data is unavailable.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Flow Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Client Components (React)                                   │
│  ├── useWorkpaperTemplates()                                 │
│  ├── useWorkpaperTemplateCategories(templateId)         │
│  ├── useTemplateCategories(templateId)                       │
│  └── useTemplateCategory(categoryId)                         │
│                    ↓                                          │
│  Server Actions                                               │
│  ├── getWorkingPaperTemplates()                              │
│  ├── getWorkpaperTemplateCategories(templateId)       │
│  ├── getTemplateCategories(templateId)                       │
│  └── getTemplateCategory(categoryId)                         │
│                    ↓                                          │
│  Database API                                                 │
│  └── /api/v1/working-paper-templates/*                       │
│                                                               │
│  Fallback: Static ISO27001_2022_TEMPLATE                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Usage Patterns

### 1. Client Components (React Components using hooks)

#### Fetch All Templates

```tsx
import { useWorkpaperTemplates } from "@/hooks/use-audit-query-data";

function TemplateSelector() {
  const { data, isLoading, error } = useWorkpaperTemplates();

  if (isLoading) return <div>Loading templates...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const templates = data?.success ? data.data?.data : [];

  return (
    <div>
      {templates.map((template) => (
        <div key={template.id}>{template.name}</div>
      ))}
    </div>
  );
}
```

#### Fetch Template with Categories

```tsx
import { useWorkpaperTemplateCategories } from "@/hooks/use-audit-query-data";

function TemplateDetails({ templateId }: { templateId: string }) {
  const { data, isLoading, error } = useWorkpaperTemplateCategories(templateId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const template = data?.data?.data;

  return (
    <div>
      <h1>{template?.name}</h1>
      <p>{template?.description}</p>
      <div>
        {template?.categories?.map((category) => (
          <div key={category.id}>{category.display_name}</div>
        ))}
      </div>
    </div>
  );
}
```

#### Fetch Categories for a Template

```tsx
import { useTemplateCategories } from "@/hooks/use-audit-query-data";

function CategoryList({ templateId }: { templateId: string }) {
  const { data: categories, isLoading, error } = useTemplateCategories(templateId);

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {categories?.data?.map((category) => (
        <li key={category.id}>{category.display_name}</li>
      ))}
    </ul>
  );
}
```

#### Fetch Single Category

```tsx
import { useTemplateCategory } from "@/hooks/use-audit-query-data";

function CategoryDetails({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading, error } = useTemplateCategory(categoryId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{category?.data?.display_name}</h2>
      <p>{category?.data?.description}</p>
      <p>Scope: {category?.data?.scope}</p>
      <p>Objectives: {category?.data?.objectives}</p>
    </div>
  );
}
```

### 2. Server Components (Next.js Server Components)

#### Fetch All Templates

```tsx
import { fetchAvailableTemplates } from "@/lib/templates/iso27001-2022-template";

async function TemplatesPage() {
  const templates = await fetchAvailableTemplates();

  return (
    <div>
      {templates.map((template) => (
        <div key={template.id}>{template.name}</div>
      ))}
    </div>
  );
}
```

#### Fetch Template with Categories

```tsx
import { fetchTemplateById } from "@/lib/templates/iso27001-2022-template";
import { notFound } from "next/navigation";

async function TemplatePage({ params }: { params: { id: string } }) {
  const template = await fetchTemplateById(params.id);

  if (!template) {
    notFound();
  }

  return (
    <div>
      <h1>{template.name}</h1>
      <p>{template.description}</p>
      <div>
        {template.categories.map((category) => (
          <div key={category.id}>{category.display_name}</div>
        ))}
      </div>
    </div>
  );
}
```

#### Fetch Categories for a Template

```tsx
import { fetchTemplateCategoriesById } from "@/lib/templates/iso27001-2022-template";

async function CategoriesPage({ templateId }: { templateId: string }) {
  const categories = await fetchTemplateCategoriesById(templateId);

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>{category.display_name}</li>
      ))}
    </ul>
  );
}
```

#### Fetch Single Category

```tsx
import { fetchCategoryById } from "@/lib/templates/iso27001-2022-template";
import { notFound } from "next/navigation";

async function CategoryPage({ params }: { params: { categoryId: string } }) {
  const category = await fetchCategoryById(params.categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h2>{category.display_name}</h2>
      <p>{category.description}</p>
      <p>Scope: {category.scope}</p>
      <p>Objectives: {category.objectives}</p>
    </div>
  );
}
```

### 3. Server Actions

If you need to fetch data in server actions:

```tsx
"use server";

import {
  getWorkingPaperTemplates,
  getTemplateCategories
} from "@/app/_actions/audit-module-actions";

export async function myServerAction() {
  // Fetch templates
  const templatesResponse = await getWorkingPaperTemplates();
  if (templatesResponse.success) {
    const templates = templatesResponse.data?.data;
    // Use templates...
  }

  // Fetch categories
  const categoriesResponse = await getTemplateCategories(templateId);
  if (categoriesResponse.success) {
    const categories = categoriesResponse.data?.data;
    // Use categories...
  }
}
```

## Available Hooks

All hooks are exported from `@/hooks/use-audit-query-data`:

### Query Hooks (Read Operations)

- `useWorkpaperTemplates()` - Fetch all templates
- `useWorkpaperTemplateCategories(templateId)` - Fetch template with categories
- `useTemplateCategories(templateId)` - Fetch all categories for a template
- `useTemplateCategory(categoryId)` - Fetch single category by ID

### Mutation Hooks (Write Operations)

- `useCreateTemplateCategory()` - Create new category
- `useUpdateTemplateCategory()` - Update existing category
- `useDeleteTemplateCategory()` - Delete category

## Available Server Functions

All functions are exported from `@/lib/templates/iso27001-2022-template`:

### Database-First Functions (Server-side only)

- `fetchAvailableTemplates()` - Fetch all templates from DB
- `fetchTemplateById(templateId)` - Fetch template with categories from DB
- `fetchTemplateCategoriesById(templateId)` - Fetch categories from DB
- `fetchCategoryById(categoryId)` - Fetch single category from DB

### Static Fallback Functions (Deprecated)

- `getAvailableTemplates()` - Get static templates (fallback)
- `getTemplateById(templateId)` - Get static template (fallback)
- `getTemplateCategoriesById(templateId)` - Get static categories (fallback)
- `getCategoryById(templateId, categoryId)` - Get static category (fallback)

## Type Definitions

### WorkpaperTemplateDefinition

```typescript
interface WorkpaperTemplateDefinition {
  id: string;
  name: string;
  description: string;
  categories: TemplateCategory[];
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### TemplateCategory

```typescript
interface TemplateCategory {
  id?: string;
  name: string;
  display_name: string;
  clauses: string[];
  clause_range?: string;
  group: "main-clauses" | "annex-a-controls";
  objectives: string;
  scope: string;
  audit_procedure: string;
  description?: string;
  is_required?: boolean;
  documents_obtained?: string;
  source_documents?: string;
  sample_size?: string;
  frequency_of_control?: string;
  sampling_methodology?: string;
  sort_order?: number;
  template_id?: string;
}
```

## Migration from Old Code

### Before (Static data only)

```tsx
import { TemplateService } from "@/lib/services/template-service";

// Client component - this won't work with DB data
const templates = TemplateService.getAvailableTemplates();
```

### After (Database-first)

#### For Client Components:

```tsx
import { useWorkpaperTemplates } from "@/hooks/use-audit-query-data";

function MyComponent() {
  const { data, isLoading } = useWorkpaperTemplates();
  const templates = data?.success ? data.data?.data : [];

  // Use templates...
}
```

#### For Server Components:

```tsx
import { fetchAvailableTemplates } from "@/lib/templates/iso27001-2022-template";

async function MyPage() {
  const templates = await fetchAvailableTemplates();

  // Use templates...
}
```

## Cache Configuration

All hooks use TanStack Query's caching:

- Templates: 5 minutes cache (`staleTime: 5 * 60 * 1000`)
- Categories: 5 minutes cache (`staleTime: 5 * 60 * 1000`)

## Error Handling

All hooks and functions include error handling with fallbacks:

1. **Try to fetch from database**
2. **On error, fall back to static ISO 27001:2022 template**
3. **Log errors to console for debugging**

## Best Practices

1. **Use hooks in client components** - Always use hooks when fetching data in client components
2. **Use async functions in server components** - Use the `fetch*` functions in server components
3. **Handle loading states** - Always handle `isLoading` state in client components
4. **Handle errors gracefully** - Display user-friendly error messages
5. **Leverage caching** - TanStack Query automatically caches data for better performance
6. **Type safety** - Always use TypeScript types for templates and categories

## Example: Complete Template Details Page

### Server Component (page.tsx)

```tsx
import { fetchTemplateById } from "@/lib/templates/iso27001-2022-template";
import { TemplateDetailsClient } from "./template-details-client";
import { notFound } from "next/navigation";

export default async function TemplatePage({ params }: { params: { id: string } }) {
  const template = await fetchTemplateById(params.id);

  if (!template) {
    notFound();
  }

  return <TemplateDetailsClient template={template} />;
}
```

### Client Component (template-details-client.tsx)

```tsx
"use client";

import { useTemplateCategories } from "@/hooks/use-audit-query-data";
import type { WorkpaperTemplateDefinition } from "@/lib/types/audit-types";

export function TemplateDetailsClient({ template }: { template: WorkpaperTemplateDefinition }) {
  const { data: categories, isLoading } = useTemplateCategories(template.id);

  return (
    <div>
      <h1>{template.name}</h1>
      <p>{template.description}</p>

      {isLoading ? (
        <div>Loading categories...</div>
      ) : (
        <ul>
          {categories?.data?.map((category) => (
            <li key={category.id}>{category.display_name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Troubleshooting

### Issue: "useQuery is not a function"

**Solution**: Make sure you're using the hook in a client component (file should have `"use client"` directive)

### Issue: "Cannot use hooks in server component"

**Solution**: Use the `fetch*` functions instead of hooks in server components

### Issue: "Data is undefined"

**Solution**: Check if the API response has `data.data` structure and handle loading/error states

### Issue: "Template not found"

**Solution**: Verify the template ID exists in the database, fallback to static data will be used if DB fails

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [ISO 27001:2022 Template Definition](../lib/templates/iso27001-2022-template.ts)
- [Audit Types](../lib/types/audit-types.ts)
