/**
 * Metadata Display Component
 *
 * Renders framework-specific metadata items based on framework type.
 * Dynamically displays different field configurations for ISO27001, COSO, COBIT, and NIST.
 */

import { Badge } from "@/components/ui/badge";

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

  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <div className="flex flex-wrap gap-2">
      {displayItems.map((item: Record<string, any>, idx: number) => (
        <Badge key={idx} variant="info" className="px-2 py-1 text-xs">
          {item[config.fields[0].name] || "-"}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="px-2 py-1 text-xs">
          +{remainingCount} others
        </Badge>
      )}
    </div>
  );
}
