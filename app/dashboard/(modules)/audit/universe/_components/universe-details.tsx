"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Save, Globe, Send } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import {
  createUniverseItem,
  updateUniverseItem,
  deleteUniverseItem,
  submitUniverseForApproval
} from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";
import BackButton from "@/components/back-button";
import { useQueryClient } from "@tanstack/react-query";
import { SelectField } from "@/components/ui/select-field";
import {
  useAuditableAreas,
  useStrategicPillars,
  useStrategicInitiatives,
  useIndicativeTargets
} from "@/hooks/use-audit-settings-query-data";
import { useDepartments } from "@/hooks/use-query-data";
import { useRisks } from "@/hooks/use-risk-query-data";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";

const AUDIT_FREQUENCIES = ["ANNUALLY", "QUARTERLY", "MONTHLY", "AS_NEEDED"];

interface Universe {
  id: string;
  universe_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status?: string;
}

interface UniverseItem {
  id: string;
  audit_universe_id: string;
  department_id: string;
  strategic_pillar_id?: string | null;
  auditable_area_id?: string | null;
  indicative_target_id?: string | null;
  strategic_initiative_id?: string | null;
  risk_id?: string | null;
  process_activity: string;
  audit_frequency: string;
  is_active: boolean;
  name: string;
}

interface UniverseDetailsProps {
  universe: Universe;
  universeItems: UniverseItem[];
}

interface UniverseItemFormData {
  audit_universe_id: string;
  department_id: string;
  strategic_pillar_id?: string;
  auditable_area_id?: string;
  indicative_target_id?: string;
  strategic_initiative_id?: string;
  risk_id?: string;
  process_activity: string;
  audit_frequency: string;
  is_active: boolean;
  name: string;
}

const INIT_ITEM_DATA: UniverseItemFormData = {
  audit_universe_id: "",
  department_id: "",
  strategic_pillar_id: "",
  auditable_area_id: "",
  indicative_target_id: "",
  strategic_initiative_id: "",
  risk_id: "",
  process_activity: "",
  name: "",
  audit_frequency: "ANNUALLY",
  is_active: true
};

