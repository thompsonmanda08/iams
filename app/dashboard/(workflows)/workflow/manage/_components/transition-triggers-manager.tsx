"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Edit2, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

interface TransitionTrigger {
  id: string;
  trigger_name: string;
  trigger_type: string;
  delay_duration?: string;
}

interface TransitionTriggersManagerProps {
  transitionId: string;
  transitionName: string;
}

const TRIGGER_TYPES = [
  { value: "IMMEDIATE", label: "Immediate" },
  { value: "DELAYED", label: "Delayed" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "CONDITIONAL", label: "Conditional" }
];

export const TransitionTriggersManager = ({
  transitionId,
  transitionName
}: TransitionTriggersManagerProps) => {
  const { checkPermission, hasPermission } = usePermissions();
  const [triggers, setTriggers] = useState<TransitionTrigger[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TransitionTrigger | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form state
  const [triggerName, setTriggerName] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [delayDuration, setDelayDuration] = useState("");

  useEffect(() => {
    fetchTriggers();
  }, [transitionId]);

  const fetchTriggers = async () => {
    setIsFetching(true);
    try {
      const response = await getTransitionTriggers(transitionId);
      if (response.success) {
        setTriggers(response.data || []);
      } else {
        notify({ description: "Failed to fetch transition triggers", type: "error" });
      }
    } catch (error) {
      notify({ description: "Error fetching transition triggers", type: "error" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenDialog = (trigger?: TransitionTrigger) => {
    if (!checkPermission(MODULE_CODES.WORKFLOW_CONFIG, trigger ? "can_edit" : "can_create")) return;
    if (trigger) {
      setEditingTrigger(trigger);
      setTriggerName(trigger.trigger_name);
      setTriggerType(trigger.trigger_type);
      setDelayDuration(trigger.delay_duration || "");
    } else {
      setEditingTrigger(null);
      setTriggerName("");
      setTriggerType("");
      setDelayDuration("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrigger(null);
    setTriggerName("");
    setTriggerType("");
    setDelayDuration("");
  };

  const handleSaveTrigger = async () => {
    if (!triggerName.trim() || !triggerType) {
      notify({ description: "Please fill in all required fields", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      if (editingTrigger) {
        // Update existing trigger
        const response = await updateTransitionTrigger(editingTrigger.id, {
          trigger_name: triggerName,
          delay_duration: delayDuration || undefined
        });
        if (response.success) {
          notify({ description: "Trigger updated successfully", type: "success" });
          handleCloseDialog();
          await fetchTriggers();
        } else {
          notify({ description: response.message || "Failed to update trigger", type: "error" });
        }
      } else {
        // Create new trigger
        const response = await createTransitionTrigger(transitionId, {
          trigger_name: triggerName,
          trigger_type: triggerType,
          delay_duration: delayDuration || undefined
        });
        if (response.success) {
          notify({ description: "Trigger created successfully", type: "success" });
          handleCloseDialog();
          await fetchTriggers();
        } else {
          notify({ description: response.message || "Failed to create trigger", type: "error" });
        }
      }
    } catch (error) {
      notify({ description: "Error saving trigger", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    if (!checkPermission(MODULE_CODES.WORKFLOW_CONFIG, "can_delete")) return;
    if (!confirm("Are you sure you want to delete this trigger?")) return;

    setIsLoading(true);
    try {
      const response = await deleteTransitionTrigger(triggerId);
      if (response.success) {
        notify({ description: "Trigger deleted successfully", type: "success" });
        await fetchTriggers();
      } else {
        notify({ description: response.message || "Failed to delete trigger", type: "error" });
      }
    } catch (error) {
      notify({ description: "Error deleting trigger", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transition Triggers
          </CardTitle>
          <CardDescription>
            Configure automated triggers for the "{transitionName}" transition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Trigger
            </Button>
          </div>

          {/* Triggers List */}
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : triggers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Clock className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2 text-sm">
                No triggers configured for this transition
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Add triggers to automate transition execution
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="bg-card flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{trigger.trigger_name}</h4>
                      <Badge variant="outline">{trigger.trigger_type}</Badge>
                    </div>
                    {trigger.delay_duration && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        Delay: {trigger.delay_duration}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDialog(trigger)}
                      disabled={isLoading}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                      disabled={isLoading}>
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrigger ? "Edit Trigger" : "Create New Trigger"}</DialogTitle>
            <DialogDescription>Configure an automated trigger for the transition</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trigger-name">
                Trigger Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="trigger-name"
                value={triggerName}
                onChange={(e) => setTriggerName(e.target.value)}
                placeholder="e.g., Auto-approve after review"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger-type">
                Trigger Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={triggerType}
                onValueChange={setTriggerType}
                disabled={!!editingTrigger}>
                <SelectTrigger id="trigger-type">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingTrigger && (
                <p className="text-muted-foreground text-xs">
                  Trigger type cannot be changed after creation
                </p>
              )}
            </div>

            {(triggerType === "DELAYED" || triggerType === "SCHEDULED") && (
              <div className="space-y-2">
                <Label htmlFor="delay-duration">Delay Duration</Label>
                <Input
                  id="delay-duration"
                  value={delayDuration}
                  onChange={(e) => setDelayDuration(e.target.value)}
                  placeholder="e.g., 2 days, 5 hours, 30 minutes"
                />
                <p className="text-muted-foreground text-xs">
                  Specify the delay duration (e.g., "2 days", "5 hours")
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveTrigger} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {editingTrigger ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
