"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { getClauseByNumber } from "@/lib/config/iso27001-clauses";
import type { TestResult, Workpaper } from "@/lib/types/audit-types";
import { createWorkpaper, updateWorkpaper } from "@/app/_actions/audit-module-actions";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/utils";

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
  onSuccess
}: WorkpaperFormProps) {
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
      notify({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        type: "error"
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
        preparedDate: new Date()
      };

      const result = existingWorkpaper
        ? await updateWorkpaper(existingWorkpaper.id, workpaperData)
        : await createWorkpaper(workpaperData);

      if (result.success) {
        notify({
          title: "Success",
          type: "success",
          description: existingWorkpaper
            ? "Workpaper updated successfully"
            : "Workpaper created successfully"
        });
        router.refresh();
        onSuccess?.();
      } else {
        notify({
          title: "Error",
          type: "error",
          description: result.message || "Failed to save workpaper"
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        type: "error",
        description: "An unexpected error occurred"
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
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {clause.number} - {clause.title}
            </h3>
            <Badge variant={clause.category === "technical" ? "default" : "secondary"}>
              {clause.category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{clause.description}</p>
        </div>

        {/* Objectives */}
        <Textarea
          id="objectives"
          label="Audit Objectives"
          required
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          placeholder="Enter the objectives of this audit test..."
          rows={3}
          className="resize-none"
        />

        {/* Test Procedures */}
        <Textarea
          id="testProcedures"
          label="Test Procedures"
          required
          value={testProcedures}
          onChange={(e) => setTestProcedures(e.target.value)}
          placeholder="Describe the testing procedures performed..."
          rows={6}
          className="resize-none"
        />

        {/* Test Results */}
        <Textarea
          id="testResults"
          label="Test Results"
          value={testResults}
          onChange={(e) => setTestResults(e.target.value)}
          placeholder="Document the results of testing..."
          rows={4}
          className="resize-none"
        />

        {/* Test Result Selection */}
        <div className="space-y-3">
          <Label>Test Result *</Label>
          <RadioGroup
            value={testResult}
            onValueChange={(value) => setTestResult(value as TestResult)}>
            <div className="grid grid-cols-3 gap-3">
              {(["conformity", "partial-conformity", "non-conformity"] as TestResult[]).map(
                (result) => (
                  <div key={result} className="flex items-center space-x-2">
                    <RadioGroupItem value={result} id={result} />
                    <Label
                      htmlFor={result}
                      className="flex cursor-pointer items-center gap-2 font-normal">
                      {getResultIcon(result)}
                      {getResultLabel(result)}
                    </Label>
                  </div>
                )
              )}
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
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={() => onSuccess?.()} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {existingWorkpaper ? "Update Workpaper" : "Save Workpaper"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
