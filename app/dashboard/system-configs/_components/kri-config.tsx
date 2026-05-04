"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2, Save, X, TrendingUp, TrendingDown } from "lucide-react";
import { notify } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

import { MODULE_CODES } from "@/lib/constants/module-codes";

type KRI = {
  id: string;
  name: string;
  target: number;
  warning: number;
  critical: number;
  unit: string;
  trend: "up" | "down";
};

type KRICategory = {
  id: string;
  name: string;
  kris: KRI[];
};

export function KRIConfig() {
  const { checkPermission, hasPermission } = usePermissions();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<KRICategory[]>([
    {
      id: "financial",
      name: "Financial KRIs",
      kris: [
        {
          id: "1",
          name: "Days Sales Outstanding (DSO)",
          target: 45,
          warning: 60,
          critical: 75,
          unit: "days",
          trend: "down"
        },
        {
          id: "2",
          name: "Current Ratio",
          target: 2.0,
          warning: 1.5,
          critical: 1.0,
          unit: "ratio",
          trend: "up"
        },
        {
          id: "3",
          name: "Debt-to-Equity Ratio",
          target: 0.5,
          warning: 1.0,
          critical: 1.5,
          unit: "ratio",
          trend: "down"
        },
        {
          id: "4",
          name: "Operating Cash Flow",
          target: 1000000,
          warning: 500000,
          critical: 250000,
          unit: "$",
          trend: "up"
        },
        {
          id: "5",
          name: "Budget Variance",
          target: 5,
          warning: 10,
          critical: 15,
          unit: "%",
          trend: "down"
        }
      ]
    },
    {
      id: "operational",
      name: "Operational KRIs",
      kris: [
        {
          id: "6",
          name: "System Uptime",
          target: 99.9,
          warning: 99.5,
          critical: 99.0,
          unit: "%",
          trend: "up"
        },
        {
          id: "7",
          name: "Process Defect Rate",
          target: 1,
          warning: 3,
          critical: 5,
          unit: "%",
          trend: "down"
        },
        {
          id: "8",
          name: "Employee Turnover Rate",
          target: 10,
          warning: 15,
          critical: 20,
          unit: "%",
          trend: "down"
        },
        {
          id: "9",
          name: "Customer Complaint Rate",
          target: 2,
          warning: 5,
          critical: 10,
          unit: "%",
          trend: "down"
        },
        {
          id: "10",
          name: "Incident Response Time",
          target: 30,
          warning: 60,
          critical: 120,
          unit: "min",
          trend: "down"
        }
      ]
    },
    {
      id: "compliance",
      name: "Compliance KRIs",
      kris: [
        {
          id: "11",
          name: "Audit Finding Count",
          target: 0,
          warning: 3,
          critical: 5,
          unit: "count",
          trend: "down"
        },
        {
          id: "12",
          name: "Policy Exception Rate",
          target: 1,
          warning: 3,
          critical: 5,
          unit: "%",
          trend: "down"
        },
        {
          id: "13",
          name: "Training Completion",
          target: 95,
          warning: 85,
          critical: 75,
          unit: "%",
          trend: "up"
        },
        {
          id: "14",
          name: "Compliance Violations",
          target: 0,
          warning: 1,
          critical: 3,
          unit: "count",
          trend: "down"
        },
        {
          id: "15",
          name: "Regulatory Changes Pending",
          target: 0,
          warning: 3,
          critical: 5,
          unit: "count",
          trend: "down"
        }
      ]
    },
    {
      id: "security",
      name: "IT Security KRIs",
      kris: [
        {
          id: "16",
          name: "Failed Login Attempts",
          target: 10,
          warning: 50,
          critical: 100,
          unit: "count",
          trend: "down"
        },
        {
          id: "17",
          name: "Patch Compliance",
          target: 95,
          warning: 85,
          critical: 75,
          unit: "%",
          trend: "up"
        },
        {
          id: "18",
          name: "Vulnerability Count",
          target: 5,
          warning: 15,
          critical: 30,
          unit: "count",
          trend: "down"
        },
        {
          id: "19",
          name: "Mean Time to Detect (MTTD)",
          target: 15,
          warning: 30,
          critical: 60,
          unit: "min",
          trend: "down"
        },
        {
          id: "20",
          name: "Mean Time to Respond (MTTR)",
          target: 60,
          warning: 120,
          critical: 240,
          unit: "min",
          trend: "down"
        }
      ]
    }
  ]);

  const handleEditCategory = (categoryId: string) => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_configure")) return;
    setEditingCategory(categoryId);
  };

  const handleSaveCategory = (categoryId: string) => {
    setEditingCategory(null);
    notify({
      title: "KRIs updated",
      description: "Key Risk Indicators have been saved successfully.",
      type: "success"
    });
  };

  const handleUpdateKRI = (
    categoryId: string,
    kriId: string,
    field: keyof KRI,
    value: string | number
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              kris: cat.kris.map((kri) => (kri.id === kriId ? { ...kri, [field]: value } : kri))
            }
          : cat
      )
    );
  };

  const handleAddKRI = (categoryId: string) => {
    if (!checkPermission(MODULE_CODES.RISK_MODULE_CONFIGS, "can_configure")) return;
    const newKRI: KRI = {
      id: Date.now().toString(),
      name: "New KRI",
      target: 0,
      warning: 0,
      critical: 0,
      unit: "count",
      trend: "down"
    };
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, kris: [...cat.kris, newKRI] } : cat
      )
    );
  };

  const handleDeleteKRI = (categoryId: string, kriId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              kris: cat.kris.filter((kri) => kri.id !== kriId)
            }
          : cat
      )
    );
  };

  const getThresholdColor = (type: "target" | "warning" | "critical"): string => {
    switch (type) {
      case "target":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold">Key Risk Indicators (KRIs)</h2>
        <p className="text-muted-foreground text-sm">
          Configure metrics to monitor and measure risk exposure
        </p>
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="bg-muted inline-flex h-auto w-full justify-start gap-1 rounded-lg p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="rounded-md px-4 py-2 text-sm">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.kris.length} indicators configured</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {editingCategory === category.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCategory(null)}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSaveCategory(category.id)}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddKRI(category.id)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add KRI
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category.id)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.kris.map((kri) => (
                    <div key={kri.id} className="border-border bg-card rounded-lg border p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {editingCategory === category.id ? (
                              <Input
                                value={kri.name}
                                onChange={(e) =>
                                  handleUpdateKRI(category.id, kri.id, "name", e.target.value)
                                }
                                className="mb-2 font-medium"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <h4 className="text-foreground font-medium">{kri.name}</h4>
                                {kri.trend === "up" ? (
                                  <TrendingUp className="text-success h-4 w-4" />
                                ) : (
                                  <TrendingDown className="text-destructive h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>
                          {editingCategory === category.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteKRI(category.id, kri.id)}>
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Target (Green)</Label>
                            {editingCategory === category.id ? (
                              <Input
                                type="number"
                                value={kri.target}
                                onChange={(e) =>
                                  handleUpdateKRI(
                                    category.id,
                                    kri.id,
                                    "target",
                                    Number.parseFloat(e.target.value)
                                  )
                                }
                              />
                            ) : (
                              <Badge variant="outline" className={getThresholdColor("target")}>
                                {kri.target} {kri.unit}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">
                              Warning (Yellow)
                            </Label>
                            {editingCategory === category.id ? (
                              <Input
                                type="number"
                                value={kri.warning}
                                onChange={(e) =>
                                  handleUpdateKRI(
                                    category.id,
                                    kri.id,
                                    "warning",
                                    Number.parseFloat(e.target.value)
                                  )
                                }
                              />
                            ) : (
                              <Badge variant="outline" className={getThresholdColor("warning")}>
                                {kri.warning} {kri.unit}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Critical (Red)</Label>
                            {editingCategory === category.id ? (
                              <Input
                                type="number"
                                value={kri.critical}
                                onChange={(e) =>
                                  handleUpdateKRI(
                                    category.id,
                                    kri.id,
                                    "critical",
                                    Number.parseFloat(e.target.value)
                                  )
                                }
                              />
                            ) : (
                              <Badge variant="outline" className={getThresholdColor("critical")}>
                                {kri.critical} {kri.unit}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">Unit</Label>
                            {editingCategory === category.id ? (
                              <Input
                                value={kri.unit}
                                onChange={(e) =>
                                  handleUpdateKRI(category.id, kri.id, "unit", e.target.value)
                                }
                              />
                            ) : (
                              <span className="text-foreground text-sm">{kri.unit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Threshold Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Threshold Configuration</CardTitle>
          <CardDescription>Understanding KRI threshold levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-border bg-muted/50 flex items-start gap-3 rounded-lg border p-3">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Green
              </Badge>
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">
                  Target / Within Acceptable Range
                </p>
                <p className="text-muted-foreground text-xs">
                  Performance is meeting or exceeding expectations
                </p>
              </div>
            </div>
            <div className="border-border bg-muted/50 flex items-start gap-3 rounded-lg border p-3">
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                Yellow
              </Badge>
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">
                  Warning Level (80-100% of threshold)
                </p>
                <p className="text-muted-foreground text-xs">
                  Approaching concerning levels, increased monitoring needed
                </p>
              </div>
            </div>
            <div className="border-border bg-muted/50 flex items-start gap-3 rounded-lg border p-3">
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/20">
                Red
              </Badge>
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">
                  Critical / Breach Level ({">"}100% of threshold)
                </p>
                <p className="text-muted-foreground text-xs">
                  Immediate action required, risk exposure is unacceptable
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
