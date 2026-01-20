"use client";

import { FileText, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getTopLevelClauses, getChildClauses } from "@/lib/config/iso27001-clauses";
import type { Workpaper } from "@/lib/types/audit-types";

interface ClauseHierarchyProps {
  workpapers?: Workpaper[];
  onSelectClause: (clauseNumber: string) => void;
  selectedClauseNumber?: string;
}

export function ClauseHierarchy({
  workpapers,
  onSelectClause,
  selectedClauseNumber
}: ClauseHierarchyProps) {
  const topLevelClauses = getTopLevelClauses();

  const getWorkpaperForClause = (clauseNumber: string) => {
    return workpapers?.find((wp) => wp.clause === clauseNumber);
  };

  const getClauseStatus = (clauseNumber: string) => {
    const workpaper = getWorkpaperForClause(clauseNumber);
    if (!workpaper) return null;

    // Map test result to status
    switch (workpaper.testResult) {
      case "conformity":
        return "completed";
      case "partial-conformity":
        return "in-progress";
      case "non-conformity":
        return "needs-review";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Accordion type="multiple" className="w-full space-y-2">
        {topLevelClauses.map((clause) => {
          const childClauses = getChildClauses(clause.id);
          const hasChildren = childClauses.length > 0;

          if (!hasChildren) {
            const status = getClauseStatus(clause.number);
            return (
              <div
                key={clause.id}
                className={`hover:bg-accent/50 cursor-pointer rounded-lg border p-4 transition-colors ${
                  selectedClauseNumber === clause.number ? "border-primary bg-accent/20" : ""
                }`}
                onClick={() => onSelectClause(clause.number)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{clause.number}</span>
                        <span className="text-sm">{clause.title}</span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{clause.description}</p>
                    </div>
                  </div>
                  {status && (
                    <Badge variant={status === "completed" ? "default" : "secondary"}>
                      {status}
                    </Badge>
                  )}
                </div>
              </div>
            );
          }

          return (
            <AccordionItem key={clause.id} value={clause.id} className="rounded-lg border">
              <AccordionTrigger className="hover:bg-accent/50 px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <FileText className="text-muted-foreground h-5 w-5" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{clause.number}</span>
                      <span className="text-sm">{clause.title}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">{clause.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="mt-2 ml-8 space-y-2">
                  {childClauses.map((child) => {
                    const status = getClauseStatus(child.number);
                    return (
                      <div
                        key={child.id}
                        className={`hover:bg-accent/50 cursor-pointer rounded-md border p-3 transition-colors ${
                          selectedClauseNumber === child.number ? "border-primary bg-accent/20" : ""
                        }`}
                        onClick={() => onSelectClause(child.number)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="border-muted-foreground h-4 w-4 rounded-full border-2" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{child.number}</span>
                                <span className="text-xs">{child.title}</span>
                              </div>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {child.description}
                              </p>
                            </div>
                          </div>
                          {status && (
                            <Badge
                              variant={status === "completed" ? "default" : "secondary"}
                              className="text-xs">
                              {status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
