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
import { SelectField } from "@/components/ui/select-field";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getDepartments } from "@/app/_actions/config-actions";
import { getRiskCategories, KRIFrequency } from "@/app/_actions/risk-module-actions";
import { getUsers } from "@/app/_actions/user-actions";
import { CURRENCIES } from "@/lib/constants";

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
  from_trigger_value: string;
  from_trigger_condition: string;
  to_trigger_value: string;
  to_trigger_condition: string;
  limit_value: string;
  measurement_type: string;
  currency_code: string;
  monitoring_frequency: KRIFrequency | "";
  owner_id: string;
  status_evaluation_method: string;
  use_moving_average: boolean;
  moving_average_days: number;
  invert_direction: boolean;
  auto_generate_risks: boolean;
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
    from_trigger_value: "",
    from_trigger_condition: "",
    to_trigger_value: "",
    to_trigger_condition: "",
    limit_value: "",
    measurement_type: "",
    currency_code: "",
    monitoring_frequency: "",
    owner_id: "",
    status_evaluation_method: "",
    use_moving_average: false,
    moving_average_days: 30,
    invert_direction: false,
    auto_generate_risks: true,
    commentary: "",
    mitigant_plan: ""
  });

  const totalSteps = 5;

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
      from_trigger_value: "",
      from_trigger_condition: "",
      to_trigger_value: "",
      to_trigger_condition: "",
      limit_value: "",
      measurement_type: "",
      currency_code: "",
      monitoring_frequency: "",
      owner_id: "",
      status_evaluation_method: "",
      use_moving_average: false,
      moving_average_days: 30,
      invert_direction: false,
      auto_generate_risks: true,
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

  const updateFormData = (field: keyof KRIFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) {
      return (
        formData.name && formData.description && formData.category_id && formData.department_id
      );
    }
    if (step === 2) {
      return formData.target_value && formData.from_trigger_value && formData.limit_value;
    }
    if (step === 3) {
      return formData.monitoring_frequency;
    }
    if (step === 4) {
      return formData.status_evaluation_method;
    }
    if (step === 5) {
      return formData.owner_id;
    }
    return false;
  };

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
    icon: <Building2 className="h-4 w-4" />,
    description: dept.code
  }));

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
    icon: <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />,
    description: category.code
  }));

  const frequencyOptions = [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "ANNUALLY", label: "Annually" }
  ];

  const options = [
    { name: "Greater Than (>)", value: ">" },
    { name: "Less Than (<)", value: "<" },
    { name: "Greater Than OR Equal To (>=)", value: ">=" },
    { name: "Less Than OR Equal To (<=)", value: "<=" },
    { name: "Equals (=)", value: "=" }
  ];

  const measures = [
    { name: "PERCENT", value: "PERCENT" },
    { name: "COUNT", value: "COUNT" },
    { name: "NUMERIC", value: "NUMERIC" },
    { name: "CURRENCY", value: "CURRENCY" }
  ];

  const currencyOptions = CURRENCIES.map((currency) => ({
    value: currency.currency,
    name: `${currency.currency} - ${currency.country}`
  }));

  const userOptions = users.map((user) => ({
    value: user.id,
    label: getUserDisplayName(user),
    icon: <User className="h-4 w-4" />,
    description: user.email
  }));

  const evaluationMethodOptions = [
    { name: "STATIC THRESHOLDS", value: "STATIC_THRESHOLDS" },
    { name: "MOVING AVERAGE", value: "MOVING_AVERAGE" },
    { name: "TREND BASED", value: "TREND_BASED" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configure New KRI</DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps}: {getStepTitle(step)}
          </DialogDescription>
        </DialogHeader>

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

        <div className="min-h-[300px] space-y-4">
          {step === 1 && (
            <>
              <Input
                id="name"
                label="KRI Name"
                required
                placeholder="e.g., Customer Retention Rate"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                disabled={isLoading}
              />

              <Textarea
                id="description"
                label="Description"
                required
                placeholder="e.g., Percentage of customers retained annually"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={3}
                disabled={isLoading}
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Department"
                  required
                  value={formData.department_id}
                  onValueChange={(value) => updateFormData("department_id", value)}
                  placeholder={loadingDepartments ? "Loading..." : "Select department"}
                  options={departmentOptions as any}
                  className="w-full"
                  disabled={isLoading || loadingDepartments}
                />

                <SelectField
                  label="Risk Category"
                  required
                  value={formData.category_id}
                  onValueChange={(value) => updateFormData("category_id", value)}
                  placeholder={loadingCategories ? "Loading..." : "Select category"}
                  options={categoryOptions as any}
                  className="w-full"
                  disabled={isLoading || loadingCategories}
                />
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
                <Input
                  required
                  label="Target Value"
                  type="number"
                  id="target_value"
                  placeholder="e.g., 10% or 95%"
                  value={formData.target_value}
                  onChange={(e) => updateFormData("target_value", e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-muted-foreground text-xs">Optimal/desired value</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  required
                  label="From Trigger Value"
                  type="number"
                  id="from_trigger_value"
                  placeholder="e.g., 3"
                  value={formData.from_trigger_value}
                  onChange={(e) => updateFormData("from_trigger_value", e.target.value)}
                  disabled={isLoading}
                />
                <SelectField
                  required
                  label="From Condition"
                  value={formData.from_trigger_condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, from_trigger_condition: value })
                  }
                  placeholder="Select condition"
                  options={options as any}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  required
                  label="To Trigger Value"
                  type="number"
                  id="to_trigger_value"
                  placeholder="e.g., 6"
                  value={formData.to_trigger_value}
                  onChange={(e) => updateFormData("to_trigger_value", e.target.value)}
                  disabled={isLoading}
                />
                <SelectField
                  required
                  label="To Condition"
                  value={formData.to_trigger_condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, to_trigger_condition: value })
                  }
                  placeholder="Select condition"
                  options={options as any}
                  className="w-full"
                />
              </div>
              <SelectField
                required
                label="Measurement Type"
                value={formData.measurement_type}
                onValueChange={(value) => setFormData({ ...formData, measurement_type: value })}
                placeholder="Select measurement"
                options={measures as any}
                className="w-full"
              />
              {formData.measurement_type === "CURRENCY" && (
                <SelectField
                  required
                  label="Currency"
                  value={formData.currency_code}
                  onValueChange={(value) => setFormData({ ...formData, currency_code: value })}
                  placeholder="Select Currency"
                  options={currencyOptions as any}
                  className="w-full"
                />
              )}
              <div className="space-y-2">
                <Input
                  required
                  label="Limit Value"
                  type="number"
                  id="limit_value"
                  placeholder="e.g., 8.0"
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

              <SelectField
                required
                label="Monitoring Frequency"
                value={formData.monitoring_frequency}
                onValueChange={(value) => updateFormData("monitoring_frequency", value)}
                placeholder="Select frequency"
                options={frequencyOptions as any}
                className="w-full"
                disabled={isLoading}
              />

              <div className="border-border bg-muted/30 flex items-start space-x-3 rounded-md border p-4">
                <Checkbox
                  id="invert_direction"
                  checked={formData.invert_direction}
                  onCheckedChange={(checked) =>
                    updateFormData("invert_direction", checked === true)
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="invert_direction" className="cursor-pointer font-medium">
                    Invert Direction (Lower is Better)
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Enable if lower/smaller values are better. Disable if higher/larger values are
                    better.
                  </p>
                  {formData.invert_direction && (
                    <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      ⚠️ Warning: With "Higher is Better", target should typically be ≥ Limit.
                      Consider enabling "Invert Direction"?
                    </div>
                  )}
                </div>
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
              <div className="border-border rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/30">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Advanced Evaluation Settings</strong>
                  <br />
                  These settings control how KRI status is evaluated. Most users should use the
                  defaults.
                </p>
              </div>

              <div className="space-y-2">
                <SelectField
                  label="Status Evaluation Method "
                  required
                  value={formData.status_evaluation_method}
                  onValueChange={(value) => updateFormData("status_evaluation_method", value)}
                  placeholder="Select method"
                  options={evaluationMethodOptions as any}
                  className="w-full"
                  disabled={isLoading}
                />
                <p className="text-muted-foreground text-xs">
                  Determines how measured values are compared against thresholds
                </p>
              </div>

              <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="use_moving_average"
                    checked={formData.use_moving_average}
                    onCheckedChange={(checked) =>
                      updateFormData("use_moving_average", checked === true)
                    }
                  />
                  <div className="flex-1 space-y-1 leading-none">
                    <Label htmlFor="use_moving_average" className="cursor-pointer font-medium">
                      Use Moving Average Smoothing
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Averages measurements over specified days to reduce noise
                    </p>
                  </div>
                </div>

                {formData.use_moving_average && (
                  <div className="ml-7 space-y-2">
                    <Input
                      label="Moving Average Period (Days)"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.moving_average_days}
                      onChange={(e) =>
                        updateFormData("moving_average_days", parseInt(e.target.value) || 30)
                      }
                      disabled={isLoading}
                    />
                    <p className="text-muted-foreground text-xs">
                      Number of days to include in the moving average calculation
                    </p>
                  </div>
                )}
              </div>

              <div className="border-border bg-muted/30 flex items-start space-x-3 rounded-md border p-4">
                <Checkbox
                  id="auto_generate_risks"
                  checked={formData.auto_generate_risks}
                  onCheckedChange={(checked) =>
                    updateFormData("auto_generate_risks", checked === true)
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="auto_generate_risks" className="cursor-pointer font-medium">
                    Auto-Generate Risks on Breach
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Automatically create risk records when KRI reaches RED status
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Assign ownership and review the complete KRI configuration.
                </p>
              </div>
              <div className="grid gap-2">
                <SelectField
                  label="KRI Owner "
                  required
                  value={formData.owner_id}
                  onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
                  placeholder={
                    loadingUsers
                      ? "Loading users..."
                      : !formData.department_id
                        ? "Select department first"
                        : "Select KRI owner"
                  }
                  options={userOptions as any}
                  className="w-full"
                  disabled={isLoading || loadingUsers || !formData.department_id}
                  descriptionText={
                    formData.department_id
                      ? "No users found in this department"
                      : "Please select a department first"
                  }
                />
                {!formData.department_id && (
                  <p className="text-muted-foreground text-xs">
                    Please select a department in Step 1 to load users
                  </p>
                )}
              </div>

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
                    <dt className="text-muted-foreground">Trigger Range:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.from_trigger_value && formData.to_trigger_value
                        ? `${formData.from_trigger_value} to ${formData.to_trigger_value}`
                        : "Not set"}
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
                    <dt className="text-muted-foreground">Evaluation Method:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.status_evaluation_method === "STATIC_THRESHOLD"
                        ? "Static Thresholds"
                        : "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Moving Average:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.use_moving_average
                        ? `${formData.moving_average_days} days`
                        : "Disabled"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Direction:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.invert_direction ? "Lower is Better" : "Higher is Better"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Auto-Generate Risks:</dt>
                    <dd className="text-foreground text-right font-medium">
                      {formData.auto_generate_risks ? "Yes" : "No"}
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
      return "Advanced Settings";
    case 5:
      return "Ownership & Review";
    default:
      return "";
  }
}
