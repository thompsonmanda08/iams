import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function AuditDashboard() {
  const auditStats = [
    { label: "Total audits", value: 30, color: "bg-blue-500" },
    { label: "Completed", value: 11, color: "bg-emerald-500" },
    { label: "In progress", value: 19, color: "bg-orange-500" },
    { label: "Overdue audits", value: 23, color: "bg-red-500" },
    { label: "Overdue action items", value: 12, color: "bg-red-500" }
  ];

  const statusCards = [
    {
      title: "Audit plans",
      value: 33,
      subtitle: "Total audit plans",
      color: "from-blue-500 to-blue-600",
      icon: CheckCircle2
    },
    {
      title: "Approved",
      value: 26,
      subtitle: "Approved plans",
      color: "from-emerald-500 to-emerald-600",
      icon: CheckCircle2
    },
    {
      title: "Rejected",
      value: 0,
      subtitle: "Rejected plans",
      color: "from-rose-500 to-rose-600",
      icon: XCircle
    },
    {
      title: "In progress",
      value: 7,
      subtitle: "Audits in progress",
      color: "from-orange-500 to-orange-600",
      icon: Clock
    }
  ];

  const findingsByCategory = [
    { category: "Compliant", value: 10, max: 12 },
    { category: "Major Non Conformance", value: 8, max: 12 },
    { category: "Minor Non Conformance", value: 5, max: 12 },
    { category: "Opportunity For Impro...", value: 3, max: 12 },
    { category: "Financial Audit", value: 2, max: 12 },
    { category: "Performance Audit", value: 1, max: 12 }
  ];

  const frameworkStatus = [
    { label: "RCSA monthly attestation status", status: "success" },
    { label: "Data health attestation", status: "success" },
    { label: "Process health attestation", status: "error" },
    { label: "Metric health attestation", status: "success" },
    { label: "Incidents submission attestation", status: "warning" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">
                <AlertCircle className="dark:text-primary h-6 w-6" />
                Audit Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-400">Completion rates and audit analytics.</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="mb-1 text-xs text-slate-400">Action response rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <span key={star} className="text-lg text-amber-400">
                      ★
                    </span>
                  ))}
                  <span className="text-lg text-slate-600">★</span>
                  <span className="text-foreground ml-2 font-semibold">(4.5)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-xs text-slate-400">Risk factors</p>
                <p className="text-foreground text-3xl font-bold">35</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Audits Card */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                  Audits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {auditStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-foreground text-3xl font-bold">{stat.value}</span>
                    </div>
                    <Progress value={(stat.value / 30) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Aggregates Card */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Aggregates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Completion rate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground text-3xl font-bold">37%</span>
                  </div>
                  <Progress value={37} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-4 gap-4">
              {statusCards.map((card, index) => (
                <Card
                  key={index}
                  className={`bg-linear-to-br ${card.color} group relative overflow-hidden border-0 transition-transform duration-300 hover:scale-105`}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="mb-1 text-sm font-medium text-white/80">{card.title}</p>
                        <p className="text-4xl font-bold text-white">{card.value}</p>
                      </div>
                      <card.icon className="h-6 w-6 text-white/60" />
                    </div>
                    <p className="text-xs text-white/70">{card.subtitle}</p>

                    {/* Wave Pattern */}
                    <svg
                      className="absolute top-0 left-0 h-16 w-full opacity-20"
                      viewBox="0 0 1200 120"
                      preserveAspectRatio="none">
                      <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                        fill="currentColor"></path>
                    </svg>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Audit Dashboard Section */}
            <Card className="backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                  Audit Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {/* Total Findings */}
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-slate-400">Total findings</p>
                      <p className="text-foreground text-4xl font-bold">20</p>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  {/* Closed Findings */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full -rotate-90 transform">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-800"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-blue-500"
                          strokeDasharray={`${55 * 2 * Math.PI * 0.55} ${55 * 2 * Math.PI}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-foreground text-2xl font-bold">55%</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">Closed findings</p>
                  </div>

                  {/* Open Findings */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full -rotate-90 transform">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-800"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-blue-500"
                          strokeDasharray={`${55 * 2 * Math.PI * 0.45} ${55 * 2 * Math.PI}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-foreground text-2xl font-bold">45%</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">Open findings</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Internal audit planned</p>
                    <p className="text-foreground text-3xl font-bold">0</p>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">External audit planned</p>
                    <p className="text-foreground text-3xl font-bold">0</p>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Findings by Category */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    Findings by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {findingsByCategory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{item.category}</span>
                        <span className="text-foreground text-sm font-semibold">{item.value}</span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-blue-500 to-blue-600"
                          style={{ width: `${(item.value / item.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Framework Status */}
              <Card className="backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Risk Framework Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {frameworkStatus.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 transition-colors hover:bg-slate-100">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          item.status === "success"
                            ? "bg-emerald-500/30 text-emerald-500"
                            : item.status === "error"
                              ? "bg-red-500/30 text-red-500"
                              : "bg-amber-500/30 text-amber-500"
                        }`}>
                        {item.status === "success" ? "✓" : item.status === "error" ? "✕" : "!"}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
