import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Clock, Download, FileSpreadsheet, FilePdf } from "lucide-react";
import { getReportTemplates } from "@/app/_actions/audit-module-actions";

export default async function ReportsPage() {
  const templatesResponse = await getReportTemplates();
  const templates = templatesResponse.success ? templatesResponse.data : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
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
              <h2 className="text-xl font-semibold mb-4">Available Report Templates</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <Button size="sm" variant="outline">
                          Generate
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <FilePdf className="h-4 w-4" />
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
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Compliance Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View comprehensive analytics and trends across all audits
              </p>
              <Button>View Analytics Dashboard</Button>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generated Reports</h2>
              <p className="text-sm text-muted-foreground">
                Reports are automatically deleted after 30 days
              </p>
            </div>

            <Card className="p-12 text-center">
              <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Report History</h3>
              <p className="text-sm text-muted-foreground">
                Generated reports will appear here
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
