import { getDepartments } from "@/app/_actions/config-actions";
import DepartmentsConfig from "../_components/departments-config";
import { Pagination } from "@/lib/types";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function DepartmentsConfigPage({ searchParams }: PageProps) {
  const urlParams = await searchParams;
  const page = urlParams.page ? Number(urlParams.page) : 1;
  const page_size = urlParams.page_size ? Number(urlParams.page_size) : 10;

  const departmentsResponse = await getDepartments({ page, page_size });

  const data = departmentsResponse.success ? departmentsResponse.data : null;
  const departments = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    has_next: false,
    has_prev: false
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Department Setup</h1>
          <p className="text-muted-foreground mt-1">Manage your departments across the country</p>
        </div>
      </div>

      <DepartmentsConfig initialDepartments={departments} pagination={pagination} />
    </div>
  );
}
