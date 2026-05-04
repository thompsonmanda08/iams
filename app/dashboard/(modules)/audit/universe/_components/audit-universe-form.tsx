"use client";
import { useMemo, useState } from "react";
import { Save, Globe, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { notify } from "@/lib/utils";
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
import { useKRIs, useRisks } from "@/hooks/use-risk-query-data";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/use-permissions";
import { MODULE_CODES } from "@/lib/constants/module-codes";

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
  risk_id?: string;
  kri_id: string;
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
  kri_id: "",
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
  onSwitchToItemTab,
  onCancel = undefined
}: {
  initialData?: any;
  universeId?: string;
  mode?: "universe" | "item";
  universes?: any[];
  initialUniverseItems?: any[];
  onSwitchToUniverseTab?: () => void;
  onSwitchToItemTab?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { checkPermission, hasPermission } = usePermissions();
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
        audit_universe_id: initialData.audit_universe_id,
        process_activity_id: initialData.process_activity_id || "",
        name: initialData.name || "",
        department_id: initialData.department_id || "",
        strategic_pillar_id: initialData.strategic_pillar_id || "",
        strategic_pillar_name: initialData.strategic_pillar_name || "",
        auditable_area_id: initialData.auditable_area_id || "",
        auditable_area_name: initialData.auditable_area_name || "",
        indicative_target_id: initialData.indicative_target_id || "",
        strategic_initiative_id: initialData.strategic_initiative_id || "",
        strategic_initiative_name: initialData.strategic_initiative_name || "",
        risk_id: initialData.risk_id || "",
        kri_id: initialData.kri_id || "",
        audit_frequency: initialData.audit_frequency || "ANNUALLY",
        is_active: initialData.is_active ?? true
      };
    }
    return INIT_ITEM_DATA;
  });

  const [editingItemId, setEditingItemId] = useState<string | null>(() => {
    // If we have initialData with an id, we're editing
    return initialData?.id || null;
  });
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
        notify({
          description: response.message || `Universe ${isEditing ? "updated" : "created"} successfully`,
          type: "success"
        });

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
        notify({ description: response.message || `Failed to ${isEditing ? "update" : "create"} universe`, type: "error" });
      }
    },
    onError: (error) => {
      notify({ description: `Failed to ${isEditing ? "update" : "create"} universe. Please try again.`, type: "error" });
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
        notify({
          description: response.message || `Universe item ${editingItemId ? "updated" : "created"} successfully`,
          type: "success"
        });
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
        notify({
          description: response.message || `Failed to ${editingItemId ? "update" : "create"} universe item`,
          type: "error"
        });
      }
    },
    onError: (error) => {
      notify({
        description: `Failed to ${editingItemId ? "update" : "create"} universe item. Please try again.`,
        type: "error"
      });
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
        notify({ description: response.message || "Universe item deleted successfully", type: "success" });
        // Invalidate all relevant query caches
        queryClient.invalidateQueries();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        router.refresh();
      } else {
        notify({ description: response.message || "Failed to delete universe item", type: "error" });
      }
    },
    onError: (error) => {
      notify({ description: "Failed to delete universe item. Please try again.", type: "error" });
      console.error("Error:", error);
    }
  });

  // Fetch dropdown data using reusable hooks
  const { data: departmentsResponse } = useDepartments({
    is_active: true,
    page_size: 1000,
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

  const { data: KRIResponse } = useKRIs();
  const KRI_Data = mode === "item" ? KRIResponse?.data || [] : [];

  const KRI_OPTIONS = useMemo(() => {
    return KRI_Data?.map((item: any) => ({
      id: item.id,
      name: `${item.name} - [ ${item.last_status} ]`,
      status: item.last_status
    }));
  }, [KRI_Data]);

  const { data: processActivitiesResponse, isLoading: isLoadingActivities } = useProcessActivities({
    department_id: itemData.department_id
  });

  const processActivitiesData = mode === "item" ? processActivitiesResponse?.data || [] : [];

  // Prerequisites for creating a universe item. A prerequisite is "missing" only
  // after its query has resolved with an empty list — checking `response !== undefined`
  // avoids flashing the banner during initial load.
  const missingPrerequisites = useMemo(() => {
    if (mode !== "item") return [];
    const checks = [
      {
        key: "departments",
        label: "Departments",
        loaded: departmentsResponse !== undefined,
        empty: departments.length === 0,
        href: "/dashboard/system-configs/setup?tab=departments"
      },
      {
        key: "initiatives",
        label: "Strategic Initiatives",
        loaded: strategicInitiativesResponse !== undefined,
        empty: strategicInitiativesData.length === 0,
        href: "/dashboard/system-configs/audit-settings?tab=initiative"
      },
      {
        key: "targets",
        label: "Indicative Targets",
        loaded: indicativeTargetsResponse !== undefined,
        empty: indicativeTargetsData.length === 0,
        href: "/dashboard/system-configs/audit-settings?tab=targets"
      },
      {
        key: "kris",
        label: "Key Risk Indicators (KRIs)",
        loaded: KRIResponse !== undefined,
        empty: KRI_Data.length === 0,
        href: "/dashboard/risks/kri"
      }
    ];
    return checks.filter((c) => c.loaded && c.empty);
  }, [
    mode,
    departmentsResponse,
    departments.length,
    strategicInitiativesResponse,
    strategicInitiativesData.length,
    indicativeTargetsResponse,
    indicativeTargetsData.length,
    KRIResponse,
    KRI_Data.length
  ]);

  // Fetch universes dynamically for the dropdown
  const { data: universesResponse } = useUniverses({ page: 1, page_size: 1000 });
  const universesData = mode === "item" ? universesResponse?.data || universes : [];

  // Fetch universe items for the selected universe
  const universeIdForItems =
    mode === "item" && itemData.audit_universe_id ? String(itemData.audit_universe_id) : undefined;

  const { data: universeItemsResponse, isLoading: isLoadingItems } = useUniverseItems(
    universeIdForItems,
    {
      page: 1,
      page_size: 1000
    }
  );

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

  const handleDepartmentChange = (deptId: string) => {
    // Clear dependent fields when department changes
    updateItemData({
      department_id: deptId,
      process_activity_id: "",
      strategic_pillar_id: "",
      strategic_pillar_name: "",
      auditable_area_id: "",
      auditable_area_name: "",
      indicative_target_id: "",
      strategic_initiative_id: "",
      strategic_initiative_name: ""
    });
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
      kri_id: item.kri_id || "",
      audit_frequency: item.audit_frequency || "ANNUALLY",
      is_active: item.is_active ?? true
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (itemId: string) => {
    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, "can_delete")) return;
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

    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, isEditing ? "can_edit" : "can_create")) return;

    if (!universeData.universe_name.trim()) {
      notify({ description: "Please enter a universe name", type: "error" });
      return;
    }

    if (!universeData.start_date || !universeData.end_date) {
      notify({ description: "Please select start and end dates", type: "error" });
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

    if (!checkPermission(MODULE_CODES.AUDIT_PLANS, editingItemId ? "can_edit" : "can_create")) return;

    if (!itemData.audit_universe_id) {
      notify({ description: "Please select a universe", type: "error" });
      return;
    }

    if (!itemData.process_activity_id) {
      notify({ description: "Please select a process/activity", type: "error" });
      return;
    }

    const selectedActivity = processActivitiesData?.find(
      (a: any) => a.id === itemData.process_activity_id
    );

    // Ensure null values are properly set for empty optional fields
    const payload: CreateUniverseItemPayload = {
      audit_universe_id: Number(itemData.audit_universe_id),
      name: itemData.name || "",
      process_activity_id: itemData.process_activity_id,
      department_id: itemData.department_id || selectedActivity?.department_id || "",
      strategic_pillar_id:
        itemData.strategic_pillar_id || selectedActivity?.strategic_pillar_id || "",
      auditable_area_id: itemData.auditable_area_id || selectedActivity?.auditable_area_id || "",
      indicative_target_id: itemData.indicative_target_id || "",
      strategic_initiative_id: itemData.strategic_initiative_id || "",
      kri_id: itemData.kri_id || "",
      audit_frequency: itemData.audit_frequency,
      is_active: itemData.is_active || true
    };

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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Form Section - 2 columns */}
        <Card className="animate-fade-in grid h-full lg:col-span-2">
          <form onSubmit={handleItemSubmit} className="h-full p-6 sm:p-8">
            {/* Prerequisites banner — shown when dependent configs are empty. */}
            {missingPrerequisites.length > 0 && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Configuration required
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Universe items depend on the following system configurations. Set these up
                      first to be able to select values for every required field below.
                    </p>
                  </div>
                  <ul className="space-y-1">
                    {missingPrerequisites.map((p) => (
                      <li key={p.key} className="flex items-center gap-2 text-xs">
                        <span className="text-amber-900 dark:text-amber-200">• {p.label}</span>
                        <Link
                          href={p.href}
                          className="inline-flex items-center gap-1 font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400">
                          Configure
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

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
                  <SearchSelectField
                    id="department_id"
                    label="Department / Functional Unit"
                    required
                    placeholder="--Select a Functional Unit--"
                    className="w-full max-w-none"
                    classNames={{
                      wrapper: "w-full max-w-none"
                    }}
                    value={itemData.department_id}
                    onValueChange={handleDepartmentChange}
                    options={(departments as any) || []}
                  />
                </div>

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
                      <SearchSelectField
                        id="kri_id"
                        label="Associated KRI (Key Risk Indicator)"
                        placeholder="-- Select a KRI (Key Risk Indicator) --"
                        required
                        className="w-full"
                        classNames={{
                          wrapper: "w-full"
                        }}
                        value={itemData.kri_id}
                        onValueChange={(value) => updateItemData({ kri_id: value })}
                        options={KRI_OPTIONS}
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
                  editingItemId
                    ? handleCancelEdit
                    : () => {
                        if (onCancel != undefined) {
                          onCancel();
                        } else {
                          router.push("/dashboard/audit/universe");
                        }
                      }
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
                  {universeItemsResponse?.pagination?.total || universeItemsData.length}
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
                  <TooltipProvider key={item.id || index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="hover:bg-muted/50 group cursor-pointer rounded-lg border p-3 transition-colors">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              {/* Process Activity - Highlighted Secondary Information */}
                              {item.process_activity_name && (
                                <p className="text-foreground mb-1 line-clamp-2 text-sm font-semibold">
                                  {item.process_activity_name}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditItem(item);
                                }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(item.id);
                                }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {/* Quick Info Row */}
                          <div className="flex flex-wrap justify-between gap-2 text-xs">
                            {/* KRI - Highlighted Primary Information */}
                            {item.kri_name && (
                              <div className="mb-1.5">
                                <span className="max-w-xs truncate italic">
                                  KRI: {item.kri_name}
                                </span>
                              </div>
                            )}{" "}
                            {item.audit_frequency && (
                              <Badge variant="secondary" className="text-xs">
                                {item.audit_frequency.replace("_", " ")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <div className="space-y-2 text-sm">
                          {item.kri_name && (
                            <div>
                              <p className="font-semibold text-blue-200">KRI</p>
                              <p className="text-xs">{item.kri_name}</p>
                            </div>
                          )}
                          {item.process_activity_name && (
                            <div>
                              <p className="font-semibold">Process/Activity</p>
                              <p className="text-xs">{item.process_activity_name}</p>
                            </div>
                          )}
                          {item.department?.name && (
                            <div>
                              <p className="font-semibold">Department</p>
                              <p className="text-xs">{item.department.name}</p>
                            </div>
                          )}
                          {item.auditable_area?.name && (
                            <div>
                              <p className="font-semibold">Auditable Area</p>
                              <p className="text-xs">{item.auditable_area.name}</p>
                            </div>
                          )}
                          {item.strategic_pillar_name && (
                            <div>
                              <p className="font-semibold">Strategic Pillar</p>
                              <p className="text-xs">{item.strategic_pillar_name}</p>
                            </div>
                          )}
                          {item.strategic_initiative_name && (
                            <div>
                              <p className="font-semibold">Strategic Initiative</p>
                              <p className="text-xs">{item.strategic_initiative_name}</p>
                            </div>
                          )}
                          {item.indicative_target_name && (
                            <div>
                              <p className="font-semibold">Indicative Target</p>
                              <p className="text-xs">{item.indicative_target_name}</p>
                            </div>
                          )}
                          {item.audit_frequency && (
                            <div>
                              <p className="font-semibold">Audit Frequency</p>
                              <p className="text-xs">{item.audit_frequency.replace("_", " ")}</p>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
            onClick={() => {
              if (onCancel != undefined) {
                onCancel();
              } else {
                router.push("/dashboard/audit/universe");
              }
            }}
            disabled={universeSubmitMutation.isPending}
            className="w-full min-w-[120px] sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={universeSubmitMutation.isPending}
            className="w-full min-w-40 gap-2 sm:w-auto"
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
