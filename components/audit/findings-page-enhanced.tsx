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

interface FindingsPageEnhancedProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  findings: Finding[];
}

export function FindingsPageEnhanced({ stats, findings }: FindingsPageEnhancedProps) {
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

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(finding.status);

    return matchesSearch && matchesSeverity && matchesStatus;
  });

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

          {/* Tabs */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Findings List</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Filters Sidebar */}
                <Card className="p-6 lg:col-span-1 h-fit">
                  <FindingsFilters
                    selectedSeverities={selectedSeverities}
                    selectedStatuses={selectedStatuses}
                    onSeverityToggle={handleSeverityToggle}
                    onStatusToggle={handleStatusToggle}
                    onClearAll={handleClearFilters}
                  />
                </Card>

                {/* Findings Table */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search findings by reference, description, or recommendation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Results Count */}
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredFindings.length} of {findings.length} finding
                    {findings.length !== 1 ? "s" : ""}
                  </div>

                  {/* Table */}
                  <FindingsTable findings={filteredFindings} />
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
