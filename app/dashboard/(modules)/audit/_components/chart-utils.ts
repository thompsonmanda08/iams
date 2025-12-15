import { ChartConfig } from "@/components/ui/chart";

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

export const CHART_CONFIG: ChartConfig = {
  Approved: {
    label: "Approved",
    color: "#10b981"
  },
  "In Progress": {
    label: "In Progress",
    color: "#3b82f6"
  },
  Upcoming: {
    label: "Upcoming",
    color: "#f59e0b"
  },
  Annual: {
    label: "Annual",
    color: "#3b82f6"
  },
  Monthly: {
    label: "Monthly",
    color: "#60a5fa"
  },
  Weekly: {
    label: "Weekly",
    color: "#93c5fd"
  },
  Q1: {
    label: "Q1",
    color: "#8b5cf6"
  },
  Q2: {
    label: "Q2",
    color: "#ec4899"
  },
  Q3: {
    label: "Q3",
    color: "#f59e0b"
  },
  Q4: {
    label: "Q4",
    color: "#10b981"
  }
};

export const prepareChartData = (data: Array<{name: string; value: number}>) => {
  return data.map(item => ({
    ...item,
    fill: CHART_CONFIG[item.name as keyof typeof CHART_CONFIG]?.color || "#8884d8"
  }));
};