import { getDepartments } from "@/app/_actions/config-actions";
import DepartmentsConfig from "../_components/departments-config";

export default async function DepartmentsConfigPage() {
  // Fetch all data server-side
  const [departmentsResponse] = await Promise.all([getDepartments()]);

  const departments = departmentsResponse.success ? departmentsResponse.data?.data : [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Department Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your departments across the country</p>
        </div>
      </div>

      <DepartmentsConfig initialDepartments={departments} />
    </div>
  );
}
