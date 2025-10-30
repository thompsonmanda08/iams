"use client";
import { useState } from "react";
import { Plus, X, ChevronDown, ChevronUp, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { mockAuditUniverses } from "./audit-universe-list";
import { AuditUniverse, AuditUniverseEntry } from "@/lib/types/audit-types";
import { useRouter } from "next/navigation";

export default function AuditUniverseForm({
  initialData,
  universeId
}: {
  initialData?: AuditUniverse | null;
  universeId?: string;
}) {
  const router = useRouter();
  const isEditing = !!universeId;

  const existingData = isEditing ? mockAuditUniverses.find((u) => u.id === universeId) : null;

  const [universeName, setUniverseName] = useState(existingData?.universeName || "");
  const [startDate, setStartDate] = useState(
    existingData?.startDate ? existingData.startDate.split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    existingData?.endDate ? existingData.endDate.split("T")[0] : ""
  );
  const [entries, setEntries] = useState<AuditUniverseEntry[]>(existingData?.entries || []);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const addEntry = () => {
    const newEntry: AuditUniverseEntry = {
      id: `entry-${Date.now()}`,
      entryName: "",
      functionalArea: "",
      strategicPillar: "",
      auditableArea: "",
      associatedRisk: "",
      indicativeTarget: "",
      strategicInitiative: "",
      processActivity: ""
    };
    setEntries([...entries, newEntry]);
    setExpandedEntries(new Set([...expandedEntries, newEntry.id]));
  };

  const removeEntry = (entryId: string) => {
    setEntries(entries.filter((e) => e.id !== entryId));
    const newExpanded = new Set(expandedEntries);
    newExpanded.delete(entryId);
    setExpandedEntries(newExpanded);
  };

  const updateEntry = (entryId: string, field: keyof AuditUniverseEntry, value: string) => {
    setEntries(entries.map((e) => (e.id === entryId ? { ...e, [field]: value } : e)));
  };

  const toggleEntry = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handleSave = () => {
    if (!universeName.trim()) {
      toast.error("Please enter a universe name");
      return;
    }
    toast.success("Changes saved successfully");
  };

  const handleSubmitForApproval = () => {
    if (!universeName.trim()) {
      toast.error("Please enter a universe name");
      return;
    }
    toast.success("Submitted for approval successfully");
    router.push("/");
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-4xl font-bold tracking-tight">
              {isEditing ? "Update Audit Universe" : "Create New Audit Universe"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isEditing
                ? "Modify existing audit universe details"
                : "Set up a new audit universe with entries"}
            </p>
          </div>
          {isEditing && (
            <Button onClick={handleSubmitForApproval} size="sm">
              <Send className="h-5 w-5" />
              Submit for Approval
            </Button>
          )}
        </div>

        <Card className="animate-fade-in shadow-lg">
          <div className="space-y-8 p-8">
            <div>
              <h3 className="text-foreground mb-6 text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Input
                    id="universeName"
                    label="Universe Name"
                    required
                    value={universeName}
                    onChange={(e) => setUniverseName(e.target.value)}
                    placeholder="Enter universe name"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">Universe Entries</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Add and manage individual entries for this universe
                  </p>
                </div>
                <Button onClick={addEntry} size="lg" className="gap-2 shadow-md">
                  <Plus className="h-5 w-5" />
                  Add Entry
                </Button>
              </div>

              <div className="space-y-4">
                {entries.length === 0 ? (
                  <div className="text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Plus className="text-muted-foreground/50 h-12 w-12" />
                      <p className="font-medium">No entries yet</p>
                      <p className="text-sm">
                        Click "Add Entry" to create your first universe entry
                      </p>
                    </div>
                  </div>
                ) : (
                  entries.map((entry, index) => (
                    <Card
                      key={entry.id}
                      className="overflow-hidden shadow-md transition-shadow hover:shadow-lg">
                      <div
                        className="bg-muted/20 hover:bg-muted/30 flex cursor-pointer items-center justify-between p-5 transition-colors"
                        onClick={() => toggleEntry(entry.id)}>
                        <div className="flex items-center gap-3">
                          {expandedEntries.has(entry.id) ? (
                            <ChevronUp className="text-primary h-5 w-5" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-5 w-5" />
                          )}
                          <div>
                            <h4 className="text-foreground font-semibold">
                              {entry.entryName || `Universe Entry ${index + 1}`}
                            </h4>
                            {entry.functionalArea && (
                              <p className="text-muted-foreground mt-0.5 text-sm">
                                {entry.functionalArea}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntry(entry.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5">
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>

                      {expandedEntries.has(entry.id) && (
                        <div className="bg-card animate-accordion-down space-y-6 border-t p-8">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Universe Entry Name</Label>
                              <Input
                                value={entry.entryName}
                                onChange={(e) => updateEntry(entry.id, "entryName", e.target.value)}
                                placeholder="Enter entry name"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Functional Area</Label>
                              <Input
                                value={entry.functionalArea}
                                onChange={(e) =>
                                  updateEntry(entry.id, "functionalArea", e.target.value)
                                }
                                placeholder="e.g., Information Technology"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Strategic Pillar</Label>
                              <Input
                                value={entry.strategicPillar}
                                onChange={(e) =>
                                  updateEntry(entry.id, "strategicPillar", e.target.value)
                                }
                                placeholder="e.g., Digital Infrastructure Excellence"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Auditable Area</Label>
                              <Input
                                value={entry.auditableArea}
                                onChange={(e) =>
                                  updateEntry(entry.id, "auditableArea", e.target.value)
                                }
                                placeholder="e.g., Cloud Computing azure stack"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Associated Risk</Label>
                              <Input
                                value={entry.associatedRisk}
                                onChange={(e) =>
                                  updateEntry(entry.id, "associatedRisk", e.target.value)
                                }
                                placeholder="Enter associated risk"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Indicative Target</Label>
                              <Input
                                value={entry.indicativeTarget}
                                onChange={(e) =>
                                  updateEntry(entry.id, "indicativeTarget", e.target.value)
                                }
                                placeholder="e.g., Launch SOC by 2025"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Strategic Initiative</Label>
                              <Input
                                value={entry.strategicInitiative}
                                onChange={(e) =>
                                  updateEntry(entry.id, "strategicInitiative", e.target.value)
                                }
                                placeholder="e.g., Automation of key business process"
                                className="h-10"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Process/Activity</Label>
                              <Input
                                value={entry.processActivity}
                                onChange={(e) =>
                                  updateEntry(entry.id, "processActivity", e.target.value)
                                }
                                placeholder="e.g., information security policy"
                                className="h-10"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-8">
              <Button variant="outline" onClick={() => router.push("/")} size="lg">
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2 shadow-md" size="lg">
                <Save className="h-5 w-5" />
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