const UniverseDetails = ({ universe, universeItems }: UniverseDetailsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [itemData, setItemData] = useState<UniverseItemFormData>({
    ...INIT_ITEM_DATA,
    audit_universe_id: universe?.id || ""
  });
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<UniverseItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UniverseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeUniverseItems = Array.isArray(universeItems) ? universeItems : [];

  // Fetch dropdown data using reusable hooks
  const { data: departmentsResponse } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });
  const departmentsData = departmentsResponse?.data?.data || [];

  const { data: auditableAreasResponse } = useAuditableAreas();
  const auditableAreasData = auditableAreasResponse?.data || [];

  const { data: strategicPillarsResponse } = useStrategicPillars();
  const strategicPillarsData = strategicPillarsResponse?.data || [];

  const { data: strategicInitiativesResponse } = useStrategicInitiatives(
    itemData.strategic_pillar_id || undefined
  );
  const strategicInitiativesData = strategicInitiativesResponse?.data || [];

  const { data: indicativeTargetsResponse } = useIndicativeTargets();
  const indicativeTargetsData = indicativeTargetsResponse?.data || [];

  const { data: risksResponse } = useRisks();
  const risksData = risksResponse?.data || [];

  // Memoized options for dropdowns
  const departmentsOptions = useMemo(() => {
    return departmentsData?.map((department: any) => ({
      id: department.id,
      name: department?.name
    }));
  }, [departmentsData]);

  const auditableAreasOptions = useMemo(() => {
    return auditableAreasData?.map((area: any) => ({
      id: area.id,
      name: area.name || area.title
    }));
  }, [auditableAreasData]);

  const strategicPillarsOptions = useMemo(() => {
    return strategicPillarsData?.map((pillar: any) => ({
      id: pillar.id,
      name: pillar.name || pillar.title
    }));
  }, [strategicPillarsData]);

  const indicativeTargetsOptions = useMemo(() => {
    return indicativeTargetsData?.map((target: any) => ({
      id: target.id,
      name: target.name || target.title
    }));
  }, [indicativeTargetsData]);

  const risksOptions = useMemo(() => {
    return risksData?.map((risk: any) => ({
      id: risk.id,
      name: risk.risk_name || risk.name || risk.title
    }));
  }, [risksData]);

  const strategicInitiativesOptions = useMemo(() => {
    return strategicInitiativesData?.map((initiative: any) => ({
      id: initiative.id,
      name: initiative.strategic_initiative_name || initiative.name || initiative.title
    }));
  }, [strategicInitiativesData]);

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departmentsData?.find((d: any) => d.id === departmentId);
    return department?.name || departmentId;
  };

  if (!universe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Globe className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Universe Not Found</EmptyTitle>
            <EmptyDescription>
              The universe you're looking for doesn't exist or may have been removed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <BackButton title="Back to Universes" />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  };

  const updateItemData = (fields: Partial<UniverseItemFormData>) => {
    setItemData((prev) => ({ ...prev, ...fields }));
  };

  const resetForm = () => {
    setItemData({
      ...INIT_ITEM_DATA,
      audit_universe_id: universe?.id || ""
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const itemPayload = {
        audit_universe_id: itemData.audit_universe_id,
        department_id: itemData.department_id,
        strategic_pillar_id: itemData.strategic_pillar_id || null,
        auditable_area_id: itemData.auditable_area_id || null,
        indicative_target_id: itemData.indicative_target_id || null,
        strategic_initiative_id: itemData.strategic_initiative_id || null,
        risk_id: itemData.risk_id || null,
        process_activity: itemData.process_activity,
        audit_frequency: itemData.audit_frequency,
        is_active: itemData.is_active,
        name: itemData.name
      };

      let response;
      if (editingItem) {
        response = await updateUniverseItem(editingItem.id, itemPayload as any, universe.id);
      } else {
        response = await createUniverseItem(itemPayload as any);
      }

      if (response.success) {
        toast.success(
          response.message || `Universe item ${editingItem ? "updated" : "created"} successfully`
        );
        // Invalidate all relevant query caches
        queryClient.invalidateQueries({ queryKey: ["universes"] });
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        queryClient.invalidateQueries({ queryKey: ["auditableAreas"] });
        queryClient.invalidateQueries({ queryKey: ["strategicPillars"] });
        queryClient.invalidateQueries({ queryKey: ["strategicInitiatives"] });
        queryClient.invalidateQueries({ queryKey: ["indicativeTargets"] });
        queryClient.invalidateQueries({ queryKey: ["risks"] });
        setShowItemForm(false);
        resetForm();
        router.refresh();
      } else {
        toast.error(
          response.message || `Failed to ${editingItem ? "update" : "create"} universe item`
        );
      }
    } catch (error) {
      toast.error(
        `Failed to ${editingItem ? "update" : "create"} universe item. Please try again.`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditItem = (item: UniverseItem) => {
    setEditingItem(item);
    setItemData({
      audit_universe_id: item.audit_universe_id,
      department_id: item.department_id,
      strategic_pillar_id: item.strategic_pillar_id || "",
      auditable_area_id: item.auditable_area_id || "",
      indicative_target_id: item.indicative_target_id || "",
      strategic_initiative_id: item.strategic_initiative_id || "",
      risk_id: item.risk_id || "",
      process_activity: item.process_activity,
      audit_frequency: item.audit_frequency,
      is_active: item.is_active,
      name: item.name
    });
    setShowItemForm(true);
  };

  const handleDeleteClick = (item: UniverseItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const result = await deleteUniverseItem(itemToDelete.id, universe.id);

    if (result.success) {
      toast.success("Universe item deleted successfully");
      // Invalidate all relevant query caches
      queryClient.invalidateQueries({ queryKey: ["universes"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["auditableAreas"] });
      queryClient.invalidateQueries({ queryKey: ["strategicPillars"] });
      queryClient.invalidateQueries({ queryKey: ["strategicInitiatives"] });
      queryClient.invalidateQueries({ queryKey: ["indicativeTargets"] });
      queryClient.invalidateQueries({ queryKey: ["risks"] });
      router.refresh();
      setShowDeleteModal(false);
    } else {
      toast.error(result.message || "Failed to delete universe item");
    }
    setIsDeleting(false);
  };

  const handleCancel = () => {
    setShowItemForm(false);
    resetForm();
  };

  const handleSubmitUniverse = async () => {
    setIsSubmitting(true);
    try {
      const response = await submitUniverseForApproval(universe.id);
      if (response.success) {
        toast.success(response.message || "Universe submitted for approval successfully");
        setSubmitConfirmationOpen(false);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to submit universe for approval");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while submitting universe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background space-y-8">
      {/* Universe Overview */}
      <Card className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-foreground text-2xl font-bold">{universe.universe_name}</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <StatusBadge status={universe.status || "UNIVERSE_CREATION"} />
              <StatusBadge
                variant={universe.is_active ? "success" : "default"}
                status={universe.is_active ? "ACTIVE" : "INACTIVE"}
              />
            </div>
            {universe.status == "DRAFT" && (
              <Button onClick={() => setSubmitConfirmationOpen(true)} className="gap-2" size="sm">
                <Send className="h-4 w-4" />
                Submit for Approval
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label className="text-muted-foreground text-sm">Start Date</Label>
            <p className="text-foreground font-medium">
              {universe.start_date ? formatDate(universe.start_date) : "Not set"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">End Date</Label>
            <p className="text-foreground font-medium">
              {universe.end_date ? formatDate(universe.end_date) : "Not set"}
            </p>
          </div>
        </div>
      </Card>

      {/* Universe Items */}
      <Card className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-xl font-bold">Universe Items</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage individual items and audit areas
            </p>
          </div>
          {!showItemForm && (
            <Button onClick={() => setShowItemForm(!showItemForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showItemForm && (
          <Card className="animate-fade-in bg-muted/20 mb-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h4 className="text-foreground font-semibold">
                {editingItem ? "Edit Universe Item" : "Add New Universe Item"}
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <SelectField
                    id="department_id"
                    label="Department"
                    required
                    placeholder="--Select a department--"
                    value={itemData.department_id || ""}
                    onValueChange={(value) => updateItemData({ department_id: value })}
                    options={departmentsOptions}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Process/Activity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="process_activity"
                    value={itemData.name}
                    onChange={(e) => updateItemData({ name: e.target.value })}
                    placeholder="e.g., Information security policy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="audit_frequency"
                    label="Audit Frequency"
                    required
                    placeholder="--Select an audit frequency--"
                    value={itemData.audit_frequency}
                    onValueChange={(value) => updateItemData({ audit_frequency: value })}
                    options={AUDIT_FREQUENCIES.map((freq) => ({
                      id: freq,
                      name: freq.replace("_", " ")
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="strategic_pillar_id"
                    label="Strategic Pillar"
                    placeholder="Select a pillar (optional)"
                    value={itemData.strategic_pillar_id || ""}
                    onValueChange={(value) =>
                      updateItemData({ strategic_pillar_id: value, strategic_initiative_id: "" })
                    }
                    options={strategicPillarsOptions}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="auditable_area_id"
                    label="Auditable Area"
                    placeholder="Select an area (optional)"
                    value={itemData.auditable_area_id || ""}
                    onValueChange={(value) => updateItemData({ auditable_area_id: value })}
                    options={auditableAreasOptions}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="risk_id"
                    label="Associated Risk"
                    placeholder="Select a risk (optional)"
                    value={itemData.risk_id || ""}
                    onValueChange={(value) => updateItemData({ risk_id: value })}
                    options={risksOptions}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="strategic_initiative_id"
                    label="Strategic Initiative"
                    placeholder={
                      itemData.strategic_pillar_id
                        ? "Select an initiative (optional)"
                        : "Select a pillar first"
                    }
                    value={itemData.strategic_initiative_id || ""}
                    onValueChange={(value) => updateItemData({ strategic_initiative_id: value })}
                    disabled={!itemData.strategic_pillar_id}
                    options={strategicInitiativesOptions}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="indicative_target_id"
                    label="Indicative Target"
                    placeholder="Select a target (optional)"
                    value={itemData.indicative_target_id || ""}
                    onValueChange={(value) => updateItemData({ indicative_target_id: value })}
                    options={indicativeTargetsOptions}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  isLoading={isCreating}
                  loadingText={editingItem ? "Updating..." : "Creating..."}
                  className="gap-2">
                  <Save className="h-4 w-4" />
                  {editingItem ? "Update Item" : "Create Item"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Items Table */}
        {safeUniverseItems.length === 0 ? (
          <Empty className="border-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Globe />
              </EmptyMedia>
              <EmptyTitle>No universe items yet</EmptyTitle>
              <EmptyDescription>Get started by creating your first universe item</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowItemForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Item
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Universe Item</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Audit Frequency</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeUniverseItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{item.name || "unknown"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getDepartmentName(item.department_id)}
                    </TableCell>
                    <TableCell>
                      <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-medium">
                        {item.audit_frequency.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.is_active ? (
                        <span className="bg-success/10 text-success rounded-md px-2.5 py-1 text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(item)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={(open) => {
          if (open) {
            setShowDeleteModal(false);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Universe Item"
        description={`Are you sure you want to delete this universe item? This action cannot be undone.`}
        confirmText="Delete"
        type="delete"
        isLoading={isDeleting}
      />

      {/* Submit for Approval Confirmation Modal */}
      <ConfirmationModal
        open={submitConfirmationOpen}
        onOpenChange={setSubmitConfirmationOpen}
        onConfirm={handleSubmitUniverse}
        title="Submit Universe for Approval?"
        description="You are about to submit this universe for approval. Once submitted, it will be reviewed by the approval committee."
        confirmText="Submit"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default UniverseDetails;
