"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarIcon, ChevronLeft, ChevronRight, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { getDepartments } from "@/app/_actions/config-actions";
import {
  createRiskStepOne,
  updateRiskStepTwo,
  updateRiskStepThree,
  getRiskCategories,
  RiskResponse
} from "@/app/_actions/risk-module-actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, formatISO } from "date-fns";
import { getUsers } from "@/app/_actions/user-actions";

type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
};

type RiskCategory = {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  is_active: boolean;
  department_id: string;
};

interface MultiStepRiskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerId: string;
  mode?: "create" | "edit";
  categories?: Array<{ id: string; name: string }>;
}

type StepOneData = {
  title: string;
  description: string;
  category_id: string;
  department_id: string;
  macro_process: string;
  sub_process: string;
  strategic_objective: string;
  root_cause: string;
  recurrence: "ongoing" | "one-time";
};

type StepTwoData = {
  inherent_likelihood: number;
  inherent_impact: number;
  existing_controls: string;
  control_effectiveness: number;
};

type StepThreeData = {
  residual_likelihood: number;
  residual_impact: number;
  treatment_plan: string;
  risk_response: RiskResponse;
  risk_owner_id: string;
  risk_appetite_status: "WITHIN" | "ABOVE";
  target_closing_date: string;
  mitigation_cost: number;
};

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  department_id: string;
  is_active: boolean;
};

