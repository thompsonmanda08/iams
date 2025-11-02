"use client";

import type React from "react";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function NewIncident() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    department: "",
    cause1: "",
    cause2: "",
    materiality: "",
    incidentDate: undefined as Date | undefined,
    discoveryDate: undefined as Date | undefined,
    location: "",
    details: "",
    rootCause: "",
    actionPlan: "",
    dueDate: undefined as Date | undefined,
    responsiblePerson: "",
    financialLoss: "no"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Incident Submitted",
      description: "Your incident report has been successfully submitted."
    });
  };

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
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Materiality */}
            <div className="space-y-2">
              <Label htmlFor="materiality">
                Materiality <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.materiality}
                onValueChange={(value) => setFormData({ ...formData, materiality: value })}>
                <SelectTrigger id="materiality" className="w-full">
                  <SelectValue placeholder="Select materiality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cause 1 and Cause 2 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cause1">Cause 1</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause2">Cause 2</Label>
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
            </div>
          </div>

          {/* Incident Date and Discovery Date */}
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
                      !formData.incidentDate && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.incidentDate ? (
                      format(formData.incidentDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.incidentDate}
                    onSelect={(date) => setFormData({ ...formData, incidentDate: date })}
                    initialFocus
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
                      !formData.discoveryDate && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.discoveryDate ? (
                      format(formData.discoveryDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.discoveryDate}
                    onSelect={(date) => setFormData({ ...formData, discoveryDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where the incident happened"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Incident Details */}
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

          {/* Root Cause and Action Plan */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="root-cause">Root Cause</Label>
              <Input
                id="root-cause"
                placeholder="What caused the incident?"
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-plan">Action Plan</Label>
              <Input
                id="action-plan"
                placeholder="The resolution"
                value={formData.actionPlan}
                onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
              />
            </div>
          </div>

          {/* Due Date and Responsible Person */}
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
                      !formData.dueDate && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                    initialFocus
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible-person">Responsible Person</Label>
              <Select
                value={formData.responsiblePerson}
                onValueChange={(value) => setFormData({ ...formData, responsiblePerson: value })}>
                <SelectTrigger id="responsible-person" className="w-full">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pama">Pama Malembeka</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="michael">Michael Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Loss */}
          <div className="space-y-2">
            <Label htmlFor="financial-loss">
              Does this incident have financial loss implications?
            </Label>
            <Select
              value={formData.financialLoss}
              onValueChange={(value) => setFormData({ ...formData, financialLoss: value })}>
              <SelectTrigger id="financial-loss" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg">
            Submit Incident
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
