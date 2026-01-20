# 17 - Troubleshooting

## Common Issues

### 1. Report ID Missing Error

**Symptom:**
- Error message: "Report ID is required"
- Cannot save draft or publish report

**Cause:**
Template merge doesn't preserve database report ID.

**Solution:**
```typescript
// Ensure explicit ID override after merge
const mergedReport = mergeReportWithTemplate(/* ... */);
mergedReport.report_id = reportId; // CRITICAL
mergedReport.status = reportStatus; // CRITICAL
```

**Files affected:**
- `app/dashboard/(modules)/reports/_components/report-details-client.tsx`
- `app/dashboard/(modules)/audit/plans/_components/audit-plan-report-tab.tsx`

---

### 2. Status Out of Sync

**Symptom:**
- Report status doesn't match database
- Published reports show as DRAFT
- UI doesn't reflect saved status

**Cause:**
Stale status from `report_content` JSON overrides database status.

**Solution:**
```typescript
// Pass reportStatus as separate prop
<ReportDetailsClient
  reportId={id}
  initialReport={report.report_content}
  reportStatus={report.status} // Database status
/>

// Override after merge
mergedReport.status = reportStatus; // Database wins
```

---

### 3. UI Not Refreshing After Save

**Symptom:**
- Save succeeds but UI doesn't update
- Old data still showing
- Need to manually refresh page

**Cause:**
Cache not properly invalidated.

**Solution:**
Implement full cache revalidation strategy:

**Server-side:**
```typescript
// In Server Actions
import { revalidatePath } from "next/cache";

revalidatePath("/dashboard/reports");
revalidatePath(`/dashboard/reports/${reportId}`);
revalidatePath("/dashboard/audit/plans", "layout");
```

**Client-side:**
```typescript
// In mutation hooks
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["reports"] });
  queryClient.invalidateQueries({ queryKey: ["report", reportId] });
  router.refresh();
}
```

---

### 4. Supabase Connection Errors

**Symptom:**
```
Error: Invalid API key
Error: Failed to fetch
```

**Solution:**
1. Check environment variables:
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Verify Supabase project is active
3. Check RLS policies aren't blocking access
4. Restart dev server

---

### 5. TypeScript Errors

**Symptom:**
```
Property 'reportStatus' does not exist on type 'Props'
```

**Solution:**
Add missing type definitions:
```typescript
interface ReportDetailsClientProps {
  reportId: string;
  initialReport: ReportContent;
  reportStatus: ReportStatus; // Add this
  entity: ReportEntity;
  entityType: ReportEntityType;
}
```

---

### 6. Module Not Found

**Symptom:**
```
Error: Cannot find module '@/components/...'
```

**Solution:**
1. Check import path is correct
2. Verify file exists
3. Clear cache:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

---

### 7. Port Already in Use

**Symptom:**
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

---

### 8. RLS Policy Blocking Query

**Symptom:**
- Query returns empty results
- Authorized user can't access data

**Solution:**
1. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'reports';
   ```

2. Test policy:
   ```sql
   -- As specific user
   SET ROLE authenticated;
   SELECT * FROM reports WHERE id = 'xxx';
   ```

3. Fix policy or add exception for role

---

### 9. PDF Export Failing

**Symptom:**
- PDF export button doesn't work
- Error in console about PDF renderer

**Solution:**
1. Check `@react-pdf/renderer` version:
   ```bash
   npm list @react-pdf/renderer
   ```

2. Verify PDF components are valid:
   ```typescript
   // Only use react-pdf components inside Document
   <Document>
     <Page>
       <View>
         <Text>Valid content</Text>
       </View>
     </Page>
   </Document>
   ```

3. Check for unsupported CSS properties

---

### 10. Session Expired Frequently

**Symptom:**
- Users logged out unexpectedly
- Session expires too quickly

**Solution:**
Adjust session timeout:
```typescript
// Increase session duration
const supabase = createClient({
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

---

### 11. Screen Lock Not Working

**Symptom:**
- Screen lock doesn't activate on idle
- Lock screen bypassed

**Solution:**
```typescript
// Verify idle timer setup
import { useIdleTimer } from "react-idle-timer";

useIdleTimer({
  timeout: 15 * 60 * 1000, // 15 minutes
  onIdle: () => {
    useScreenLockStore.getState().lockScreen();
  },
  debounce: 500
});
```

---

### 12. Build Errors

**Symptom:**
```
Error: Build failed
Type error: ...
```

**Solution:**
1. Run type check:
   ```bash
   npm run type-check
   ```

2. Fix type errors

3. Clear build cache:
   ```bash
   rm -rf .next
   npm run build
   ```

---

### 13. Slow Page Loads

**Symptom:**
- Pages take long to load
- Database queries slow

**Solution:**
1. Add database indexes:
   ```sql
   CREATE INDEX idx_reports_entity_id ON reports(entity_id);
   CREATE INDEX idx_reports_status ON reports(status);
   ```

2. Use React Query caching:
   ```typescript
   useQuery({
     queryKey: ["report", reportId],
     queryFn: getReport,
     staleTime: 5 * 60 * 1000 // 5 minutes
   });
   ```

3. Implement pagination

---

### 14. Workflow Not Advancing

**Symptom:**
- Workflow stuck on current step
- Approval doesn't move forward

**Solution:**
Check workflow step processing:
```typescript
// Verify step update logic
const steps = workflow.steps;
steps[stepNumber - 1].status = "APPROVED";
steps[stepNumber - 1].completed_at = new Date();

// Ensure current_step increments
await supabase
  .from("workflows")
  .update({
    current_step: stepNumber + 1,
    steps
  });
```

---

## Debug Tools

### Enable React Query Devtools

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Enable Verbose Logging

```typescript
// In Server Actions
console.log("Report data:", report);
console.log("User:", user);
console.log("Query result:", data);
```

### Supabase Logging

```typescript
const supabase = createClient({
  auth: {
    debug: true // Enable auth debug logs
  }
});
```

---

## Getting Help

1. **Check docs:** Review relevant documentation
2. **Search issues:** Look for similar problems
3. **Check console:** Look for error messages
4. **Check network:** Inspect failed requests
5. **Check database:** Verify data state
6. **Contact team:** Reach out with details

---

## Error Log Analysis

**Common error patterns:**

```bash
# Auth errors
"Invalid API key" → Check environment variables
"JWT expired" → Session timeout, re-login needed

# Database errors
"Policies blocking" → RLS policy issue
"Row not found" → Wrong ID or permissions

# Build errors
"Module not found" → Path issue or missing dependency
"Type error" → TypeScript mismatch
```

## Next Steps

Continue to → [18-contributing.md](18-contributing.md)
