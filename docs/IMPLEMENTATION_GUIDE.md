# 📖 Mutation Hooks Implementation Guide
## How to Create & Use Reusable Mutation Hooks

**Last Updated:** December 16, 2025

---

## Quick Start: The 30-Second Overview

### Before (Inline Mutation)
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");

const handleSave = async (data) => {
  setIsLoading(true);
  try {
    const result = await saveItem(data);
    if (result.success) {
      toast.success("Saved!");
      refreshData();
    } else {
      setError(result.message);
    }
  } catch (error) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### After (Using Hook)
```typescript
const saveMutation = useSaveItemMutation({
  onSuccess: refreshData
});

const handleSave = (data) => {
  saveMutation.mutate(data);
};

// Use: saveMutation.isPending for loading state
```

---

## Hook Anatomy

### Basic Hook Structure
```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/constants";
import { saveItem } from "@/app/_actions/item-actions";

/**
 * Hook to save an item
 * @example
 * const saveMutation = useSaveItemMutation({
 *   onSuccess: () => closeDialog()
 * });
 * saveMutation.mutate({ name: "Item" });
 */
export function useSaveItemMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const result = await saveItem(params);
      if (!result.success) {
        throw new Error(result.message || "Failed to save item");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ITEMS]
      });
      notify({
        title: "Success",
        description: "Item saved successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message || "Failed to save item",
        type: "error"
      });
      options?.onError?.(error);
    }
  });
}
```

### Key Points
1. **JSDoc Documentation** - Always include usage examples
2. **Type Safety** - Define input/output types
3. **Error Handling** - Check success flag before proceeding
4. **Query Invalidation** - Refresh stale data
5. **Notifications** - Use notify() helper for consistency
6. **Custom Callbacks** - Allow components to add custom logic

---

## Common Patterns

### Pattern 1: Simple Create
```typescript
export function useCreateItemMutation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateItemInput) => {
      const result = await createItem(params);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ITEMS] });
      notify({
        title: "Success",
        description: "Item created successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message,
        type: "error"
      });
    }
  });
}
```

### Pattern 2: Create/Update (Conditional)
```typescript
export function useUpsertItemMutation(isEdit: boolean, options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ItemInput) => {
      const result = isEdit
        ? await updateItem(params.id, params)
        : await createItem(params);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ITEMS] });
      notify({
        title: "Success",
        description: isEdit ? "Updated" : "Created",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message,
        type: "error"
      });
    }
  });
}
```

### Pattern 3: Delete with Confirmation
```typescript
export function useDeleteItemMutation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const result = await deleteItem(itemId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ITEMS] });
      notify({
        title: "Success",
        description: "Item deleted successfully",
        type: "success"
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({
        title: "Error",
        description: error.message,
        type: "error"
      });
    }
  });
}
```

---

## Component Refactoring Steps

### Step 1: Create Hook File
Create `hooks/use-item-mutations.ts` with mutation logic

### Step 2: Update Component Imports
```typescript
// Remove:
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Add:
import { useCreateItemMutation } from "@/hooks/use-item-mutations";
```

### Step 3: Replace State Management
```typescript
// Before:
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");
const router = useRouter();

// After:
const createItemMutation = useCreateItemMutation({
  onSuccess: () => {
    setOpen(false);
    setFormData({ name: "" });
  }
});
```

### Step 4: Simplify Submit Handler
```typescript
// Before: 15+ lines with try/catch
// After: Simple 5-line handler
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.name) return;
  createItemMutation.mutate(formData);
};
```

### Step 5: Update Button States
```typescript
// Before:
<Button disabled={isLoading}>
  {isLoading ? "Creating..." : "Create"}
</Button>

// After:
<Button disabled={createItemMutation.isPending}>
  {createItemMutation.isPending ? "Creating..." : "Create"}
</Button>
```

### Result
- **Lines Reduced:** 30-50% per component
- **Code Clarity:** Significantly improved
- **Maintainability:** Much easier to update

---

## Common Pitfalls to Avoid

### ❌ Don't Forget Query Invalidation
```typescript
// WRONG
onSuccess: () => {
  notify({ ... });
}

// RIGHT
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ITEMS] });
  notify({ ... });
}
```

### ❌ Don't Skip Success Check
```typescript
// WRONG
mutationFn: async (data) => {
  const result = await apiCall(data);
  return result; // May have success: false!
}

// RIGHT
mutationFn: async (data) => {
  const result = await apiCall(data);
  if (!result.success) throw new Error(result.message);
  return result;
}
```

### ❌ Don't Overload Callbacks
```typescript
// WRONG
onSuccess: () => {
  setDialog(false);
  setFormData({});
  refetch();
  updateUI();
  // Too much logic!
}

// RIGHT
onSuccess: () => {
  closeDialog();
}
```

### ❌ Don't Duplicate Notifications
```typescript
// WRONG
onError: (error) => {
  notify({ title: "Error", ... });
  showErrorToast(error.message); // Duplicate!
}

// RIGHT
onError: (error) => {
  // Hook handles notification, component uses it
}
```

---

## Best Practices

✅ **DO:**
- Keep hooks focused on single operation
- Use TypeScript for type safety
- Add JSDoc with examples
- Test hooks independently
- Keep callback logic simple
- Centralize error handling
- Invalidate related queries

❌ **DON'T:**
- Mix multiple operations
- Use `any` types
- Put complex business logic in hooks
- Forget error handling
- Leave duplicate notifications
- Invalidate all queries unnecessarily
- Create unused hooks

---

## Quick Reference Template

```typescript
// Step 1: Create hook file
export function useCreateItemMutation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ItemInput) => {
      const result = await apiCall(params);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ITEMS] });
      notify({ title: "Success", type: "success" });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      notify({ title: "Error", description: error.message, type: "error" });
    }
  });
}

// Step 2: Use in component
const mutation = useCreateItemMutation({
  onSuccess: () => closeDialog()
});

const handleSubmit = (data) => {
  mutation.mutate(data);
};

<button disabled={mutation.isPending}>Save</button>
```

---

## Next Steps

Refer to:
- **REFACTORING_AUDIT_SUMMARY.md** - What was already done
- **MUTATION_REFACTORING_ROADMAP.md** - Detailed plan for 20+ components

For implementation, follow this guide and use the existing hooks in `hooks/` as references.