export function MultiStepRiskForm({ open, onOpenChange, registerId }: MultiStepRiskFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdRiskId, setCreatedRiskId] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [closeDate, setCloseDate] = useState<Date | undefined>();

  // Step 1 state
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    title: "",
    description: "",
    category_id: "",
    department_id: "",
    macro_process: "",
    sub_process: "",
    strategic_objective: "",
    root_cause: "",
    recurrence: "ongoing"
  });

  // Step 2 state
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    inherent_likelihood: 3,
    inherent_impact: 3,
    existing_controls: "",
    control_effectiveness: 2
  });

  // Step 3 state
  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    residual_likelihood: 2,
    residual_impact: 2,
    treatment_plan: "",
    risk_response: "REDUCE",
    risk_owner_id: "",
    risk_appetite_status: "WITHIN",
    target_closing_date: "",
    mitigation_cost: 0
  });

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (stepOneData.department_id) {
      loadUsers(stepOneData.department_id);
    }
  }, [stepOneData.department_id]);

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setCreatedRiskId(null);
      resetForm();
    }
  }, [open]);

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await getDepartments({ isActive: true });
      if (response.success && response.data?.data) {
        setDepartments(response.data?.data);
      } else {
        toast.error("Failed to load departments");
      }
    } catch (error) {
      toast.error("Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadCategories = async (departmentId?: string) => {
    setLoadingCategories(true);
    try {
      const response = await getRiskCategories({
        is_active: true,
        department_id: departmentId
      });
      if (response.success && response.data.data) {
        setCategories(response.data.data);
      } else {
        toast.error("Failed to load risk categories");
      }
    } catch (error) {
      toast.error("Error loading risk categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadUsers = async (departmentId: string) => {
    setLoadingUsers(true);
    try {
      const response = await getUsers({
        departmentId: departmentId,
        isActive: true
      });
      if (response.success && response.data?.data) {
        setUsers(response.data?.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      toast.error("Error loading users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const resetForm = () => {
    setStepOneData({
      title: "",
      description: "",
      category_id: "",
      department_id: "",
      macro_process: "",
      sub_process: "",
      strategic_objective: "",
      root_cause: "",
      recurrence: "ongoing"
    });
    setStepTwoData({
      inherent_likelihood: 3,
      inherent_impact: 3,
      existing_controls: "",
      control_effectiveness: 2
    });
    setStepThreeData({
      residual_likelihood: 2,
      residual_impact: 2,
      treatment_plan: "",
      risk_response: "REDUCE",
      risk_owner_id: "",
      risk_appetite_status: "WITHIN",
      target_closing_date: "",
      mitigation_cost: 0
    });
    setCloseDate(undefined);
    setUsers([]);
  };

  const handleStepOne = async () => {
    setIsLoading(true);
    try {
      const response = await createRiskStepOne({
        risk_register_id: registerId,
        ...stepOneData
      });

      if (response.success && response.data) {
        setCreatedRiskId(response.data.id);
        toast.success("Step 1 completed - Risk details saved");
        setCurrentStep(2);
      } else {
        toast.error(response.message || "Failed to create risk");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepTwo = async () => {
    if (!createdRiskId) {
      toast.error("Risk ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateRiskStepTwo(createdRiskId, stepTwoData);

      if (response.success) {
        toast.success("Step 2 completed - Risk evaluation saved");
        setCurrentStep(3);
      } else {
        toast.error(response.message || "Failed to update risk");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepThree = async () => {
    if (!createdRiskId) {
      toast.error("Risk ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateRiskStepThree(createdRiskId, stepThreeData);

      if (response.success) {
        toast.success("Risk created successfully and is now OPEN");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to complete risk");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      handleStepOne();
    } else if (currentStep === 2) {
      handleStepTwo();
    } else if (currentStep === 3) {
      handleStepThree();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        stepOneData.title &&
        stepOneData.description &&
        stepOneData.category_id &&
        stepOneData.department_id
      );
    }
    if (currentStep === 2) {
      return true; // All fields are optional or have defaults
    }
    if (currentStep === 3) {
      return stepThreeData.risk_owner_id && stepThreeData.treatment_plan;
    }
    return false;
  };

  const getUserDisplayName = (user: User) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username || user.email;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Critical", color: "text-red-600" };
    if (score >= 10) return { label: "High", color: "text-orange-600" };
    if (score >= 5) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Low", color: "text-green-600" };
  };

  const inherentScore = stepTwoData.inherent_likelihood * stepTwoData.inherent_impact;
  const residualScore = stepThreeData.residual_likelihood * stepThreeData.residual_impact;
  const inherentLevel = getRiskLevel(inherentScore);
  const residualLevel = getRiskLevel(residualScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Risk - Step {currentStep} of 3</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Provide risk identification and categorization details"}
            {currentStep === 2 && "Assess inherent risk and document existing controls"}
            {currentStep === 3 && "Define risk response strategy and ownership"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex w-full items-center justify-between">
          {[1, 2, 3].map((step) => (
            <Fragment key={step}>
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  step <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } font-semibold`}>
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`mx-2 h-1 flex-1 ${step < currentStep ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </Fragment>
          ))}
        </div>

        <div className="space-y-4 py-4">
          {/* Step 1: Risk Details */}
          {currentStep === 1 && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Risk Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter risk title"
                  value={stepOneData.title}
                  onChange={(e) => setStepOneData({ ...stepOneData, title: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the risk in detail"
                  rows={3}
                  value={stepOneData.description}
                  onChange={(e) => setStepOneData({ ...stepOneData, description: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Risk Category *</Label>
                  <Select
                    value={stepOneData.category_id}
                    onValueChange={(value) =>
                      setStepOneData({ ...stepOneData, category_id: value })
                    }
                    disabled={isLoading || loadingCategories}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category">
                        {loadingCategories
                          ? "Loading categories..."
                          : stepOneData.category_id
                            ? categories.find((c) => c.id === stepOneData.category_id)?.name ||
                              "Select category"
                            : "Select category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-sm">
                          No categories available
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ({category.code})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={stepOneData.department_id}
                    onValueChange={(value) =>
                      setStepOneData({ ...stepOneData, department_id: value })
                    }
                    disabled={isLoading || loadingDepartments}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department">
                        {loadingDepartments
                          ? "Loading..."
                          : stepOneData.department_id
                            ? departments.find((d) => d.id === stepOneData.department_id)?.name ||
                              "Select department"
                            : "Select department"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{dept.name}</span>
                            <span className="text-muted-foreground text-xs">({dept.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="macro_process">Macro Process</Label>
                  <Input
                    id="macro_process"
                    placeholder="e.g., Infrastructure Management"
                    value={stepOneData.macro_process}
                    onChange={(e) =>
                      setStepOneData({ ...stepOneData, macro_process: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sub_process">Sub Process</Label>
                  <Input
                    id="sub_process"
                    placeholder="e.g., Power Management"
                    value={stepOneData.sub_process}
                    onChange={(e) =>
                      setStepOneData({ ...stepOneData, sub_process: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="strategic_objective">Strategic Objective</Label>
                <Input
                  id="strategic_objective"
                  placeholder="e.g., Ensure 99.9% uptime for critical systems"
                  value={stepOneData.strategic_objective}
                  onChange={(e) =>
                    setStepOneData({ ...stepOneData, strategic_objective: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="root_cause">Root Cause</Label>
                <Textarea
                  id="root_cause"
                  placeholder="Describe the underlying cause of this risk"
                  rows={2}
                  value={stepOneData.root_cause}
                  onChange={(e) => setStepOneData({ ...stepOneData, root_cause: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select
                  value={stepOneData.recurrence}
                  onValueChange={(value) =>
                    setStepOneData({ ...stepOneData, recurrence: value as "ongoing" | "one-time" })
                  }
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 2: Evaluation */}
          {currentStep === 2 && (
            <>
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Inherent Risk Assessment</h3>
                <p className="text-muted-foreground text-sm">
                  Assess the risk before considering any controls
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="inherent_likelihood">
                      Likelihood (1-5)
                      <span className="text-muted-foreground ml-2 text-sm">
                        {stepTwoData.inherent_likelihood}
                      </span>
                    </Label>
                    <input
                      type="range"
                      id="inherent_likelihood"
                      min="1"
                      max="5"
                      value={stepTwoData.inherent_likelihood}
                      onChange={(e) =>
                        setStepTwoData({
                          ...stepTwoData,
                          inherent_likelihood: Number(e.target.value)
                        })
                      }
                      className="w-full"
                      disabled={isLoading}
                    />
                    <p className="text-muted-foreground text-xs">1 = Rare, 5 = Almost Certain</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inherent_impact">
                      Impact (1-5)
                      <span className="text-muted-foreground ml-2 text-sm">
                        {stepTwoData.inherent_impact}
                      </span>
                    </Label>
                    <input
                      type="range"
                      id="inherent_impact"
                      min="1"
                      max="5"
                      value={stepTwoData.inherent_impact}
                      onChange={(e) =>
                        setStepTwoData({
                          ...stepTwoData,
                          inherent_impact: Number(e.target.value)
                        })
                      }
                      className="w-full"
                      disabled={isLoading}
                    />
                    <p className="text-muted-foreground text-xs">
                      1 = Insignificant, 5 = Catastrophic
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                  <div>
                    <span className="text-sm font-medium">Inherent Score:</span>
                    <span className="ml-2 text-xl font-bold">{inherentScore}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Level:</span>
                    <span className={`ml-2 font-semibold ${inherentLevel.color}`}>
                      {inherentLevel.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="existing_controls">Existing Controls</Label>
                <Textarea
                  id="existing_controls"
                  placeholder="Describe current controls in place (optional)"
                  rows={3}
                  value={stepTwoData.existing_controls}
                  onChange={(e) =>
                    setStepTwoData({ ...stepTwoData, existing_controls: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="control_effectiveness">Control Effectiveness</Label>
                <Select
                  value={String(stepTwoData.control_effectiveness)}
                  onValueChange={(value) =>
                    setStepTwoData({ ...stepTwoData, control_effectiveness: Number(value) })
                  }
                  disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Highly Effective</SelectItem>
                    <SelectItem value="2">2 - Effective</SelectItem>
                    <SelectItem value="3">3 - Partially Effective</SelectItem>
                    <SelectItem value="4">4 - Ineffective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 3: Response Strategy */}
          {currentStep === 3 && (
            <>
              <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Residual Risk Assessment</h3>
                <p className="text-muted-foreground text-sm">
                  Assess the risk after considering planned controls
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="residual_likelihood">
                      Likelihood (1-5)
                      <span className="text-muted-foreground ml-2 text-sm">
                        {stepThreeData.residual_likelihood}
                      </span>
                    </Label>
                    <input
                      type="range"
                      id="residual_likelihood"
                      min="1"
                      max="5"
                      value={stepThreeData.residual_likelihood}
                      onChange={(e) =>
                        setStepThreeData({
                          ...stepThreeData,
                          residual_likelihood: Number(e.target.value)
                        })
                      }
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="residual_impact">
                      Impact (1-5)
                      <span className="text-muted-foreground ml-2 text-sm">
                        {stepThreeData.residual_impact}
                      </span>
                    </Label>
                    <input
                      type="range"
                      id="residual_impact"
                      min="1"
                      max="5"
                      value={stepThreeData.residual_impact}
                      onChange={(e) =>
                        setStepThreeData({
                          ...stepThreeData,
                          residual_impact: Number(e.target.value)
                        })
                      }
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                  <div>
                    <span className="text-sm font-medium">Residual Score:</span>
                    <span className="ml-2 text-xl font-bold">{residualScore}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Level:</span>
                    <span className={`ml-2 font-semibold ${residualLevel.color}`}>
                      {residualLevel.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="treatment_plan">Treatment Plan *</Label>
                <Textarea
                  id="treatment_plan"
                  placeholder="Describe the risk mitigation strategy"
                  rows={3}
                  value={stepThreeData.treatment_plan}
                  onChange={(e) =>
                    setStepThreeData({ ...stepThreeData, treatment_plan: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="risk_response">Risk Response</Label>
                  <Select
                    value={stepThreeData.risk_response}
                    onValueChange={(value) =>
                      setStepThreeData({ ...stepThreeData, risk_response: value as RiskResponse })
                    }
                    disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REDUCE">Reduce</SelectItem>
                      <SelectItem value="ACCEPT">Accept</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                      <SelectItem value="AVOID">Avoid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="risk_appetite_status">Risk Appetite Status</Label>
                  <Select
                    value={stepThreeData.risk_appetite_status}
                    onValueChange={(value) =>
                      setStepThreeData({
                        ...stepThreeData,
                        risk_appetite_status: value as "WITHIN" | "ABOVE"
                      })
                    }
                    disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WITHIN">Within Appetite</SelectItem>
                      <SelectItem value="ABOVE">Above Appetite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="risk_owner_id">Risk Owner *</Label>
                <Select
                  value={stepThreeData.risk_owner_id}
                  onValueChange={(value) =>
                    setStepThreeData({ ...stepThreeData, risk_owner_id: value })
                  }
                  disabled={isLoading || loadingUsers || !stepOneData.department_id}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select risk owner">
                      {loadingUsers
                        ? "Loading users..."
                        : !stepOneData.department_id
                          ? "Select department first"
                          : stepThreeData.risk_owner_id
                            ? users.find((u) => u.id === stepThreeData.risk_owner_id)
                              ? getUserDisplayName(
                                  users.find((u) => u.id === stepThreeData.risk_owner_id)!
                                )
                              : "Select risk owner"
                            : "Select risk owner"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="text-muted-foreground p-2 text-sm">
                        {stepOneData.department_id
                          ? "No users found in this department"
                          : "Please select a department first"}
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{getUserDisplayName(user)}</span>
                            <span className="text-muted-foreground text-xs">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!stepOneData.department_id && (
                  <p className="text-muted-foreground text-xs">
                    Please select a department in Step 1 to load users
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target_closing_date">Target Closing Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !closeDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {closeDate ? format(closeDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={closeDate}
                        onSelect={(date) => {
                          if (date) {
                            setCloseDate(date);
                            setStepThreeData((prev) => ({
                              ...prev,
                              target_closing_date: formatISO(date)
                            }));
                          }
                        }}
                        disabled={isLoading}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mitigation_cost">Mitigation Cost</Label>
                  <Input
                    id="mitigation_cost"
                    type="number"
                    placeholder="0.00"
                    value={stepThreeData.mitigation_cost || ""}
                    onChange={(e) =>
                      setStepThreeData({
                        ...stepThreeData,
                        mitigation_cost: parseFloat(e.target.value) || 0
                      })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleNext} disabled={!canProceed() || isLoading}>
            {isLoading ? (
              "Processing..."
            ) : currentStep === 3 ? (
              "Complete Risk"
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
