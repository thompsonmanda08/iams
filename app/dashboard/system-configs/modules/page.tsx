import { getModules } from "@/app/_actions/config-actions";
import ModuleListConfig from "./module-list";

export default async function ModulesConfigPage() {
  const response = await getModules();
  const modules = response.success ? response.data.data : [];
  return (
    <div className="container mx-auto space-y-6 p-6 px-4">
      <ModuleListConfig initialModules={modules} />
    </div>
  );
}
