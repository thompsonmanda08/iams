"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ResponseStrategy = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type TreatmentStatus = {
  id: string;
  name: string;
  color: string;
};

export function RiskResponseConfig() {
  const { toast } = useToast();
  const [editingStrategies, setEditingStrategies] = useState(false);
  const [editingStatuses, setEditingStatuses] = useState(false);

  const [strategies, setStrategies] = useState<ResponseStrategy[]>([
    {
      id: "1",
      name: "Avoid",
      description: "Eliminate the risk entirely by not engaging in the activity or changing plans",
      color: "bg-destructive/10 text-destructive border-destructive/20"
    },
    {
      id: "2",
      name: "Mitigate",
      description: "Reduce likelihood or impact through controls, processes, or safeguards",
      color: "bg-warning/10 text-warning border-warning/20"
    },
    {
      id: "3",
      name: "Transfer",
      description: "Shift risk to third party through insurance, outsourcing, or contracts",
      color: "bg-info/10 text-info border-info/20"
    },
    {
      id: "4",
      name: "Accept",
      description: "Acknowledge and monitor the risk without active intervention",
      color: "bg-muted text-muted-foreground border-border"
    },
    {
      id: "5",
      name: "Exploit",
      description: "Seize opportunities and maximize positive outcomes (for positive risks)",
      color: "bg-success/10 text-success border-success/20"
    }
  ]);

  const [statuses, setStatuses] = useState<TreatmentStatus[]>([
    { id: "1", name: "Not Started", color: "bg-muted text-muted-foreground" },
    { id: "2", name: "In Progress", color: "bg-info/10 text-info" },
    { id: "3", name: "Completed", color: "bg-success/10 text-success" },
    { id: "4", name: "On Hold", color: "bg-warning/10 text-warning" },
    { id: "5", name: "Cancelled", color: "bg-destructive/10 text-destructive" }
  ]);

  const handleSaveStrategies = () => {
    setEditingStrategies(false);
    toast({
      title: "Response strategies updated",
      description: "Risk response strategies have been saved successfully."
    });
  };

  const handleSaveStatuses = () => {
    setEditingStatuses(false);
    toast({
      title: "Treatment statuses updated",
      description: "Treatment statuses have been saved successfully."
    });
  };

  return (
    <div className="space-y-6">
      {/* Response Strategies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Response Strategies</CardTitle>
              <CardDescription>
                Define available actions for responding to identified risks
              </CardDescription>
            </div>
            {!editingStrategies ? (
              <Button variant="outline" size="sm" onClick={() => setEditingStrategies(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingStrategies(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveStrategies}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="border-border bg-card rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Badge variant="outline" className={strategy.color}>
                    {strategy.name}
                  </Badge>
                </div>
                {editingStrategies ? (
                  <div className="space-y-2">
                    <Label htmlFor={`strategy-${strategy.id}`}>Description</Label>
                    <Textarea
                      id={`strategy-${strategy.id}`}
                      value={strategy.description}
                      onChange={(e) => {
                        setStrategies(
                          strategies.map((s) =>
                            s.id === strategy.id ? { ...s, description: e.target.value } : s
                          )
                        );
                      }}
                      rows={2}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">{strategy.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Treatment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Treatment Status Options</CardTitle>
              <CardDescription>Track the progress of risk treatment activities</CardDescription>
            </div>
            {!editingStatuses ? (
              <Button variant="outline" size="sm" onClick={() => setEditingStatuses(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingStatuses(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveStatuses}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statuses.map((status) => (
              <div
                key={status.id}
                className="border-border bg-card flex items-center justify-center rounded-lg border p-4">
                <Badge variant="outline" className={status.color}>
                  {status.name}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Response Strategy Guidelines</CardTitle>
          <CardDescription>Best practices for selecting appropriate risk responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground space-y-4 text-sm">
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">When to Avoid</h4>
              <p>
                Use when the risk is unacceptable and can be eliminated by changing the approach or
                not proceeding with the activity.
              </p>
            </div>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">When to Mitigate</h4>
              <p>
                Most common strategy. Implement controls to reduce either the likelihood of
                occurrence or the severity of impact.
              </p>
            </div>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">When to Transfer</h4>
              <p>
                Appropriate when another party is better positioned to manage the risk. Common for
                financial and operational risks.
              </p>
            </div>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">When to Accept</h4>
              <p>
                Use when the risk is within appetite or when the cost of treatment exceeds the
                potential impact.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
