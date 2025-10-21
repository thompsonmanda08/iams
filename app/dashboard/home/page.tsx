"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  Target,
  BarChart3,
  Settings,
  BookOpen,
  FileCheck,
  Activity,
  Zap,
  HelpCircle,
  GraduationCap,
  FileStack,
  BookMarked,
  ListChecks
} from "lucide-react";

export default function RiskDashboard() {
  const riskMetrics = [
    { label: "Current personal risk score", value: 2, status: "critical" },
    { label: "Logical access monthly attestation", value: 6, status: "critical" },
    { label: "Overdue action items", value: 0, status: "success" },
    { label: "Risk policies attestation", value: 3, status: "warning" },
    { label: "Losses attributed to me", value: 1, status: "warning" },
    { label: "Incidences reported in my profile", value: 0, status: "success" },
    { label: "RCSA monthly attestation", value: 5, status: "success" },
    { label: "Failed audits in unit", value: 0, status: "critical" },
    { label: "Recoverable losses not recovered", value: 0, status: "critical" },
    { label: "Interaction with this platform", value: 1, status: "warning" }
  ];

  const quickLinks = [
    { icon: Target, label: "Incident management", href: "#" },
    { icon: AlertTriangle, label: "Indicators", href: "#" },
    { icon: ListChecks, label: "Actions", href: "#" },
    { icon: Shield, label: "RCSA", href: "#" }
  ];

  const appLauncher = [
    { icon: FileText, label: "Project management", href: "#" },
    { icon: FileCheck, label: "Audit and Assurance", href: "#" },
    { icon: Activity, label: "Stress testing", href: "#" },
    { icon: Settings, label: "Governance", href: "#" }
  ];

  const dashboards = [
    { icon: BarChart3, label: "Audit dashboard", href: "#" },
    { icon: Zap, label: "Operations dashboard", href: "#" },
    { icon: TrendingUp, label: "Pareto analysis", href: "#" },
    { icon: BarChart3, label: "Economic outlook", href: "#" }
  ];

  const resources = [
    { icon: GraduationCap, label: "Cybersecurity training", href: "#" },
    { icon: FileStack, label: "Risk policies", href: "#" },
    { icon: BookMarked, label: "Employee hand book", href: "#" },
    { icon: BookOpen, label: "SOAPs", href: "#" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "warning":
        return "bg-warning/10 text-warning-foreground border-warning/20";
      case "success":
        return "bg-success/10 text-success-foreground border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <Clock className="h-4 w-4" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <User className="text-primary h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Risk Profile</h1>
                <p className="text-muted-foreground text-sm">Completion rates and risk analytics</p>
              </div>
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="from-card to-card/50 border-border/50 bg-linear-to-br p-6 lg:col-span-1">
            <div className="mb-6 flex items-start gap-4">
              <Avatar className="border-primary/20 h-14 w-14 border-2">
                <AvatarImage src="/placeholder.svg?height=56&width=56" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  IS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-muted-foreground mb-1 text-sm">Welcome</p>
                <h3 className="text-lg font-semibold">Bob Mwale</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Your risk profile is currently
                  </span>
                  <Badge variant="destructive" className="font-semibold">
                    RED
                  </Badge>
                </div>
              </div>
              <span className="text-muted-foreground text-xs">2 hours ago</span>
            </div>

            <div className="bg-muted/50 border-border/50 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your current accumulated risk score is below 8. Improve your risk profile to green
                by accumulating 10 points to be included in the monthly draw to win ZMW 100,000.00
              </p>
            </div>

            {/* Risk Metrics */}
            <div className="mt-6 space-y-2">
              {riskMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 transition-colors">
                  <span className="text-foreground/80 text-sm">{metric.label}</span>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(metric.status)} min-w-[2.5rem] justify-center font-semibold`}>
                    {metric.value}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Links & App Launcher */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Quick Links */}
              <Card className="from-card to-card/50 border-border/50 bg-gradient-to-br p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="text-primary h-5 w-5" />
                  <h3 className="text-lg font-semibold">Quick links</h3>
                </div>
                <div className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="hover:bg-primary/5 group flex items-center gap-3 rounded-lg p-3 transition-colors">
                      <div className="bg-primary/10 group-hover:bg-primary/20 flex h-9 w-9 items-center justify-center rounded-md transition-colors">
                        <link.icon className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              </Card>

              {/* App Launcher */}
              <Card className="from-card to-card/50 border-border/50 bg-gradient-to-br p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Target className="text-accent h-5 w-5" />
                  <h3 className="text-lg font-semibold">App launcher</h3>
                </div>
                <div className="space-y-2">
                  {appLauncher.map((app, index) => (
                    <a
                      key={index}
                      href={app.href}
                      className="hover:bg-accent/5 group flex items-center gap-3 rounded-lg p-3 transition-colors">
                      <div className="bg-accent/10 group-hover:bg-accent/20 flex h-9 w-9 items-center justify-center rounded-md transition-colors">
                        <app.icon className="text-accent h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{app.label}</span>
                    </a>
                  ))}
                </div>
              </Card>
            </div>

            {/* Dashboards & Resources */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* My Dashboards */}
              <Card className="from-card to-card/50 border-border/50 bg-gradient-to-br p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="text-primary h-5 w-5" />
                  <h3 className="text-lg font-semibold">My dashboards</h3>
                </div>
                <div className="space-y-2">
                  {dashboards.map((dashboard, index) => (
                    <a
                      key={index}
                      href={dashboard.href}
                      className="hover:bg-primary/5 group flex items-center gap-3 rounded-lg p-3 transition-colors">
                      <div className="bg-primary/10 group-hover:bg-primary/20 flex h-9 w-9 items-center justify-center rounded-md transition-colors">
                        <dashboard.icon className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{dashboard.label}</span>
                    </a>
                  ))}
                </div>
              </Card>

              {/* Help & Resources */}
              <Card className="from-card to-card/50 border-border/50 bg-gradient-to-br p-6">
                <div className="mb-4 flex items-center gap-2">
                  <HelpCircle className="text-accent h-5 w-5" />
                  <h3 className="text-lg font-semibold">Help and resources</h3>
                </div>
                <div className="space-y-2">
                  {resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.href}
                      className="hover:bg-accent/5 group flex items-center gap-3 rounded-lg p-3 transition-colors">
                      <div className="bg-accent/10 group-hover:bg-accent/20 flex h-9 w-9 items-center justify-center rounded-md transition-colors">
                        <resource.icon className="text-accent h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{resource.label}</span>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
