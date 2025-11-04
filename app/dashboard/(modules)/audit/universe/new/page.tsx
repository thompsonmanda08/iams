import AuditUniverseForm from "../_components/audit-universe-form";
import PageHeader from "@/components/page-header";

const NewAuditUniversePage = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="New Universe"
              description="Set up a new audit universe with entries"
              icon="FileText"
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Universe
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AuditUniverseForm initialData={null} />
      </div>
    </div>
  );
};

export default NewAuditUniversePage;
