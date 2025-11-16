"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface TransitionRolesManagerProps {
  transitionId: string;
  transitionName: string;
  availableRoles: Array<{ id: string; name: string }>;
}

export const TransitionRolesManager = ({
  transitionId,
  transitionName,
  availableRoles
}: TransitionRolesManagerProps) => {
  const [assignedRoles, setAssignedRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch assigned roles on mount
  useEffect(() => {
    fetchRoles();
  }, [transitionId]);

  const fetchRoles = async () => {
    setIsFetching(true);
    try {
      const response = await getTransitionRoles(transitionId);
      if (response.success) {
        setAssignedRoles(response.data || []);
      } else {
        toast.error("Failed to fetch transition roles");
      }
    } catch (error) {
      toast.error("Error fetching transition roles");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    try {
      const response = await assignRoleToTransition(transitionId, selectedRoleId);
      if (response.success) {
        toast.success("Role assigned successfully");
        setSelectedRoleId("");
        await fetchRoles();
      } else {
        toast.error(response.message || "Failed to assign role");
      }
    } catch (error) {
      toast.error("Error assigning role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to remove this role?")) return;

    setIsLoading(true);
    try {
      const response = await removeRoleFromTransition(transitionId, roleId);
      if (response.success) {
        toast.success("Role removed successfully");
        await fetchRoles();
      } else {
        toast.error(response.message || "Failed to remove role");
      }
    } catch (error) {
      toast.error("Error removing role");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out already assigned roles
  const unassignedRoles = availableRoles.filter(
    (role) => !assignedRoles.some((assigned) => assigned.id === role.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Transition Role Permissions
        </CardTitle>
        <CardDescription>
          Manage which roles can execute the "{transitionName}" transition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assign New Role */}
        <div className="space-y-2">
          <Label>Assign Role</Label>
          <div className="flex gap-2">
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a role to assign" />
              </SelectTrigger>
              <SelectContent>
                {unassignedRoles.length === 0 ? (
                  <div className="text-muted-foreground p-2 text-sm">
                    All roles are already assigned
                  </div>
                ) : (
                  unassignedRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRoleId || isLoading}
              className="gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Assign
            </Button>
          </div>
        </div>

        {/* Assigned Roles List */}
        <div className="space-y-2">
          <Label>Assigned Roles ({assignedRoles.length})</Label>
          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : assignedRoles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Shield className="text-muted-foreground mx-auto h-8 w-8" />
              <p className="text-muted-foreground mt-2 text-sm">
                No roles assigned to this transition
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Assign roles to control who can execute this transition
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-card flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="text-primary h-4 w-4" />
                    <Badge variant="secondary">{role.name}</Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={isLoading}>
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
