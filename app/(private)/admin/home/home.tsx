import PageHeader from "@/components/page-header";
import { Building2, Users, MapPin, Globe, LayoutDashboard } from "lucide-react";

export default async function AdminDashboardHome() {
  const stats = {
    companies: 12,
    users: 45,
    countries: 3,
    locations: 28
  };

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
        <h3 className="mb-4 text-xl font-semibold text-slate-800">Quick Actions</h3>
        <p className="text-slate-600">
          Use the sidebar to navigate to different management sections. You can manage companies,
          users, configure locations, and map companies to their operating regions.
        </p>
      </div>
    </>
  );
}
