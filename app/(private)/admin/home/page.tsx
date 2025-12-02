import PageHeader from "@/components/page-header";
import AdminDashboardHome from "./home";
import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Home",
  description: "Administrator dashboard"
};

const setupSteps = [
  {
    step: "01",
    action: "COUNTRIES",
    description: "Create countries as the foundation of your location hierarchy",
    example: "e.g., Zambia, South Africa, Kenya"
  },
  {
    step: "02",
    action: "PROVINCES OR STATES",
    description: "Add provinces or states within each country",
    example: "e.g., Lusaka Province, Central Province"
  },
  {
    step: "03",
    action: "TOWNS OR CITIES",
    description: "Define towns and cities within provinces/states",
    example: "e.g., Lusaka City, Kitwe, Ndola"
  },
  {
    step: "04",
    action: "ORGANIZATIONS / INSTITUTIONS",
    description: "Register companies or organizations and link them to specific locations",
    example: "e.g., BGS Zambia → Lusaka City"
  },
  {
    step: "05",
    action: "USERS",
    description: "Create admin users for each organization with appropriate permissions",
    example: "e.g., admin@bgs.co.zm → BGS Zambia"
  }
] as const;

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      {/* Quick Actions Skeleton */}
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}

async function AdminDashboardHomePage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Dashboard Overview"
              description="A summary of key metrics and statistics for your dashboard."
              customIcon={
                <div className="relative">
                  <div className="gradient-blue absolute inset-0 rounded-2xl opacity-40 blur-lg"></div>
                  <div className="gradient-blue relative rounded-2xl p-3 shadow-lg">
                    <LayoutDashboard className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <AdminDashboardHome />
        </Suspense>

        <Card className="from-canvas to-canvas/50 border-primary/10 mt-8 bg-linear-to-br">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="from-primary to-primary/40 h-1 w-12 rounded-full bg-linear-to-r" />
              <CardTitle className="text-xl">Quick Guide</CardTitle>
            </div>
            <CardDescription>Initialize and setup your configurable items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {setupSteps.map((item) => (
                <div
                  key={item.step}
                  className="group border-border/50 bg-background/50 hover:border-primary/20 hover:bg-background flex gap-4 rounded-lg border p-4 transition-all duration-200">
                  <div className="shrink-0">
                    <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-lg border">
                      <span className="text-primary font-mono text-sm font-bold">{item.step}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-primary/80 mb-1 font-mono text-sm font-semibold">
                      {item.action}
                    </div>
                    <p className="text-foreground/80 text-sm leading-relaxed">{item.description}</p>
                    {item.example && (
                      <p className="text-muted-foreground mt-2 text-xs italic">{item.example}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardHomePage;
