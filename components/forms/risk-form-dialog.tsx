"use client"

import type React from "react"

import { useState } from "react"
import { Building2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RiskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  risk?: any
  onSave: (data: any) => Promise<void>
}

export function RiskFormDialog({ open, onOpenChange, risk, onSave }: RiskFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: risk?.title || "",
    description: risk?.description || "",
    category: risk?.category || "operational",
    businessUnit: risk?.businessUnit || "",
    likelihood: risk?.likelihood || 3,
    impact: risk?.impact || 3,
    status: risk?.status || "open",
    owner: risk?.owner || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save risk:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const riskScore = formData.likelihood * formData.impact
  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Critical", color: "text-red-600" }
    if (score >= 10) return { label: "High", color: "text-orange-600" }
    if (score >= 5) return { label: "Medium", color: "text-yellow-600" }
    return { label: "Low", color: "text-green-600" }
  }

  const riskLevel = getRiskLevel(riskScore)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{risk ? "Edit Risk" : "Create New Risk"}</DialogTitle>
          <DialogDescription>
            {risk ? "Update risk information and assessment." : "Add a new risk to the register."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Risk Title</Label>
              <Input
                id="title"
                placeholder="Enter risk title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the risk in detail"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                    <SelectItem value="reputational">Reputational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessUnit">Business Unit</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessUnit"
                    placeholder="e.g., Finance"
                    className="pl-9"
                    value={formData.businessUnit}
                    onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="likelihood">
                  Likelihood (1-5)
                  <span className="ml-2 text-sm text-muted-foreground">{formData.likelihood}</span>
                </Label>
                <input
                  type="range"
                  id="likelihood"
                  min="1"
                  max="5"
                  value={formData.likelihood}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      likelihood: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="impact">
                  Impact (1-5)
                  <span className="ml-2 text-sm text-muted-foreground">{formData.impact}</span>
                </Label>
                <input
                  type="range"
                  id="impact"
                  min="1"
                  max="5"
                  value={formData.impact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      impact: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score:</span>
                <span className="text-2xl font-bold">{riskScore}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Risk Level:</span>
                <span className={`text-lg font-semibold ${riskLevel.color}`}>{riskLevel.label}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="owner">Risk Owner</Label>
                <Input
                  id="owner"
                  placeholder="Enter owner name"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : risk ? "Update Risk" : "Create Risk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
