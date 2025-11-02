"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, Check, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { getRiskCategories, KRIFrequency } from "@/app/_actions/risk-module-actions";
import { getUsers } from "@/app/_actions/user-actions";

interface KRIConfigureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerId: string;
  onSubmit?: (data: KRIFormData) => Promise<void>;
}

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

type KRIFormData = {
  name: string;
  description: string;
  kri_register_id: string;
  category_id: string;
  department_id: string;
  target_value: string;
  trigger_value: string;
  limit_value: string;
  monitoring_frequency: KRIFrequency | "";
  owner_id: string;
  commentary: string;
  mitigant_plan: string;
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

export function KRIConfigureForm({ open, onOpenChange, registerId, onSubmit }: KRIConfigureProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState<KRIFormData>({
    name: "",
    description: "",
    kri_register_id: registerId,
    category_id: "",
    department_id: "",
    target_value: "",
    trigger_value: "",
    limit_value: "",
    monitoring_frequency: "",
    owner_id: "",
    commentary: "",
    mitigant_plan: ""
  });

  const totalSteps = 4;

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadCategories();
      setFormData((prev) => ({ ...prev, kri_register_id: registerId }));
    }
  }, [open, registerId]);

  useEffect(() => {
    if (formData.department_id) {
      loadUsers(formData.department_id);
    }
  }, [formData.department_id]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (formData.department_id && open) {
      loadCategories(formData.department_id);
    }
  }, [formData.department_id, open]);

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
      if (response.success && response.data?.data) {
        setCategories(response.data?.data);
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
        setUsers(response?.data?.data);
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

  const getUserDisplayName = (user: User) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username || user.email;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      kri_register_id: registerId,
      category_id: "",
      department_id: "",
      target_value: "",
      trigger_value: "",
      limit_value: "",
      monitoring_frequency: "",
      owner_id: "",
      commentary: "",
      mitigant_plan: ""
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to configure KRI", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof KRIFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) {
      return (
        formData.name && formData.description && formData.category_id && formData.department_id
      );
    }
    if (step === 2) {
      return formData.target_value && formData.trigger_value && formData.limit_value;
    }
    if (step === 3) {
      return formData.monitoring_frequency;
    }
    if (step === 4) {
      return formData.owner_id;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configure New KRI</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}: {getStepTitle(step)}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${index + 1 <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">KRI Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Retention Rate"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Percentage of customers retained annually"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => updateFormData("department_id", value)}
                    disabled={isLoading || loadingDepartments}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department">
                        {loadingDepartments
                          ? "Loading..."
                          : formData.department_id
                            ? departments.find((d) => d.id === formData.department_id)?.name ||
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

                <div className="space-y-2">
                  <Label htmlFor="category">Risk Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => updateFormData("category_id", value)}
                    disabled={isLoading || loadingCategories}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category">
                        {loadingCategories
                          ? "Loading..."
                          : formData.category_id
                            ? categories.find((c) => c.id === formData.category_id)?.name ||
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
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Define target, trigger, and limit values for monitoring this KRI.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_value">Target Value *</Label>
                <Input
                  id="target_value"
                  placeholder="e.g., 10% or 95%"
                  value={formData.target_value}
                  onChange={(e) => updateFormData("target_value", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-muted-foreground text-xs">Optimal/desired value</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_value">Trigger Value *</Label>
                <Input
                  id="trigger_value"
                  placeholder="e.g., 9.5% ≥ but > 9%"
                  value={formData.trigger_value}
                  onChange={(e) => updateFormData("trigger_value", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-muted-foreground text-xs">
                  Warning threshold - triggers review when crossed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit_value">Limit Value *</Label>
                <Input
                  id="limit_value"
                  placeholder="e.g., 8.8%"
                  value={formData.limit_value}
                  onChange={(e) => updateFormData("limit_value", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-muted-foreground text-xs">
                  Critical threshold - requires immediate action
                </p>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Configure monitoring frequency and mitigation planning for this KRI.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitoring_frequency">Monitoring Frequency *</Label>
                <Select
                  value={formData.monitoring_frequency}
                  onValueChange={(value) => updateFormData("monitoring_frequency", value)}
                  disabled={isLoading}>
                  <SelectTrigger id="monitoring_frequency" className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentary">Commentary</Label>
                <Textarea
                  id="commentary"
                  placeholder="e.g., Initial setup for customer retention tracking"
                  value={formData.commentary}
                  onChange={(e) => updateFormData("commentary", e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mitigant_plan">Mitigant Plan</Label>
                <Textarea
                  id="mitigant_plan"
                  placeholder="e.g., Implement customer feedback survey quarterly"
                  value={formData.mitigant_plan}
                  onChange={(e) => updateFormData("mitigant_plan", e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Assign ownership and review the complete KRI configuration.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="owner_id">KRI Owner *</Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
                  disabled={isLoading || loadingUsers || !formData.department_id}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select KRI owner">
                      {loadingUsers
                        ? "Loading users..."
                        : !formData.department_id
                          ? "Select department first"
                          : formData.owner_id
                            ? users.find((u) => u.id === formData.owner_id)
                              ? getUserDisplayName(users.find((u) => u.id === formData.owner_id)!)
                              : "Select KRI owner"
                            : "Select KRI owner"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="text-muted-foreground p-2 text-sm">
                        {formData.department_id
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
                {!formData.department_id && (
                  <p className="text-muted-foreground text-xs">
                    Please select a department in Step 1 to load users
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="border-border bg-card mt-6 rounded-lg border p-4">
                <h4 className="text-foreground mb-3 font-medium">Configuration Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.name || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Department:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.department_id
                        ? departments.find((d) => d.id === formData.department_id)?.name
                        : "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.category_id
                        ? categories.find((c) => c.id === formData.category_id)?.name
                        : "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Target:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.target_value || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Trigger:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.trigger_value || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Limit:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.limit_value || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Frequency:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.monitoring_frequency || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Owner:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.owner_id && users.find((u) => u.id === formData.owner_id)
                        ? getUserDisplayName(users.find((u) => u.id === formData.owner_id)!)
                        : "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="border-border flex justify-between gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || isLoading}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed() || isLoading}>
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "Basic Information";
    case 2:
      return "Targets & Thresholds";
    case 3:
      return "Monitoring & Mitigation";
    case 4:
      return "Ownership & Review";
    default:
      return "";
  }
}
