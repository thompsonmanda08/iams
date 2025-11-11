# Template Service Migration Summary

## Overview

Successfully migrated the template and category fetching system from static data to a **database-first approach** using TanStack Query, while maintaining backward compatibility with static fallbacks.

## Files Modified

### 1. Core Template System

#### `lib/templates/iso27001-2022-template.ts`

**Changes:**

- Added new async `fetch*` functions for database-first data retrieval
- Maintained existing sync functions as fallbacks
- Added clear deprecation notices and documentation

**New Functions:**

```typescript
fetchAvailableTemplates(); // DB-first template fetching
fetchTemplateById(templateId); // DB-first template with categories
fetchTemplateCategoriesById(templateId); // DB-first categories
fetchCategoryById(categoryId); // DB-first single category
```

**Deprecated Functions** (still work, but use static data):

```typescript
getAvailableTemplates(); // Static fallback
getTemplateById(templateId); // Static fallback
getTemplateCategoriesById(templateId); // Static fallback
getCategoryById(templateId, categoryId); // Static fallback
```

---

#### `lib/services/template-service.ts`

**Changes:**

- Added async methods that wrap the database fetch functions
- Maintained sync methods for backward compatibility
- Added comprehensive documentation with examples

**New Async Methods:**

```typescript
TemplateService.fetchTemplates(); // DB-first
TemplateService.fetchTemplate(id); // DB-first
TemplateService.fetchCategories(templateId); // DB-first
TemplateService.fetchCategory(categoryId); // DB-first
TemplateService.fetchCategoryByTemplateAndId(templateId, categoryId); // DB-first
```

**Existing Sync Methods** (deprecated but functional):

```typescript
TemplateService.getAvailableTemplates(); // Static fallback
TemplateService.getTemplate(templateId); // Static fallback
TemplateService.getTemplateCategories(templateId); // Static fallback
TemplateService.getCategoryById(templateId, categoryId); // Static fallback
```

---

### 2. TanStack Query Hooks

#### `hooks/use-audit-query-data.ts`

**New Hooks Added:**

```typescript
// Query Hooks
useTemplateCategories(templateId); // Fetch all categories for a template
useTemplateCategory(categoryId); // Fetch single category by ID

// Mutation Hooks
useCreateTemplateCategory(); // Create new category
useUpdateTemplateCategory(); // Update existing category
useDeleteTemplateCategory(); // Delete category
```

**All hooks include:**

- 5-minute cache (`staleTime: 5 * 60 * 1000`)
- Automatic error handling
- Toast notifications for mutations
- Query invalidation on mutations

---

### 3. Client Components Updated

#### `components/audit/category-selector.tsx`

**Before:**

```tsx
const template = TemplateService.getTemplate(templateId);
setCategories(template.categories);
```

**After:**

```tsx
const { data: templateResponse, isLoading, error } = useWorkpaperTemplateCategories(templateId);

const categories = templateResponse?.success
  ? templateResponse.data.data.categories
  : TemplateService.getTemplate(templateId)?.categories || [];
```

**Features:**

- Loading spinner while fetching
- Automatic fallback to static data on error
- Updated field names (`is_required`, `display_name`, `audit_procedure`, etc.)

---

#### `components/audit/iso-category-selector.tsx`

**Before:**

```tsx
const categories = TemplateService.getTemplateCategories(templateId);
const groupedCategories = TemplateService.getCategoriesGrouped(templateId);
```

**After:**

```tsx
const { data: templateResponse, isLoading, error } = useWorkpaperTemplateCategories(templateId);

const categories = templateResponse?.success
  ? templateResponse.data.data.categories
  : TemplateService.getTemplateCategories(templateId);

const mainClauses = categories.filter((cat) => cat.group === "main-clauses");
const annexAControls = categories.filter((cat) => cat.group === "annex-a-controls");
```

**Features:**

- Loading state with spinner
- Automatic fallback to static data
- Updated all field references to match DB schema

---

#### `components/audit/template-selector-simple.tsx`

**Status:** Already using `useWorkpaperTemplates()` hook
**Notes:** No changes needed - already database-first

---

### 4. Server Components

#### `app/dashboard/(modules)/audit/workpapers/templates/[id]/categories/[categoryId]/page.tsx`

**New File Created:**

```tsx
const response = await getTemplateCategory(categoryId);
if (!response.success || !response.data) {
  notFound();
}
const category = response.data as TemplateCategory;
```

**Features:**

- Server-side data fetching
- 404 handling for missing categories
- Passes data to client component

