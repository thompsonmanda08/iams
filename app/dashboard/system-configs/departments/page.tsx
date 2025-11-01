import { getDepartments } from "@/app/_actions/config-actions";
import DepartmentsConfig from "../_components/departments-config";
import { Pagination } from "@/lib/types";
import PageHeader from "@/components/page-header";
import { Briefcase } from "lucide-react";

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
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Department Setup"
              description="Manage your departments across the country"
              Icon={Briefcase}
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Budget
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      <div className="container mx-auto space-y-6 p-6">
        <DepartmentsConfig initialDepartments={departments} pagination={pagination} />
      </div>
    </div>
  );
}
