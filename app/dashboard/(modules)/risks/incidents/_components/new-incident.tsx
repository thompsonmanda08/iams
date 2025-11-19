"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { getKRIs } from "@/app/_actions/risk-module-actions";

export function NewIncident() {
  const [formData, setFormData] = useState({
    department_id: "",
    primary_cause_id: "",
    specific_cause_id: "",
    kri_id: "",
    materiality: "",
    incident_date: undefined as Date | undefined,
    discovery_date: undefined as Date | undefined,
    location: "",
    details: "",
    root_cause: "",
    action_plan: "",
    due_date: undefined as Date | undefined,
    responsible_person_id: "",
    financial_loss_implications: "",
    measured_value: 0
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [causes, setCauses] = useState<any[]>([]);
  const [kris, setKris] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCauses, setLoadingCauses] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingKRIs, setLoadingKRIs] = useState(false);

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

      if (response.success && response.data) {
        setCauses(response.data);
      }
    } catch (error) {
      toast.error("Error loading causes");
    } finally {
      setLoadingCauses(false);
    }
  };

  const loadKRIs = async (departmentId: string) => {
    setLoadingKRIs(true);
    try {
      const response = await getKRIs({
        department_id: departmentId
      });

      if (response.success && response.data?.data) {
        setKris(response.data.data);
      } else {
        setKris([]);
      }
    } catch (error) {
      toast.error("Error loading KRIs");
      setKris([]);
    } finally {
      setLoadingKRIs(false);
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
        toast.success(response.message || "Incident created successfully");
        setFormData({
          department_id: "",
          primary_cause_id: "",
          specific_cause_id: "",
          kri_id: "",
          materiality: "",
          incident_date: undefined as Date | undefined,
          discovery_date: undefined as Date | undefined,
          location: "",
          details: "",
          root_cause: "",
          action_plan: "",
          due_date: undefined as Date | undefined,
          responsible_person_id: "",
          financial_loss_implications: "",
          measured_value: 0
        });
      } else {
        toast.error(response.message || "Failed to create incident");
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
      loadKRIs(formData.department_id);
    } else {
      setUsers([]);
      setKris([]);
      setFormData((prev) => ({ ...prev, kri_id: "" }));
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
              placeholder="Select department"
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
            <SearchSelectField
              label="Key Risk Indicator (KRI)"
              required
              placeholder={
                !formData.department_id
                  ? "Select department first"
                  : loadingKRIs
                    ? "Loading KRIs..."
                    : kris.length === 0
                      ? "No KRIs available"
                      : "Select KRI"
              }
              options={kris}
              value={formData.kri_id}
              onValueChange={(value) => setFormData({ ...formData, kri_id: value })}
              isLoading={loadingKRIs}
              isDisabled={isLoading || loadingKRIs || !formData.department_id}
              classNames={{ wrapper: "max-w-full" }}
            />

            <Input
              id="measured_value"
              label="Measured Value"
              required
              type="number"
              placeholder="eg, 20.01"
              value={formData.measured_value}
              onChange={(e) => setFormData({ ...formData, measured_value: e.target.valueAsNumber })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              placeholder={
                !formData.department_id ? "Select department first" : "Select responsible person"
              }
              options={departmentUser}
              value={formData.responsible_person_id}
              onValueChange={(value) => setFormData({ ...formData, responsible_person_id: value })}
              isLoading={loadingUsers}
              isDisabled={isLoading || loadingUsers || !formData.department_id}
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

          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Creating Incident..." : "Submit Incident"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
