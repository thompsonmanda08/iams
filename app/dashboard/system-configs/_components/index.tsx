"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppModule, Department, ErrorState } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input-field";
import { updateDepartment } from "@/app/_actions/config-actions";
import { useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, FolderCode } from "lucide-react";
import { add } from "date-fns";
import { capitalize, cn } from "@/lib/utils";

import { ArrowUpRightIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import Link from "next/link";

export const UpdateDepartmentForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const departmentId = params?.id as string;

  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<Department>({
    id: undefined,
    name: "",
    code: "",
    description: ""
  });

  async function handleUpdateDepartment(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await updateDepartment({ ...formData, id: departmentId });
    if (res.success) {
      toast.success(`Department updated successfully`);
    } else {
      toast.error(res.message);
      setError({ status: true, message: res.message });
    }

    setIsLoading(false);
  }
  return (
    <form onSubmit={handleUpdateDepartment} className="space-y-4">
      <div className="flex flex-col items-end justify-start gap-2 md:flex-row">
        <Input
          label="Name"
          placeholder="Department Name"
          classNames={{
            wrapper: "md:max-w-xs w-full"
          }}
          value={formData.name}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, name: e.target.value }));
          }}
          required
          // descriptionText="A unique code will be automatically generated from the name"
        />
        <Input
          label="Description"
          placeholder="Department description (optional)"
          value={formData.description}
          className="w-full"
          classNames={{
            wrapper: "md:max-w-none w-full"
          }}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, description: e.target.value }));
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !formData.parentId || !formData.name}
          isLoading={isLoading}
          loadingText="Saving..."
          className="col-end-1">
          Save
        </Button>
      </div>
      {error.status && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};
export const AddNewRoleForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const departmentId = params?.id as string;

  const [error, setError] = useState<ErrorState>({
    status: false,
    message: ""
  });

  const [formData, setFormData] = useState<Department>({
    id: undefined,
    name: "",
    code: "",
    description: ""
  });

  async function handleUpdateDepartment(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await updateDepartment({ ...formData, id: departmentId });
    if (res.success) {
      toast.success(`Department updated successfully`);
    } else {
      toast.error(res.message);
      setError({ status: true, message: res.message });
    }

    setIsLoading(false);
  }
  return (
    <form onSubmit={handleUpdateDepartment} className="space-y-4">
      <div className="flex flex-col items-end justify-start gap-2 md:flex-row">
        <Input
          label="Name"
          placeholder="Department Name"
          classNames={{
            wrapper: "md:max-w-xs w-full"
          }}
          value={formData.name}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, name: e.target.value }));
          }}
          required
          // descriptionText="A unique code will be automatically generated from the name"
        />
        <Input
          label="Description"
          placeholder="Department description (optional)"
          value={formData.description}
          className="w-full"
          classNames={{
            wrapper: "md:max-w-none w-full"
          }}
          onChange={(e) => {
            setError({ status: false, message: "" });
            setFormData((c) => ({ ...c, description: e.target.value }));
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !formData.parentId || !formData.name}
          isLoading={isLoading}
          loadingText="Saving..."
          className="col-end-1">
          Save
        </Button>
      </div>
      {error.status && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};

const ModuleItem = ({
  name,
  description,
  onSelection,
  allowSelect = false,
  backendKey,
  selectedModules = []
}: {
  name: string;
  description: string;
  onSelection: (key: string, action: "add" | "remove") => void;
  allowSelect?: boolean;
  backendKey: string;
  selectedModules?: string[];
}) => {
  return (
    <div
      key={name}
      className="relative flex w-full cursor-pointer justify-start gap-x-2 rounded-lg border border-blue-100 bg-blue-50 p-3 hover:bg-blue-100">
      <Checkbox
        checked={selectedModules?.includes(backendKey)}
        onCheckedChange={(checked) => {
          if (!allowSelect) return;
          onSelection(backendKey, checked ? "add" : "remove");
        }}
        disabled={!allowSelect}
        className="h-4 w-4"
      />
      <div className="gap-3s flex items-center justify-center rounded">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <div className="flex w-max flex-col items-start justify-start gap-y-1">
          <span className="text-sm font-medium text-gray-900 uppercase">{name}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>
    </div>
  );
};

export function ModuleSelection({
  modules = [],
  allowSelect,
  initialSelectedModules = [],
  onSave
}: {
  modules: AppModule[];
  allowSelect?: boolean;
  initialSelectedModules?: string[];
  onSave?: (selectedModules: string[]) => void | Promise<void>;
}) {
  const [selectedModules, setSelectedModules] = useState<string[]>(
    initialSelectedModules.length > 0 ? initialSelectedModules : modules.map((m) => m.backendKey)
  );

  async function handleSave() {
    if (onSave) {
      await onSave(selectedModules);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={cn(
          "grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3",
          modules.length === 0 && "place-items-center"
        )}>
        {modules && modules.length > 0 ? (
          modules.map((module, index) => {
            return (
              <ModuleItem
                key={module.backendKey + "-display"}
                name={capitalize(module.name)}
                description={module.description || "No Description"}
                allowSelect={allowSelect}
                backendKey={module.backendKey}
                selectedModules={selectedModules}
                onSelection={(key, action) => {
                  if (action == "add") {
                    setSelectedModules((prev) => prev.concat(key));
                  } else {
                    setSelectedModules((prev) => prev.filter((item) => item !== key));
                  }
                }}
              />
            );
          })
        ) : (
          <div className="col-span-full">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderCode />
                </EmptyMedia>
                <EmptyTitle>No Modules Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any modules yet. Get started by creating your first
                  module.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Link href="/dashboard/system-configs/modules">
                    <Button>Create module</Button>
                  </Link>
                </div>
              </EmptyContent>
              <Link href="/dashboard/system-configs/modules">
                <Button variant="link" asChild className="text-muted-foreground" size="sm">
                  Configure Modules <ArrowUpRightIcon />
                </Button>
              </Link>
            </Empty>
          </div>
        )}
      </div>
      {allowSelect && (
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedModules.length} module{selectedModules.length !== 1 ? "s" : ""} selected
          </span>
          <Button onClick={handleSave} disabled={selectedModules.length === 0}>
            Save Selection
          </Button>
        </div>
      )}
    </div>
  );
}
