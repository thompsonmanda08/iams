'use client';
import { useState } from "react";
import { Plus, GitBranch, Edit, Trash2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WorkflowEditor from "./workflow-editor";
import PageHeader from "@/components/page-header";

const workflows = [
  {
    id: "1",
    name: "Audit Plan Approval",
    entityType: "AUDIT_PLAN",
    states: 5,
    transitions: 8,
    status: "active"
  },
  {
    id: "2",
    name: "Risk Assessment",
    entityType: "RISK",
    states: 4,
    transitions: 6,
    status: "draft"
  }
];

const WorkflowClient = ({ initialData }: any) => {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <WorkflowEditor onBack={() => setIsEditing(false)} />
  ) : (
    <div className="">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageHeader
              title="Workflow Setup"
              description="Configure and manage your workflow processes"
              Icon={Workflow}
            />
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <GitBranch className="text-primary mb-2 h-8 w-8" />
                  <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                    {workflow.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{workflow.name}</CardTitle>
                <CardDescription>{workflow.entityType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">States:</span>
                    <span className="font-medium">{workflow.states}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transitions:</span>
                    <span className="font-medium">{workflow.transitions}</span>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="text-destructive h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get started with workflow configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">1.</span>
                <span>
                  Create a new workflow and select the entity type (Risk, Audit Plan, etc.)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">2.</span>
                <span>
                  Add states to define the steps in your process (Draft, Submitted, Approved)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">3.</span>
                <span>
                  Connect states with transitions and configure permissions, conditions, and actions
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">4.</span>
                <span>
                  Define entry triggers to automatically start workflows when entities are created
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowClient;
