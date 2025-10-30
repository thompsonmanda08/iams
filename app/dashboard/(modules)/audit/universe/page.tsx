import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  PieChart,
  ArrowRight,
  Layers,
  BarChart3,
  Plus,
  FileText
} from "lucide-react";
import Link from "next/link";
import AuditUniverseList from "./_components/audit-universe-list";
import PageHeader from "@/components/page-header";

const AuditUniversePage = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Audit Universe"
              description="Comprehensive Audit Management System"
              Icon={FileText}
            />
            <div className="flex gap-2">
              <Link href="/dashboard/audit/universe/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Universe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AuditUniverseList />
      </div>
    </div>
  );
};

export default AuditUniversePage;
