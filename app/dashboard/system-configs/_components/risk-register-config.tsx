"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RegisterType = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type LifecycleStatus = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type AutoArchivalRule = {
  id: string;
  name: string;
  days: number;
  enabled: boolean;
};

export function RiskRegisterConfig() {
  const { toast } = useToast();
  const [editingTypes, setEditingTypes] = useState(false);
  const [editingLifecycle, setEditingLifecycle] = useState(false);
  const [editingRules, setEditingRules] = useState(false);

  const [registerTypes, setRegisterTypes] = useState<RegisterType[]>([
    {
      id: "1",
      name: "Corporate Risk Register",
      description: "Enterprise-wide strategic risks",
      enabled: true
    },
    {
      id: "2",
      name: "Operational Risk Register",
      description: "Day-to-day operational risks",
      enabled: true
    },
    {
      id: "3",
      name: "Project Risk Register",
      description: "Project-specific risks",
      enabled: true
    },
    {
      id: "4",
      name: "IT Risk Register",
      description: "Technology and cybersecurity risks",
      enabled: true
    },
    {
      id: "5",
      name: "Compliance Risk Register",
      description: "Regulatory and compliance risks",
      enabled: true
    },
    {
      id: "6",
      name: "Third-Party Risk Register",
      description: "Vendor and supplier risks",
      enabled: false
    }
  ]);

  const [lifecycleStatuses, setLifecycleStatuses] = useState<LifecycleStatus[]>([
    {
      id: "1",
      name: "Open",
      description: "Active monitoring",
      color: "bg-info/10 text-info border-info/20"
    },
    {
      id: "2",
      name: "Under Review",
      description: "Assessment in progress",
      color: "bg-warning/10 text-warning border-warning/20"
    },
    {
      id: "3",
      name: "Closed",
      description: "Risk no longer relevant",
      color: "bg-success/10 text-success border-success/20"
    },
    {
      id: "4",
      name: "Archived",
      description: "Historical record",
      color: "bg-muted text-muted-foreground border-border"
    }
  ]);

  const [archivalRules, setArchivalRules] = useState<AutoArchivalRule[]>([
    { id: "1", name: "Close after no activity", days: 90, enabled: true },
    { id: "2", name: "Archive closed risks", days: 365, enabled: true },
    { id: "3", name: "Escalate high risks without treatment", days: 30, enabled: true }
  ]);

  const handleSaveTypes = () => {
    setEditingTypes(false);
    toast({
      title: "Register types updated",
      description: "Risk register types have been saved successfully."
    });
  };

  const handleSaveLifecycle = () => {
    setEditingLifecycle(false);
    toast({
      title: "Lifecycle statuses updated",
      description: "Register lifecycle statuses have been saved successfully."
    });
  };

  const handleSaveRules = () => {
    setEditingRules(false);
    toast({
      title: "Archival rules updated",
      description: "Auto-archival rules have been saved successfully."
    });
  };

  const handleToggleRegisterType = (id: string) => {
    setRegisterTypes(
      registerTypes.map((type) => (type.id === id ? { ...type, enabled: !type.enabled } : type))
    );
  };

  const handleToggleRule = (id: string) => {
    setArchivalRules(
      archivalRules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
  };

  const handleAddRegisterType = () => {
    const newType: RegisterType = {
      id: Date.now().toString(),
      name: "New Register Type",
      description: "Description",
      enabled: true
    };
    setRegisterTypes([...registerTypes, newType]);
  };

  const handleDeleteRegisterType = (id: string) => {
    setRegisterTypes(registerTypes.filter((type) => type.id !== id));
  };

  const handleUpdateRegisterType = (
    id: string,
    field: keyof RegisterType,
    value: string | boolean
  ) => {
    setRegisterTypes(
      registerTypes.map((type) => (type.id === id ? { ...type, [field]: value } : type))
    );
  };

  const handleUpdateLifecycleStatus = (id: string, field: keyof LifecycleStatus, value: string) => {
    setLifecycleStatuses(
      lifecycleStatuses.map((status) => (status.id === id ? { ...status, [field]: value } : status))
    );
  };

  const handleUpdateRule = (
    id: string,
    field: keyof AutoArchivalRule,
    value: string | number | boolean
  ) => {
    setArchivalRules(
      archivalRules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule))
    );
  };

  return (
    <div className="space-y-6">
      {/* Register Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Register Types</CardTitle>
              <CardDescription>Configure available risk register categories</CardDescription>
            </div>
            {!editingTypes ? (
              <Button variant="outline" size="sm" onClick={() => setEditingTypes(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddRegisterType()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Type
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingTypes(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveTypes}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registerTypes.map((type) => (
              <div
                key={type.id}
                className="border-border bg-card flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-1 space-y-3">
                  {editingTypes ? (
                    <>
                      <Input
                        value={type.name}
                        onChange={(e) => handleUpdateRegisterType(type.id, "name", e.target.value)}
                        className="font-medium"
                      />
                      <Input
                        value={type.description}
                        onChange={(e) =>
                          handleUpdateRegisterType(type.id, "description", e.target.value)
                        }
                        className="text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground font-medium">{type.name}</h4>
                        {type.enabled && (
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success border-success/20">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{type.description}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={type.enabled}
                    onCheckedChange={() => handleToggleRegisterType(type.id)}
                    disabled={!editingTypes}
                  />
                  {editingTypes && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRegisterType(type.id)}>
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Statuses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Register Lifecycle</CardTitle>
              <CardDescription>Define status progression for risk records</CardDescription>
            </div>
            {!editingLifecycle ? (
              <Button variant="outline" size="sm" onClick={() => setEditingLifecycle(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingLifecycle(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveLifecycle}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lifecycleStatuses.map((status) => (
              <div
                key={status.id}
                className="border-border bg-card flex items-center gap-4 rounded-lg border p-4">
                <Badge variant="outline" className={status.color}>
                  {status.name}
                </Badge>
                <div className="flex-1">
                  {editingLifecycle ? (
                    <Input
                      value={status.description}
                      onChange={(e) =>
                        handleUpdateLifecycleStatus(status.id, "description", e.target.value)
                      }
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">{status.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-archival Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Auto-archival Rules</CardTitle>
              <CardDescription>Automated risk record management policies</CardDescription>
            </div>
            {!editingRules ? (
              <Button variant="outline" size="sm" onClick={() => setEditingRules(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingRules(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveRules}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {archivalRules.map((rule) => (
              <div
                key={rule.id}
                className="border-border bg-card flex items-center gap-4 rounded-lg border p-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-foreground font-medium">{rule.name}</h4>
                    {rule.enabled && (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20">
                        Enabled
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-muted-foreground text-sm">After</Label>
                    {editingRules ? (
                      <Input
                        type="number"
                        value={rule.days}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, "days", Number.parseInt(e.target.value))
                        }
                        className="w-20"
                      />
                    ) : (
                      <span className="text-foreground text-sm font-medium">{rule.days}</span>
                    )}
                    <Label className="text-muted-foreground text-sm">days</Label>
                  </div>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => handleToggleRule(rule.id)}
                  disabled={!editingRules}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
          <CardDescription>Current risk register settings overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <div className="text-foreground text-2xl font-semibold">
                {registerTypes.filter((t) => t.enabled).length}
              </div>
              <div className="text-muted-foreground text-sm">Active Register Types</div>
            </div>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <div className="text-foreground text-2xl font-semibold">
                {lifecycleStatuses.length}
              </div>
              <div className="text-muted-foreground text-sm">Lifecycle Statuses</div>
            </div>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <div className="text-foreground text-2xl font-semibold">
                {archivalRules.filter((r) => r.enabled).length}
              </div>
              <div className="text-muted-foreground text-sm">Active Automation Rules</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
