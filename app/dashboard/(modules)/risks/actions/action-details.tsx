"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Shield,
  DollarSign,
  Calendar,
  User,
  Building,
  AlertTriangle,
  ChevronDown,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RiskOwner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface RiskAction {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  risk_owner: RiskOwner;
  macro_process: string;
  sub_process: string;
  strategic_objective: string;
  root_cause: string;
  recurrence: string;
  step: number;
  department_status: string;
  inherent_likelihood: number;
  inherent_impact: number;
  residual_likelihood: number;
  residual_impact: number;
  existing_controls: string;
  control_effectiveness: number;
  treatment_plan: string;
  risk_response: string;
  risk_appetite_status: string;
  target_closing_date: string;
  status: string;
  mitigation_cost: number;
  created_at: string;
  updated_at: string;
}

interface Update {
  date: string;
  updateType: string;
  description: string;
  attachment?: string;
  progress: number;
  status: string;
}

interface ActionDetailsProps {
  action: RiskAction;
}

export function ActionDetails({ action }: ActionDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [updates, setUpdates] = useState<Update[]>([]);

  const handleMitigationSelect = (option: string) => {
    toast({
      title: "Risk Response Updated",
      description: `Risk response changed to: ${option}`
    });
  };

  // Calculate risk scores
  const inherentScore = action.inherent_likelihood * action.inherent_impact;
  const residualScore = action.residual_likelihood * action.residual_impact;

  // Get risk level
  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Critical", color: "bg-red-500", textColor: "text-red-600" };
    if (score >= 10) return { label: "High", color: "bg-orange-500", textColor: "text-orange-600" };
    if (score >= 5)
      return { label: "Medium", color: "bg-yellow-500", textColor: "text-yellow-600" };
    return { label: "Low", color: "bg-green-500", textColor: "text-green-600" };
  };

  const inherentRisk = getRiskLevel(inherentScore);
  const residualRisk = getRiskLevel(residualScore);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "secondary";
      case "IN_PROGRESS":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get response color
  const getResponseColor = (response: string) => {
    switch (response?.toUpperCase()) {
      case "REDUCE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACCEPT":
        return "bg-green-100 text-green-800 border-green-200";
      case "TRANSFER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "AVOID":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Actions
              </Button>
              <div>
                <h1 className="text-foreground text-3xl font-bold">{action.title}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{action.description}</p>
                <p className="text-muted-foreground mt-2 font-mono text-xs">ID: {action.id}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="gap-2">
                  Change Risk Response
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleMitigationSelect("Reduce")}>
                  <Shield className="mr-2 h-4 w-4" />
                  Reduce
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMitigationSelect("Accept")}>
                  <Target className="mr-2 h-4 w-4" />
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMitigationSelect("Avoid")}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Avoid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMitigationSelect("Transfer")}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Transfer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Status and Response Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                    <AlertTriangle className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Status</p>
                    <Badge variant={getStatusVariant(action?.status)} className="mt-1">
                      {action.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Risk Response</p>
                    <Badge className={cn("mt-1 border", getResponseColor(action?.risk_response))}>
                      {action.risk_response}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Risk Appetite</p>
                    <p className="mt-1 text-lg font-semibold">{action?.risk_appetite_status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inherent Risk */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-500/10 blur-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Inherent Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-full", inherentRisk.color)} />
                  <span className={cn("text-2xl font-bold", inherentRisk.textColor)}>
                    {inherentRisk.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Likelihood</p>
                    <p className="text-2xl font-bold">{action.inherent_likelihood}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Impact</p>
                    <p className="text-2xl font-bold">{action.inherent_impact}</p>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <p className="text-muted-foreground text-xs">Risk Score</p>
                  <p className="text-3xl font-bold">{inherentScore}</p>
                </div>
              </CardContent>
            </Card>

            {/* Residual Risk */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-green-500/10 blur-2xl" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Shield className="h-5 w-5 text-green-600" />
                  Residual Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-full", residualRisk.color)} />
                  <span className={cn("text-2xl font-bold", residualRisk.textColor)}>
                    {residualRisk.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Likelihood</p>
                    <p className="text-2xl font-bold">{action.residual_likelihood}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Impact</p>
                    <p className="text-2xl font-bold">{action.residual_impact}</p>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <p className="text-muted-foreground text-xs">Risk Score</p>
                  <p className="text-3xl font-bold">{residualScore}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Risk Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Risk Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Category</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: action?.category?.color }}
                      />
                      <p className="font-semibold">{action.category.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {action.category.code}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Department</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Building className="text-muted-foreground h-4 w-4" />
                      <p className="font-semibold">{action.department.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {action.department.code}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Risk Owner</p>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-semibold">
                          {action.risk_owner.first_name} {action.risk_owner.last_name}
                        </p>
                        <p className="text-muted-foreground text-xs">{action.risk_owner.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Strategic Objective</p>
                    <p className="mt-1 font-semibold">{action.strategic_objective}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Process & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Macro Process</p>
                    <p className="mt-1 font-semibold">{action.macro_process}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Sub Process</p>
                    <p className="mt-1 font-semibold">{action.sub_process}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Target Closing Date</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <p className="font-semibold">
                        {format(new Date(action.target_closing_date), "MMMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Recurrence</p>
                    <Badge variant="outline" className="mt-1">
                      {action.recurrence}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Root Cause & Controls */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Root Cause</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{action.root_cause}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                  Existing Controls
                  <Badge variant="outline">Effectiveness: {action.control_effectiveness}/5</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{action.existing_controls}</p>
              </CardContent>
            </Card>
          </div>

          {/* Treatment Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5" />
                Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{action.treatment_plan}</p>
              <div className="mt-4 flex items-center gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-xs">Mitigation Cost</p>
                    <p className="font-semibold">${action.mitigation_cost?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Risk Updates</CardTitle>
                <Input
                  placeholder="Search updates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Update Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="text-muted-foreground/50 h-8 w-8" />
                            <p className="text-muted-foreground">No updates available</p>
                            <p className="text-muted-foreground text-xs">
                              Updates will appear here as they are added
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      updates.map((update, index) => (
                        <TableRow key={index}>
                          <TableCell>{update.date}</TableCell>
                          <TableCell>{update.updateType}</TableCell>
                          <TableCell>{update.description}</TableCell>
                          <TableCell>{update.attachment || "-"}</TableCell>
                          <TableCell>{update.progress}%</TableCell>
                          <TableCell>
                            <Badge>{update.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
