"use client";

import { FileText, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getTopLevelClauses, getChildClauses } from "@/lib/data/iso27001-clauses";
import type { Workpaper } from "@/lib/types/audit-types";

interface ClauseHierarchyProps {
  workpapers?: Workpaper[];
  onSelectClause: (clauseNumber: string) => void;
  selectedClauseNumber?: string;
}

export function ClauseHierarchy({ workpapers, onSelectClause, selectedClauseNumber }: ClauseHierarchyProps) {
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
                className={`rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/50 ${
                  selectedClauseNumber === clause.number ? "border-primary bg-accent/20" : ""
                }`}
                onClick={() => onSelectClause(clause.number)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{clause.number}</span>
                        <span className="text-sm">{clause.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{clause.description}</p>
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
            <AccordionItem key={clause.id} value={clause.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{clause.number}</span>
                      <span className="text-sm">{clause.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{clause.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 mt-2 ml-8">
                  {childClauses.map((child) => {
                    const status = getClauseStatus(child.number);
                    return (
                      <div
                        key={child.id}
                        className={`rounded-md border p-3 transition-colors cursor-pointer hover:bg-accent/50 ${
                          selectedClauseNumber === child.number ? "border-primary bg-accent/20" : ""
                        }`}
                        onClick={() => onSelectClause(child.number)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{child.number}</span>
                                <span className="text-xs">{child.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{child.description}</p>
                            </div>
                          </div>
                          {status && (
                            <Badge
                              variant={status === "completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
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
