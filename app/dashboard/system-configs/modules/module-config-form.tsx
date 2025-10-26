"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { createModule } from "@/app/_actions/config-actions";
import { toast } from "sonner";

const INIT_FORM_DATA = {
  name: "",
  href: "",
  order: 0,
  hasSubModules: false
};

export default function ModuleConfigForm() {
  const [formData, setFormData] = useState(INIT_FORM_DATA);

  const updateFormData = (e: any) => {
    const { name, value, type, checked } = e.target;
    const field = type === "checkbox" ? "hasSubModules" : name;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [field]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createModule({
        name: data.name,
        href: data.href,
        sortOrder: data.order,
        parent_module_id: null,
        module_code:"",
      });

      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
      // },
      // onSuccess: () => {
      //   toast.success(`Module ${initialData ? "updated" : "created"} successfully`);
      //   setOpenModal(false);
      //   setInitialData(null);
      //   setFormData(PROVINCE_INITIAL_STATE);
      //   onSuccess();
      // },
      // onError: (error: Error) => {
      //   setError({ status: true, message: error.message });
      //   toast.error(error.message);
    }
  });

  const handleSave = () => {
    console.log("Saving module:", formData);
  };

  return (
    <>
      <form className="border-border rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-foreground text-lg font-semibold">Create Module</h2>
          <p className="text-muted-foreground mt-1 text-sm">Create and edit system modules.</p>
        </div>

        <div className="flex w-full gap-3">
          <div className="space-y-2">
            <Label htmlFor="module-name" className="text-foreground text-sm font-medium">
              Module Name
            </Label>
            <Input
              id="module-name"
              name="name"
              value={formData.name}
              onChange={updateFormData}
              placeholder="Enter module name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path-name" className="text-foreground text-sm font-medium">
              Path Name
            </Label>
            <Input
              id="path-name"
              value={formData.href}
              name="href"
              onChange={updateFormData}
              placeholder="Enter path name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sidebar-order" className="text-foreground text-sm font-medium">
              Sidebar Order
            </Label>
            <Input
              id="sidebar-order"
              type="number"
              name="order"
              value={formData.order}
              onChange={updateFormData}
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2 self-end">
            <Checkbox
              id="has-sub-modules"
              checked={formData.hasSubModules}
              onChange={updateFormData}
              // onCheckedChange={(checked) => setHasSubModules(checked as boolean)}
            />
            <Label
              htmlFor="has-sub-modules"
              className="text-foreground cursor-pointer text-sm font-medium">
              Has Sub Modules
            </Label>
          </div>

          <Button onClick={handleSave} className="w-max self-end">
            Save
          </Button>
        </div>
      </form>
    </>
  );
}
