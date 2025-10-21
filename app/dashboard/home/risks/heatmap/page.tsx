"use client"

import { useState, useEffect } from "react"
import { risksApi, type HeatMapData } from "@/lib/api/risks-api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function RiskHeatMapPage() {
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState<HeatMapData | null>(null)

  useEffect(() => {
    loadHeatMap()
  }, [])

  const loadHeatMap = async () => {
    setIsLoading(true)
    try {
      const data = await risksApi.getHeatMap()
      setHeatMapData(data)
    } catch (error) {
      console.error("Failed to load heat map:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCellColor = (impact: number, likelihood: number) => {
    const score = impact * likelihood

    if (score >= 20) return "bg-red-600 hover:bg-red-700"
    if (score >= 15) return "bg-red-500 hover:bg-red-600"
    if (score >= 10) return "bg-orange-500 hover:bg-orange-600"
    if (score >= 5) return "bg-amber-400 hover:bg-amber-500"
    return "bg-green-500 hover:bg-green-600"
  }

  const getCellData = (impact: number, likelihood: number) => {
    return heatMapData.find((d) => d.impact === impact && d.likelihood === likelihood)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/risks">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Risk Heat Map</h1>
            <p className="text-muted-foreground mt-1">Visual representation of risk distribution</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Map */}
        <Card className="p-6 lg:col-span-2">
          {isLoading ? (
            <div className="h-96 bg-muted animate-pulse rounded" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Residual Risk Matrix (5×5)</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-400 rounded" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span>Critical</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {/* Y-axis label */}
                <div className="col-span-1 row-span-6 flex items-center justify-center">
                  <div className="transform -rotate-90 whitespace-nowrap font-semibold text-sm">Impact →</div>
                </div>

                {/* Header row */}
                <div className="col-span-5 grid grid-cols-5 gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((likelihood) => (
                    <div key={likelihood} className="text-center text-sm font-medium text-muted-foreground">
                      {likelihood}
                    </div>
                  ))}
                </div>

                {/* Heat map cells (reversed impact for visual representation) */}
                {[5, 4, 3, 2, 1].map((impact) => (
                  <div key={impact} className="col-span-5 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const cellData = getCellData(impact, likelihood)
                      const score = impact * likelihood

                      return (
                        <button
                          key={`${impact}-${likelihood}`}
                          onClick={() => setSelectedCell(cellData || null)}
                          className={cn(
                            "aspect-square rounded-lg flex flex-col items-center justify-center text-white font-semibold transition-all",
                            getCellColor(impact, likelihood),
                            selectedCell?.impact === impact &&
                              selectedCell?.likelihood === likelihood &&
                              "ring-4 ring-primary",
                          )}
                        >
                          <span className="text-2xl">{cellData?.count || 0}</span>
                          <span className="text-xs opacity-75">{score}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}

                {/* X-axis label */}
                <div className="col-span-5 text-center font-semibold text-sm mt-2">← Likelihood</div>
              </div>
            </div>
          )}
        </Card>

        {/* Selected Cell Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cell Details</h3>
          {selectedCell ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Impact Level</p>
                <p className="text-2xl font-bold">{selectedCell.impact}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Likelihood Level</p>
                <p className="text-2xl font-bold">{selectedCell.likelihood}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">{selectedCell.impact * selectedCell.likelihood}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of Risks</p>
                <p className="text-2xl font-bold">{selectedCell.count}</p>
              </div>

              {selectedCell.risks.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Risks in this cell:</p>
                  <div className="space-y-2">
                    {selectedCell.risks.map((risk) => (
                      <div key={risk.id} className="p-2 bg-muted rounded text-sm">
                        {risk.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click on a cell to view details</p>
          )}
        </Card>
      </div>
    </div>
  )
}
