import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Clock, Download, FileSpreadsheet } from "lucide-react";
import { getReportTemplates } from "@/app/_actions/audit-module-actions";

export default async function ReportsPage() {
  const templatesResponse = await getReportTemplates();
  const templates = templatesResponse.success ? templatesResponse.data : [];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Generate audit reports and view compliance analytics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Report Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Report Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Available Report Templates</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="p-6 transition-shadow hover:shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <Button size="sm" variant="outline">
                          Generate
                        </Button>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <FileText className="h-4 w-4" />
                          PDF
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="p-12 text-center">
              <BarChart3 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-lg font-semibold">Compliance Analytics</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                View comprehensive analytics and trends across all audits
              </p>
              <Button>View Analytics Dashboard</Button>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Reports</h2>
              <p className="text-muted-foreground text-sm">
                Reports are automatically deleted after 30 days
              </p>
            </div>

            <Card className="p-12 text-center">
              <Clock className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-lg font-semibold">No Report History</h3>
              <p className="text-muted-foreground text-sm">Generated reports will appear here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
