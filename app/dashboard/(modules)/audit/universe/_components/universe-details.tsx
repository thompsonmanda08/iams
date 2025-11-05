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
import { Plus, Pencil, Trash2, Save, Globe } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import {
  createUniverseItem,
  updateUniverseItem,
  deleteUniverseItem
} from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";
import BackButton from "@/components/back-button";
import { getDepartments } from "@/app/_actions/org-actions";
import { useQueryClient } from "@tanstack/react-query";

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

  const safeUniverseItems = Array.isArray(universeItems) ? universeItems : [];

  if (!universe) {
    return (
      <div className="from-background via-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br">
        <Card className="max-w-md p-8 text-center">
          <Globe className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
          <h2 className="mb-4 text-2xl font-bold">Universe Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The universe you're looking for doesn't exist.
          </p>
          <BackButton title="Back to Universes" />
        </Card>
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
        is_active: itemData.is_active
      };

      let response;
      if (editingItem) {
        response = await updateUniverseItem(editingItem.id, itemPayload, universe.id);
      } else {
        response = await createUniverseItem(itemPayload);
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
      is_active: item.is_active
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

  return (
    <div className="bg-background space-y-8">
      {/* Universe Overview */}
      <Card className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-foreground text-2xl font-bold">{universe.universe_name}</h2>
          <div className="flex gap-2">
            <StatusBadge status={universe.status || "UNIVERSE_CREATION"} />
            {universe.is_active ? (
              <span className="bg-success/10 text-success rounded-md px-3 py-1 text-sm font-medium">
                Active
              </span>
            ) : (
              <span className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-sm font-medium">
                Inactive
              </span>
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
          <Button onClick={() => setShowItemForm(!showItemForm)} className="gap-2">
            {showItemForm ? (
              <>Cancel</>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Item
              </>
            )}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showItemForm && (
          <Card className="animate-fade-in mb-6 bg-muted/20 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h4 className="text-foreground font-semibold">
                {editingItem ? "Edit Universe Item" : "Add New Universe Item"}
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department_id">
                    Department ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="department_id"
                    value={itemData.department_id}
                    onChange={(e) => updateItemData({ department_id: e.target.value })}
                    placeholder="Enter department ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="process_activity">
                    Process/Activity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="process_activity"
                    value={itemData.process_activity}
                    onChange={(e) => updateItemData({ process_activity: e.target.value })}
                    placeholder="e.g., Information security policy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit_frequency">Audit Frequency</Label>
                  <Select
                    value={itemData.audit_frequency}
                    onValueChange={(value) => updateItemData({ audit_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIT_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategic_pillar_id">Strategic Pillar ID</Label>
                  <Input
                    id="strategic_pillar_id"
                    value={itemData.strategic_pillar_id}
                    onChange={(e) => updateItemData({ strategic_pillar_id: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auditable_area_id">Auditable Area ID</Label>
                  <Input
                    id="auditable_area_id"
                    value={itemData.auditable_area_id}
                    onChange={(e) => updateItemData({ auditable_area_id: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_id">Risk ID</Label>
                  <Input
                    id="risk_id"
                    value={itemData.risk_id}
                    onChange={(e) => updateItemData({ risk_id: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isCreating
                    ? editingItem
                      ? "Updating..."
                      : "Creating..."
                    : editingItem
                      ? "Update Item"
                      : "Create Item"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Items Table */}
        {safeUniverseItems.length === 0 ? (
          <div className="text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed py-12 text-center">
            <p className="font-medium">No universe items yet</p>
            <p className="mt-2 text-sm">Click "Add Item" to create your first universe item</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Process/Activity</TableHead>
                  <TableHead className="font-semibold">Department ID</TableHead>
                  <TableHead className="font-semibold">Audit Frequency</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeUniverseItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{item.process_activity}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.department_id}
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
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Universe Item"
        description={`Are you sure you want to delete this universe item? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UniverseDetails;
