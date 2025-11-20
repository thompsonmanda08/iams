import { CheckCircle2, AlertTriangle, XCircle, Zap, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function KRIStatsSection({ stats }: any) {
  const items = [
    {
      label: "Total KRIs",
      value: stats.totalKRIs,
      icon: BarChart3,
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200"
    },
    {
      label: "Green",
      value: stats.greenStatus,
      icon: CheckCircle2,
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200"
    },
    {
      label: "Amber",
      value: stats.amberStatus,
      icon: AlertTriangle,
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200"
    },
    {
      label: "Red",
      value: stats.redStatus,
      icon: XCircle,
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-200"
    },
    {
      label: "Breaches",
      value: stats.breachesDetected,
      icon: Zap,
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200"
    }
  ];

  return (
    <div className="container mx-auto px-4 pt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <Card
            key={item.label}
            className={`rounded-xl border p-5 ${item.border} transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{item.label}</p>
                <p className={`text-3xl font-bold ${item.text}`}>{item.value}</p>
              </div>

              <div className={`rounded-lg p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.text}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
