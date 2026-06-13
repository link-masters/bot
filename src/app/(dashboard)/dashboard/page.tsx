"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Bot,
  Percent,
  Plus,
  ArrowRight,
  MessageCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Messages", value: "8,940", change: "+12.3%", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Active Bots", value: "3/5", change: "2 connecting", icon: Bot, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Conversations", value: "1,242", change: "+8.4%", icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "AI Accuracy", value: "98.4%", change: "+0.6%", icon: Percent, color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

const activeBots = [
  { id: "1", name: "Sales Assistant", status: "active", number: "+1 (555) 019-2834", messages: 3412, model: "Gemini Flash Lite" },
  { id: "2", name: "Support Bot", status: "active", number: "+1 (555) 014-9382", messages: 4920, model: "Gemini Flash Lite" },
  { id: "3", name: "Lead Generator", status: "connecting", number: "+1 (555) 017-4930", messages: 608, model: "Gemini Flash Lite" },
];

const recentActivity = [
  { id: "1", contact: "+1 (555) 012-3928", bot: "Support Bot", content: "Order tracking link delivered.", time: "2 mins ago", type: "success" },
  { id: "2", contact: "+44 20 7946 0958", bot: "Sales Assistant", content: "Product pricing structure explained.", time: "12 mins ago", type: "success" },
  { id: "3", contact: "+91 98765 43210", bot: "Lead Generator", content: "Lead details captured.", time: "25 mins ago", type: "success" },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/15 to-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 fill-primary" />
            Gemini AI Automation Live
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-serif">Hello, Demo User!</h2>
          <p className="text-muted-foreground text-xs max-w-md">
            Your bots are running smoothly. You have used 8,940 of your 10,000 monthly message limits.
          </p>
          <div className="w-full max-w-xs pt-1">
            <div className="flex justify-between text-[10px] mb-1 font-medium">
              <span>Monthly Limits</span>
              <span>89.4% used</span>
            </div>
            <Progress value={89.4} className="h-1.5" />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button asChild size="sm" className="glow flex-1 md:flex-none">
            <Link href="/bots">
              <Plus className="w-4 h-4 mr-1" />
              Connect Bot
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
            <Link href="/conversations">
              Live Chat
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="text-left space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                <span className="text-[11px] text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bots List */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="text-left">
              <CardTitle className="text-xl font-bold font-serif">Active Bots</CardTitle>
              <CardDescription>Bots currently connected to phone numbers.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
              <Link href="/bots" className="flex items-center gap-1">
                Manage All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeBots.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-border/80 transition-colors bg-background/30"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    bot.status === "active" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{bot.name}</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-muted">
                        {bot.model}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{bot.number}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold">{bot.messages.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Messages</div>
                  </div>
                  <Badge
                    variant={bot.status === "active" ? "default" : "secondary"}
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full capitalize font-medium",
                      bot.status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    )}
                  >
                    {bot.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <div className="text-left">
              <CardTitle className="text-xl font-bold font-serif">Recent Activity</CardTitle>
              <CardDescription>Latest automation triggers.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex gap-3 text-left items-start p-2 hover:bg-accent/30 rounded-lg transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs">{act.contact}</span>
                    <span className="text-[10px] text-muted-foreground">{act.time}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Via <span className="font-medium text-foreground">{act.bot}</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed bg-background/50 p-2 rounded border border-border/20 text-muted-foreground truncate">
                    {act.content}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
