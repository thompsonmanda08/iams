"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { createAuditPlan } from "@/app/_actions/audit-module-actions";
import { useToast } from "@/hooks/use-toast";

export default function NewAuditPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const auditData = {
      title: formData.get("title") as string,
      standard: formData.get("standard") as string,
      scope: (formData.get("scope") as string).split(",").map(s => s.trim()),
      objectives: formData.get("objectives") as string,
      teamLeader: formData.get("teamLeader") as string,
      teamMembers: (formData.get("teamMembers") as string).split(",").map(m => m.trim()).filter(Boolean),
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
    };

    try {
      const result = await createAuditPlan(auditData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Audit plan created successfully",
        });
        router.push("/dashboard/audit/plans");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create audit plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/audit/plans">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Audit Plan</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up a new ISO 27001 audit plan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Basic Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="title">Audit Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Q1 2025 ISO 27001 Internal Audit"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="standard">Standard *</Label>
                    <Select name="standard" defaultValue="ISO 27001:2022" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISO 27001:2022">ISO 27001:2022</SelectItem>
                        <SelectItem value="ISO 27001:2013">ISO 27001:2013</SelectItem>
                        <SelectItem value="ISO 9001:2015">ISO 9001:2015</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scope">Scope (comma-separated) *</Label>
                    <Input
                      id="scope"
                      name="scope"
                      placeholder="e.g., Information Security, Risk Management, ISMS"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple scope items with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objectives">Audit Objectives *</Label>
                    <Textarea
                      id="objectives"
                      name="objectives"
                      placeholder="Describe the main objectives of this audit..."
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="teamLeader">Team Leader *</Label>
                    <Input
                      id="teamLeader"
                      name="teamLeader"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamMembers">Team Members (comma-separated)</Label>
                    <Input
                      id="teamMembers"
                      name="teamMembers"
                      placeholder="e.g., Jane Smith, Mike Johnson"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple team members with commas
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Audit Plan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
