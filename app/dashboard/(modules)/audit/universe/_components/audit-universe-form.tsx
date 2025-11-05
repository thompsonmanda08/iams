"use client";
import { useMemo, useState } from "react";
import { Save, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  createUniverse,
  createUniverseItem,
  updateUniverse,
  getUniverseItems,
  getUniverses
} from "@/app/_actions/audit-module-actions";
import { CreateUniversePayload, CreateUniverseItemPayload } from "@/lib/types/audit-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDepartments } from "@/app/_actions/config-actions";
import {
  getAuditableAreas,
  getStrategicPillars,
  getStrategicInitiatives,
  getIndicativeTargets
} from "@/app/_actions/audit-settings-actions";
import { getRisks } from "@/app/_actions/risk-module-actions";
import { SelectField } from "@/components/ui/select-field";
import { undefined } from "zod";

const AUDIT_FREQUENCIES = ["ANNUALLY", "QUARTERLY", "MONTHLY", "AS_NEEDED"];

interface UniverseFormData {
  universe_name: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  is_active: boolean;
}

interface UniverseItemFormData {
  audit_universe_id: number | string;
  department_id: string;
  strategic_pillar_id: string;
  auditable_area_id: string;
  indicative_target_id: string;
  strategic_initiative_id: string;
  risk_id: string;
  process_activity: string;
  audit_frequency: string;
  is_active: boolean;
}

const INIT_UNIVERSE_DATA: UniverseFormData = {
  universe_name: "",
  start_date: undefined,
  end_date: undefined,
  is_active: true
};

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

