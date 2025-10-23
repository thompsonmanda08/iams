# Component Library Reference

Complete reference for all components in the Audit Management Module.

## Shared Components

### AuditLayout

Wrapper component providing consistent padding and spacing.

```typescript
interface AuditLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuditLayout({ children, className }: AuditLayoutProps) {
  return (
    <div className={cn('container mx-auto px-6 py-8', className)}>
      {children}
    </div>
  );
}
```

**Usage:**
```tsx
<AuditLayout>
  <AuditPageHeader title="Audit Plans" />
  {/* Content */}
</AuditLayout>
```

### AuditPageHeader

Page header with title, description, and action buttons.

```typescript
interface AuditPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AuditPageHeader({ title, description, action }: AuditPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

**Usage:**
```tsx
<AuditPageHeader
  title="Audit Plans"
  description="Manage ISO 27001 audit plans"
  action={
    <Button onClick={() => setCreateModalOpen(true)}>
      Create Audit
    </Button>
  }
/>
```

### AuditBreadcrumbs

Breadcrumb navigation component.

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AuditBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function AuditBreadcrumbs({ items }: AuditBreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

**Usage:**
```tsx
<AuditBreadcrumbs
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Audit', href: '/dashboard/home/audit' },
    { label: 'Plans' },
  ]}
/>
```

### AuditEmptyState

Empty state with icon and message.

```typescript
interface AuditEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AuditEmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
}: AuditEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

**Usage:**
```tsx
<AuditEmptyState
  title="No audit plans found"
  description="Get started by creating your first audit plan"
  action={
    <Button onClick={() => setCreateModalOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Create Audit Plan
    </Button>
  }
/>
```

### AuditLoadingState

Skeleton loader for content.

