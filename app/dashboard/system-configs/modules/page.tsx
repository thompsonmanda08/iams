"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ModuleList } from "./module-list";

export default function Page() {
  const [moduleName, setModuleName] = useState("");
  const [pathName, setPathName] = useState("");
  const [iconName, setIconName] = useState("");
  const [sidebarOrder, setSidebarOrder] = useState("0");
  const [hasSubModules, setHasSubModules] = useState(false);

  const handleSave = () => {
    console.log("Saving module:", { moduleName, pathName, iconName, sidebarOrder, hasSubModules });
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <aside className="border-border w-md border p-6 rounded-lg">
          <div className="mb-6">
            <h2 className="text-foreground text-lg font-semibold">Module Management</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Create and edit system modules to customize your organization's needs.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="module-name" className="text-foreground text-sm font-medium">
                Module Name
              </Label>
              <Input
                id="module-name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter module name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="path-name" className="text-foreground text-sm font-medium">
                Path Name
              </Label>
              <Input
                id="path-name"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                placeholder="Enter path name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon-name" className="text-foreground text-sm font-medium">
                Icon Name
              </Label>
              <Input
                id="icon-name"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="Enter icon name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sidebar-order" className="text-foreground text-sm font-medium">
                Sidebar Order
              </Label>
              <Input
                id="sidebar-order"
                type="number"
                value={sidebarOrder}
                onChange={(e) => setSidebarOrder(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-sub-modules"
                checked={hasSubModules}
                onCheckedChange={(checked) => setHasSubModules(checked as boolean)}
              />
              <Label
                htmlFor="has-sub-modules"
                className="text-foreground cursor-pointer text-sm font-medium">
                Has Sub Modules
              </Label>
            </div>

            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </aside>
        <main className="flex-1 pb-6 px-6">
          <ModuleList />
        </main>
      </div>
    </div>
  );
}
