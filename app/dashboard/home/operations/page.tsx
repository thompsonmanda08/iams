"use client";

import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";

const executiveData = [
  { name: "Finance Chairman", value: 20 },
  { name: "Chief Monada", value: 22 },
  { name: "Ortega", value: 10 },
  { name: "Ledwaba Seakgoe", value: 28 },
  { name: "P.Exotic", value: 16 },
  { name: "James Tutelian", value: 22 },
  { name: "Harry Mwelase", value: 12 },
  { name: "Oswalt Gee", value: 30 },
  { name: "Steven Joseph Banda", value: 30 }
];

const riskTaxonomyData = [
  { name: "Operational", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Financial", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Strategic", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Compliance", value: 20, color: "hsl(var(--chart-4))" }
];

const waveData = Array.from({ length: 50 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 5) * 20 + 50
}));

export default function OperationalRiskDashboard() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="border-primary/30 rounded-lg border bg-white/20 p-2">
                  <BarChart3 className="text-primary h-6 w-6 dark:text-blue-400" />
                </div>
                <h1 className="text-foreground text-3xl font-bold">Operational Risk Dashboard</h1>
              </div>
              <p className="text-sm text-slate-400">Completion rates and audit analytics</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="mb-1 text-xs text-slate-400">Action response rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((star) => (
                      <div key={star} className="h-4 w-4 rounded-sm bg-amber-400" />
                    ))}
                    <div className="h-4 w-4 rounded-sm bg-amber-400/30" />
                  </div>
                  <span className="text-foreground font-semibold">(4.5)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-xs text-slate-400">Risk factors</p>
                <p className="text-foreground text-3xl font-bold">35</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-6 py-8">
        {/* Top Row - Risk Posture Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Operational Risk Posture */}
          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-500/90 to-teal-600/90 p-6">
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Operational Risk Posture</h3>
              </div>
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <div className="h-3 w-3 rounded-full bg-white" />
                  <span className="text-lg font-semibold text-white">Green</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 left-0 h-24 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waveData}>
                  <Area type="monotone" dataKey="y" stroke="none" fill="white" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Departments Risk Posture */}
          <Card className="p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-slate-400" />
              <h3 className="text-foreground text-lg font-semibold">Departments Risk Posture</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-rose-500 to-red-600 p-4">
                <div className="mb-2 h-12 w-12 rounded-full border-4 border-white/30" />
                <span className="text-sm font-medium text-white">Commercial</span>
              </div>
              <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 p-4">
                <div className="mb-2 h-12 w-12 rounded-full border-4 border-white/30" />
                <span className="text-sm font-medium text-white">Operations</span>
              </div>
              <div className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-orange-500 to-amber-600 p-4">
                <div className="mb-2 h-12 w-12 rounded-full border-4 border-white/30" />
                <span className="text-sm font-medium text-white">ICT</span>
              </div>
            </div>
          </Card>

          {/* Enterprise Aggregate Control Scale */}
          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-orange-500/90 to-amber-600/90 p-6">
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Ent. Aggregate Control Scale</h3>
              </div>
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <span className="text-lg font-semibold text-white">Effectiveness</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 left-0 h-24 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waveData}>
                  <Area type="monotone" dataKey="y" stroke="none" fill="white" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Economic Capital */}
          <Card className="p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-400" />
              <h3 className="text-foreground text-lg font-semibold">
                Operational Risk Economic Capital
              </h3>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Unit</th>
                    <th className="p-3 text-right text-sm font-medium text-slate-300">Current Q</th>
                    <th className="p-3 text-right text-sm font-medium text-slate-300">Q-1</th>
                    <th className="p-3 text-right text-sm font-medium text-slate-300">Q-2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="p-3">
                      <div className="mr-2 inline-block h-8 w-3 rounded bg-linear-to-br from-emerald-500 to-teal-600" />
                      <span className="text-foreground font-medium">Commercial</span>
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-400">+2%</td>
                    <td className="p-3 text-right">
                      <TrendingUp className="inline h-4 w-4 text-emerald-400" />
                    </td>
                    <td className="p-3 text-right">
                      <TrendingUp className="inline h-4 w-4 text-emerald-400" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <div className="mr-2 inline-block h-8 w-3 rounded bg-linear-to-br from-rose-500 to-red-600" />
                      <span className="text-foreground font-medium">Finance</span>
                    </td>
                    <td className="p-3 text-right font-semibold text-rose-400">-1.4%</td>
                    <td className="p-3 text-right">
                      <TrendingDown className="inline h-4 w-4 text-rose-400" />
                    </td>
                    <td className="p-3 text-right">
                      <TrendingDown className="inline h-4 w-4 text-rose-400" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Overdue Actions Per Executive */}
          <Card className="p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-slate-400" />
              <h3 className="text-foreground text-lg font-semibold">
                Overdue Actions Per Executive
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={executiveData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--slate-800))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: "hsl(var(--slate-400))", fontSize: 11 }}
                  stroke="hsl(var(--slate-700))"
                />
                <YAxis tick={{ fill: "hsl(var(--slate-400))" }} stroke="hsl(var(--slate-700))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--slate-900))",
                    border: "1px solid hsl(var(--slate-800))",
                    borderRadius: "8px",
                    color: "white"
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Risk Framework Status */}
          <Card className="p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" />
              <h3 className="text-foreground text-lg font-semibold">Risk Framework Status</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "RCSA monthly attestation status", status: "success" },
                { label: "Data health attestation", status: "success" },
                { label: "Process health attestation", status: "error" },
                { label: "Metric health attestation", status: "success" },
                { label: "Incidents submission attestation", status: "warning" }
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 transition-colors hover:border-slate-600">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <div
                    className={`h-5 w-5 rounded-full ${
                      item.status === "success"
                        ? "bg-emerald-500"
                        : item.status === "error"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Risk Profile Status */}
          <Card className="p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" />
              <h3 className="text-foreground text-lg font-semibold">Risk Profile Status</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-slate-300">Operational loss ratio</span>
                  <span className="text-2xl font-bold text-emerald-400">0%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-0 bg-linear-to-r from-emerald-500 to-teal-500" />
                </div>
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-slate-300">BCM maturity rating</span>
                  <span className="text-2xl font-bold text-emerald-400">85%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-[85%] bg-linear-to-r from-emerald-500 via-amber-500 to-rose-500" />
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Taxonomy */}
          <Card className="p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-slate-400" />
              <h3 className="text-foreground text-lg font-semibold">Risk Taxonomy</h3>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <RePieChart>
                  <Pie
                    data={riskTaxonomyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value">
                    {riskTaxonomyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--slate-900))",
                      border: "1px solid hsl(var(--slate-800))",
                      borderRadius: "8px",
                      color: "white"
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {riskTaxonomyData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-300">{item.name}</span>
                  <span className="ml-auto text-sm text-slate-400">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
