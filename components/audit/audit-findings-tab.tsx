"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, AlertCircle, Clock, CheckCircle2, Search } from "lucide-react";
import { FindingsTable } from "@/components/audit/findings-table";
import { FindingsFilters } from "@/components/audit/findings-filters";
import { FindingsAnalytics } from "@/components/audit/findings-analytics";
import { CreateFindingModal } from "@/components/audit/create-finding-modal";
import type { Finding, FindingSeverity, FindingStatus } from "@/lib/types/audit-types";

interface AuditFindingsTabProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  findings: Finding[];
}

export function AuditFindingsTab({ stats, findings }: AuditFindingsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<FindingSeverity[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<FindingStatus[]>([]);

  const handleSeverityToggle = (severity: FindingSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
    );
  };

  const handleStatusToggle = (status: FindingStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  // Apply filters
  const filteredFindings = findings.filter((finding) => {
    const matchesSearch =
      searchQuery === "" ||
      finding.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.recommendation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      selectedSeverities.length === 0 || selectedSeverities.includes(finding.severity);

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(finding.status);

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Audit Findings</h1>
              <p className="text-muted-foreground mt-1 text-sm">
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
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Findings</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Findings List</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <div className="grid">
                {/* SEARCH AND FILTER  */}
                <div className="space-y-4">
                  {/* Filters */}
                  <Card className="gap-4 p-6 py-4">
                    <h3 className="font-medium">Search or filter by: </h3>
                    {/* Search */}
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="Search findings by reference, description, or recommendation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <FindingsFilters
                      selectedSeverities={selectedSeverities}
                      selectedStatuses={selectedStatuses}
                      onSeverityToggle={handleSeverityToggle}
                      onStatusToggle={handleStatusToggle}
                      onClearAll={handleClearFilters}
                    />
                  </Card>

                  {/* Table */}
                  <FindingsTable findings={filteredFindings} />
                  {/* Results Count */}
                  <div className="text-muted-foreground text-sm">
                    Showing {filteredFindings.length} of {findings.length} finding
                    {findings.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <FindingsAnalytics findings={findings} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Finding Modal */}
      <CreateFindingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        auditPlanId="1"
      />
    </div>
  );
}