```typescript
export function AuditLoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### AuditErrorState

Error display with retry button.

```typescript
interface AuditErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function AuditErrorState({
  title = 'Error',
  message,
  onRetry,
}: AuditErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground text-center max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
```

## Dashboard Components

### AuditMetricCard

Display individual metric with icon and optional change indicator.

```typescript
interface AuditMetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function AuditMetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  color = 'blue',
}: AuditMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold">{value}</h3>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend === 'up' && 'text-emerald-500',
                    trend === 'down' && 'text-red-500',
                    trend === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', `bg-${color}-500/10`)}>
            <Icon className={cn('h-6 w-6', `text-${color}-500`)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Usage:**
```tsx
<AuditMetricCard
  title="Total Audits"
  value={30}
  change={5.2}
  trend="up"
  icon={CheckCircle2}
  color="blue"
/>
```

### ConformityChart

Line chart showing conformity trends over time using Recharts.

```typescript
interface ConformityChartProps {
  data: ConformityTrend[];
}

export function ConformityChart({ data }: ConformityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conformity Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM dd')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conformityRate"
              stroke="#10b981"
              name="Conformity"
            />
            <Line
              type="monotone"
              dataKey="partialConformityRate"
              stroke="#f59e0b"
              name="Partial"
            />
            <Line
              type="monotone"
              dataKey="nonConformityRate"
              stroke="#ef4444"
              name="Non-Conformity"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

## Audit Plans Components

### AuditStatusBadge

Status badge with color coding.

```typescript
interface AuditStatusBadgeProps {
  status: AuditStatus;
  showIcon?: boolean;
}

export function AuditStatusBadge({ status, showIcon = true }: AuditStatusBadgeProps) {
  const { color, label, icon: Icon } = getAuditStatusConfig(status);

  return (
    <Badge variant="outline" className={cn('border-current', `text-${color}-500`)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}
```

### AuditPlanCard

Card view for grid layout.

```typescript
interface AuditPlanCardProps {
  audit: AuditPlan;
  onClick?: () => void;
}

export function AuditPlanCard({ audit, onClick }: AuditPlanCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{audit.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{audit.standard}</p>
          </div>
          <AuditStatusBadge status={audit.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDateRange(audit.startDate, audit.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{audit.teamLeader}</span>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{audit.progress}%</span>
            </div>
            <Progress value={audit.progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### CreateAuditModal

Modal form for creating/editing audit plans.

```typescript
interface CreateAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<AuditPlan>;
  mode?: 'create' | 'edit';
}

export function CreateAuditModal({
  open,
  onOpenChange,
  initialData,
  mode = 'create',
}: CreateAuditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Audit Plan' : 'Edit Audit Plan'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new audit plan for ISO 27001 compliance'
              : 'Update audit plan details'}
          </DialogDescription>
        </DialogHeader>
        <AuditPlanForm
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Workpaper Components

### ClauseSelector

Dropdown with search showing ISO 27001 clause codes and titles.

```typescript
interface ClauseSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  category?: string;
}

export function ClauseSelector({ value, onChange, category }: ClauseSelectorProps) {
  const clauses = getAllClauses(category);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select clause" />
      </SelectTrigger>
      <SelectContent>
        {clauses.map((clause) => (
          <SelectItem key={clause.code} value={clause.code}>
            <div>
              <div className="font-medium">{clause.code}</div>
              <div className="text-xs text-muted-foreground">{clause.title}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### EvidenceUpload

Drag-and-drop file upload area.

```typescript
interface EvidenceUploadProps {
  onUpload: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function EvidenceUpload({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
}: EvidenceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onUpload(files);
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
      <h3 className="font-medium mb-1">Upload Evidence</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop files here, or click to browse
      </p>
      <Button variant="outline" size="sm">
        Browse Files
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
      </p>
    </div>
  );
}
```

### TestResultSelector

Radio button group for test result selection.

```typescript
interface TestResultSelectorProps {
  value?: TestResult;
  onChange: (value: TestResult) => void;
}

export function TestResultSelector({ value, onChange }: TestResultSelectorProps) {
  const options: { value: TestResult; label: string; color: string }[] = [
    { value: 'conformity', label: 'Conformity', color: 'emerald' },
    { value: 'partial-conformity', label: 'Partial Conformity', color: 'amber' },
    { value: 'non-conformity', label: 'Non-Conformity', color: 'red' },
  ];

  return (
    <RadioGroup value={value} onValueChange={onChange}>
      <div className="grid grid-cols-3 gap-4">
        {options.map((option) => (
          <div key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={option.value}
              className={cn(
                'flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 cursor-pointer',
                'hover:bg-accent hover:text-accent-foreground',
                'peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
              )}
            >
              <CheckCircle2 className={cn('h-6 w-6 mb-2', `text-${option.color}-500`)} />
              <span className="text-sm font-medium">{option.label}</span>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}
```

## Finding Components

### SeverityBadge

Color-coded severity badge.

```typescript
interface SeverityBadgeProps {
  severity: FindingSeverity;
  showIcon?: boolean;
}

export function SeverityBadge({ severity, showIcon = true }: SeverityBadgeProps) {
  const config = {
    critical: { color: 'red', icon: AlertCircle, label: 'Critical' },
    high: { color: 'orange', icon: AlertTriangle, label: 'High' },
    medium: { color: 'yellow', icon: Info, label: 'Medium' },
    low: { color: 'blue', icon: Info, label: 'Low' },
  }[severity];

  return (
    <Badge variant="outline" className={cn('border-current', `text-${config.color}-500`)}>
      {showIcon && <config.icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
```

### FindingTimeline

Vertical timeline showing finding lifecycle events.

```typescript
interface FindingTimelineProps {
  events: FindingTimelineEvent[];
}

export function FindingTimeline({ events }: FindingTimelineProps) {
  return (
    <div className="relative space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {/* Timeline line */}
          {index < events.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
          )}

          {/* Event marker */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background">
            {getEventIcon(event.type)}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <p className="font-medium">{event.description}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>{event.user}</span>
              <span>•</span>
              <span>{formatDate(event.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Usage Examples

### Complete Page Example

```typescript
'use client';

import { AuditLayout, AuditPageHeader, AuditLoadingState, AuditErrorState } from './audit-shared';
import { AuditPlansTable } from './audit-plans';
import { useAuditPlans } from '@/lib/hooks/use-audit-query-data';
import { useAuditStore } from '@/lib/stores/audit-store';

export default function AuditPlansPage() {
  const { auditFilters, setCreateAuditModalOpen } = useAuditStore();
  const { data, isLoading, error, refetch } = useAuditPlans(auditFilters);

  if (isLoading) return <AuditLoadingState />;
  if (error) return <AuditErrorState message={error.message} onRetry={refetch} />;

  return (
    <AuditLayout>
      <AuditPageHeader
        title="Audit Plans"
        description="Manage ISO 27001 audit plans"
        action={
          <Button onClick={() => setCreateAuditModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Audit
          </Button>
        }
      />

      <AuditPlansTable audits={data} />
    </AuditLayout>
  );
}
```

## Component Composition

Components are designed to be composable and reusable:

```typescript
// Compose multiple components
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Audit Details</CardTitle>
      <AuditStatusBadge status="in-progress" />
    </div>
  </CardHeader>
  <CardContent>
    <AuditMetricCard
      title="Progress"
      value="75%"
      trend="up"
      change={10}
      icon={TrendingUp}
    />
  </CardContent>
</Card>
```

## Styling Guidelines

All components follow these styling conventions:

1. **Use Tailwind utility classes**
2. **Use `cn()` for conditional classes**
3. **Maintain consistent spacing** (p-4, p-6, gap-4, space-y-4)
4. **Use semantic color variables** (text-muted-foreground, bg-accent)
5. **Responsive by default** (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
6. **Dark mode support** via Tailwind dark: prefix
7. **Accessible colors** (WCAG AA compliance)

## Icon Guidelines

- Use Lucide React icons exclusively
- Consistent sizes: `h-4 w-4` for inline, `h-6 w-6` for cards, `h-8 w-8` for headers
- Always include descriptive className
- Use semantic colors matching the context

## Performance Tips

1. **Memoize expensive components**: Use `React.memo()`
2. **Debounce search inputs**: Use custom `useDebounce` hook
3. **Virtual scrolling**: For lists >100 items
4. **Lazy load heavy components**: Use `React.lazy()`
5. **Optimize re-renders**: Use `useMemo` and `useCallback`
