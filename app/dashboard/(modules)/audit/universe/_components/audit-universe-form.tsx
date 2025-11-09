"use client";
import { useMemo, useState } from "react";
import { Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import {
  createUniverse,
  createUniverseItem,
  updateUniverse,
  updateUniverseItem,
  deleteUniverseItem
} from "@/app/_actions/audit-module-actions";
import { CreateUniversePayload, CreateUniverseItemPayload } from "@/lib/types/audit-types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useStrategicInitiatives,
  useIndicativeTargets,
  useUniverses,
  useUniverseItems,
  useProcessActivities
} from "@/hooks/use-audit-settings-query-data";
import { useDepartments } from "@/hooks/use-query-data";
import { useRisks } from "@/hooks/use-risk-query-data";
import { SelectField } from "@/components/ui/select-field";
import { SearchSelectField } from "@/components/ui/search-select-field";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Department } from "@/lib/types";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";

const AUDIT_FREQUENCIES = ["ANNUALLY", "SEMI_ANNUALLY", "QUARTERLY", "AS_NEEDED"];

interface UniverseFormData {
  universe_name: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  department_id?: string;
  auditable_area_id?: string;
  is_active: boolean;
}

interface UniverseItemFormData {
  audit_universe_id: number | string;
  process_activity_id: string; // Changed: now storing the ID
  name: string;
  department_id: string;
  strategic_pillar_id: string;
  strategic_pillar_name?: string;
  auditable_area_id: string;
  auditable_area_name?: string;
  indicative_target_id: string;
  strategic_initiative_id: string;
  strategic_initiative_name?: string;
  risk_id: string;
  audit_frequency: string;
  is_active: boolean;
}

const INIT_UNIVERSE_DATA: UniverseFormData = {
  universe_name: "",
  start_date: undefined,
  end_date: undefined,
  department_id: undefined,
  auditable_area_id: undefined,
  is_active: true
};

const INIT_ITEM_DATA: UniverseItemFormData = {
  audit_universe_id: "",
  process_activity_id: "",
  name: "",
  department_id: "",
  strategic_pillar_id: "",
  auditable_area_id: "",
  indicative_target_id: "",
  strategic_initiative_id: "",
  risk_id: "",
  audit_frequency: "ANNUALLY",
  is_active: true
};

