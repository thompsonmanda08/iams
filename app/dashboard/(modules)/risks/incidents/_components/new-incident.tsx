"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { Department, User } from "@/lib/types/risk-type";
import { getDepartments, getRiskCausesHierarchy } from "@/app/_actions/config-actions";
import { toast } from "sonner";
import { getUsers } from "@/app/_actions/user-actions";
import { createIncident } from "@/app/_actions/incident-actions";

export function NewIncident() {
  const [formData, setFormData] = useState({
    department_id: "",
    primary_cause_id: "",
    specific_cause_id: "",
    materiality: "",
    incident_date: undefined as Date | undefined,
    discovery_date: undefined as Date | undefined,
    location: "",
    details: "",
    root_cause: "",
    action_plan: "",
    due_date: undefined as Date | undefined,
    responsible_person_id: "",
    financial_loss_implications: ""
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [causes, setCauses] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCauses, setLoadingCauses] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load functions
  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await getDepartments({ isActive: true });
      if (response.success && response.data?.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      toast.error("Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadUsers = async (departmentId: string) => {
    setLoadingUsers(true);
    try {
      const response = await getUsers({
        departmentId: departmentId,
        isActive: true
      });
      if (response.success && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error("Error loading users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCauses = async () => {
    setLoadingCauses(true);
    try {
      const response = await getRiskCausesHierarchy();
      console.log("CAUSES:", response);

      if (response.success && response.data) {
        setCauses(response.data);
      }
    } catch (error) {
      toast.error("Error loading causes");
    } finally {
      setLoadingCauses(false);
    }
  };

  const materiality = [
    { name: "LOW", id: "LOW" },
    { name: "MEDIUM", id: "MEDIUM" },
    { name: "HIGH", id: "HIGH" },
    { name: "CRITICAL", id: "CRITICAL" }
  ];
  const implications = [
    { name: "YES", id: "YES" },
    { name: "NO", id: "NO" }
  ];

  // Computed values
  const availableSubCauses = useMemo(() => {
    if (!formData.primary_cause_id) return [];
    const selectedCause = causes.find((process) => process.id === formData.primary_cause_id);
    return selectedCause?.sub_causes || [];
  }, [formData.primary_cause_id, causes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await createIncident(formData);
      if (response.success) {
        toast.success(response.message || "Risk register created successfully");
        setFormData({
          department_id: "",
          primary_cause_id: "",
          specific_cause_id: "",
          materiality: "",
          incident_date: undefined as Date | undefined,
          discovery_date: undefined as Date | undefined,
          location: "",
          details: "",
          root_cause: "",
          action_plan: "",
          due_date: undefined as Date | undefined,
          responsible_person_id: "",
          financial_loss_implications: ""
        });
      } else {
        toast.error(response.message || "Failed to create risk register");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadCauses();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      loadUsers(formData.department_id);
    } else {
      setUsers([]);
    }
  }, [formData.department_id]);

  const departmentUser = users.map((user) => ({
    name: `${user.first_name} ${user.last_name}`,
    id: user.id
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          New Incident
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SearchSelectField
              label="Department"
              required
              placeholder="Select department "
              options={departments}
              value={formData.department_id}
              onValueChange={(value) => setFormData({ ...formData, department_id: value })}
              isLoading={loadingDepartments}
              isDisabled={isLoading || loadingDepartments}
              classNames={{ wrapper: "max-w-full" }}
            />

            <SearchSelectField
              label="Materiality"
              required
              placeholder="Select materiality"
              options={materiality as any}
              value={formData.materiality}
              onValueChange={(value) => setFormData({ ...formData, materiality: value })}
              classNames={{ wrapper: "max-w-full" }}
              isDisabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* <div className="space-y-2">
              <Label htmlFor="cause1">Primary Cause</Label>
              <Select
                value={formData.cause1}
                onValueChange={(value) => setFormData({ ...formData, cause1: value })}>
                <SelectTrigger id="cause1" className="w-full">
                  <SelectValue placeholder="Select cause 1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="human-error">Human Error</SelectItem>
                  <SelectItem value="system-failure">System Failure</SelectItem>
                  <SelectItem value="process-gap">Process Gap</SelectItem>
                  <SelectItem value="external-factor">External Factor</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* <div className="space-y-2">
              <Label htmlFor="cause2">Specific Cause</Label>
              <Select
                value={formData.cause2}
                onValueChange={(value) => setFormData({ ...formData, cause2: value })}>
                <SelectTrigger id="cause2" className="w-full">
                  <SelectValue placeholder="Select cause 2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Lack of Training</SelectItem>
                  <SelectItem value="documentation">Poor Documentation</SelectItem>
                  <SelectItem value="communication">Communication Breakdown</SelectItem>
                  <SelectItem value="resources">Insufficient Resources</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <SearchSelectField
              label="Primary Cause"
              required
              placeholder="Select primary cause"
              options={causes}
              value={formData.primary_cause_id}
              onValueChange={(value) => setFormData({ ...formData, primary_cause_id: value })}
              isLoading={loadingCauses}
              isDisabled={isLoading || loadingCauses}
              classNames={{ wrapper: "max-w-full" }}
            />
            <SearchSelectField
              label="Sub Process"
              required
              placeholder={
                !formData.primary_cause_id ? "Select macro process first" : "Select sub process"
              }
              options={availableSubCauses}
              value={formData.specific_cause_id}
              onValueChange={(value) => setFormData({ ...formData, specific_cause_id: value })}
              isLoading={loadingCauses}
              isDisabled={isLoading || loadingCauses || !formData.primary_cause_id}
              classNames={{ wrapper: "max-w-full" }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="incident-date">Incident Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="incident-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.incident_date && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.incident_date ? (
                      format(formData.incident_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.incident_date}
                    onSelect={(date) => setFormData({ ...formData, incident_date: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discovery-date">Discovery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="discovery-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.discovery_date && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.discovery_date ? (
                      format(formData.discovery_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.discovery_date}
                    onSelect={(date) => setFormData({ ...formData, discovery_date: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where the incident happened"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Incident Details</Label>
            <Textarea
              id="details"
              placeholder="What happened? When did it happen? Where did it happen? How did it happen?"
              rows={6}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="root-cause">Root Cause</Label>
              <Input
                id="root-cause"
                placeholder="What caused the incident?"
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-plan">Action Plan</Label>
              <Input
                id="action-plan"
                placeholder="The resolution"
                value={formData.action_plan}
                onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(formData.due_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData({ ...formData, due_date: date })}
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <SearchSelectField
              label="Responsible Person"
              required
              placeholder="Select responsible person"
              options={departmentUser}
              value={formData.responsible_person_id}
              onValueChange={(value) => setFormData({ ...formData, responsible_person_id: value })}
              isLoading={loadingUsers}
              isDisabled={isLoading || loadingUsers}
              classNames={{ wrapper: "max-w-full" }}
            />
          </div>
          <SearchSelectField
            label="Does this incident have financial loss implications?"
            required
            placeholder="Select financial loss implications"
            options={implications}
            value={formData.financial_loss_implications}
            onValueChange={(value) =>
              setFormData({ ...formData, financial_loss_implications: value })
            }
            isDisabled={isLoading}
            classNames={{ wrapper: "max-w-full" }}
          />

          <Button type="submit" size="lg">
            {isLoading ? "Creating Incident..." : "Submit Incident"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
