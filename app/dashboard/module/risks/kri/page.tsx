"use client";

import { useState, useEffect } from "react";
import { risksApi, type KRI } from "@/lib/api/risks-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { KRIConfigure } from "./kri-configuration";
import { KRIHistory } from "./kri-history";

export default function KRIPage() {
  const [kris, setKris] = useState<KRI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKRI, setSelectedKRI] = useState<string | null>(null);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);

  console.log("Selected KRI:", selectedKRI);
  

  useEffect(() => {
    loadKRIs();
  }, []);

  const loadKRIs = async () => {
    setIsLoading(true);
    try {
      const data = await risksApi.getKRIs();
      setKris(data);
    } catch (error) {
      console.error("Failed to load KRIs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      normal: "bg-white text-green-700 border-green-200",
      warning: "bg-white text-amber-700 border-amber-200",
      critical: "bg-white text-red-700 border-red-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getProgressPercentage = (current: number, target: number, threshold: number) => {
    const range = threshold - target;
    const progress = ((current - target) / range) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Key Risk Indicators (KRI)</h1>
          <p className="text-muted-foreground mt-1">Monitor critical risk metrics and thresholds</p>
        </div>
        <Button size="sm" onClick={() => setIsConfigureOpen(true)}>
          <AlertCircle className="mr-2 h-4 w-4" />
          Configure KRIs
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Normal</p>
              <p className="text-2xl font-bold text-green-600">
                {kris.filter((k) => k.status === "normal").length}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <AlertCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Warning</p>
              <p className="text-2xl font-bold text-amber-600">
                {kris.filter((k) => k.status === "warning").length}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Critical</p>
              <p className="text-2xl font-bold text-red-600">
                {kris.filter((k) => k.status === "critical").length}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* KRI Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted h-48 animate-pulse rounded-lg" />
            ))}
          </>
        ) : (
          kris.map((kri) => (
            <Card key={kri.id} className={cn("border-l-4 p-6", getStatusColor(kri.status))}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{kri.name}</h3>
                      {getTrendIcon(kri.trend)}
                    </div>
                    <p className="text-muted-foreground text-sm">{kri.description}</p>
                    <p className="text-muted-foreground mt-1 text-xs">Category: {kri.category}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium capitalize",
                      kri.status === "normal" && "bg-green-100 text-green-700",
                      kri.status === "warning" && "bg-amber-100 text-amber-700",
                      kri.status === "critical" && "bg-red-100 text-red-700"
                    )}>
                    {kri.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Current</p>
                    <p className="text-xl font-bold">
                      {kri.currentValue}
                      {kri.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Target</p>
                    <p className="text-xl font-bold text-green-600">
                      {kri.targetValue}
                      {kri.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Threshold</p>
                    <p className="text-xl font-bold text-red-600">
                      {kri.threshold}
                      {kri.unit}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Target</span>
                    <span>Threshold</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full transition-all",
                        kri.status === "normal" && "bg-green-500",
                        kri.status === "warning" && "bg-amber-500",
                        kri.status === "critical" && "bg-red-500"
                      )}
                      style={{
                        width: `${getProgressPercentage(kri.currentValue, kri.targetValue, kri.threshold)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
                  <span>Last updated: {format(kri.lastUpdated, "MMM dd, yyyy HH:mm")}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedKRI(kri.id)}>
                    View History
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <KRIConfigure open={isConfigureOpen} onOpenChange={setIsConfigureOpen} />
      <KRIHistory kriId={selectedKRI} onClose={() => setSelectedKRI(null)} />
    </div>
  );
}
