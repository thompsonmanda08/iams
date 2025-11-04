"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
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
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BackButton from "@/components/back-button";

interface RiskOwner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  user_type?: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  color: string;
  description?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

interface RiskAction {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category_id: string;
  department_id: string;
  matrix_id: string | null;
  risk_register_id: string;
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
  inherent_score: number | null;
  inherent_rating: string | null;
  residual_likelihood: number;
  residual_impact: number;
  residual_score: number | null;
  residual_rating: string | null;
  existing_controls: string;
  control_effectiveness: number;
  treatment_plan: string;
  risk_response: string;
  risk_owner_id: string;
  risk_appetite_status: string;
  target_closing_date: string;
  revised_target_date: string | null;
  date_closed: string | null;
  status: string;
  overdue_days: number | null;
  review_date: string | null;
  mitigation_cost: number;
  latest_update: string | null;
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

  const handleMitigationSelect = (option: string) => {
    toast.success(`Risk response changed to: ${option}`);
  };

  // Calculate risk scores
  const inherentScore =
    action.inherent_score || action.inherent_likelihood * action.inherent_impact;
  const residualScore =
    action.residual_score || action.residual_likelihood * action.residual_impact;

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

  // Format date safely
  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "Not set";
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Check if date is overdue
  const isOverdue = (dateString: string | null) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <BackButton title="Back to Actions" />
              <div>
                <h1 className="text-foreground text-3xl font-bold">{action.title}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{action.description}</p>
                <p className="text-muted-foreground mt-2 font-mono text-xs uppercase">
                  ID: {action.id}
                </p>
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
                    <Badge variant={getStatusVariant(action.status)} className="mt-1">
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
                    <Badge className={cn("mt-1 border", getResponseColor(action.risk_response))}>
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
                    <p className="mt-1 text-lg font-semibold">{action.risk_appetite_status}</p>
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
                        style={{ backgroundColor: action.category?.color }}
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
                    <p className="mt-1 font-semibold">
                      {action.strategic_objective || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Step</p>
                    <Badge variant="outline" className="mt-1">
                      Step {action.step}
                    </Badge>
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
                    <p className="mt-1 font-semibold">{action.macro_process || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Sub Process</p>
                    <p className="mt-1 font-semibold">{action.sub_process || "Not specified"}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Target Closing Date</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <div>
                        <p className="font-semibold">{formatDate(action.target_closing_date)}</p>
                        {isOverdue(action.target_closing_date) && (
                          <p className="text-xs text-red-600">
                            Overdue{action.overdue_days ? ` by ${action.overdue_days} days` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Recurrence</p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {action.recurrence}
                    </Badge>
                  </div>

                  {action.review_date && (
                    <div>
                      <p className="text-muted-foreground text-sm">Review Date</p>
                      <p className="mt-1 font-semibold">{formatDate(action.review_date)}</p>
                    </div>
                  )}
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
                <p className="text-sm">{action.root_cause || "Not specified"}</p>
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
                <p className="text-sm">{action.existing_controls || "No controls specified"}</p>
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
              <p className="text-sm">{action.treatment_plan || "No treatment plan specified"}</p>
              <div className="mt-4 flex items-center gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-xs">Mitigation Cost</p>
                    <p className="font-semibold">
                      {action.mitigation_cost
                        ? `$${action.mitigation_cost.toLocaleString()}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
