"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Workflow,
  Settings,
  Shield,
  Clock,
  Zap,
  Activity,
  GitPullRequestCreateArrow
} from "lucide-react";
import { TransitionRolesManager } from "./transition-roles-manager";
import { TransitionTriggersManager } from "./transition-triggers-manager";
import { EntryTriggersManager } from "./entry-triggers-manager";
import { WorkflowWorkerPanel } from "./workflow-worker-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

interface WorkflowAdministrationProps {
  workflow: {
    id: string;
    name: string;
    entity_type: string;
    states: Array<{ id: string; name: string }>;
    transitions: Array<{
      id: string;
      name: string;
      action_name: string;
      from_state_id: string;
      to_state_id: string;
    }>;
  };
  availableRoles: Array<{ id: string; name: string }>;
}

export const WorkflowAdministration = ({
  workflow,
  availableRoles
}: WorkflowAdministrationProps) => {
  const [selectedTransitionId, setSelectedTransitionId] = useState<string>(
    workflow.transitions?.[0]?.id || ""
  );

  const selectedTransition = workflow?.transitions
    ? workflow?.transitions.find((t) => t.id === selectedTransitionId)
    : undefined;

  const getStateName = (stateId: string) => {
    return workflow.states ? workflow?.states?.find((s) => s.id === stateId)?.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                {workflow.name}
              </CardTitle>
              <CardDescription className="mt-2">
                Advanced workflow configuration and administration
              </CardDescription>
            </div>
            <Badge variant="secondary">{workflow.entity_type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-muted/50 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm font-medium">States</p>
              <p className="mt-1 text-2xl font-bold">{workflow?.states?.length || "N/A"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm font-medium">Transitions</p>
              <p className="mt-1 text-2xl font-bold">{workflow?.transitions?.length || "N/A"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm font-medium">Status</p>
              <p className="mt-1 text-sm font-semibold text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="worker" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="worker" className="gap-2">
            <Activity className="h-4 w-4" />
            Worker
          </TabsTrigger>
          <TabsTrigger value="entry-triggers" className="gap-2">
            <Zap className="h-4 w-4" />
            Entry Triggers
          </TabsTrigger>
          <TabsTrigger value="transitions" className="gap-2">
            <Settings className="h-4 w-4" />
            Transitions
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        {/* Background Worker Tab */}
        <TabsContent value="worker" className="space-y-4">
          <WorkflowWorkerPanel />
        </TabsContent>

        {/* Entry Triggers Tab */}
        <TabsContent value="entry-triggers" className="space-y-4">
          <EntryTriggersManager workflowId={workflow.id} workflowName={workflow.name} />
        </TabsContent>

        {/* Transitions Tab */}
        <TabsContent value="transitions" className="space-y-4">
          {!workflow?.transitions || workflow?.transitions?.length <= 0 ? (
            <>
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <GitPullRequestCreateArrow />
                  </EmptyMedia>
                  <EmptyTitle>No transitions configured.</EmptyTitle>
                  <EmptyDescription>
                    Please add transitions in the workflow editor.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={()=>{
                    //   router.push(`/dashboard/system-configs/workflow/editor?workflow_id=${workflow.id}`);
                    // }}
                  >
                    Update
                  </Button>
                </EmptyContent>
              </Empty>
            </>
          ) : (
            <>
              {/* Transition Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Transition</CardTitle>
                  <CardDescription>Choose a transition to configure its triggers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {workflow?.transitions &&
                      workflow?.transitions?.map((transition) => (
                        <button
                          key={transition.id}
                          onClick={() => setSelectedTransitionId(transition.id)}
                          className={`hover:border-primary rounded-lg border p-4 text-left transition-all ${
                            selectedTransitionId === transition.id
                              ? "border-primary bg-primary/5"
                              : "bg-card"
                          }`}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{transition.action_name}</Badge>
                          </div>
                          <p className="text-muted-foreground mt-2 text-sm">
                            {getStateName(transition.from_state_id)} →{" "}
                            {getStateName(transition.to_state_id)}
                          </p>
                        </button>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transition Triggers Manager */}
              {selectedTransition && (
                <TransitionTriggersManager
                  transitionId={selectedTransition?.id}
                  transitionName={selectedTransition.action_name}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          {!workflow?.transitions || workflow?.transitions?.length <= 0 ? (
            <>
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <GitPullRequestCreateArrow />
                  </EmptyMedia>
                  <EmptyTitle>No transitions configured.</EmptyTitle>
                  <EmptyDescription>
                    Please add transitions in the workflow editor.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={()=>{
                    //   router.push(`/dashboard/system-configs/workflow/editor?workflow_id=${workflow.id}`);
                    // }}
                  >
                    Update
                  </Button>
                </EmptyContent>
              </Empty>
            </>
          ) : (
            <>
              {/* Transition Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Transition</CardTitle>
                  <CardDescription>
                    Choose a transition to manage its role permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {workflow?.transitions?.map((transition) => (
                      <button
                        key={transition.id}
                        onClick={() => setSelectedTransitionId(transition.id)}
                        className={`hover:border-primary rounded-lg border p-4 text-left transition-all ${
                          selectedTransitionId === transition.id
                            ? "border-primary bg-primary/5"
                            : "bg-card"
                        }`}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{transition.action_name}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {getStateName(transition?.from_state_id)} →{" "}
                          {getStateName(transition?.to_state_id)}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transition Roles Manager */}
              {selectedTransition && (
                <TransitionRolesManager
                  transitionId={selectedTransition.id}
                  transitionName={selectedTransition.action_name}
                  availableRoles={availableRoles}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
