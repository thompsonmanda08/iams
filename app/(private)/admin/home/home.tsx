import PageHeader from "@/components/page-header";
import { Building2, Users, MapPin, Globe, LayoutDashboard } from "lucide-react";
import { getBackofficeStats } from "@/app/_actions/backoffice-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export default async function AdminDashboardHome() {
  // Fetch stats from backend
  // const statsResponse = await getBackofficeStats();
  // const stats = statsResponse.success
  //   ? statsResponse.data
  //   : { companies: 0, users: 0, countries: 0, locations: 0 };

  const stats = { companies: 0, users: 0, countries: 0, locations: 0 };

  const statCards = [
    { label: "Total Companies", value: stats.companies, icon: Building2, color: "bg-blue-500" },
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-green-500" },
    { label: "Countries", value: stats.countries, icon: Globe, color: "bg-purple-500" },
    { label: "Company Locations", value: stats.locations, icon: MapPin, color: "bg-orange-500" }
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
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
    </>
  );
}
