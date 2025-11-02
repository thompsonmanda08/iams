import { Plus } from "lucide-react";
import Companies from "./companies";
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function CompaniesPage() {
  // return ;
  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Dashboard Overview"
              description="A summary of key metrics and statistics for your dashboard."
              icon="Building2"
            />
            {/* <div className="flex gap-2">
              <Link href="/admin/companies/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Company
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Companies />
      </div>
    </div>
  );
}

export default CompaniesPage;
