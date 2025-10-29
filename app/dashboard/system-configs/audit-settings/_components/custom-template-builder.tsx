"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  AlertCircle,
  Settings,
  FileText,
} from "lucide-react";
import type {
  CustomTemplateInput,
  CustomField,
  CustomTemplateSection,
} from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { TICK_MARKS } from "@/lib/data/tick-marks";

interface CustomTemplateBuilderProps {
  onSuccess?: (templateId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<CustomTemplateInput>;
}

const FIELD_TYPES: Array<CustomField["type"]> = [
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "checkbox",
  "file",
];

export function CustomTemplateBuilder({
  onSuccess,
  onCancel,
  initialData,
}: CustomTemplateBuilderProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Template metadata
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [includeEvidenceGrid, setIncludeEvidenceGrid] = useState(
    initialData?.includeEvidenceGrid || false
  );
  const [includeTickMarks, setIncludeTickMarks] = useState(
    initialData?.includeTickMarks || false
  );
  const [defaultTickMarks, setDefaultTickMarks] = useState<string[]>(
    initialData?.defaultTickMarks || []
  );

  // Sections and fields
  const [sections, setSections] = useState<Omit<CustomTemplateSection, "id">[]>(
    initialData?.sections || [
      {
        title: "Basic Information",
        description: "Core workpaper details",
        fields: [],
        order: 0,
      },
    ]
  );

  // Add new section
  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "New Section",
        description: "",
        fields: [],
        order: sections.length,
      },
    ]);
  };

  // Update section
  const updateSection = (index: number, updates: Partial<Omit<CustomTemplateSection, "id">>) => {
    setSections(sections.map((section, i) => (i === index ? { ...section, ...updates } : section)));
  };

  // Delete section
  const deleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // Add field to section
  const addField = (sectionIndex: number) => {
    const newField: Omit<CustomField, "id"> = {
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
      order: sections[sectionIndex].fields.length,
    };

    setSections(
      sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              fields: [...section.fields, { ...newField, id: `field-${Date.now()}` }],
            }
          : section
      )
    );
  };

  // Update field
  const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<CustomField>) => {
    setSections(
      sections.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, fi) =>
                fi === fieldIndex ? { ...field, ...updates } : field
              ),
            }
          : section
      )
    );
  };

  // Delete field
  const deleteField = (sectionIndex: number, fieldIndex: number) => {
    setSections(
      sections.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              fields: section.fields.filter((_, fi) => fi !== fieldIndex),
            }
          : section
      )
    );
  };

  // Validation
  const validateTemplate = (): string | null => {
    if (!name.trim()) return "Template name is required";
    if (!description.trim()) return "Template description is required";
    if (sections.length === 0) return "At least one section is required";

    for (const section of sections) {
      if (!section.title.trim()) return "All sections must have a title";
      if (section.fields.length === 0) return `Section "${section.title}" must have at least one field`;

      for (const field of section.fields) {
        if (!field.label.trim()) return "All fields must have a label";
        if (field.type === "select" && (!field.options || field.options.length === 0)) {
          return `Field "${field.label}" is a select field and must have options`;
        }
      }
    }

    return null;
  };

  // Submit
  const handleSubmit = async () => {
    const error = validateTemplate();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const templateData: CustomTemplateInput = {
      name,
      description,
      type: "custom",
      isPublic,
      includeEvidenceGrid,
      includeTickMarks: includeEvidenceGrid ? includeTickMarks : false,
      defaultTickMarks: includeTickMarks ? defaultTickMarks : undefined,
      sections,
    };

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Success",
        description: "Custom template created successfully",
      });

      const mockTemplateId = `template-${Date.now()}`;
      onSuccess?.(mockTemplateId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Create Custom Template</h2>
          <p className="text-sm text-muted-foreground">
            Build a reusable workpaper template for your team
          </p>
        </div>
      </div>

      {/* Template Metadata */}
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Template Information</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., IT Security Assessment Template"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this template is used for and when to use it..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public">Share with Team</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other team members to use this template
                </p>
              </div>
              <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Additional Features</h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="evidence-grid">Include Evidence Grid</Label>
                  <p className="text-sm text-muted-foreground">
                    Add evidence & testing grid with debits/credits
                  </p>
                </div>
                <Switch
                  id="evidence-grid"
                  checked={includeEvidenceGrid}
                  onCheckedChange={setIncludeEvidenceGrid}
                />
              </div>

              {includeEvidenceGrid && (
                <div className="ml-6 space-y-3 p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="tick-marks">Include Tick Marks</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow tick mark selection in evidence grid
                      </p>
                    </div>
                    <Switch
                      id="tick-marks"
                      checked={includeTickMarks}
                      onCheckedChange={setIncludeTickMarks}
                    />
                  </div>

                  {includeTickMarks && (
                    <div className="space-y-2">
                      <Label>Default Tick Marks (Optional)</Label>
                      <p className="text-xs text-muted-foreground">
                        Pre-select tick marks that users can modify
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {TICK_MARKS.slice(0, 12).map((tm) => (
                          <Button
                            key={tm.code}
                            variant={defaultTickMarks.includes(tm.code) ? "default" : "outline"}
                            size="sm"
                            className="font-mono"
                            onClick={() => {
                              setDefaultTickMarks((prev) =>
                                prev.includes(tm.code)
                                  ? prev.filter((c) => c !== tm.code)
                                  : [...prev, tm.code]
                              );
                            }}
                          >
                            {tm.code}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Template Sections</h3>
          <Button size="sm" onClick={addSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="p-6">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        placeholder="e.g., Scope & Objectives"
                        value={section.title}
                        onChange={(e) =>
                          updateSection(sectionIndex, { title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="Brief description..."
                        value={section.description || ""}
                        onChange={(e) =>
                          updateSection(sectionIndex, { description: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Fields ({section.fields.length})</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addField(sectionIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Field
                      </Button>
                    </div>

                    {section.fields.map((field, fieldIndex) => (
                      <Card key={field.id} className="p-4 bg-slate-50">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-4 space-y-2">
                            <Label className="text-xs">Field Label</Label>
                            <Input
                              placeholder="e.g., Risk Level"
                              value={field.label}
                              onChange={(e) =>
                                updateField(sectionIndex, fieldIndex, {
                                  label: e.target.value,
                                })
                              }
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="col-span-3 space-y-2">
                            <Label className="text-xs">Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                updateField(sectionIndex, fieldIndex, {
                                  type: value as CustomField["type"],
                                })
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-4 space-y-2">
                            <Label className="text-xs">Placeholder</Label>
                            <Input
                              placeholder="Hint text..."
                              value={field.placeholder || ""}
                              onChange={(e) =>
                                updateField(sectionIndex, fieldIndex, {
                                  placeholder: e.target.value,
                                })
                              }
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="col-span-1 flex items-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                updateField(sectionIndex, fieldIndex, {
                                  required: !field.required,
                                })
                              }
                              title={field.required ? "Required" : "Optional"}
                            >
                              {field.required ? (
                                <Badge variant="destructive" className="h-5 px-1 text-xs">
                                  *
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="h-5 px-1 text-xs">
                                  ?
                                </Badge>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => deleteField(sectionIndex, fieldIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Select options */}
                          {field.type === "select" && (
                            <div className="col-span-12 space-y-2">
                              <Label className="text-xs">Options (comma-separated)</Label>
                              <Input
                                placeholder="e.g., Low, Medium, High, Critical"
                                value={field.options?.join(", ") || ""}
                                onChange={(e) =>
                                  updateField(sectionIndex, fieldIndex, {
                                    options: e.target.value.split(",").map((o) => o.trim()),
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {section.fields.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No fields added yet. Click "Add Field" to get started.
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => deleteSection(sectionIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {sections.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No sections added yet</p>
            <Button className="mt-4" onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Section
            </Button>
          </Card>
        )}
      </div>

      {/* Validation Message */}
      {(() => {
        const error = validateTemplate();
        return error ? (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        ) : null;
      })()}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} disabled={isSaving || !!validateTemplate()}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Template...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