---

#### `components/audit/category-details-client.tsx`

**New File Created:**

- Displays comprehensive category information
- Shows all fields from database
- Professional UI with cards and badges
- Back navigation to template page

---

## Field Name Mappings

### Static Template (camelCase) → Database (snake_case)

| Static Field          | Database Field         | Type    |
| --------------------- | ---------------------- | ------- |
| `displayName`         | `display_name`         | string  |
| `isRequired`          | `is_required`          | boolean |
| `clauseRange`         | `clause_range`         | string  |
| `auditProcedure`      | `audit_procedure`      | string  |
| `documentsObtained`   | `documents_obtained`   | string  |
| `sourceDocuments`     | `source_documents`     | string  |
| `sampleSize`          | `sample_size`          | string  |
| `frequencyOfControl`  | `frequency_of_control` | string  |
| `samplingMethodology` | `sampling_methodology` | string  |
| `sortOrder`           | `sort_order`           | number  |
| `templateId`          | `template_id`          | string  |

---

## Usage Patterns

### For Client Components (React)

```tsx
import { useWorkpaperTemplates, useTemplateCategories } from "@/hooks/use-audit-query-data";

function MyComponent() {
  const { data: templates, isLoading } = useWorkpaperTemplates();
  const { data: categories } = useTemplateCategories(templateId);

  // Use data...
}
```

### For Server Components (Next.js)

```tsx
import { TemplateService } from "@/lib/services/template-service";

async function MyPage() {
  const templates = await TemplateService.fetchTemplates();
  const categories = await TemplateService.fetchCategories(templateId);

  // Use data...
}
```

### For Server Actions

```tsx
import {
  getWorkingPaperTemplates,
  getTemplateCategories
} from "@/app/_actions/audit-module-actions";

export async function myAction() {
  const response = await getWorkingPaperTemplates();
  if (response.success) {
    const templates = response.data.data;
    // Use templates...
  }
}
```

---

## Benefits

1. **Database-First**: All data now fetched from the database
2. **Automatic Caching**: TanStack Query caches data for 5 minutes
3. **Loading States**: Professional loading spinners
4. **Error Handling**: Automatic fallback to static data on errors
5. **Type Safety**: Full TypeScript support
6. **Backward Compatible**: Old code continues to work
7. **Optimistic Updates**: Mutations invalidate queries automatically
8. **User Feedback**: Toast notifications for all mutations

---

## Migration Checklist for Future Code

When working with templates and categories:

- [ ] **Client Components**: Use `useTemplateCategories()` or `useWorkpaperTemplateCategories()` hooks
- [ ] **Server Components**: Use `TemplateService.fetchTemplates()` or `TemplateService.fetchCategories()`
- [ ] **Server Actions**: Use server action functions directly from `audit-module-actions.ts`
- [ ] **Handle Loading**: Always check `isLoading` state in client components
- [ ] **Handle Errors**: Implement fallbacks or error messages
- [ ] **Update Field Names**: Use snake_case for DB fields (`display_name`, not `displayName`)
- [ ] **Cache Awareness**: Data is cached for 5 minutes - mutations auto-invalidate

---

## Testing

### Test Database Connection

1. Verify templates load from database in template selector
2. Check categories load when viewing a template
3. Test fallback when database is unavailable (disconnect network)

### Test Loading States

1. Slow down network in DevTools
2. Verify loading spinners appear
3. Check that data loads correctly after spinner

### Test Mutations

1. Create a new category
2. Update an existing category
3. Delete a category
4. Verify toast notifications appear
5. Verify data refreshes automatically

---

## Troubleshooting

### Issue: Data not loading

**Solution**: Check network tab for API calls to `/api/v1/working-paper-templates`

### Issue: Using old field names

**Solution**: Update to snake_case (`display_name`, `is_required`, etc.)

### Issue: Static data showing instead of DB data

**Solution**: Check if API is returning success response, verify authentication

### Issue: Infinite loading

**Solution**: Check `enabled` flag on hooks, ensure templateId/categoryId is truthy

---

## Next Steps

1. Update remaining server pages to use async `fetch*` methods
2. Add error boundaries for better error handling
3. Consider adding optimistic updates for mutations
4. Add unit tests for hooks and service methods
5. Document API response structure for team

---

## Documentation References

- [Template Usage Guide](./TEMPLATE_USAGE_GUIDE.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Audit Types](../lib/types/audit-types.ts)
- [Server Actions](../app/_actions/audit-module-actions.ts)
