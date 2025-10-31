"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type RiskType = {
  id: string
  name: string
}

type RiskCategory = {
  id: string
  name: string
  types: RiskType[]
  editing?: boolean
}

export function RiskCategoriesConfig() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<RiskCategory[]>([
    {
      id: "1",
      name: "Strategic Risks",
      types: [
        { id: "1-1", name: "Market changes" },
        { id: "1-2", name: "Competitive threats" },
        { id: "1-3", name: "Regulatory changes" },
        { id: "1-4", name: "Technology disruption" },
        { id: "1-5", name: "Reputation damage" },
      ],
    },
    {
      id: "2",
      name: "Operational Risks",
      types: [
        { id: "2-1", name: "Process failures" },
        { id: "2-2", name: "System outages" },
        { id: "2-3", name: "Human error" },
        { id: "2-4", name: "Supply chain disruption" },
        { id: "2-5", name: "Quality issues" },
      ],
    },
    {
      id: "3",
      name: "Financial Risks",
      types: [
        { id: "3-1", name: "Currency fluctuations" },
        { id: "3-2", name: "Credit risk" },
        { id: "3-3", name: "Liquidity risk" },
        { id: "3-4", name: "Investment losses" },
        { id: "3-5", name: "Fraud" },
      ],
    },
    {
      id: "4",
      name: "Compliance Risks",
      types: [
        { id: "4-1", name: "Regulatory violations" },
        { id: "4-2", name: "Legal disputes" },
        { id: "4-3", name: "Policy breaches" },
        { id: "4-4", name: "Licensing issues" },
        { id: "4-5", name: "Data privacy violations" },
      ],
    },
    {
      id: "5",
      name: "IT & Cybersecurity Risks",
      types: [
        { id: "5-1", name: "Data breaches" },
        { id: "5-2", name: "Cyber attacks" },
        { id: "5-3", name: "System failures" },
        { id: "5-4", name: "Software vulnerabilities" },
        { id: "5-5", name: "Network disruptions" },
      ],
    },
    {
      id: "6",
      name: "Environmental, Social & Governance (ESG)",
      types: [
        { id: "6-1", name: "Climate risks" },
        { id: "6-2", name: "Social responsibility" },
        { id: "6-3", name: "Environmental compliance" },
        { id: "6-4", name: "Governance failures" },
        { id: "6-5", name: "Sustainability issues" },
      ],
    },
  ])

  const handleAddCategory = () => {
    const newCategory: RiskCategory = {
      id: Date.now().toString(),
      name: "New Category",
      types: [],
      editing: true,
    }
    setCategories([...categories, newCategory])
  }

  const handleEditCategory = (id: string) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, editing: true } : cat)))
  }

  const handleSaveCategory = (id: string) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, editing: false } : cat)))
    toast({
      title: "Category updated",
      description: "Risk category has been saved successfully.",
    })
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    toast({
      title: "Category deleted",
      description: "Risk category has been removed.",
      variant: "destructive",
    })
  }

  const handleAddType = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              types: [...cat.types, { id: `${categoryId}-${Date.now()}`, name: "New Risk Type" }],
            }
          : cat,
      ),
    )
  }

  const handleDeleteType = (categoryId: string, typeId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              types: cat.types.filter((type) => type.id !== typeId),
            }
          : cat,
      ),
    )
  }

  const handleUpdateCategoryName = (id: string, name: string) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, name } : cat)))
  }

  const handleUpdateTypeName = (categoryId: string, typeId: string, name: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              types: cat.types.map((type) => (type.id === typeId ? { ...type, name } : type)),
            }
          : cat,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Risk Categories & Types</h2>
          <p className="text-sm text-muted-foreground">Organize risks into categories and define specific risk types</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {category.editing ? (
                    <Input
                      value={category.name}
                      onChange={(e) => handleUpdateCategoryName(category.id, e.target.value)}
                      className="mb-2 font-semibold"
                    />
                  ) : (
                    <CardTitle>{category.name}</CardTitle>
                  )}
                  <CardDescription>{category.types.length} risk types</CardDescription>
                </div>
                <div className="flex gap-2">
                  {category.editing ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleSaveCategory(category.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setCategories(
                            categories.map((cat) => (cat.id === category.id ? { ...cat, editing: false } : cat)),
                          )
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.types.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/50 p-2"
                  >
                    {category.editing ? (
                      <Input
                        value={type.name}
                        onChange={(e) => handleUpdateTypeName(category.id, type.id, e.target.value)}
                        className="h-8 flex-1 bg-background"
                      />
                    ) : (
                      <span className="text-sm text-foreground">{type.name}</span>
                    )}
                    {category.editing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteType(category.id, type.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                {category.editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => handleAddType(category.id)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Add Risk Type
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
