/**
 * Metadata Display Component
 *
 * Renders framework-specific metadata items based on framework type.
 * Dynamically displays different field configurations for ISO27001, COSO, COBIT, and NIST.
 */


// Framework field configurations matching the form definitions
const FRAMEWORK_FIELD_CONFIGS = {
  iso27001: {
    label: "ISO 27001",
    fields: [
      { name: "clause_number", label: "Clause", shortLabel: "C" },
      { name: "clause_description", label: "Description", shortLabel: "D" }
    ]
  },
  coso: {
    label: "COSO",
    fields: [
      { name: "component", label: "Component", shortLabel: "Comp" },
      { name: "control_type", label: "Control Type", shortLabel: "Type" },
      { name: "principle", label: "Principle", shortLabel: "Prin" }
    ]
  },
  cobit: {
    label: "COBIT",
    fields: [
      { name: "domain", label: "Domain", shortLabel: "D" },
      { name: "process_code", label: "Process Code", shortLabel: "Code" },
      { name: "process_name", label: "Process", shortLabel: "P" }
    ]
  },
  nist: {
    label: "NIST",
    fields: [
      { name: "function", label: "Function", shortLabel: "F" },
      { name: "category", label: "Category", shortLabel: "C" },
      { name: "subcategory", label: "Subcategory", shortLabel: "S" }
    ]
  }
};

interface MetadataDisplayProps {
  metadata?: Record<string, any>;
  frameworkType?: string;
}

export function MetadataDisplay({ metadata, frameworkType = "iso27001" }: MetadataDisplayProps) {
  const normalizedFrameworkType = frameworkType.toLowerCase();
  const config =
    FRAMEWORK_FIELD_CONFIGS[normalizedFrameworkType as keyof typeof FRAMEWORK_FIELD_CONFIGS];

  if (!config) {
    return <p className="text-muted-foreground text-sm">Unknown framework type: {frameworkType}</p>;
  }

  const items = metadata?.[normalizedFrameworkType] || [];

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-sm">No {config.label} items defined</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item: Record<string, any>, idx: number) => (
        <div key={idx} className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm">
          <div className="space-y-1">
            {config.fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                <span className="text-foreground">{item[field.name] || "-"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
