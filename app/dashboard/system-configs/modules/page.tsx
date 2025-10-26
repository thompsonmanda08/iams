import { ModuleList } from "./module-list";
import ModuleConfigForm from "./module-config-form";

export default async function ModulesConfigPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">System Modules Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your system modules and routes</p>
        </div>
      </div>

      <ModuleConfigForm />
      <div className="grid grid-cols-1 gap-4">
        <ModuleList />
      </div>
    </div>
  );
}
