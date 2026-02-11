"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
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
import { createRisk, updateRisk } from "@/app/_actions/risk-module-actions";

type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
};

interface RiskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: any;
  registerId: string;
}

export function RiskFormDialog({ open, onOpenChange, risk, registerId }: RiskFormDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState({
    title: risk?.title || "",
    description: risk?.description || "",
    category_id: risk?.category_id || "",
    department_id: risk?.department_id || "",
    inherent_likelihood: risk?.inherent_likelihood || 3,
    inherent_impact: risk?.inherent_impact || 3,
    status: risk?.status || "open",
    owner: risk?.owner || ""
  });

  console.log("FORM-DATA:", formData);

  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title || "",
        description: risk.description || "",
        category_id: risk.category_id || "operational",
        department_id: risk.department_id || "",
        inherent_likelihood: risk.inherent_likelihood || 3,
        inherent_impact: risk.inherent_impact || 3,
        status: risk.status || "open",
        owner: risk.owner || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category_id: "operational",
        department_id: "",
        inherent_likelihood: 3,
        inherent_impact: 3,
        status: "open",
        owner: ""
      });
    }
  }, [risk]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        registerId,
        inherentScore: formData.inherent_likelihood * formData.inherent_impact
      };

      let response;
      if (risk) {
        response = await updateRisk(risk.id, data);
      } else {
        response = await createRisk(data);
      }

      if (response.success) {
        toast.success(risk ? "Risk updated successfully" : "Risk created successfully");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to save risk");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inherentScore = formData.inherent_likelihood * formData.inherent_impact;

  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Critical", color: "text-red-600" };
    if (score >= 10) return { label: "High", color: "text-orange-600" };
    if (score >= 5) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Low", color: "text-green-600" };
  };

  const inherentLevel = getRiskLevel(inherentScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{risk ? "Edit Risk" : "Create New Risk"}</DialogTitle>
          <DialogDescription>
            {risk ? "Update risk information and assessment." : "Add a new risk to the register."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Risk Title</Label>
              <Input
                id="title"
                placeholder="Enter risk title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the risk in detail"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  disabled={isLoading}>
                  <SelectTrigger className="w-full flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                    <SelectItem value="reputational">Reputational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full flex-1 gap-2">
                <Label htmlFor="department">Business Unit</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  disabled={isLoading || loadingDepartments}>
                  <SelectTrigger className="w-full flex-1">
                    <SelectValue placeholder="Select business unit">
                      {loadingDepartments
                        ? "Loading business unit..."
                        : formData.department_id
                          ? departments.find((d) => d.id === formData.department_id)?.name ||
                            "Select business unit"
                          : "Select business unit"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <div className="text-muted-foreground p-2 text-sm">
                        No departments available
                      </div>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="text-muted-foreground h-4 w-4" />
                            <span>{dept.name}</span>
                            <span className="text-muted-foreground text-xs">({dept.code})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Inherent Risk */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Inherent Risk Assessment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="inherentLikelihood">
                    Likelihood (1-5)
                    <span className="text-muted-foreground ml-2 text-sm">
                      {formData.inherent_likelihood}
                    </span>
                  </Label>
                  <input
                    type="range"
                    id="inherentLikelihood"
                    min="1"
                    max="5"
                    value={formData.inherent_likelihood}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inherent_likelihood: Number(e.target.value)
                      })
                    }
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inherentImpact">
                    Impact (1-5)
                    <span className="text-muted-foreground ml-2 text-sm">
                      {formData.inherent_impact}
                    </span>
                  </Label>
                  <input
                    type="range"
                    id="inherentImpact"
                    min="1"
                    max="5"
                    value={formData.inherent_impact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inherent_impact: Number(e.target.value)
                      })
                    }
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
                <div>
                  <span className="text-sm font-medium">Risk Score:</span>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="owner">Risk Owner</Label>
                <Input
                  id="owner"
                  placeholder="Enter owner name"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : risk ? "Update Risk" : "Create Risk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
