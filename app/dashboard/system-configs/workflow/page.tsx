import { getDepartments } from "@/app/_actions/config-actions";
import DepartmentsConfig from "../_components/departments-config";
import { Pagination } from "@/lib/types";
import PageHeader from "@/components/page-header";
import { Briefcase, Plus, Workflow } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WorkflowClient from "./_components";

type PageProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<Pagination & { [key: string]: string }>;
};

export default async function WorkflowConfigPage({ searchParams }: PageProps) {
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
      <WorkflowClient initialDepartments={departments} pagination={pagination} />
    </div>
  );
}
