"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Zap, Edit2, Loader2, Save, X } from "lucide-react";
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
import { toast } from "sonner";

interface EntryTrigger {
  id: string;
  trigger_name: string;
  trigger_type: string;
}

interface EntryTriggersManagerProps {
  workflowId: string;
  workflowName: string;
}

const ENTRY_TRIGGER_TYPES = [
  { value: "ON_CREATE", label: "On Create" },
  { value: "ON_UPDATE", label: "On Update" },
  { value: "ON_DELETE", label: "On Delete" },
  { value: "MANUAL", label: "Manual" },
  { value: "SCHEDULED", label: "Scheduled" }
];

export const EntryTriggersManager = ({ workflowId, workflowName }: EntryTriggersManagerProps) => {
  const [triggers, setTriggers] = useState<EntryTrigger[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<EntryTrigger | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form state
  const [triggerName, setTriggerName] = useState("");
  const [triggerType, setTriggerType] = useState("");

  useEffect(() => {
    fetchTriggers();
  }, [workflowId]);

  const fetchTriggers = async () => {
    setIsFetching(true);
    try {
      const response = await getWorkflowEntryTriggers(workflowId);
      if (response.success) {
        setTriggers(response.data || []);
      } else {
        toast.error("Failed to fetch entry triggers");
      }
    } catch (error) {
      toast.error("Error fetching entry triggers");
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenDialog = (trigger?: EntryTrigger) => {
    if (trigger) {
      setEditingTrigger(trigger);
      setTriggerName(trigger.trigger_name);
      setTriggerType(trigger.trigger_type);
    } else {
      setEditingTrigger(null);
      setTriggerName("");
      setTriggerType("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrigger(null);
    setTriggerName("");
    setTriggerType("");
  };

  const handleSaveTrigger = async () => {
    if (!triggerName.trim() || !triggerType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (editingTrigger) {
        // Update existing trigger
        const response = await updateEntryTrigger(editingTrigger.id, {
          trigger_name: triggerName
        });
        if (response.success) {
          toast.success("Entry trigger updated successfully");
          handleCloseDialog();
          await fetchTriggers();
        } else {
          toast.error(response.message || "Failed to update entry trigger");
        }
      } else {
        // Create new trigger
        const response = await createEntryTrigger(workflowId, {
          trigger_name: triggerName,
          trigger_type: triggerType
        });
        if (response.success) {
          toast.success("Entry trigger created successfully");
          handleCloseDialog();
          await fetchTriggers();
        } else {
          toast.error(response.message || "Failed to create entry trigger");
        }
      }
    } catch (error) {
      toast.error("Error saving entry trigger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    if (!confirm("Are you sure you want to delete this entry trigger?")) return;

    setIsLoading(true);
    try {
      const response = await deleteEntryTrigger(triggerId);
      if (response.success) {
        toast.success("Entry trigger deleted successfully");
        await fetchTriggers();
      } else {
        toast.error(response.message || "Failed to delete entry trigger");
      }
    } catch (error) {
      toast.error("Error deleting entry trigger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Workflow Entry Triggers
          </CardTitle>
          <CardDescription>
            Configure when the "{workflowName}" workflow should automatically start
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry Trigger
            </Button>
          </div>

          {/* Triggers List */}
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : triggers.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Zap className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2 text-sm">
                No entry triggers configured for this workflow
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Add entry triggers to automatically start workflows when entities are created
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
                      <Zap className="h-4 w-4 text-amber-500" />
                      <h4 className="font-semibold">{trigger.trigger_name}</h4>
                      <Badge variant="outline">{trigger.trigger_type}</Badge>
                    </div>
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
            <DialogTitle>
              {editingTrigger ? "Edit Entry Trigger" : "Create Entry Trigger"}
            </DialogTitle>
            <DialogDescription>
              Configure when this workflow should automatically start
            </DialogDescription>
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
                placeholder="e.g., Start workflow on risk creation"
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
                  {ENTRY_TRIGGER_TYPES.map((type) => (
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

            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-sm">
                <strong>Note:</strong> Entry triggers determine when a workflow instance is
                automatically created for an entity. For example, "On Create" will start a workflow
                whenever a new entity is created.
              </p>
            </div>
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
