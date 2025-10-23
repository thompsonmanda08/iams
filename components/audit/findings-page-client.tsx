"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { FindingsTable } from "@/components/audit/findings-table";
import { CreateFindingModal } from "@/components/audit/create-finding-modal";
import type { Finding } from "@/lib/types/audit-types";

interface FindingsPageClientProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  findings: Finding[];
}

export function FindingsPageClient({ stats, findings }: FindingsPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Findings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track and manage non-conformities and observations
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                New Finding
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Findings</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Results Summary */}
          {findings && findings.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {findings.length} finding{findings.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Table */}
          <FindingsTable findings={findings || []} />
        </div>
      </div>

      {/* Create Finding Modal */}
      <CreateFindingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        auditPlanId="1" // This should be dynamic - perhaps selected from a dropdown
      />
    </div>
  );
}
