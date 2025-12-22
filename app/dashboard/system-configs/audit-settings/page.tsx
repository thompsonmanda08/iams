import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditableAreaConfig from "./_components/auditable-areas-tab";
import IndicativeTargetsTab from "./_components/indicative-targets-tab";
import StrategicPillarsTab from "./_components/strategic-pillars-tab";
import StrategicInitiativeTab from "./_components/strategic-initiative-tab";
import ProcessActivityTab from "./_components/process-activity-tab";
import WorkpaperTemplatesTab from "./_components/workpaper-templates-tab";
import PageHeader from "@/components/page-header";
import { FileText, MapPin, Target, Building2, Lightbulb, Workflow } from "lucide-react";

export default function AuditSettingsPage() {
  return (
    <div className="">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Configurations"
              description="Manage your audit templates, pillars, auditable areas, strategies, and workpapers"
              icon="ClipboardCheck"
            />
            {/* <div className="flex gap-2">
              <Link href="/dashboard/audit/budgets/new">
                <Button className="gap-2">
                  <Plus className="h-6 w-6" />
                  New Budget
                </Button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-4 p-4">
        <Tabs defaultValue="templates" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-2">
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="h-6 w-6" />
                Workpaper Templates
              </TabsTrigger>
              <TabsTrigger value="areas" className="gap-2">
                <MapPin className="h-6 w-6" />
                Auditable Areas
              </TabsTrigger>
              <TabsTrigger value="targets" className="gap-2">
                <Target className="h-6 w-6" />
                Indicative Targets
              </TabsTrigger>
              <TabsTrigger value="pillars" className="gap-2">
                <Building2 className="h-6 w-6" />
                Strategic Pillars
              </TabsTrigger>
              <TabsTrigger value="initiative" className="gap-2">
                <Lightbulb className="h-6 w-6" />
                Strategic Initiative
              </TabsTrigger>
              <TabsTrigger value="process" className="gap-2">
                <Workflow className="h-6 w-6" />
                Process/Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="templates">
            <WorkpaperTemplatesTab />
          </TabsContent>

          {/* Auditable Areas Tab */}
          <TabsContent value="areas">
            <AuditableAreaConfig />
          </TabsContent>

          {/* Indicative Targets Tab */}
          <TabsContent value="targets">
            <IndicativeTargetsTab />
          </TabsContent>

          {/* Strategic Pillars Tab */}
          <TabsContent value="pillars">
            <StrategicPillarsTab />
          </TabsContent>

          {/* Strategic Initiative Tab */}
          <TabsContent value="initiative">
            <StrategicInitiativeTab />
          </TabsContent>

          {/* Process Activity Tab */}
          <TabsContent value="process">
            <ProcessActivityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
