"use client";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, AlertTriangle, Activity, Filter } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Label } from "recharts";
import PageHeader from "@/components/page-header";
import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import { getRiskOverview } from "@/app/_actions/risk-module-actions";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";

export default function RisksOverviewClient() {
  const [start_date, setStartDate] = useState<string>("");
  const [end_date, setEndDate] = useState<string>("");

  const thisMonth = format(new Date(), "yyyy-MM-dd");
  const twentyEightDate = new Date();
  twentyEightDate.setDate(twentyEightDate.getDate() - 28);
  const twentyEightDaysAgo = format(twentyEightDate, "yyyy-MM-dd");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["risk-overview", start_date, end_date],
    queryFn: () => {
      const dateRangeQuery = {
        start_date: start_date || twentyEightDaysAgo,
        end_date: end_date || thisMonth
      };
      return getRiskOverview(dateRangeQuery.start_date, dateRangeQuery.end_date);
    },
    staleTime: Infinity,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  const applyFilter = useCallback(async () => {
    const dateRangeQuery = {
      start_date: start_date || twentyEightDaysAgo,
      end_date: end_date || thisMonth
    };
    try {
      await getRiskOverview(dateRangeQuery.start_date, dateRangeQuery.end_date);
    } catch (error) {
      console.error("Error applying filter:", error);
    }
  }, [start_date, end_date]);

  // Transform data for charts
  const graphData = useMemo(() => {
    if (!data?.data?.risks_summary?.risks_by_department) return [];

    return data.data.risks_summary.risks_by_department.map((dept: any) => ({
      name: dept.department_name,
      High: dept.high_risk_count || 0,
      Medium: dept.medium_risk_count || 0,
      Low: dept.low_risk_count || 0,
      "Above (Open)": dept.above_open_risk_count || 0,
      Within: dept.within_risk_count || 0,
      Closed: dept.overall_closed_risk_count || 0,
      Open: dept.overall_open_risk_count || 0,
      total: dept.risk_count || 0
    }));
  }, [data]);

  // Data for risk profile pie chart (aggregate across all departments)
  const riskProfileData = useMemo(() => {
    if (!graphData.length) return [];

    const totalHigh = graphData.reduce((sum: any, dept: any) => sum + (dept.High || 0), 0);
    const totalMedium = graphData.reduce((sum: any, dept: any) => sum + (dept.Medium || 0), 0);
    const totalLow = graphData.reduce((sum: any, dept: any) => sum + (dept.Low || 0), 0);

    return [
      { name: "High", value: totalHigh, color: "var(--red-active)" },
      { name: "Medium", value: totalMedium, color: "var(--amber-active)" },
      { name: "Low", value: totalLow, color: "var(--green-active)" }
    ];
  }, [graphData]);

  // Data for closure status pie chart
  const closureStatusData = useMemo(() => {
    if (!graphData.length) return [];

    const totalOpen = graphData.reduce((sum: any, dept: any) => sum + (dept.Open || 0), 0);
    const totalClosed = graphData.reduce((sum: any, dept: any) => sum + (dept.Closed || 0), 0);

    return [
      { name: "Open", value: totalOpen, color: "var(--red-active)" },
      { name: "Closed", value: totalClosed, color: "var(--green-active)" }
    ];
  }, [graphData]);

  // Data for category distribution bar chart
  const categoryData = useMemo(() => {
    if (!graphData.length) return [];

    return graphData.map((dept: any) => ({
      name: dept.name,
      Within_Tolerance: dept.Within || 0,
      Above_Tolerance: dept["Above (Open)"] || 0
    }));
  }, [graphData]);

  // Calculate totals for quick stats
  const totals = useMemo(() => {
    if (!graphData.length) return { total: 0, high: 0, open: 0 };

    const total = graphData.reduce((sum: any, dept: any) => sum + (dept.total || 0), 0);
    const high = graphData.reduce((sum: any, dept: any) => sum + (dept.High || 0), 0);
    const open = graphData.reduce((sum: any, dept: any) => sum + (dept.Open || 0), 0);

    return { total, high, open };
  }, [graphData]);

  const riskProfileConfig = {
    High: {
      label: "High",
      color: "var(--red-active)"
    },
    Medium: {
      label: "Medium",
      color: "var(--amber-active)"
    },
    Low: {
      label: "Low",
      color: "var(--green-active)"
    }
  } satisfies ChartConfig;

  const closureStatusConfig = {
    Open: {
      label: "Open",
      color: "var(--red-active)"
    },
    Closed: {
      label: "Closed",
      color: "var(--green-active)"
    }
  } satisfies ChartConfig;

  const categoryChartConfig = {
    Within_Tolerance: {
      label: "Within Tolerance",
      color: "var(--green-active)"
    },
    Above_Tolerance: {
      label: "Above Tolerance (Open)",
      color: "var(--red-active)"
    }
  } satisfies ChartConfig;

  const departmentChartConfig = {
    High: {
      label: "High",
      color: "var(--red-active)"
    },
    Medium: {
      label: "Medium",
      color: "var(--amber-active)"
    },
    Closed: {
      label: "Closed",
      color: "var(--state-node-final)"
    },
    Low: {
      label: "Low",
      color: "var(--green-active)"
    },
    Above: {
      label: "Above Tolerance (Open)",
      color: "var(--red-active)"
    },
    Within: {
      label: "Within Tolerance",
      color: "var(--secondary)"
    },
    Open: {
      label: "Open",
      color: "var(--destructive)"
    }
  } satisfies ChartConfig;

  const totalRiskProfile = riskProfileData.reduce((sum, item) => sum + item.value, 0);
  const totalClosureStatus = closureStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Risk Management"
            description="Comprehensive risk assessment and monitoring dashboard"
            icon="ChartNetwork"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Risks</p>
                  <p className="text-2xl font-bold">{totals.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">High Risks</p>
                  <p className="text-2xl font-bold">{totals.high}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Open Risks</p>
                  <p className="text-2xl font-bold">{totals.open}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Closed Risks</p>
                  <p className="text-2xl font-bold">
                    {closureStatusData.find((item) => item.name === "Closed")?.value || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common risk management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/risks/risk-registers">
                    <Button className="gap-2">
                      <FileText className="h-4 w-4" />
                      Add New Risk
                    </Button>
                  </Link>
                  <Link href="/dashboard/risks/heat-map">
                    <Button variant="outline" className="gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      View Heat Map
                    </Button>
                  </Link>
                  <Link href="/dashboard/risks/kri">
                    <Button variant="outline" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Monitor KRIs
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2">
                  <CalendarDateRangePicker
                    initialFrom={new Date()}
                    initialTo={new Date()}
                    onChange={(from, to) => {
                      setStartDate(format(from, "yyyy-MM-dd"));
                      setEndDate(format(to, "yyyy-MM-dd"));
                    }}
                  />
                  <Button onClick={applyFilter}>
                    Apply <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Corporate Risk Profile Pie Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  Corporate Risk Profile
                  <Badge variant="secondary" className="gradient-blue ml-auto">
                    {format(new Date(), "MMMM yyyy")}
                  </Badge>
                </CardTitle>
                <CardDescription>Distribution of risk severity levels</CardDescription>
              </CardHeader>
              {!riskProfileData ? (
                <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No Risk Profile Yet</p>
                  </div>
                </div>
              ) : (
                <CardContent>
                  <ChartContainer config={riskProfileConfig} className="h-[300px]">
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent labelKey="name" indicator="line" />}
                      />
                      <Pie
                        data={riskProfileData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}>
                        {riskProfileData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold">
                                    {totalRiskProfile}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground">
                                    Total Risks
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              )}
            </Card>

            {/* Closure Status Pie Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Closure Status</CardTitle>
                <CardDescription>Current risk closure performance</CardDescription>
              </CardHeader>
              {!closureStatusData ? (
                <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No Risk Closure Yet</p>
                  </div>
                </div>
              ) : (
                <CardContent>
                  <ChartContainer config={closureStatusConfig} className="h-[300px]">
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent labelKey="name" indicator="line" />}
                      />
                      <Pie
                        data={closureStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}>
                        {closureStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold">
                                    {totalClosureStatus}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground">
                                    Total Risks
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Category Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Risk against set risk appetite</CardTitle>
              <CardDescription>Breakdown of risks across organizational categories</CardDescription>
            </CardHeader>
            {!categoryData ? (
              <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">No Risk Categories Yet</p>
                </div>
              </div>
            ) : (
              <CardContent>
                <ChartContainer config={categoryChartConfig} className="h-[450px] w-full">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barSize={30}
                    maxBarSize={50}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="Within_Tolerance"
                      fill="var(--green-active)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="Above_Tolerance" fill="var(--red-active)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            )}
          </Card>

          {/* Department Distribution Stacked Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution of Risks by Department</CardTitle>
              <CardDescription>Comprehensive risk breakdown per department</CardDescription>
            </CardHeader>
            {!graphData ? (
              <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2">
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">No Departmental Risks Yet</p>
                </div>
              </div>
            ) : (
              <CardContent>
                <ChartContainer config={departmentChartConfig} className="h-[450px] w-full">
                  <BarChart
                    data={graphData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barSize={30}
                    maxBarSize={50}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis />

                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />

                    <Bar dataKey="High" stackId="a" fill="var(--color-High)" />
                    <Bar dataKey="Medium" stackId="a" fill="var(--color-Medium)" />
                    <Bar dataKey="Open" stackId="a" fill="var(--color-Open)" />
                    <Bar dataKey="Low" stackId="a" fill="var(--color-Low)" />
                    <Bar dataKey="Closed" stackId="a" fill="var(--color-Closed)" />
                    <Bar dataKey="Within" stackId="a" fill="var(--color-Within)" />
                    <Bar dataKey="Above" stackId="a" fill="var(--color-Above)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
