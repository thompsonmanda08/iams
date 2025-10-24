"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClauseTemplates, useCreateClauseTemplate } from "@/hooks/use-audit-query-data";
import type { ClauseTemplate, ClauseCategory, ClauseTemplateInput } from "@/lib/types/audit-types";

interface TemplateSelectorProps {
  onTemplateSelect: (template: ClauseTemplate | null) => void;
  selectedTemplate: ClauseTemplate | null;
}

const CLAUSE_CATEGORIES: ClauseCategory[] = [
  "Context",
  "Leadership",
  "Planning",
  "Support",
  "Operation",
  "Evaluation",
  "Improvement",
  "Annex A",
];

export function TemplateSelector({ onTemplateSelect, selectedTemplate }: TemplateSelectorProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "create">("existing");
  const [open, setOpen] = useState(false);

  // Fetch templates
  const { data: templates, isLoading } = useClauseTemplates();
  const createTemplateMutation = useCreateClauseTemplate();

  // Create new template form state
  const [newTemplate, setNewTemplate] = useState<ClauseTemplateInput>({
    clause: "",
    clauseTitle: "",
    category: "Context",
    objective: "",
    testProcedure: "",
  });

  // Group templates by category
  const groupedTemplates = templates?.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, ClauseTemplate[]>);

  // Handle creating a new template
  const handleCreateTemplate = async () => {
    if (!newTemplate.clause || !newTemplate.clauseTitle || !newTemplate.objective || !newTemplate.testProcedure) {
      return;
    }

    try {
      const createdTemplate = await createTemplateMutation.mutateAsync(newTemplate);

      // Auto-select the newly created template
      onTemplateSelect(createdTemplate);

      // Switch to existing tab and reset form
      setActiveTab("existing");
      setNewTemplate({
        clause: "",
        clauseTitle: "",
        category: "Context",
        objective: "",
        testProcedure: "",
      });
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Failed to create template:", error);
    }
  };

  // Reset form when switching tabs
  useEffect(() => {
    if (activeTab === "create") {
      onTemplateSelect(null);
    }
  }, [activeTab, onTemplateSelect]);

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "create")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Use Existing Template</TabsTrigger>
          <TabsTrigger value="create">Create New Template</TabsTrigger>
        </TabsList>

        {/* Tab 1: Use Existing Template */}
        <TabsContent value="existing" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="template-select">Select Clause Template</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {selectedTemplate
                    ? `${selectedTemplate.clause} - ${selectedTemplate.clauseTitle}`
                    : "Select template..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0">
                <Command>
                  <CommandInput placeholder="Search templates..." />
                  <CommandList>
                    <CommandEmpty>No template found.</CommandEmpty>
                    {groupedTemplates &&
                      Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                        <CommandGroup key={category} heading={category}>
                          {categoryTemplates.map((template) => (
                            <CommandItem
                              key={template.id}
                              value={`${template.clause} ${template.clauseTitle}`}
                              onSelect={() => {
                                onTemplateSelect(template);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTemplate?.id === template.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {template.clause} - {template.clauseTitle}
                                </span>
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {template.objective}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Template preview */}
          {selectedTemplate && (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
              <div>
                <p className="text-xs font-medium text-slate-600">Category</p>
                <p className="text-sm">{selectedTemplate.category}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Objective</p>
                <p className="text-sm text-slate-700">{selectedTemplate.objective}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Test Procedure</p>
                <p className="text-sm text-slate-700">{selectedTemplate.testProcedure}</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Create New Template */}
        <TabsContent value="create" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clause-code">
                  Clause Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clause-code"
                  placeholder="e.g., 5.1"
                  value={newTemplate.clause}
                  onChange={(e) => setNewTemplate({ ...newTemplate, clause: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) =>
                    setNewTemplate({ ...newTemplate, category: value as ClauseCategory })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CLAUSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clause-title">
                Clause Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clause-title"
                placeholder="e.g., Leadership and Commitment"
                value={newTemplate.clauseTitle}
                onChange={(e) => setNewTemplate({ ...newTemplate, clauseTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">
                Default Objective <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="objective"
                placeholder="Describe the audit objective for this clause..."
                rows={4}
                className="resize-none"
                value={newTemplate.objective}
                onChange={(e) => setNewTemplate({ ...newTemplate, objective: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {newTemplate.objective.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-procedure">
                Default Test Procedure <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="test-procedure"
                placeholder="Describe the testing procedure for this clause..."
                rows={5}
                className="resize-none"
                value={newTemplate.testProcedure}
                onChange={(e) => setNewTemplate({ ...newTemplate, testProcedure: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {newTemplate.testProcedure.length} characters
              </p>
            </div>

            <Button
              type="button"
              onClick={handleCreateTemplate}
              disabled={
                !newTemplate.clause ||
                !newTemplate.clauseTitle ||
                !newTemplate.objective ||
                !newTemplate.testProcedure ||
                createTemplateMutation.isPending
              }
              className="w-full"
            >
              {createTemplateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Template...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
