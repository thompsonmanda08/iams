"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/utils";
import { formatISO, parseISO } from "date-fns";
import {
  getBusinessProcessesHierarchy,
  getDepartments,
  getRiskMatrices,
  getDepartmentRiskCategories,
  getRiskResponses,
  getEffectivenessLevels
} from "@/app/_actions/config-actions";
import {
  createRiskStepOne,
  updateRiskStepTwo,
  updateRiskStepThree,
  updateRisk
} from "@/app/_actions/risk-module-actions";
import { getDepartmentHeads } from "@/app/_actions/user-actions";
import { getStrategicPillars } from "@/app/_actions/audit-settings-actions";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

import {
  Risk,
  Department,
  RiskCategory,
  BusinessProcess,
  RiskMatrix,
  User,
  StepOneData,
  StepTwoData,
  StepThreeData,
  RiskResponse,
  RiskControls
} from "@/lib/types/risk-type";
import { StepProgressIndicator } from "@/app/dashboard/(modules)/risks/_components/step-progress-indicator";
import { StepOne } from "@/app/dashboard/(modules)/risks/_components/form/step-one";
import { StepTwo } from "@/app/dashboard/(modules)/risks/_components/form/step-two";
import { StepThree } from "@/app/dashboard/(modules)/risks/_components/form/step-three";

interface MultiStepRiskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerId: string;
  mode?: "create" | "edit";
  riskData?: Risk;
}

