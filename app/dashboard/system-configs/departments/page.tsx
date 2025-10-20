"use client"

import { useState, useEffect } from "react"
import { configApi, type Province, type Town, type Branch } from "@/lib/api/config-api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function OfficesConfigPage() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [towns, setTowns] = useState<Town[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [provincesData, townsData, branchesData] = await Promise.all([
        configApi.getProvinces(),
        configApi.getTowns(),
        configApi.getBranches(),
      ])
      setProvinces(provincesData)
      setTowns(townsData)
      setBranches(branchesData)
    } catch (error) {
      toast.error("Failed to load office configuration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProvince = async (id: string) => {
    if (!confirm("Are you sure? This will affect related towns and branches.")) return

    try {
      await configApi.deleteProvince(id)
      toast.success("Province deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete province")
    }
  }

  const handleDeleteTown = async (id: string) => {
    if (!confirm("Are you sure? This will affect related branches.")) return

    try {
      await configApi.deleteTown(id)
      toast.success("Town deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete town")
    }
  }

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    try {
      await configApi.deleteBranch(id)
      toast.success("Branch deleted successfully")
      loadData()
    } catch (error) {
      toast.error("Failed to delete branch")
    }
  }

  const getProvinceName = (provinceId: string) => {
    return provinces.find((p) => p.id === provinceId)?.name || "Unknown"
  }

  const getTownName = (townId: string) => {
    return towns.find((t) => t.id === townId)?.name || "Unknown"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Office Setup</h1>
          <p className="text-muted-foreground mt-1">Manage provinces, towns, and branch locations</p>
        </div>
      </div>

      <Tabs defaultValue="provinces" className="space-y-6">
        <TabsList>
          <TabsTrigger value="provinces">Provinces</TabsTrigger>
          <TabsTrigger value="towns">Towns</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>

        {/* Provinces */}
        <TabsContent value="provinces">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Provinces</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Province
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="h-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ) : (
                  provinces.map((province) => (
                    <TableRow key={province.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{province.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{province.code}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            province.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {province.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProvince(province.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Towns */}
        <TabsContent value="towns">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Towns</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Town
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="h-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ) : (
                  towns.map((town) => (
                    <TableRow key={town.id}>
                      <TableCell>
                        <span className="font-medium">{town.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{getProvinceName(town.provinceId)}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            town.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {town.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTown(town.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Branches</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Branch
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Town</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="h-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <span className="font-medium">{branch.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{branch.code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{getTownName(branch.townId)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{branch.address || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            branch.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700",
                          )}
                        >
                          {branch.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