export default function AuditUniverseForm({
  initialData,
  universeId,
  mode = "universe",
  universes = []
}: {
  initialData?: any;
  universeId?: string;
  mode?: "universe" | "item";
  universes?: any[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!universeId;

  // Safely initialize universe data with proper date handling
  const [universeData, setUniverseData] = useState<UniverseFormData>(() => {
    if (!initialData) return INIT_UNIVERSE_DATA;

    return {
      universe_name: initialData.universe_name || "",
      start_date: initialData.start_date instanceof Date && !isNaN(initialData.start_date.getTime())
        ? initialData.start_date
        : undefined,
      end_date: initialData.end_date instanceof Date && !isNaN(initialData.end_date.getTime())
        ? initialData.end_date
        : undefined,
      is_active: initialData.is_active ?? true
    };
  });
  const [itemData, setItemData] = useState<UniverseItemFormData>(INIT_ITEM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dropdown data using TanStack Query
  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const result = await getDepartments();
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item"
  });

  const { data: auditableAreasData } = useQuery({
    queryKey: ["auditableAreas"],
    queryFn: async () => {
      const result = await getAuditableAreas();
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item"
  });

  const { data: strategicPillarsData } = useQuery({
    queryKey: ["strategicPillars"],
    queryFn: async () => {
      const result = await getStrategicPillars();
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item"
  });

  const { data: strategicInitiativesData } = useQuery({
    queryKey: ["strategicInitiatives", itemData.strategic_pillar_id],
    queryFn: async () => {
      if (!itemData.strategic_pillar_id) return [];
      const result = await getStrategicInitiatives(itemData.strategic_pillar_id);
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item" && !!itemData.strategic_pillar_id
  });

  const { data: indicativeTargetsData } = useQuery({
    queryKey: ["indicativeTargets"],
    queryFn: async () => {
      const result = await getIndicativeTargets();
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item"
  });

  const { data: risksData } = useQuery({
    queryKey: ["risks"],
    queryFn: async () => {
      const result = await getRisks();
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item"
  });

  // Fetch universes dynamically for the dropdown
  const { data: universesData } = useQuery({
    queryKey: ["universes"],
    queryFn: async () => {
      const result = await getUniverses();
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item",
    initialData: universes // Use server-fetched data as initial data
  });

  // Fetch universe items for the selected universe
  const { data: universeItemsData, isLoading: isLoadingItems } = useQuery({
    queryKey: ["universeItems", itemData.audit_universe_id],
    queryFn: async () => {
      if (!itemData.audit_universe_id) return [];
      const result = await getUniverseItems({
        audit_universe_id: String(itemData.audit_universe_id)
      });
      return result.data?.data || result.data || [];
    },
    enabled: mode === "item" && !!itemData.audit_universe_id
  });

  const updateUniverseData = (fields: Partial<UniverseFormData>) => {
    setUniverseData((prev) => ({ ...prev, ...fields }));
  };

  const updateItemData = (fields: Partial<UniverseItemFormData>) => {
    setItemData((prev) => ({ ...prev, ...fields }));
  };

  const handleUniverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!universeData.universe_name.trim()) {
      toast.error("Please enter a universe name");
      return;
    }

    if (!universeData.start_date || !universeData.end_date) {
      toast.error("Please select start and end dates");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateUniversePayload = {
        universe_name: universeData.universe_name,
        start_date: universeData.start_date.toISOString(),
        end_date: universeData.end_date.toISOString(),
        is_active: universeData.is_active
      };

      let response;
      if (isEditing && universeId) {
        response = await updateUniverse(universeId, payload);
      } else {
        response = await createUniverse(payload);
      }

      if (response.success) {
        toast.success(
          response.message || `Universe ${isEditing ? "updated" : "created"} successfully`
        );
        // Invalidate all relevant query caches
        queryClient.invalidateQueries({ queryKey: ["universes"] });
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        queryClient.invalidateQueries({ queryKey: ["auditableAreas"] });
        queryClient.invalidateQueries({ queryKey: ["strategicPillars"] });
        queryClient.invalidateQueries({ queryKey: ["strategicInitiatives"] });
        queryClient.invalidateQueries({ queryKey: ["indicativeTargets"] });
        queryClient.invalidateQueries({ queryKey: ["risks"] });
        router.push("/dashboard/audit/universe");
        router.refresh();
      } else {
        toast.error(response.message || `Failed to ${isEditing ? "update" : "create"} universe`);
      }
    } catch (error) {
      toast.error(`Failed to ${isEditing ? "update" : "create"} universe. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemData.audit_universe_id) {
      toast.error("Please select a universe");
      return;
    }

    if (!itemData.department_id) {
      toast.error("Please select a department");
      return;
    }

    if (!itemData.process_activity.trim()) {
      toast.error("Please enter a process/activity");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateUniverseItemPayload = {
        audit_universe_id: Number(itemData.audit_universe_id),
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

      const response = await createUniverseItem(payload);

      if (response.success) {
        toast.success(response.message || "Universe item created successfully");
        // Invalidate all relevant query caches
        queryClient.invalidateQueries({ queryKey: ["universes"] });
        queryClient.invalidateQueries({ queryKey: ["universeItems", itemData.audit_universe_id] });
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        queryClient.invalidateQueries({ queryKey: ["auditableAreas"] });
        queryClient.invalidateQueries({ queryKey: ["strategicPillars"] });
        queryClient.invalidateQueries({ queryKey: ["strategicInitiatives"] });
        queryClient.invalidateQueries({ queryKey: ["indicativeTargets"] });
        queryClient.invalidateQueries({ queryKey: ["risks"] });
        // Reset form except universe selection
        setItemData({
          ...INIT_ITEM_DATA,
          audit_universe_id: itemData.audit_universe_id
        });
        router.refresh();
      } else {
        toast.error(response.message || "Failed to create universe item");
      }
    } catch (error) {
      toast.error("Failed to create universe item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const universeOptions = useMemo(() => {
    const data = universesData || universes || [];
    if (!data || data.length === 0) return [];
    return data.map((universe: any) => ({
      id: String(universe.id),
      name: universe.universe_name || universe.universeName || "Unnamed Universe"
    }));
  }, [universesData, universes]);

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

  if (mode === "item") {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Section - 2 columns */}
        <Card className="animate-fade-in lg:col-span-2">
          <form onSubmit={handleItemSubmit} className="p-6 sm:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h3 className="text-foreground flex items-center gap-2 text-xl font-semibold">
              <span className="bg-primary h-8 w-1 rounded-full"></span>
              Universe Item Information
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Configure the universe item details and associations
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            {/* Primary Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Universe Selection */}
                <div className="space-y-2">
                  <SelectField
                    id="audit_universe_id"
                    label="Universe"
                    required
                    placeholder="--Select a universe--"
                    value={String(itemData.audit_universe_id || "")}
                    onValueChange={(value) => updateItemData({ audit_universe_id: value })}
                    options={universeOptions}
                    className="w-full"
                    classNames={{
                      wrapper: "w-full"
                    }}
                  />
                </div>

                {/* Department Selection */}
                <div className="space-y-2">
                  <SelectField
                    id="department_id"
                    label="Department"
                    required
                    placeholder="--Select a department--"
                    value={itemData.department_id || ""}
                    className="w-full"
                    classNames={{
                      wrapper: "w-full"
                    }}
                    onValueChange={(value) => updateItemData({ department_id: value })}
                    options={departmentsOptions}
                  />
                </div>
              </div>

              {/* Process/Activity - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="process_activity" className="text-sm font-medium">
                  Process/Activity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="process_activity"
                  value={itemData.process_activity}
                  onChange={(e) => updateItemData({ process_activity: e.target.value })}
                  placeholder="e.g., Information security policy"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Audit Configuration */}
            <div className="border-t pt-6">
              <h4 className="text-foreground mb-4 text-sm font-semibold">Audit Configuration</h4>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
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
                </div>

                <div className="space-y-2">
                  <SelectField
                    id="auditable_area_id"
                    label="Auditable Area"
                    placeholder="Select an area (optional)"
                    required
                    className="w-full"
                    classNames={{
                      wrapper: "w-full"
                    }}
                    value={itemData.auditable_area_id}
                    onValueChange={(value) => updateItemData({ auditable_area_id: value })}
                    options={auditableAreasOptions}
                  />
                </div>
              </div>
            </div>

            {/* Strategic Alignment */}
            <div className="border-t pt-6">
              <h4 className="text-foreground mb-4 text-sm font-semibold">Strategic Alignment</h4>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <SelectField
                    id="strategic_pillar_id"
                    label="Strategic Pillar"
                    placeholder="Select a pillar (optional)"
                    required
                    className="w-full"
                    classNames={{
                      wrapper: "w-full"
                    }}
                    value={itemData.strategic_pillar_id}
                    onValueChange={(value) =>
                      updateItemData({ strategic_pillar_id: value, strategic_initiative_id: "" })
                    }
                    options={strategicPillarsOptions}
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
                    required
                    className="w-full"
                    classNames={{
                      wrapper: "w-full"
                    }}
                    value={itemData.strategic_initiative_id}
                    onValueChange={(value) => updateItemData({ strategic_initiative_id: value })}
                    disabled={!itemData.strategic_pillar_id}
                    options={strategicInitiativesOptions}
                  />
                </div>
              </div>
            </div>

            {/* Additional Associations */}
            <div className="border-t pt-6">
              <h4 className="text-foreground mb-4 text-sm font-semibold">
                Additional Associations
              </h4>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
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
                  />
                </div>

                <div className="space-y-2">
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

            {/* Status */}
            <div className="border-t pt-6">
              <div className="bg-muted/30 hover:bg-muted/50 flex items-center space-x-3 rounded-lg border p-4 transition-colors">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={itemData.is_active}
                  onChange={(e) => updateItemData({ is_active: e.target.checked })}
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
              onClick={() => router.push("/dashboard/audit/universe")}
              disabled={isSubmitting}
              className="w-full min-w-[120px] sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-w-[180px] gap-2 sm:w-auto">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Universe Item"}
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
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                {universeItemsData.length}
              </span>
            )}
          </div>

          {!itemData.audit_universe_id ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Globe className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">Select a universe to view entries</p>
            </div>
          ) : isLoadingItems ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : !universeItemsData || universeItemsData.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm">No entries yet</p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                Create your first entry using the form
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {universeItemsData.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className="hover:bg-muted/50 group rounded-lg border p-3 transition-colors">
                  <div className="mb-1.5 flex items-start justify-between">
                    <h4 className="text-foreground line-clamp-2 text-sm font-medium">
                      {item.process_activity || "Unnamed Activity"}
                    </h4>
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
    </div>
    );
  }

  // Universe mode
  return (
    // <Card className="animate-fade-in p-8">
    //   <form onSubmit={handleUniverseSubmit} className="space-y-6">
    //     <div>
    //       <h3 className="text-foreground mb-6 text-lg font-semibold">Basic Information</h3>
    //       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    //         <div className="space-y-2 md:col-span-2">
    //           <Label htmlFor="universe_name">
    //             Universe Name <span className="text-destructive">*</span>
    //           </Label>
    //           <Input
    //             id="universe_name"
    //             value={universeData.universe_name}
    //             onChange={(e) => updateUniverseData({ universe_name: e.target.value })}
    //             placeholder="Enter universe name"
    //             required
    //           />
    //         </div>

    //         <DatePicker
    //           label="Start Date"
    //           name="start_date"
    //           value={universeData.start_date as any}
    //           onValueChange={(date) => updateUniverseData({ start_date: date })}
    //           required
    //         />

    //         <DatePicker
    //           label="End Date"
    //           name="end_date"
    //           value={universeData.end_date as any}
    //           onValueChange={(date) => updateUniverseData({ end_date: date })}
    //           required
    //         />

    //         <div className="flex items-center space-x-2">
    //           <input
    //             type="checkbox"
    //             id="is_active"
    //             checked={universeData.is_active}
    //             onChange={(e) => updateUniverseData({ is_active: e.target.checked })}
    //             className="h-4 w-4 rounded border-gray-300"
    //           />
    //           <Label htmlFor="is_active" className="cursor-pointer">
    //             Active
    //           </Label>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="flex justify-end gap-3 border-t pt-6">
    //       <Button
    //         type="button"
    //         variant="outline"
    //         onClick={() => router.push("/dashboard/audit/universe")}
    //         disabled={isSubmitting}>
    //         Cancel
    //       </Button>
    //       <Button type="submit" disabled={isSubmitting} className="gap-2">
    //         <Save className="h-4 w-4" />
    //         {isSubmitting
    //           ? isEditing
    //             ? "Updating..."
    //             : "Creating..."
    //           : isEditing
    //             ? "Update Universe"
    //             : "Create Universe"}
    //       </Button>
    //     </div>
    //   </form>
    // </Card>
    <Card className="animate-fade-in mx-auto w-full max-w-4xl shadow-lg">
      <form onSubmit={handleUniverseSubmit}>
        {/* Header Section */}
        <div className="p-6 pb-0 sm:p-8">
          <h3 className="text-foreground flex items-center gap-2 text-xl font-semibold">
            <span className="bg-primary h-8 w-1 rounded-full"></span>
            Basic Information
          </h3>
          <p className="text-muted-foreground mt-2 ml-3 text-sm">
            Configure the universe details and active period
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-6 p-6 sm:p-8">
          {/* Universe Name - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="universe_name" className="text-sm font-medium">
              Universe Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="universe_name"
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
              <input
                type="checkbox"
                id="is_active"
                checked={universeData.is_active}
                onChange={(e) => updateUniverseData({ is_active: e.target.checked })}
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
            disabled={isSubmitting}
            className="w-full min-w-[120px] sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-w-[160px] gap-2 sm:w-auto">
            <Save className="h-4 w-4" />
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Universe"
                : "Create Universe"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