export function MultiStepRiskForm({
  open,
  onOpenChange,
  registerId,
  mode = "create",
  riskData
}: MultiStepRiskFormProps) {
  const router = useRouter();
  const { checkPermission } = usePermissions();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdRiskId, setCreatedRiskId] = useState<string | null>(
    mode === "edit" && riskData ? riskData.id : null
  );

  // State for dropdowns
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [riskMatrices, setRiskMatrices] = useState<RiskMatrix[]>([]);
  const [responses, setResponses] = useState<RiskResponse[]>([]);
  const [controls, setControls] = useState<RiskControls[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<RiskMatrix | null>(null);

  // Loading states
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPillars, setLoadingPillars] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [loadingMatrices, setLoadingMatrices] = useState(false);
  const [loadingMrResponses, setLoadingResponses] = useState(false);
  const [loadingControls, setLoadingControls] = useState(false);

  const [closeDate, setCloseDate] = useState<Date | undefined>(
    mode === "edit" && riskData?.target_closing_date
      ? parseISO(riskData.target_closing_date)
      : undefined
  );

  // Form data states
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    title: mode === "edit" && riskData ? riskData.title : "",
    description: mode === "edit" && riskData ? riskData.description : "",
    category_id: mode === "edit" && riskData ? riskData.category_id : "",
    department_id: mode === "edit" && riskData ? riskData.department_id : "",
    macro_process_id: mode === "edit" && riskData ? riskData.macro_process_id : "",
    sub_process_id: mode === "edit" && riskData ? riskData.sub_process_id : "",
    strategic_objective_id: mode === "edit" && riskData ? riskData.strategic_objective_id : "",
    root_cause: mode === "edit" && riskData ? riskData.root_cause : "",
    recurrence: mode === "edit" && riskData ? riskData.recurrence : "ongoing",
    status: mode === "edit" && riskData ? riskData.status.toUpperCase() : ""
  });

  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    risk_matrix_id: mode === "edit" && riskData ? riskData.risk_matrix_id : "",
    inherent_likelihood: mode === "edit" && riskData ? riskData.inherent_likelihood : 0,
    inherent_impact: mode === "edit" && riskData ? riskData.inherent_impact : 0,
    existing_controls: mode === "edit" && riskData ? riskData.existing_controls : "",
    control_effectiveness: mode === "edit" && riskData ? riskData.control_effectiveness : 0
  });

  const [stepThreeData, setStepThreeData] = useState<StepThreeData>({
    treatment_plan: mode === "edit" && riskData ? riskData.treatment_plan : "",
    risk_response_id: mode === "edit" && riskData ? riskData.risk_response_id : "",
    risk_owner_id: mode === "edit" && riskData ? riskData.risk_owner_id : "",
    target_closing_date: mode === "edit" && riskData ? riskData.target_closing_date : "",
    mitigation_cost: mode === "edit" && riskData ? riskData.mitigation_cost : 0
  });

  // Computed values
  const availableSubProcesses = useMemo(() => {
    if (!stepOneData.macro_process_id) return [];
    const selectedMacroProcess = businessProcesses.find(
      (process) => process.id === stepOneData.macro_process_id
    );
    return selectedMacroProcess?.sub_processes || [];
  }, [stepOneData.macro_process_id, businessProcesses]);

  const getLikelihoodRange = () => ({
    min: selectedMatrix?.likelihood_min || 0,
    max: selectedMatrix?.likelihood_max || 0
  });

  const getImpactRange = () => ({
    min: selectedMatrix?.impact_min || 0,
    max: selectedMatrix?.impact_max || 0
  });

  const likelihoodRange = getLikelihoodRange();
  const impactRange = getImpactRange();

  const transformedUsers = users.map((user) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim() || user.username || user.email
  }));

  const options = controls.map((ctrl: any) => ({
    name: `${ctrl.value} - ${ctrl.name}`,
    id: ctrl.value.toString()
  }));

  // Load functions
  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await getDepartments({ isActive: true });
      if (response.success && response.data?.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      notify({ description: "Error loading departments", type: "error" });
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadCategories = async (departmentId?: string) => {
    if (!departmentId) {
      setCategories([]);
      return;
    }
    setLoadingCategories(true);
    try {
      const response = await getDepartmentRiskCategories(departmentId);
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      notify({ description: "Error loading categories", type: "error" });
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadPillars = async (departmentId?: string) => {
    if (!departmentId) {
      setPillars([]);
      return;
    }
    setLoadingPillars(true);
    try {
      const response = await getStrategicPillars(undefined, {
        department_id: departmentId
      });
      if (response.success && response.data.data) {
        setPillars(response.data.data);
      }
    } catch (error) {
      notify({ description: "Error loading strategic objectives", type: "error" });
    } finally {
      setLoadingPillars(false);
    }
  };

  const loadProcesses = async () => {
    setLoadingProcesses(true);
    try {
      const response = await getBusinessProcessesHierarchy();
      if (response.success && response.data) {
        setBusinessProcesses(response.data);
      }
    } catch (error) {
      notify({ description: "Error loading business processes", type: "error" });
    } finally {
      setLoadingProcesses(false);
    }
  };

  const loadUsers = async (departmentId: string) => {
    setLoadingUsers(true);
    try {
      const response = await getDepartmentHeads({
        departmentId: departmentId
      });
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      notify({ description: "Error loading users", type: "error" });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRiskMatrices = async () => {
    setLoadingMatrices(true);
    try {
      const response = await getRiskMatrices();
      if (response.success && response.data?.data) {
        setRiskMatrices(response.data.data);
        if (mode === "edit" && riskData?.risk_matrix_id) {
          const matrix = response.data.data.find(
            (m: RiskMatrix) => m.id === riskData.risk_matrix_id
          );
          if (matrix) setSelectedMatrix(matrix);
        }
      }
    } catch (error) {
      notify({ description: "Error loading risk matrices", type: "error" });
    } finally {
      setLoadingMatrices(false);
    }
  };

  const loadResponses = async () => {
    setLoadingResponses(true);
    try {
      const response = await getRiskResponses();
      if (response.success && response.data.data) {
        setResponses(response.data.data);
      }
    } catch (error) {
      notify({ description: "Error loading responses", type: "error" });
    } finally {
      setLoadingResponses(false);
    }
  };

  const loadControls = async () => {
    setLoadingControls(true);
    try {
      const response = await getEffectivenessLevels();
      if (response.success && response.data.data) {
        setControls(response.data.data);
      }
    } catch (error) {
      notify({ description: "Error loading responses", type: "error" });
    } finally {
      setLoadingControls(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadProcesses();
      loadRiskMatrices();
      loadControls();
      loadResponses();
      if (stepOneData.department_id) {
        loadCategories(stepOneData.department_id);
        loadPillars(stepOneData.department_id);
      }
    }
  }, [open]);

  useEffect(() => {
    if (stepOneData.department_id) {
      loadUsers(stepOneData.department_id);
      loadCategories(stepOneData.department_id);
      loadPillars(stepOneData.department_id);
    } else {
      setCategories([]);
      setUsers([]);
    }
  }, [stepOneData.department_id]);

  useEffect(() => {
    if (mode === "create") {
      setStepOneData((prev) => ({ ...prev, sub_process_id: "" }));
    }
  }, [stepOneData.macro_process_id, mode]);

  useEffect(() => {
    if (!open && mode === "create") {
      setCurrentStep(1);
      setCreatedRiskId(null);
      setCloseDate(undefined);
      setSelectedMatrix(null);
      setStepOneData({
        title: "",
        description: "",
        category_id: "",
        department_id: "",
        macro_process_id: "",
        sub_process_id: "",
        strategic_objective_id: "",
        root_cause: "",
        recurrence: "ongoing",
        status: ""
      });
      setStepTwoData({
        risk_matrix_id: "",
        inherent_likelihood: 0,
        inherent_impact: 0,
        existing_controls: "",
        control_effectiveness: 0
      });
      setStepThreeData({
        treatment_plan: "",
        risk_response_id: "",
        risk_owner_id: "",
        target_closing_date: "",
        mitigation_cost: 0
      });
    }
  }, [open, mode]);

  // Handlers
  const handleMatrixChange = (matrixId: string) => {
    const matrix = riskMatrices.find((m) => m.id === matrixId);
    if (matrix) {
      setSelectedMatrix(matrix);
      const midLikelihood = Math.ceil(
        ((matrix.likelihood_min ?? 1) + (matrix.likelihood_max ?? 5)) / 2
      );
      const midImpact = Math.ceil(((matrix.impact_min ?? 1) + (matrix.impact_max ?? 5)) / 2);

      setStepTwoData((prev) => ({
        ...prev,
        risk_matrix_id: matrixId,
        inherent_likelihood: midLikelihood,
        inherent_impact: midImpact
      }));
      setStepThreeData((prev) => ({
        ...prev,
        residual_likelihood: midLikelihood,
        residual_impact: midImpact
      }));
    }
  };

  const handleStepOne = async () => {
    if (!checkPermission(MODULE_CODES.RISK_REGISTERS, mode === "edit" ? "can_edit" : "can_create")) return;
    setIsLoading(true);
    const payload = {
      ...stepOneData,
      sub_process_id: stepOneData.sub_process_id || null
    };
    try {
      if (mode === "edit" && createdRiskId) {
        const response = await updateRisk(createdRiskId, payload);
        if (response.success) {
          notify({ description: "Step 1 updated", type: "success" });
          setCurrentStep(2);
        } else {
          notify({ description: response.message || "Failed to update risk", type: "error" });
        }
      } else {
        const response = await createRiskStepOne({
          risk_register_id: registerId,
          ...payload
        });
        if (response.success && response.data) {
          setCreatedRiskId(response.data.id);
          notify({ description: "Step 1 completed", type: "success" });
          setCurrentStep(2);
        } else {
          notify({ description: response.message || "Failed to create risk", type: "error" });
        }
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepTwo = async () => {
    if (!createdRiskId) return;
    if (!checkPermission(MODULE_CODES.RISK_REGISTERS, "can_edit")) return;
    setIsLoading(true);
    try {
      const response = await updateRiskStepTwo(createdRiskId, stepTwoData);
      if (response.success) {
        notify({ description: "Step 2 completed", type: "success" });
        setCurrentStep(3);
      } else {
        notify({ description: response.message || "Failed to update risk", type: "error" });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepThree = async () => {
    if (!createdRiskId) return;
    if (!checkPermission(MODULE_CODES.RISK_REGISTERS, "can_edit")) return;
    setIsLoading(true);
    try {
      const response = await updateRiskStepThree(createdRiskId, stepThreeData);
      if (response.success) {
        notify({ description: mode === "edit" ? "Risk updated successfully" : "Risk created successfully", type: "success" });
        onOpenChange(false);
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to complete risk", type: "error" });
      }
    } catch (error) {
      notify({ description: "An unexpected error occurred", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) handleStepOne();
    else if (currentStep === 2) handleStepTwo();
    else if (currentStep === 3) handleStepThree();
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
      return !!stepTwoData.risk_matrix_id;
    }
    if (currentStep === 3) {
      return stepThreeData.risk_owner_id && stepThreeData.treatment_plan;
    }
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Risk" : "Create New Risk"} - Step {currentStep} of 3
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Provide risk identification and categorization details"}
            {currentStep === 2 && "Assess inherent risk and document existing controls"}
            {currentStep === 3 && "Define risk response strategy and ownership"}
          </DialogDescription>
        </DialogHeader>

        <StepProgressIndicator
          currentStep={currentStep}
          totalSteps={3}
          mode={mode}
          onStepClick={setCurrentStep}
        />

        <div className="space-y-4 py-4">
          {currentStep === 1 && (
            <StepOne
              data={stepOneData}
              onChange={(updates) => setStepOneData({ ...stepOneData, ...updates })}
              departments={departments}
              categories={categories}
              businessProcesses={businessProcesses}
              availableSubProcesses={availableSubProcesses}
              pillars={pillars}
              isLoading={isLoading}
              loadingDepartments={loadingDepartments}
              loadingCategories={loadingCategories}
              loadingProcesses={loadingProcesses}
              loadingPillars={loadingPillars}
            />
          )}

          {currentStep === 2 && (
            <StepTwo
              data={stepTwoData}
              onChange={(updates) => setStepTwoData({ ...stepTwoData, ...updates })}
              riskMatrices={riskMatrices}
              selectedMatrix={selectedMatrix}
              onMatrixChange={handleMatrixChange}
              likelihoodRange={likelihoodRange}
              impactRange={impactRange}
              isLoading={isLoading}
              loadingMatrices={loadingMatrices}
              controls={options}
              controlsLoading={loadingControls}
            />
          )}

          {currentStep === 3 && (
            <StepThree
              data={stepThreeData}
              onChange={(updates) => setStepThreeData({ ...stepThreeData, ...updates })}
              users={transformedUsers}
              closeDate={closeDate}
              onCloseDateChange={(date) => {
                setCloseDate(date);
                if (date) {
                  setStepThreeData({ ...stepThreeData, target_closing_date: formatISO(date) });
                }
              }}
              likelihoodRange={likelihoodRange}
              impactRange={impactRange}
              hasMatrixSelected={!!stepTwoData.risk_matrix_id}
              hasDepartmentSelected={!!stepOneData.department_id}
              isLoading={isLoading}
              loadingUsers={loadingUsers}
              responses={responses}
              loadingResponses={loadingMrResponses}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isLoading}>
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
              mode === "edit" ? (
                "Update Risk"
              ) : (
                "Complete Risk"
              )
            ) : (
              <>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
