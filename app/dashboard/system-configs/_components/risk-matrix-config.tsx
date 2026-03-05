"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, X } from "lucide-react";
import { notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

type ScaleItem = {
  value: number;
  label: string;
  description: string;
};

export function RiskMatrixConfig() {
  const { checkPermission } = usePermissions();
  const [editingLikelihood, setEditingLikelihood] = useState(false);
  const [editingImpact, setEditingImpact] = useState(false);

  const [likelihoodScale, setLikelihoodScale] = useState<ScaleItem[]>([
    { value: 1, label: "Very Rare", description: "Once in 10+ years" },
    { value: 2, label: "Rare", description: "Once in 5-10 years" },
    { value: 3, label: "Possible", description: "Once in 2-5 years" },
    { value: 4, label: "Likely", description: "Once in 1-2 years" },
    { value: 5, label: "Almost Certain", description: "Multiple times per year" }
  ]);

  const [impactScale, setImpactScale] = useState<ScaleItem[]>([
    { value: 1, label: "Insignificant", description: "< $10,000 loss" },
    { value: 2, label: "Minor", description: "$10,000 - $50,000 loss" },
    { value: 3, label: "Moderate", description: "$50,000 - $250,000 loss" },
    { value: 4, label: "Major", description: "$250,000 - $1M loss" },
    { value: 5, label: "Catastrophic", description: "> $1M loss" }
  ]);

  const getRiskLevel = (likelihood: number, impact: number): string => {
    const score = likelihood * impact;
    if (score <= 3) return "Low";
    if (score <= 6) return "Medium";
    if (score <= 12) return "High";
    return "Critical";
  };

  const getRiskColor = (level: string): string => {
    switch (level) {
      case "Low":
        return "bg-success/10 text-success border-success/20";
      case "Medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "High":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Critical":
        return "bg-destructive/20 text-destructive border-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSaveLikelihood = () => {
    setEditingLikelihood(false);
    notify({
      title: "Likelihood scale updated",
      description: "Risk likelihood scale has been saved successfully.",
      type: "success"
    });
  };

  const handleSaveImpact = () => {
    setEditingImpact(false);
    notify({
      title: "Impact scale updated",
      description: "Risk impact scale has been saved successfully.",
      type: "success"
    });
  };

  return (
    <div className="space-y-6">
      {/* Likelihood Scale */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Likelihood Scale</CardTitle>
              <CardDescription>Define the probability levels for risk occurrence</CardDescription>
            </div>
            {!editingLikelihood ? (
              <Button variant="outline" size="sm" onClick={() => {
                if (!checkPermission("RISK_MODULE_CONFIGS", "can_configure")) return;
                setEditingLikelihood(true);
              }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingLikelihood(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveLikelihood}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {likelihoodScale.map((item) => (
              <div
                key={item.value}
                className="border-border bg-card flex items-center gap-4 rounded-lg border p-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md font-semibold">
                  {item.value}
                </div>
                <div className="flex-1 space-y-2">
                  {editingLikelihood ? (
                    <>
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const newScale = [...likelihoodScale];
                          newScale[item.value - 1].label = e.target.value;
                          setLikelihoodScale(newScale);
                        }}
                        className="font-medium"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newScale = [...likelihoodScale];
                          newScale[item.value - 1].description = e.target.value;
                          setLikelihoodScale(newScale);
                        }}
                        className="text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-foreground font-medium">{item.label}</div>
                      <div className="text-muted-foreground text-sm">{item.description}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Scale */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Impact Scale</CardTitle>
              <CardDescription>Define the severity levels for risk consequences</CardDescription>
            </div>
            {!editingImpact ? (
              <Button variant="outline" size="sm" onClick={() => {
                if (!checkPermission("RISK_MODULE_CONFIGS", "can_configure")) return;
                setEditingImpact(true);
              }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingImpact(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveImpact}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {impactScale.map((item) => (
              <div
                key={item.value}
                className="border-border bg-card flex items-center gap-4 rounded-lg border p-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md font-semibold">
                  {item.value}
                </div>
                <div className="flex-1 space-y-2">
                  {editingImpact ? (
                    <>
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const newScale = [...impactScale];
                          newScale[item.value - 1].label = e.target.value;
                          setImpactScale(newScale);
                        }}
                        className="font-medium"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newScale = [...impactScale];
                          newScale[item.value - 1].description = e.target.value;
                          setImpactScale(newScale);
                        }}
                        className="text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-foreground font-medium">{item.label}</div>
                      <div className="text-muted-foreground text-sm">{item.description}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Score Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Score Matrix</CardTitle>
          <CardDescription>Likelihood × Impact = Risk Score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-border bg-muted border p-3 text-left text-sm font-medium">
                    Likelihood → Impact
                  </th>
                  {impactScale.map((impact) => (
                    <th
                      key={impact.value}
                      className="border-border bg-muted border p-3 text-center text-sm font-medium">
                      {impact.value}
                      <div className="text-muted-foreground text-xs font-normal">
                        {impact.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {likelihoodScale.map((likelihood) => (
                  <tr key={likelihood.value}>
                    <td className="border-border bg-muted border p-3 text-sm font-medium">
                      {likelihood.value} - {likelihood.label}
                    </td>
                    {impactScale.map((impact) => {
                      const level = getRiskLevel(likelihood.value, impact.value);
                      const score = likelihood.value * impact.value;
                      return (
                        <td key={impact.value} className="border-border border p-3 text-center">
                          <Badge variant="outline" className={getRiskColor(level)}>
                            {level} ({score})
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Low (1-3)
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                Medium (4-6)
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/20">
                High (8-12)
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-destructive/20 text-destructive border-destructive">
                Critical (15-25)
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
