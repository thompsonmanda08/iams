# 12 - UI Components

## Overview

INFRATEL IAMS uses a component library built on:
- **Radix UI** - Accessible primitives
- **TailwindCSS** - Styling
- **shadcn/ui** patterns
- Custom business components

## Component Structure

```
components/
├── ui/                    # Base UI components (Radix-based)
├── reports/              # Report builder components
├── workflows/            # Workflow components
├── audit/                # Audit-specific components
├── risks/                # Risk-specific components
└── shared/               # Shared business components
```

## Base UI Components

Located in `components/ui/`:

### Button

```typescript
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button isLoading>Loading...</Button>
```

### StatusBadge

```typescript
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge status="DRAFT" size="sm" />
<StatusBadge status="PUBLISHED" size="md" />
<StatusBadge status="IN_PROGRESS" size="lg" />
```

**Supported statuses:**
- DRAFT, PUBLISHED
- OPEN, IN_PROGRESS, RESOLVED, CLOSED
- PENDING, APPROVED, REJECTED
- IDENTIFIED, ASSESSED, TREATED

### CustomAlert

```typescript
import { CustomAlert } from "@/components/ui/custom-alert";

<CustomAlert
  type="error"
  title="Export Error"
  message={errorMessage}
/>

<CustomAlert
  type="success"
  title="Success"
  message="Saved successfully!"
/>
```

### Dialog

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>{/* Content */}</div>
  </DialogContent>
</Dialog>
```

### DataTable

```typescript
import { DataTable } from "@/components/ui/data-table";

<DataTable
  columns={columns}
  data={data}
  searchKey="title"
  filterOptions={[
    { label: "Status", value: "status", options: ["DRAFT", "PUBLISHED"] }
  ]}
/>
```

### Form Components

```typescript
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

<Input placeholder="Enter title" />
<Textarea placeholder="Enter description" />
<Select options={options} />
<Checkbox label="Enable feature" />
```

## Report Components

Located in `components/reports/`:

### ReportBuilder

Main report editing interface.

```typescript
import { ReportBuilder } from "@/components/reports/report-builder";

<ReportBuilder
  report={report}
  onSave={handleSave}
  onPublish={handlePublish}
/>
```

### SectionEditor

Edit individual report sections.

```typescript
import { SectionEditor } from "@/components/reports/section-editor";

<SectionEditor
  section={section}
  onChange={handleChange}
/>
```

### AddSectionButton

Add new sections to report.

```typescript
import { AddSectionButton } from "@/components/reports/add-section-button";

<AddSectionButton
  onAdd={handleAddSection}
  availableTypes={["text", "table", "chart"]}
/>
```

### BarChartWidget

Display bar charts in reports.

```typescript
import { BarChartWidget } from "@/components/reports/bar-chart-widget";

<BarChartWidget
  data={chartData}
  xKey="category"
  yKey="value"
/>
```

### PieChartWidget

Display pie charts in reports.

```typescript
import { PieChartWidget } from "@/components/reports/pie-chart-widget";

<PieChartWidget
  data={pieData}
  labelKey="name"
  valueKey="count"
/>
```

### ConfigurableTable

Dynamic tables with configurable columns.

```typescript
import { ConfigurableTable } from "@/components/reports/configurable-table";

<ConfigurableTable
  columns={tableColumns}
  data={tableData}
  editable={true}
/>
```

### FindingsSelector

Select findings for report inclusion.

```typescript
import { FindingsSelector } from "@/components/reports/findings-selector";

<FindingsSelector
  auditPlanId={planId}
  selectedFindings={selectedFindings}
  onSelect={handleSelect}
/>
```

## Workflow Components

### WorkflowPanel

Display workflow status and actions.

```typescript
import { WorkflowPanel } from "@/components/workflows/workflow-panel";

<WorkflowPanel workflow={workflow} />
```

### WorkflowHistory

Timeline of workflow actions.

```typescript
import { WorkflowHistory } from "@/components/workflows/workflow-history";

<WorkflowHistory workflowId={workflowId} />
```

## Shared Components

### PageHeader

Standard page header with breadcrumbs.

```typescript
import { PageHeader } from "@/components/shared/page-header";

<PageHeader
  title="Audit Plans"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Audit", href: "/dashboard/audit" },
    { label: "Plans" }
  ]}
  actions={<Button>Create New</Button>}
/>
```

### LoadingSpinner

Loading indicator.

```typescript
import { LoadingSpinner } from "@/components/shared/loading-spinner";

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
```

### EmptyState

Display when no data is available.

```typescript
import { EmptyState } from "@/components/shared/empty-state";

<EmptyState
  title="No reports found"
  description="Create your first report to get started"
  action={<Button>Create Report</Button>}
/>
```

## Component Patterns

### Server Component with Client Interactivity

```typescript
// page.tsx (Server Component)
export default async function Page() {
  const data = await fetchData();

  return <ClientComponent data={data} />;
}

// client-component.tsx
"use client";

export function ClientComponent({ data }) {
  const [state, setState] = useState(data);

  return <div>{/* Interactive UI */}</div>;
}
```

### Form Handling

```typescript
"use client";

import { useForm } from "react-hook-form";

export function MyForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    await saveData(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("title")} />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

### Modal Pattern

```typescript
"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>{/* Content */}</DialogContent>
      </Dialog>
    </>
  );
}
```

## Styling Guidelines

### TailwindCSS Utilities

```typescript
// Spacing
<div className="p-4 m-2 space-y-4">

// Layout
<div className="flex items-center justify-between">

// Colors
<div className="bg-primary text-white">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">
```

### Custom Styles

Use `cn()` utility for conditional classes:

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "outline" && "outline-class"
)} />
```

## Accessibility

All components follow WCAG 2.1 Level AA:
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

```typescript
<Button aria-label="Delete report">
  <Trash className="h-4 w-4" />
</Button>
```

## Next Steps

Continue to → [13-state-management.md](13-state-management.md)
