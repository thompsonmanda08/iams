"use client";

import { useState, useEffect } from "react";
import { State } from "@/lib/types/workflow";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface StateEditDialogProps {
  state: State | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (state: State) => void;
}

export const StateEditDialog = ({ state, isOpen, onClose, onSave }: StateEditDialogProps) => {
  const [formData, setFormData] = useState<State | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (state) {
      setFormData({ ...state });
    }
  }, [state, isOpen]);

  if (!formData) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call the parent's onSave - if it throws, the dialog won't close
      onSave(formData);
      // Only close if save was successful
      onClose();
    } catch (error) {
      // Error handling is done by parent component (it will show a toast)
      // Dialog stays open so user can fix the issue
      console.error("Error saving state:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent closing dialog by clicking outside or pressing Escape
  const handleOpenChange = (open: boolean) => {
    if (open === false && !isSaving) {
      // Allow closing only via Cancel button
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => {
          // Prevent closing dialog by clicking outside
          if (isSaving) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}>
        <DialogHeader>
          <DialogTitle>Edit State</DialogTitle>
          <DialogDescription>
            Update the state name, description, and properties.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* State Name */}
          <Input
            id="state-name"
            label="State Name"
            required
            placeholder="e.g., Approved"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
            }
          />

          {/* Description */}
          <Textarea
            id="state-description"
            label="Description"
            placeholder="Describe this state..."
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
            }
            className="min-h-20"
          />

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display-order">Display Order</Label>
            <Input
              id="display-order"
              type="number"
              min="0"
              value={formData.display_order ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value) || 0
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the workflow
            </p>
          </div>

          {/* Initial State Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-initial"
              checked={formData.isInitial}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isInitial: checked === true
                })
              }
            />
            <Label htmlFor="is-initial" className="font-normal cursor-pointer">
              Initial State (starting point for the workflow)
            </Label>
          </div>

          {/* Final State Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-final"
              checked={formData.isFinal}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isFinal: checked === true
                })
              }
            />
            <Label htmlFor="is-final" className="font-normal cursor-pointer">
              Final State (end point for the workflow)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim() || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
