"use client";

import { useState } from "react";
import { ChevronRight, Pencil, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  name: string;
  icon: string;
  path?: string;
  subModules?: SubModule[];
  expanded?: boolean;
}

interface SubModule {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

const initialModules: Module[] = [
  {
    id: "1",
    name: "Dashboard",
    icon: "D",
    path: "/dashboard",
    subModules: [{ id: "1-1", name: "home", path: "/dashboard", icon: "home" }],
    expanded: true
  },
  {
    id: "2",
    name: "Super Merchants",
    icon: "S",
    expanded: false
  },
  {
    id: "3",
    name: "Merchants",
    icon: "M",
    expanded: false
  },
  {
    id: "4",
    name: "Accounts",
    icon: "A",
    subModules: [
      { id: "4-1", name: "calculator", path: "/dashboard/accounts/revenue", icon: "calculator" },
      { id: "4-2", name: "Revenue Account", path: "/dashboard/accounts/revenue" }
    ],
    expanded: true
  },
  {
    id: "5",
    name: "Settlements",
    icon: "S",
    expanded: false
  },
  {
    id: "6",
    name: "Invoices",
    icon: "I",
    expanded: false
  },
  {
    id: "7",
    name: "Configurations",
    icon: "C",
    expanded: false
  }
];

export function ModuleList() {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [editingSubModule, setEditingSubModule] = useState<string | null>(null);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((module) => (module.id === id ? { ...module, expanded: !module.expanded } : module))
    );
  };

  return (
    <div className="space-y-2">
      {modules.map((module) => (
        <div key={module.id} className="border-border bg-card overflow-hidden rounded-lg border">
          <button
            onClick={() => toggleModule(module.id)}
            className="hover:bg-accent/50 flex w-full items-center justify-between p-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-chart-1 flex h-10 w-10 items-center justify-center rounded-lg font-medium text-white">
                {module.icon}
              </div>
              <span className="text-foreground text-sm font-medium">{module.name}</span>
            </div>
            {module.subModules && module.subModules.length > 0 && (
              <ChevronRight
                className={cn(
                  "text-muted-foreground h-4 w-4 transition-transform",
                  module.expanded && "rotate-90"
                )}
              />
            )}
          </button>

          {/* Sub Modules */}
          {module.expanded && module.subModules && (
            <div className="border-border bg-accent/20 border-t">
              {module.subModules.map((subModule) => (
                <div
                  key={subModule.id}
                  className="hover:bg-accent/30 flex items-center justify-between px-4 py-3 transition-colors">
                  <div className="flex items-center gap-3">
                    {subModule.icon === "calculator" ? (
                      <Calculator className="text-muted-foreground h-4 w-4" />
                    ) : subModule.icon === "home" ? (
                      <svg
                        className="text-muted-foreground h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    ) : null}
                    <div>
                      <p className="text-foreground text-sm font-medium">{subModule.name}</p>
                      {subModule.path && (
                        <p className="text-muted-foreground text-xs">{subModule.path}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-chart-1 hover:text-chart-1 hover:bg-chart-1/10 h-7 w-7"
                      onClick={() => setEditingSubModule(subModule.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Edit Form (shown when editing) */}
              {editingSubModule && (
                <div className="border-border bg-card space-y-4 border-t p-4">
                  <div className="space-y-2">
                    <Label htmlFor="route-name" className="text-foreground text-sm font-medium">
                      Route Name
                    </Label>
                    <Input id="route-name" placeholder="Enter route name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="path-name-edit" className="text-foreground text-sm font-medium">
                      Path Name
                    </Label>
                    <Input id="path-name-edit" placeholder="Enter path name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon-name-edit" className="text-foreground text-sm font-medium">
                      Icon Name
                    </Label>
                    <Input id="icon-name-edit" placeholder="Enter icon name" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSubModule(null)}
                      className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setEditingSubModule(null)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
