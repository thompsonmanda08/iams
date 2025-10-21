"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const modules = [
  { id: "dashboard", label: "Dashboard", defaultChecked: true },
  { id: "super-merchants", label: "Super Merchants", defaultChecked: false },
  { id: "merchants", label: "Merchants", defaultChecked: true },
  { id: "accounts", label: "Accounts", defaultChecked: false },
  { id: "settlements", label: "Settlements", defaultChecked: false },
  { id: "invoices", label: "Invoices", defaultChecked: false },
  { id: "configurations", label: "Configurations", defaultChecked: false },
  { id: "reconciliations", label: "Reconciliations", defaultChecked: false }
];

export function General() {
  const [selectedModules, setSelectedModules] = useState<string[]>(
    modules.filter((m) => m.defaultChecked).map((m) => m.id)
  );

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSave = () => {
    console.log("Saving modules:", selectedModules);
    // Handle save logic here
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground mb-4 text-base font-semibold">Modules</h3>

        <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-6">
          {modules.map((module) => (
            <div key={module.id} className="flex items-center space-x-3">
              <Checkbox
                id={module.id}
                checked={selectedModules.includes(module.id)}
                onCheckedChange={() => handleModuleToggle(module.id)}
              />
              <Label
                htmlFor={module.id}
                className="text-foreground cursor-pointer text-sm font-normal">
                {module.label}
              </Label>
            </div>
          ))}

          <p className="text-muted-foreground pt-2 text-sm">
            Please choose modules you want this department to have access to.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
