"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, X } from "lucide-react";
import { notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

import { PermissionButton } from "@/components/ui/permission-button";

type AppetiteLevel = {
  category: string;
  appetite: string;
  maxScore: number;
  description: string;
};

export function RiskAppetiteConfig() {
  const { checkPermission, hasPermission } = usePermissions();
  const [editing, setEditing] = useState(false);

  const [appetiteLevels, setAppetiteLevels] = useState<AppetiteLevel[]>([
    { category: "Strategic", appetite: "High", maxScore: 15, description: "Innovation-driven" },
    { category: "Operational", appetite: "Medium", maxScore: 10, description: "Balanced approach" },
    { category: "Financial", appetite: "Low", maxScore: 6, description: "Conservative" },
    { category: "Compliance", appetite: "Very Low", maxScore: 3, description: "Zero tolerance" },
    { category: "IT Security", appetite: "Very Low", maxScore: 4, description: "Strict controls" },
    { category: "ESG", appetite: "Low", maxScore: 6, description: "Cautious approach" }
  ]);

  const getAppetiteColor = (appetite: string): string => {
    switch (appetite) {
      case "Very Low":
        return "bg-success/10 text-success border-success/20";
      case "Low":
        return "bg-info/10 text-info border-info/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getToleranceLevel = (
    currentScore: number,
    maxScore: number
  ): { level: string; color: string } => {
    if (currentScore <= maxScore) {
      return { level: "Acceptable", color: "bg-success/10 text-success border-success/20" };
    } else if (currentScore <= maxScore + 3) {
      return { level: "Elevated", color: "bg-warning/10 text-warning border-warning/20" };
    } else {
      return {
        level: "Unacceptable",
        color: "bg-destructive/10 text-destructive border-destructive/20"
      };
    }
  };

  const handleSave = () => {
    setEditing(false);
    notify({
      title: "Risk appetite updated",
      description: "Risk appetite levels have been saved successfully.",
      type: "success"
    });
  };

  const handleUpdateAppetite = (
    index: number,
    field: keyof AppetiteLevel,
    value: string | number
  ) => {
    const newLevels = [...appetiteLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setAppetiteLevels(newLevels);
  };

  return (
    <div className="space-y-6">
      {/* Risk Appetite Levels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Appetite by Category</CardTitle>
              <CardDescription>Define acceptable risk levels for each category</CardDescription>
            </div>
            {!editing ? (
              <PermissionButton moduleCode={MODULE_CODES.RISK_MODULE_CONFIGS} action="can_configure" variant="outline" size="sm" onClick={() => {
  setEditing(true);
}}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </PermissionButton>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Category
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Appetite
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Max Score
                  </th>
                  <th className="text-muted-foreground pb-3 text-left text-sm font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {appetiteLevels.map((level, index) => (
                  <tr key={level.category} className="border-border border-b">
                    <td className="text-foreground py-4 font-medium">{level.category}</td>
                    <td className="py-4">
                      {editing ? (
                        <Select
                          value={level.appetite}
                          onValueChange={(value) => handleUpdateAppetite(index, "appetite", value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Very Low">Very Low</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={getAppetiteColor(level.appetite)}>
                          {level.appetite}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4">
                      {editing ? (
                        <Input
                          type="number"
                          value={level.maxScore}
                          onChange={(e) =>
                            handleUpdateAppetite(index, "maxScore", Number.parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                      ) : (
                        <span className="text-foreground">{level.maxScore}</span>
                      )}
                    </td>
                    <td className="py-4">
                      {editing ? (
                        <Input
                          value={level.description}
                          onChange={(e) =>
                            handleUpdateAppetite(index, "description", e.target.value)
                          }
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">{level.description}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tolerance Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Tolerance Thresholds</CardTitle>
          <CardDescription>Define when risks exceed acceptable levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-border bg-card rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Acceptable
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Risk score is within the defined appetite for the category
              </p>
            </div>
            <div className="border-border bg-card rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  Elevated
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Risk score is 1-3 points above appetite - requires attention
              </p>
            </div>
            <div className="border-border bg-card rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20">
                  Unacceptable
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Risk score is 4+ points above appetite - immediate action required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Example Risk Scenarios</CardTitle>
          <CardDescription>See how different risk scores compare to appetite</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appetiteLevels.slice(0, 3).map((level) => {
              const scenarios = [
                { score: level.maxScore - 2, label: "Low risk" },
                { score: level.maxScore, label: "At appetite" },
                { score: level.maxScore + 2, label: "Elevated" },
                { score: level.maxScore + 5, label: "Unacceptable" }
              ];

              return (
                <div
                  key={level.category}
                  className="border-border bg-muted/50 rounded-lg border p-4">
                  <div className="text-foreground mb-3 font-medium">{level.category}</div>
                  <div className="flex flex-wrap gap-2">
                    {scenarios.map((scenario) => {
                      const tolerance = getToleranceLevel(scenario.score, level.maxScore);
                      return (
                        <div key={scenario.label} className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            Score {scenario.score}:
                          </span>
                          <Badge variant="outline" className={tolerance.color}>
                            {tolerance.level}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
