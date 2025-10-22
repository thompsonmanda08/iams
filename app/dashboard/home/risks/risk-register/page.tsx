"use client"

import { useState, useEffect } from "react"
import { risksApi, type Risk, type RiskQueryParams } from "@/lib/api/risks-api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, TrendingUp, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { RiskFormDialog } from "@/components/forms/risk-form-dialog"
import { ConfirmDeleteDialog } from "@/components/dialogs/confirm-delete-dialog"

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<RiskQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "updatedAt",
    sortOrder: "desc",
  })
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const [riskDialogOpen, setRiskDialogOpen] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [riskToDelete, setRiskToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadRisks()
  }, [params])

  const loadRisks = async () => {
    setIsLoading(true)
    try {
      const response = await risksApi.getAll(params)
      setRisks(response.data)
      setMeta(response.meta)
    } catch (error) {
      toast.error("Failed to load risks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setParams({ ...params, search: value, page: 1 })
  }

  const handleDelete = async (id: string) => {
    setRiskToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!riskToDelete) return

    try {
      await risksApi.delete(riskToDelete)
      toast.success("Risk deleted successfully")
      loadRisks()
      setDeleteDialogOpen(false)
      setRiskToDelete(null)
    } catch (error) {
      toast.error("Failed to delete risk")
    }
  }

  const handleSaveRisk = async (data: any) => {
    try {
      if (selectedRisk) {
        await risksApi.update(selectedRisk.id, data)
        toast.success("Risk updated successfully")
      } else {
        await risksApi.create(data)
        toast.success("Risk created successfully")
      }
      loadRisks()
    } catch (error) {
      toast.error("Failed to save risk")
      throw error
    }
  }

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk)
    setRiskDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedRisk(undefined)
    setRiskDialogOpen(true)
  }

  const getMagnitudeColor = (magnitude: string) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-amber-100 text-amber-700",
      high: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
    }
    return colors[magnitude as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-700",
      monitoring: "bg-purple-100 text-purple-700",
      closed: "bg-gray-100 text-gray-700",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-red-600 font-bold"
    if (score >= 10) return "text-orange-600 font-semibold"
    if (score >= 5) return "text-amber-600 font-medium"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk Register</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor organizational risks</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/home/risks/heat-map">
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Heat Map
            </Button>
          </Link>
          <Link href="/dashboard/home/risks/kri">
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              KRI Dashboard
            </Button>
          </Link>
          <Button onClick={handleCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Risk
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Risks</p>
              <p className="text-2xl font-bold">{meta.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Risks</p>
              <p className="text-2xl font-bold">{risks.filter((r) => r.riskMagnitude === "critical").length}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Risks</p>
              <p className="text-2xl font-bold">{risks.filter((r) => r.riskMagnitude === "high").length}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Risks</p>
              <p className="text-2xl font-bold">{risks.filter((r) => r.status === "open").length}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search risks..."
              value={params.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={params.category || "all"}
            onValueChange={(v) => setParams({ ...params, category: v === "all" ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Strategic">Strategic</SelectItem>
              <SelectItem value="IT Security">IT Security</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={params.status || "all"}
            onValueChange={(v) => setParams({ ...params, status: v === "all" ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Inherent Score</TableHead>
              <TableHead>Residual Score</TableHead>
              <TableHead>Magnitude</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <p className="text-muted-foreground">No risks found</p>
                </TableCell>
              </TableRow>
            ) : (
              risks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{risk.riskId}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{risk.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">{risk.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{risk.category}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", getRiskScoreColor(risk.inherentScore))}>
                        {risk.inherentScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({risk.inherentImpact}×{risk.inherentLikelihood})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", getRiskScoreColor(risk.residualScore))}>
                        {risk.residualScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({risk.residualImpact}×{risk.residualLikelihood})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium capitalize",
                        getMagnitudeColor(risk.riskMagnitude),
                      )}
                    >
                      {risk.riskMagnitude}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium capitalize",
                        getStatusColor(risk.status),
                      )}
                    >
                      {risk.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{risk.owner}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(risk)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(risk.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && risks.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of{" "}
              {meta.total} risks
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1}
                onClick={() => setParams({ ...params, page: meta.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages}
                onClick={() => setParams({ ...params, page: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RiskFormDialog
        open={riskDialogOpen}
        onOpenChange={setRiskDialogOpen}
        risk={selectedRisk}
        onSave={handleSaveRisk}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Risk"
        description="Are you sure you want to delete this risk? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  )
}
