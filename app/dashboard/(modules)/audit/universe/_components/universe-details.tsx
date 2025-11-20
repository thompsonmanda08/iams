"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Globe, Send } from "lucide-react";
import { toast } from "sonner";
import { submitUniverseForApproval } from "@/app/_actions/audit-module-actions";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { useRouter } from "next/navigation";
import BackButton from "@/components/back-button";
import { useQueryClient } from "@tanstack/react-query";
import AuditUniverseForm from "./audit-universe-form";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from "@/components/ui/empty";

interface Universe {
  id: string;
  universe_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status?: string;
}

interface UniverseDetailsProps {
  universe: Universe;
  universeItems: any[];
}

const UniverseDetails = ({ universe, universeItems }: UniverseDetailsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showItemForm, setShowItemForm] = useState(false);
  const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeUniverseItems = Array.isArray(universeItems) ? universeItems : [];

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

  const handleSubmitUniverse = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitUniverseForApproval(universe.id);
      if (result.success) {
        toast.success("Universe submitted for approval successfully");
        queryClient.invalidateQueries({ queryKey: ["universes"] });
        router.refresh();
      } else {
        toast.error(result.message || "Failed to submit universe for approval");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the universe");
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setSubmitConfirmationOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Universe Header */}
      <Card className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold">{universe.universe_name}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Manage audit universe details and items
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSubmitConfirmationOpen(true)}
              className="gap-2">
              <Send className="h-4 w-4" />
              Submit for Approval
            </Button>
            <BackButton title="Back to Universes" />
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

      {/* Add Item Form - Using AuditUniverseForm */}
      {showItemForm && (
        <Card className="animate-fade-in bg-muted/20 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-foreground font-semibold">Add New Universe Item</h4>
            <Button variant="outline" size="sm" onClick={() => setShowItemForm(false)}>
              Cancel
            </Button>
          </div>
          <AuditUniverseForm
            mode="item"
            initialData={{ audit_universe_id: universe.id }}
            onSwitchToUniverseTab={() => {}}
            onCancel={() => setShowItemForm(false)}
          />
        </Card>
      )}

      {/* Universe Items Section - Hidden when form is open */}
      {!showItemForm && (
        <Card className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-xl font-bold">Universe Items</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage individual items and audit areas
              </p>
            </div>
            <Button onClick={() => setShowItemForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {safeUniverseItems.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Globe className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Universe Items</EmptyTitle>
                <EmptyDescription>
                  Start by adding your first universe item to this universe.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {safeUniverseItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold">{item.name}</h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Audit Frequency:{" "}
                        <span className="text-foreground font-medium">
                          {item.audit_frequency?.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          item.is_active
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

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
