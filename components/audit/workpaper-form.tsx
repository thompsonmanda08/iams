"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { getClauseByNumber } from "@/lib/data/iso27001-clauses";
import type { TestResult, Workpaper } from "@/lib/types/audit-types";
import { useToast } from "@/hooks/use-toast";
import { createWorkpaper, updateWorkpaper } from "@/app/_actions/audit-module-actions";
import { useRouter } from "next/navigation";

interface WorkpaperFormProps {
  auditPlanId: string;
  clauseNumber: string;
  existingWorkpaper?: Workpaper;
  onSuccess?: () => void;
}

export function WorkpaperForm({
  auditPlanId,
  clauseNumber,
  existingWorkpaper,
  onSuccess,
}: WorkpaperFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const clause = getClauseByNumber(clauseNumber);

  const [objectives, setObjectives] = useState(existingWorkpaper?.objectives || "");
  const [testProcedures, setTestProcedures] = useState(existingWorkpaper?.testProcedures || "");
  const [testResults, setTestResults] = useState(existingWorkpaper?.testResults || "");
  const [testResult, setTestResult] = useState<TestResult>(
    existingWorkpaper?.testResult || "conformity"
  );
  const [preparedBy, setPreparedBy] = useState(existingWorkpaper?.preparedBy || "");

  const handleSave = async () => {
    if (!objectives || !testProcedures || !preparedBy) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const workpaperData = {
        auditId: auditPlanId,
        clause: clauseNumber,
        objectives,
        testProcedures,
        testResults,
        testResult,
        preparedBy,
        preparedDate: new Date(),
      };

      const result = existingWorkpaper
        ? await updateWorkpaper(existingWorkpaper.id, workpaperData)
        : await createWorkpaper(workpaperData);

      if (result.success) {
        toast({
          title: "Success",
          description: existingWorkpaper
            ? "Workpaper updated successfully"
            : "Workpaper created successfully",
        });
        router.refresh();
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save workpaper",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getResultIcon = (result: TestResult) => {
    switch (result) {
      case "conformity":
        return <CheckCircle2 className="h-4 w-4" />;
      case "partial-conformity":
        return <MinusCircle className="h-4 w-4" />;
      case "non-conformity":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getResultLabel = (result: TestResult) => {
    switch (result) {
      case "conformity":
        return "Conformity";
      case "partial-conformity":
        return "Partial Conformity";
      case "non-conformity":
        return "Non-Conformity";
    }
  };

  if (!clause) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Clause not found</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Clause Header */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">
              {clause.number} - {clause.title}
            </h3>
            <Badge variant={clause.category === "technical" ? "default" : "secondary"}>
              {clause.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{clause.description}</p>
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          <Label htmlFor="objectives">Audit Objectives *</Label>
          <Textarea
            id="objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Enter the objectives of this audit test..."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Test Procedures */}
        <div className="space-y-2">
          <Label htmlFor="testProcedures">Test Procedures *</Label>
          <Textarea
            id="testProcedures"
            value={testProcedures}
            onChange={(e) => setTestProcedures(e.target.value)}
            placeholder="Describe the testing procedures performed..."
            rows={6}
            className="resize-none"
          />
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <Label htmlFor="testResults">Test Results</Label>
          <Textarea
            id="testResults"
            value={testResults}
            onChange={(e) => setTestResults(e.target.value)}
            placeholder="Document the results of testing..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Test Result Selection */}
        <div className="space-y-3">
          <Label>Test Result *</Label>
          <RadioGroup value={testResult} onValueChange={(value) => setTestResult(value as TestResult)}>
            <div className="grid grid-cols-3 gap-3">
              {(["conformity", "partial-conformity", "non-conformity"] as TestResult[]).map((result) => (
                <div key={result} className="flex items-center space-x-2">
                  <RadioGroupItem value={result} id={result} />
                  <Label htmlFor={result} className="flex items-center gap-2 cursor-pointer font-normal">
                    {getResultIcon(result)}
                    {getResultLabel(result)}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Prepared By */}
        <div className="space-y-2">
          <Label htmlFor="preparedBy">Prepared By *</Label>
          <input
            id="preparedBy"
            type="text"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            placeholder="e.g., John Doe"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t gap-3">
          <Button variant="outline" onClick={() => onSuccess?.()} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {existingWorkpaper ? "Update Workpaper" : "Save Workpaper"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
