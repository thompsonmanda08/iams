import PageHeader from "@/components/page-header";
import AdminDashboardHome from "./home";
import { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin Home",
  description: "Administrator dashboard"
};

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
              Icon={LayoutDashboard}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <AdminDashboardHome />
        </Suspense>
      </div>
    </div>
  );
}

export default AdminDashboardHomePage;