export default function AuditUniverseForm({
  initialData,
  universeId,
  mode = "universe",
  universes = [],
  initialUniverseItems = [],
  onSwitchToUniverseTab,
  onSwitchToItemTab
}: {
  initialData?: any;
  universeId?: string;
  mode?: "universe" | "item";
  universes?: any[];
  initialUniverseItems?: any[];
  onSwitchToUniverseTab?: () => void;
  onSwitchToItemTab?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!universeId;

  // Safely initialize universe data with proper date handling
  const [universeData, setUniverseData] = useState<UniverseFormData>(() => {
    if (!initialData) return INIT_UNIVERSE_DATA;

    return {
      universe_name: initialData.universe_name || "",
      start_date:
        initialData.start_date instanceof Date && !isNaN(initialData.start_date.getTime())
          ? initialData.start_date
          : undefined,
      end_date:
        initialData.end_date instanceof Date && !isNaN(initialData.end_date.getTime())
          ? initialData.end_date
          : undefined,
      is_active: initialData.is_active ?? true
    };
  });
  const [itemData, setItemData] = useState<UniverseItemFormData>(() => {
    // If we have initialData with audit_universe_id (edit mode), pre-populate it
    if (initialData?.audit_universe_id) {
      return {
        ...INIT_ITEM_DATA,
        audit_universe_id: initialData.audit_universe_id
      };
    }
    return INIT_ITEM_DATA;
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Mutation for creating/updating universe
  const universeSubmitMutation = useMutation({
    mutationFn: async (payload: CreateUniversePayload) => {
      if (isEditing && universeId) {
        return await updateUniverse(universeId, payload);
      } else {
        return await createUniverse(payload);
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(
          response.message || `Universe ${isEditing ? "updated" : "created"} successfully`
        );

        // Switch to item tab for both creating and editing to allow item management
        if (onSwitchToItemTab) {
          onSwitchToItemTab();
        }

        // Reset form for next universe creation (only if creating, not editing)
        if (!isEditing) {
          setUniverseData(INIT_UNIVERSE_DATA);
        }

        // Invalidate all relevant query caches
        queryClient.invalidateQueries();
      } else {
        toast.error(response.message || `Failed to ${isEditing ? "update" : "create"} universe`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to ${isEditing ? "update" : "create"} universe. Please try again.`);
      console.error("Error:", error);
    }
  });

  // Mutation for creating/editing universe item
  const itemSubmitMutation = useMutation({
    mutationFn: async (payload: CreateUniverseItemPayload) => {
      if (editingItemId) {
        return await updateUniverseItem(editingItemId, payload);
      } else {
        return await createUniverseItem(payload);
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(
          response.message || `Universe item ${editingItemId ? "updated" : "created"} successfully`
        );
        // Invalidate all relevant query caches
        queryClient.invalidateQueries();
        // Reset form except universe selection
        setItemData({
          ...INIT_ITEM_DATA,
          audit_universe_id: itemData.audit_universe_id
        });
        setEditingItemId(null);
        router.refresh();
      } else {
        toast.error(
          response.message || `Failed to ${editingItemId ? "update" : "create"} universe item`
        );
      }
    },
    onError: (error) => {
      toast.error(
        `Failed to ${editingItemId ? "update" : "create"} universe item. Please try again.`
      );
      console.error("Error:", error);
    }
  });

  // Mutation for deleting universe item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await deleteUniverseItem(itemId);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Universe item deleted successfully");
        // Invalidate all relevant query caches
        queryClient.invalidateQueries();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        router.refresh();
      } else {
        toast.error(response.message || "Failed to delete universe item");
      }
    },
    onError: (error) => {
      toast.error("Failed to delete universe item. Please try again.");
      console.error("Error:", error);
    }
  });

  // Fetch dropdown data using reusable hooks
  const { data: departmentsResponse } = useDepartments({
    is_active: true,
    page_size: 100,
    page: 1
  });

  const departments: Department[] = departmentsResponse?.data?.data || [];

  // const { data: auditableAreasResponse } = useAuditableAreas({
  //   department_id: itemData.department_id
  //   // page_size: 100,
  //   // page: 1
  // });
  // const auditableAreasData = auditableAreasResponse?.data || [];

  // const { data: strategicPillarsResponse } = useStrategicPillars(undefined, {
  //   department_id: itemData.department_id
  //   // page_size: 100,
  //   // page: 1
  // });

  // const strategicPillarsData = mode === "item" ? strategicPillarsResponse?.data || [] : [];
  // console.log("strategicPillarsData", strategicPillarsData);

  const selectedPillarId = useMemo(() => {
    return mode === "item" && itemData.strategic_pillar_id
      ? itemData.strategic_pillar_id
      : undefined;
  }, [itemData.strategic_pillar_id, mode]);

  const { data: strategicInitiativesResponse } = useStrategicInitiatives(selectedPillarId);

  const strategicInitiativesData = mode === "item" ? strategicInitiativesResponse?.data || [] : [];

  const { data: indicativeTargetsResponse } = useIndicativeTargets();
  const indicativeTargetsData = mode === "item" ? indicativeTargetsResponse?.data || [] : [];

  const { data: risksResponse } = useRisks();
  const risksData = mode === "item" ? risksResponse?.data || [] : [];

  const { data: processActivitiesResponse, isLoading: isLoadingActivities } = useProcessActivities({
    department_id: itemData.department_id
  });

  const processActivitiesData = mode === "item" ? processActivitiesResponse?.data || [] : [];

  // Fetch universes dynamically for the dropdown
  const { data: universesResponse } = useUniverses();
  const universesData = mode === "item" ? universesResponse?.data || universes : [];

  // Fetch universe items for the selected universe
  const universeIdForItems =
    mode === "item" && itemData.audit_universe_id ? String(itemData.audit_universe_id) : undefined;

  const { data: universeItemsResponse, isLoading: isLoadingItems } =
    useUniverseItems(universeIdForItems);

  // Use initialUniverseItems if editing a universe, otherwise use fetched data
  const universeItemsData =
    mode === "item"
      ? isEditing && initialUniverseItems.length > 0
        ? initialUniverseItems
        : universeItemsResponse?.data || []
      : [];

  const updateUniverseData = (fields: Partial<UniverseFormData>) => {
    setUniverseData((prev) => ({ ...prev, ...fields }));
  };

  const updateItemData = (fields: Partial<UniverseItemFormData>) => {
    setItemData((prev) => ({ ...prev, ...fields }));
  };

  const handleProcessActivityChange = (activityId: string) => {
    const selectedActivity = processActivitiesData?.find((a: any) => a.id === activityId);

    console.log("selectedActivity", selectedActivity, activityId);

    if (selectedActivity) {
      updateItemData({
        process_activity_id: activityId,
        strategic_pillar_id: selectedActivity.strategic_pillar_id || "",
        strategic_pillar_name: selectedActivity.strategic_pillar_name || "",
        auditable_area_id: selectedActivity.auditable_area_id || "",
        auditable_area_name: selectedActivity.auditable_area_name || ""
      });
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id);
    setItemData({
      audit_universe_id: item.audit_universe_id,
      process_activity_id: item.process_activity_id || "",
      name: item.name || "",
      department_id: item.department_id || "",
      strategic_pillar_id: item.strategic_pillar_id || "",
      strategic_pillar_name: item.strategic_pillar_name || "",
      auditable_area_id: item.auditable_area_id || "",
      auditable_area_name: item.auditable_area_name || "",
      indicative_target_id: item.indicative_target_id || "",
      strategic_initiative_id: item.strategic_initiative_id || "",
      risk_id: item.risk_id || "",
      audit_frequency: item.audit_frequency || "ANNUALLY",
      is_active: item.is_active ?? true
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setItemData({
      ...INIT_ITEM_DATA,
      audit_universe_id: itemData.audit_universe_id
    });
  };

  const handleUniverseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!universeData.universe_name.trim()) {
      toast.error("Please enter a universe name");
      return;
    }

    if (!universeData.start_date || !universeData.end_date) {
      toast.error("Please select start and end dates");
      return;
    }

    const payload: CreateUniversePayload = {
      universe_name: universeData.universe_name,
      start_date: universeData.start_date.toISOString(),
      end_date: universeData.end_date.toISOString(),
      is_active: universeData.is_active
    };

    universeSubmitMutation.mutate(payload);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemData.audit_universe_id) {
      toast.error("Please select a universe");
      return;
    }

    if (!itemData.process_activity_id) {
      toast.error("Please select a process/activity");
      return;
    }

    const selectedActivity = processActivitiesData?.find(
      (a: any) => a.id === itemData.process_activity_id
    );

    const payload: CreateUniverseItemPayload = {
      audit_universe_id: Number(itemData.audit_universe_id),
      name: itemData.name || "",
      process_activity_id: itemData.process_activity_id,
      department_id: itemData.department_id || selectedActivity?.department_id || null,
      strategic_pillar_id:
        itemData.strategic_pillar_id || selectedActivity?.strategic_pillar_id || null,
      auditable_area_id: itemData.auditable_area_id || selectedActivity?.auditable_area_id || null,
      indicative_target_id: itemData.indicative_target_id || null,
      strategic_initiative_id: itemData.strategic_initiative_id || null,
      risk_id: itemData.risk_id || null,
      audit_frequency: itemData.audit_frequency,
      is_active: itemData.is_active || true
    };

    // console.log("payload", payload);

    itemSubmitMutation.mutate(payload);
  };

  const universeOptions = useMemo(() => {
    // Ensure data is always an array
    const data = Array.isArray(universesData)
      ? universesData
      : Array.isArray(universes)
        ? universes
        : [];

    if (data.length === 0) return [];

    return data.map((universe: any) => ({
      id: String(universe.id),
      name: universe.universe_name || universe.universeName || "Unnamed Universe"
    }));
  }, [universesData, universes]);

  // const auditableAreasOptions = useMemo(() => {
  //   return auditableAreasData?.map((area: any) => ({
  //     id: area.id,
  //     name: area.name || area.title
  //   }));
  // }, [auditableAreasData]);

  // const strategicPillarsOptions = useMemo(() => {
  //   return strategicPillarsData?.map((pillar: any) => ({
  //     id: pillar.id,
  //     name: pillar.name || pillar.title
  //   }));
  // }, [strategicPillarsData]);

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

  // const strategicInitiativesOptions = useMemo(() => {
  //   return strategicInitiativesData?.map((initiative: any) => ({
  //     id: initiative.id,
  //     name: initiative.strategic_initiative_name || initiative.name || initiative.title
  //   }));
  // }, [strategicInitiativesData]);

  const processActivitiesOptions = useMemo(() => {
    return processActivitiesData?.map((activity: any) => ({
      id: activity.id,
      name: activity.name || activity.title || activity.process_activity
    }));
  }, [processActivitiesData]);

  if (mode === "item") {
    // Show Empty state if no universes exist
    if (universeOptions.length === 0) {
      return (
        <Empty className="animate-fade-in">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Globe />
            </EmptyMedia>
            <EmptyTitle>No Universes Available</EmptyTitle>
            <EmptyDescription>
              You need to create a universe first before you can add universe items.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {onSwitchToUniverseTab ? (
              <Button onClick={onSwitchToUniverseTab} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Universe First
              </Button>
            ) : (
              <Link href="/dashboard/audit/universe/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Universe First
                </Button>
              </Link>
            )}
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Section - 2 columns */}
        <Card className="animate-fade-in lg:col-span-2">
          <form onSubmit={handleItemSubmit} className="p-6 sm:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <h3 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                <span className="bg-primary h-8 w-1 rounded-full"></span>
                {editingItemId ? "Edit Universe Item" : "Universe Item Information"}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {editingItemId
                  ? "Update the universe item details and associations"
                  : "Configure the universe item details and associations"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
              {/* Primary Information */}
              <div className="space-y-4">
                {/* Universe Selection */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Input
                    id="name"
                    label="Universe Entry Name"
                    value={itemData.name}
                    onChange={(e) => updateItemData({ name: e.target.value })}
                    placeholder="Enter name"
                    required={true}
                    className="md:col-span-1"
                    classNames={{
                      wrapper: "md:col-span-1"
                    }}
                  />
                  <SearchSelectField
                    id="audit_universe_id"
                    label="Universe"
                    required
                    placeholder="--Select a universe--"
                    value={String(itemData.audit_universe_id || "")}
                    onValueChange={(value) => updateItemData({ audit_universe_id: value })}
                    options={universeOptions}
                    className="w-full md:col-span-2"
                    classNames={{
                      wrapper: "w-full md:col-span-2"
                    }}
                  />
                </div>

                <SearchSelectField
                  id="department_id"
                  label="Department / Functional Unit"
                  required
                  placeholder="--Select a Department / Functional Unit--"
                  className="w-full max-w-none"
                  classNames={{
                    wrapper: "w-full max-w-none"
                  }}
                  value={itemData.department_id}
                  onValueChange={(value) => updateItemData({ department_id: value })}
                  options={(departments as any) || []}
                />

                {/* Process/Activity - Full Width */}
                <SearchSelectField
                  id="process_activity_id"
                  label="Process/Activity"
                  required
                  className="w-full max-w-none"
                  classNames={{
                    wrapper: "w-full max-w-none",
                    descriptionText: "w-full mt-1 text-sm text-orange-500"
                  }}
                  disabled={!itemData.department_id}
                  isDisabled={!itemData.department_id || isLoadingActivities}
                  isLoading={isLoadingActivities}
                  placeholder="--Select a process/activity--"
                  descriptionText={
                    !itemData.department_id ? "Please select a department first" : ""
                  }
                  options={processActivitiesOptions || []}
                  value={itemData.process_activity_id}
                  onValueChange={handleProcessActivityChange}
                />
              </div>

              {/* Auto-Populated Fields (Read-only) */}
              {itemData.process_activity_id && (
                <div className="mb-4 border-t pt-6">
                  <div className="mb-2">
                    <h4 className="text-foreground text-sm font-semibold">Strategic Alignment</h4>
                    <span className="text-muted-foreground text-xs">
                      Auto-Populated from Process/Activity
                    </span>
                  </div>
                  <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/20 p-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="">
                        <h4 className="text-muted-foreground mb-0.5 text-sm font-medium">
                          Auditable Area
                        </h4>
                        <p className="text-primary border-primary/10 bg-primary/5 max-w-md rounded-lg border p-2 text-sm font-bold wrap-break-word">
                          {itemData.auditable_area_name || (
                            <span className="text-muted-foreground cursor-not-allowed text-sm font-medium uppercase">
                              Configuration unavailable
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="">
                        <h4 className="text-muted-foreground mb-0.5 text-sm font-medium">
                          Strategic Pillar
                        </h4>
                        <p className="text-primary border-primary/10 bg-primary/5 max-w-md rounded-lg border p-2 text-sm font-bold wrap-break-word">
                          {itemData.strategic_pillar_name || (
                            <span className="text-muted-foreground cursor-not-allowed text-sm font-medium uppercase">
                              Configuration unavailable
                            </span>
                          )}
                        </p>
                      </div>
                      <SelectField
                        id="strategic_initiative_id"
                        label="Strategic Initiative"
                        required
                        placeholder="--Select a strategic initiative--"
                        className="w-full"
                        classNames={{
                          wrapper: "w-full"
                        }}
                        value={itemData.strategic_initiative_id}
                        onValueChange={(value) =>
                          updateItemData({ strategic_initiative_id: value })
                        }
                        options={strategicInitiativesData}
                      />
                      <SelectField
                        id="audit_frequency"
                        label="Audit Frequency"
                        required
                        placeholder="--Select an audit frequency--"
                        className="w-full"
                        classNames={{
                          wrapper: "w-full"
                        }}
                        value={itemData.audit_frequency}
                        onValueChange={(value) => updateItemData({ audit_frequency: value })}
                        options={AUDIT_FREQUENCIES.map((freq) => ({
                          id: freq,
                          name: freq.replace("_", " ")
                        }))}
                      />
                      <SelectField
                        id="indicative_target_id"
                        label="Indicative Target"
                        placeholder="Select a target (optional)"
                        required
                        className="w-full"
                        classNames={{
                          wrapper: "w-full"
                        }}
                        value={itemData.indicative_target_id}
                        onValueChange={(value) => updateItemData({ indicative_target_id: value })}
                        options={indicativeTargetsOptions}
                      />{" "}
                      <SelectField
                        id="risk_id"
                        label="Associated Risk"
                        placeholder="Select a risk (optional)"
                        required
                        className="w-full"
                        classNames={{
                          wrapper: "w-full"
                        }}
                        value={itemData.risk_id}
                        onValueChange={(value) => updateItemData({ risk_id: value })}
                        options={risksOptions}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="border-t pt-6">
                <div className="bg-muted/30 hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-4 transition-colors">
                  <Checkbox
                    // type="checkbox"
                    id="is_active"
                    checked={itemData.is_active}
                    onCheckedChange={(checked) => updateItemData({ is_active: Boolean(checked) })}
                    className="text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-offset-2"
                  />
                  <Label
                    htmlFor="is_active"
                    className="flex-1 cursor-pointer text-sm font-medium select-none">
                    Active Status
                    <span className="text-muted-foreground mt-0.5 block text-xs font-normal">
                      Enable this universe item for use in the system
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 -mx-6 mt-8 flex flex-col-reverse justify-end gap-3 border-t px-6 pt-6 pb-6 backdrop-blur sm:-mx-8 sm:flex-row sm:px-8 sm:pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={
                  editingItemId ? handleCancelEdit : () => router.push("/dashboard/audit/universe")
                }
                disabled={itemSubmitMutation.isPending}
                className="w-full min-w-[120px] sm:w-auto">
                {editingItemId ? "Cancel Edit" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={itemSubmitMutation.isPending}
                isLoading={itemSubmitMutation.isPending}
                className="w-full min-w-[180px] gap-2 sm:w-auto">
                <Save className="h-4 w-4" />
                {itemSubmitMutation.isPending
                  ? editingItemId
                    ? "Saving..."
                    : "Creating..."
                  : editingItemId
                    ? "Save Changes"
                    : "Create Universe Item"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Universe Items List - 1 column */}
        <Card className="animate-fade-in h-fit lg:sticky lg:top-6">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <span className="bg-primary h-6 w-1 rounded-full"></span>
                Universe Entries
              </h3>
              {universeItemsData && universeItemsData.length > 0 && (
                <Badge variant={"secondary"} className="p-1 px-4 text-sm font-medium">
                  {universeItemsData.length}
                </Badge>
              )}
            </div>

            {!itemData.audit_universe_id ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <Globe className="mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">Select a universe to view entries</p>
              </div>
            ) : isLoadingItems ? (
              <div className="flex items-center justify-center py-12">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
            ) : !Array.isArray(universeItemsData) || universeItemsData.length === 0 ? (
              <Empty className="border-0 py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Globe />
                  </EmptyMedia>
                  <EmptyTitle className="text-base">No entries yet</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    Create your first entry using the form on the left
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="max-h-[600px] space-y-2 overflow-y-auto">
                {universeItemsData.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="hover:bg-muted/50 group rounded-lg border p-3 transition-colors">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <h4 className="text-foreground line-clamp-2 flex-1 text-sm font-medium">
                        {item.name || "Unnamed Activity"}
                      </h4>
                      <div className="flex gap-1 transition-opacity">
                        <Button
                          size="icon"
                          variant="outline"
                          className=""
                          onClick={() => handleEditItem(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">
                        <span className="font-medium">Frequency:</span>{" "}
                        {item.audit_frequency?.replace("_", " ") || "N/A"}
                      </p>
                      {item.department?.name && (
                        <p className="text-muted-foreground text-xs">
                          <span className="font-medium">Department:</span> {item.department.name}
                        </p>
                      )}
                      {item.auditable_area?.name && (
                        <p className="text-muted-foreground text-xs">
                          <span className="font-medium">Area:</span> {item.auditable_area.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteConfirmOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteConfirmOpen(false);
              setItemToDelete(null);
            }
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Universe Item"
          description="Are you sure you want to delete this universe item? This action cannot be undone."
          confirmText="Delete"
          type="delete"
          isLoading={deleteItemMutation.isPending}
        />
      </div>
    );
  }

  // Universe mode
  return (
    <Card className="animate-fade-in mx-auto w-full max-w-4xl">
      <form onSubmit={handleUniverseSubmit}>
        {/* Header Section */}
        <div className="p-6 pb-0 sm:p-8">
          <h3 className="text-foreground flex items-center gap-2 text-xl font-semibold">
            <span className="bg-primary h-8 w-1 rounded-full"></span>
            {isEditing ? "Edit Universe" : "Create New Universe"}
          </h3>
          <p className="text-muted-foreground mt-2 ml-3 text-sm">
            {isEditing
              ? "Update the universe details and active period"
              : "Configure the universe details and active period"}
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-6 p-6 sm:p-8">
          {/* Universe Name - Full Width */}
          <div className="space-y-2">
            <Input
              id="universe_name"
              label="Universe Name"
              value={universeData.universe_name}
              onChange={(e) => updateUniverseData({ universe_name: e.target.value })}
              placeholder="Enter universe name"
              required
              className="w-full"
            />
          </div>

          {/* Date Pickers - Responsive Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
            <div className="space-y-2">
              <DatePicker
                label="Start Date"
                name="start_date"
                value={universeData.start_date as any}
                onValueChange={(date) => updateUniverseData({ start_date: date })}
                required
              />
            </div>

            <div className="space-y-2">
              <DatePicker
                label="End Date"
                name="end_date"
                value={universeData.end_date as any}
                onValueChange={(date) => updateUniverseData({ end_date: date })}
                required
              />
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="pt-2">
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-4 transition-colors">
              <Checkbox
                id="is_active"
                checked={universeData.is_active}
                onCheckedChange={(checked) => updateUniverseData({ is_active: Boolean(checked) })}
                className="text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-offset-2"
              />
              <Label
                htmlFor="is_active"
                className="flex-1 cursor-pointer text-sm font-medium select-none">
                Active Status
                <span className="text-muted-foreground mt-0.5 block text-xs font-normal">
                  Enable this universe for use in the system
                </span>
              </Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-muted/20 flex flex-col-reverse justify-end gap-3 rounded-b-lg border-t p-6 sm:flex-row sm:p-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/audit/universe")}
            disabled={universeSubmitMutation.isPending}
            className="w-full min-w-[120px] sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={universeSubmitMutation.isPending}
            className="w-full min-w-[160px] gap-2 sm:w-auto"
            isLoading={universeSubmitMutation.isPending}
            loadingText={isEditing ? "Updating..." : "Creating..."}>
            <Save className="h-4 w-4" />
            {isEditing ? "Update Universe" : "Create Universe"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
