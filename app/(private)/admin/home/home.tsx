import PageHeader from "@/components/page-header";
import { Building2, Users, MapPin, Globe, LayoutDashboard } from "lucide-react";
import { getBackofficeStats } from "@/app/_actions/backoffice-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardHome() {
  // Fetch stats from backend
  const statsResponse = await getBackofficeStats();
  const stats = statsResponse.success
    ? statsResponse.data
    : { company_count: 0, user_count: 0, country_count: 0, location_count: 0 };

  const statCards = [
    { label: "Countries", value: stats.country_count || 0, icon: Globe, color: "bg-purple-500" },
    { label: "Companies", value: stats.company_count || 0, icon: Building2, color: "bg-blue-500" },
    { label: "Users", value: stats.user_count || 0, icon: Users, color: "bg-green-500" }
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </>
  );
}
