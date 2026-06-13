"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const stats = [
  { label: "Total Volume", value: "8,940", change: "+12.3%", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Successful", value: "8,797", change: "98.4%", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "Failed/Handoff", value: "143", change: "1.6%", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
];

const dailyData = [
  { date: "Jun 07", messages: 1200, success: 1180, failed: 20 },
  { date: "Jun 08", messages: 1450, success: 1420, failed: 30 },
  { date: "Jun 09", messages: 1100, success: 1085, failed: 15 },
  { date: "Jun 10", messages: 1600, success: 1580, failed: 20 },
  { date: "Jun 11", messages: 1800, success: 1770, failed: 30 },
  { date: "Jun 12", messages: 1790, success: 1762, failed: 28 },
  { date: "Jun 13", messages: 1000, success: 980, failed: 20 },
];

const botPerformances = [
  { name: "Sales Assistant", messages: 3412, successRate: 99.1 },
  { name: "Support Bot", messages: 4920, successRate: 98.2 },
  { name: "Lead Generator", messages: 608, successRate: 96.8 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <p className="text-sm text-muted-foreground">
          Track message volume, bot efficiency, and customer handoff statistics.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="text-left space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                <span className="text-[11px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                  {stat.change}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily message volume */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <div className="text-left">
              <CardTitle className="text-xl font-bold font-serif">Message Volume</CardTitle>
              <CardDescription>Daily messages processed over the last 7 days.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  name="Total Messages"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bot Performances */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="text-left">
              <CardTitle className="text-xl font-bold font-serif">Bot Efficiency</CardTitle>
              <CardDescription>Success rate per active instance.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={botPerformances} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" domain={[90, 100]} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis dataKey="name" type="category" fontSize={10} width={80} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="successRate"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                  name="Success Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
