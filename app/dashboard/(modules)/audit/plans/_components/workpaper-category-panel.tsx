"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkpaperCategoryPanelProps {
  category: any;
}

export function WorkpaperCategoryPanel({ category }: WorkpaperCategoryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold">
                {category.display_name || category.name || category.clause_title}
              </CardTitle>
              {category.clause && (
                <CardDescription className="text-sm">
                  Clause: {category.clause}
                </CardDescription>
              )}
            </div>
            {category.clause_range && (
              <Badge variant="outline">{category.clause_range}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {category.description && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>
        )}

        {category.objectives && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Objectives</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.objectives}
            </p>
          </div>
        )}

        {category.scope && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Scope</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.scope}
            </p>
          </div>
        )}

        {category.requirements && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Requirements</h3>
            <ul className="space-y-2">
              {(Array.isArray(category.requirements)
                ? category.requirements
                : [category.requirements]
              ).map((req: any, idx: number) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{typeof req === "string" ? req : req.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
