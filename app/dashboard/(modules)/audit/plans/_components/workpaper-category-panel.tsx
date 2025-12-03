"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFrameworkFieldConfig } from "@/lib/config/finding-framework-fields";
import type { AuditPlan } from "@/lib/types/audit-types";

interface WorkpaperCategoryPanelProps {
  category: any;
  auditPlan?: AuditPlan;
}

export function WorkpaperCategoryPanel({ category, auditPlan }: WorkpaperCategoryPanelProps) {
  // Get framework type from auditPlan or derive from category metadata
  let framework = auditPlan?.framework_type || "ISO27001";

  // If category has metadata, try to derive framework from it
  if (!auditPlan?.framework_type && category.metadata) {
    const metadataKeys = Object.keys(category.metadata);
    if (metadataKeys.length > 0) {
      framework = metadataKeys[0];
    }
  }

  const config = getFrameworkFieldConfig(framework as any);

  // Extract framework-specific fields from category metadata
  const frameworkMetadata = category.metadata?.[framework] || {};

  // console.log({ category });

  return (
    <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold">
                  {category.display_name || category.name || category.clause_title}
                </CardTitle>
                {category.clause && (
                  <Badge variant="secondary" className="text-sm">
                    {category.clause}
                  </Badge>
                )}
              </div>
              {category.clause_range && (
                <CardDescription className="text-xs">
                  Range: {category.clause_range}
                </CardDescription>
              )}
            </div>
          </div>

          {/* Framework Badge */}
          <div className="flex items-center gap-2 border-t border-blue-200 pt-2 dark:border-blue-900">
            <Badge variant="outline" className="bg-white dark:bg-slate-800">
              {framework}
            </Badge>
            <span className="text-muted-foreground text-xs">Framework</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {category.description && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{category.description}</p>
          </div>
        )}

        {category.objectives && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Objectives</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{category.objectives}</p>
          </div>
        )}

        {category.scope && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Scope</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{category.scope}</p>
          </div>
        )}

        {category.requirements && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Requirements</h3>
            <ul className="space-y-2">
              {(Array.isArray(category.requirements)
                ? category.requirements
                : [category.requirements]
              ).map((req: any, idx: number) => (
                <li key={idx} className="text-muted-foreground flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{typeof req === "string" ? req : req.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Framework-Specific Fields */}
        {Object.keys(frameworkMetadata).length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="text-primary">●</span>
              {framework} Framework Details
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {config.complianceFields
                .filter(
                  (field) =>
                    !["compliance_status", "compliance_percentage"].includes(field.name) &&
                    frameworkMetadata[field.name]
                )
                .map((field) => (
                  <div
                    key={field.name}
                    className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-900 dark:bg-slate-800">
                    <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                      {field.label}
                    </p>
                    <p className="text-foreground mt-1 line-clamp-2 text-sm font-medium">
                      {String(frameworkMetadata[field.name])}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
