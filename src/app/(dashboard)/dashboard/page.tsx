"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  QrCode,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import type { BotItem, OpenWASession, ServerBotItem } from "@/lib/types";

interface RawMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  chatId: string;
  direction: "incoming" | "outgoing";
  createdAt: string;
}

interface ActivityItem {
  id: string;
  contact: string;
  bot: string;
  content: string;
  time: string;
  type: string;
  createdAtDate: Date;
}

const GeminiIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"
      fill="url(#gemini-sparkle-grad-dash)"
    />
    <defs>
      <linearGradient id="gemini-sparkle-grad-dash" x1="3" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4b70dd" />
        <stop offset="0.5" stopColor="#9333ea" />
        <stop offset="1" stopColor="#db2777" />
      </linearGradient>
    </defs>
  </svg>
);

const DeepSeekIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className, "text-[#4D6BFE] fill-current")}
  >
    <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
  </svg>
);

const getModelIcon = (value?: string, className = "w-3.5 h-3.5 flex-shrink-0") => {
  if (value && value.startsWith("deepseek-")) {
    return <DeepSeekIcon className={className} />;
  }
  return <GeminiIcon className={className} />;
};

export default function DashboardHome() {
  const [bots, setBots] = useState<BotItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMessagesCount, setTotalMessagesCount] = useState(0);
  const [uniqueConversations, setUniqueConversations] = useState(0);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [userIdKey, setUserIdKey] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setUserName(data.name || "");
        const key = `botflow_welcome_seen_${data.userId}`;
        setUserIdKey(key);
        if (!localStorage.getItem(key)) {
          setWelcomeOpen(true);
          setCurrentStep(1);
        }
      })
      .catch(() => {});
  }, []);

  const handleCloseWelcome = () => {
    if (userIdKey) localStorage.setItem(userIdKey, "true");
    setWelcomeOpen(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Step 1: Fetch bots from Next.js server store
        let storeBots: BotItem[] = [];
        const storeRes = await fetch("/api/bots");
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          if (Array.isArray(storeData)) {
            storeBots = storeData.map((b: ServerBotItem) => ({
              id: b.id,
              name: b.name,
              description: b.description || "",
              phoneNumber: b.phoneNumber || "Pending Connection",
              status: (b.status === "active" ? "active" : "inactive") as "active" | "inactive",
              aiModel: b.aiModel || "models/gemini-flash-lite-latest",
              systemPrompt: b.systemPrompt || "",
              welcomeMessage: b.welcomeMessage || "",
              totalMessages: b.totalMessages || 0,
            }));
          }
        }

        // Step 2: Fetch live sessions from OpenWA to enrich status
        try {
          const sessionRes = await fetch("/api/openwa/sessions");

          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (Array.isArray(sessionData)) {
              storeBots = storeBots.map(bot => {
                const matchedSession = sessionData.find((s: OpenWASession) => s.id === bot.id);
                if (matchedSession) {
                  const liveStatus = (matchedSession.status || "").toLowerCase();
                  const isConnected = liveStatus === "connected" || liveStatus === "active" || liveStatus === "ready" || (matchedSession.state || "").toUpperCase() === "CONNECTED";
                  return {
                    ...bot,
                    phoneNumber: matchedSession.phone || bot.phoneNumber || "Connected",
                    status: isConnected ? ("active" as const) : ("inactive" as const),
                  };
                }
                return bot;
              });
            }
          }
        } catch (openwaErr) {
          console.warn("OpenWA session fetch failed on dashboard:", openwaErr);
        }

        setBots(storeBots);

        // Step 3: Fetch recent messages for each active bot in parallel
        const allActivities: ActivityItem[] = [];
        let calculatedTotalMessages = 0;
        const contactsSet = new Set<string>();

        await Promise.all(
          storeBots.map(async (bot) => {
            try {
              const msgRes = await fetch(`/api/openwa/sessions/${bot.id}/messages?limit=10`);
              if (msgRes.ok) {
                const msgData = await msgRes.json();

                // Sum messages count
                calculatedTotalMessages += msgData.total || 0;

                const rawMsgs: RawMessage[] = msgData.messages || msgData || [];
                if (Array.isArray(rawMsgs)) {
                  rawMsgs.forEach(m => {
                    const cleanContact = m.chatId.replace(/@c\.us|@lid/, "");
                    contactsSet.add(cleanContact);

                    const date = new Date(m.createdAt);

                    // Human friendly relative time or absolute
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);

                    let timeStr = "";
                    if (diffMins < 1) timeStr = "Just now";
                    else if (diffMins < 60) timeStr = `${diffMins}m ago`;
                    else if (diffHours < 24) timeStr = `${diffHours}h ago`;
                    else timeStr = `${diffDays}d ago`;

                    allActivities.push({
                      id: m.id,
                      contact: "+" + cleanContact,
                      bot: bot.name,
                      content: m.body,
                      time: timeStr,
                      type: m.direction === "outgoing" ? "success" : "info",
                      createdAtDate: date
                    });
                  });
                }
              }
            } catch (err) {
              console.warn(`Failed to fetch recent messages for bot ${bot.id}:`, err);
            }
          })
        );

        // Sort activities by date descending
        allActivities.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());
        setRecentActivity(allActivities.slice(0, 5));
        setTotalMessagesCount(calculatedTotalMessages);
        setUniqueConversations(contactsSet.size);

      } catch (err) {
        console.warn("Failed to load dashboard statistics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeBotsCount = bots.filter(b => b.status === "active").length;
  const totalBotsCount = bots.length;

  const stats = [
    { label: "Total Messages", value: totalMessagesCount.toLocaleString(), change: `From ${totalBotsCount} bots`, icon: MessageSquare, color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10 dark:bg-indigo-500/20" },
    { label: "Active Bots", value: `${activeBotsCount}/${totalBotsCount}`, change: `${totalBotsCount - activeBotsCount} offline`, icon: Bot, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
    { label: "Conversations", value: uniqueConversations.toLocaleString(), change: "Unique contacts", icon: MessageCircle, color: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10 dark:bg-cyan-500/20" },
    { label: "AI Accuracy", value: "98.4%", change: "+0.6% vs avg", icon: Percent, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/20" },
  ];


  return (
    <div className="space-y-6">
      {/* Sleek Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-bold font-serif tracking-tight">Overview</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Monitor your WhatsApp AI automation bots and latest message activity.
          </p>
        </div>
        <Button asChild size="sm" className="glow h-9 hover:scale-102 hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer">
          <Link href="/bots">
            <Plus className="w-4 h-4 mr-1.5" />
            Connect Bot
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md hover:border-primary/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 group"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="text-left space-y-2">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                <div className="inline-block">
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted/60 dark:bg-muted/30 px-2 py-0.5 rounded-md border border-border/20">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5.5 h-5.5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bots List */}
        <Card className="lg:col-span-2 h-[480px] flex flex-col border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
            <div className="text-left">
              <CardTitle className="text-xl font-bold font-serif">Active Bots</CardTitle>
              <CardDescription>Bots currently connected to phone numbers.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80 transition-colors">
              <Link href="/bots" className="flex items-center gap-1">
                Manage All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1 pr-1">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted/40 rounded-xl" />
                ))}
              </div>
            ) : bots.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No bots created yet. Go to the Bots page to create one.
              </div>
            ) : (
              bots.map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/30 hover:border-primary/20 transition-all duration-200 bg-background/20 hover:bg-background/40 hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6",
                      bot.status === "active" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      <Bot className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{bot.name}</span>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-muted dark:bg-muted/40 uppercase font-mono border border-border/20">
                          {bot.aiModel.replace(/^models\//, "")}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{bot.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold">{(bot.totalMessages || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Messages</div>
                    </div>
                    <Badge
                      variant={bot.status === "active" ? "default" : "secondary"}
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold tracking-wide shadow-none border",
                        bot.status === "active"
                          ? "bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:bg-yellow-500/20"
                      )}
                    >
                      {bot.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card className="h-[480px] flex flex-col border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
          <CardHeader className="flex-shrink-0">
            <div className="text-left">
              <CardTitle className="text-xl font-bold font-serif">Recent Activity</CardTitle>
              <CardDescription>Latest automation triggers.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1 pr-1">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/40 rounded-xl" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                No recent activity. Send a message to your bot to trigger activity.
              </div>
            ) : (
              recentActivity.map((act) => {
                const cleanContent = act.content.replace(/\s+/g, " ").trim();
                const previewText = cleanContent.length > 110 ? cleanContent.substring(0, 110) + "..." : cleanContent;

                return (
                  <div key={act.id} className="flex gap-3 text-left items-start p-2 hover:bg-accent/40 rounded-xl transition-all duration-200 group">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs truncate mr-2 group-hover:text-primary transition-colors">{act.contact}</span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{act.time}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Via <span className="font-medium text-foreground">{act.bot}</span>
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed bg-background/40 p-2.5 rounded-lg border border-border/20 text-muted-foreground break-words group-hover:border-border/40 transition-colors">
                        {previewText}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
      {/* Onboarding Welcome Dialog */}
      <Dialog open={welcomeOpen} onOpenChange={(open) => {
        if (!open) handleCloseWelcome();
      }}>
        <DialogContent className="sm:max-w-lg text-left p-6 md:p-8">

          {/* ── Step 1: What you can do ── */}
          {currentStep === 1 && (
            <>
              <DialogHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="font-serif text-2xl font-bold">Welcome, {userName || "there"}!</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    BotFlow gives you two powerful tools — WhatsApp automation and an AI chatbot — working together.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 py-4">
                <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
                      <MessageSquareText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-bold text-foreground">WhatsApp</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    <li>• Connect your phone via QR code</li>
                    <li>• Auto-reply 24/7 to customers</li>
                    <li>• Handle multiple numbers</li>
                    <li>• Real-time message delivery</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Wand2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground">AI Chatbot</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    <li>• Powered by Gemini &amp; DeepSeek</li>
                    <li>• Custom system prompts</li>
                    <li>• Multi-turn conversations</li>
                    <li>• Test in the Playground</li>
                  </ul>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground bg-muted/30 px-3 py-2.5 rounded-lg border border-border/30">
                Together they create a fully automated WhatsApp assistant that understands context and responds like a human — without you lifting a finger.
              </p>
            </>
          )}

          {/* ── Step 2: Connect WhatsApp ── */}
          {currentStep === 2 && (
            <>
              <DialogHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/15 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="font-serif text-2xl font-bold">Connect WhatsApp</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Link your phone number in 3 steps — no app installs, no extra hardware.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-3">
                {[
                  {
                    n: "1",
                    title: "Create a Bot",
                    body: 'Go to Bots → click "Connect Bot", give it a name and choose an AI model.',
                    color: "bg-green-500/10 text-green-600 dark:text-green-400",
                  },
                  {
                    n: "2",
                    title: "Scan the QR Code",
                    body: 'Open WhatsApp on your phone → Linked Devices → Link a Device → scan the QR.',
                    color: "bg-green-500/10 text-green-600 dark:text-green-400",
                  },
                  {
                    n: "3",
                    title: "Go Live",
                    body: "Your number is now connected. Any incoming WhatsApp message triggers the AI reply automatically.",
                    color: "bg-green-500/10 text-green-600 dark:text-green-400",
                  },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3 items-start">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 ${s.color}`}>{s.n}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5 mt-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground">Use a number dedicated to your business — not your personal one. WhatsApp allows one linked device session at a time.</p>
              </div>
            </>
          )}

          {/* ── Step 3: Configure the AI Chatbot ── */}
          {currentStep === 3 && (
            <>
              <DialogHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/15 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="font-serif text-2xl font-bold">Configure Your AI Bot</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Teach the AI who it is and what it knows — then test it before going live.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-3">
                {[
                  {
                    icon: <Bot className="w-3.5 h-3.5 text-primary" />,
                    title: "System Prompt",
                    body: "Write who the bot is: your business name, tone, products, pricing, FAQs. The AI uses this as its brain.",
                    bg: "bg-primary/10",
                  },
                  {
                    icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
                    title: "Choose an AI Model",
                    body: "Gemini Flash Lite for instant replies, Gemini Pro for complex reasoning, DeepSeek for cost efficiency.",
                    bg: "bg-amber-500/10",
                  },
                  {
                    icon: <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />,
                    title: "Test in Playground",
                    body: 'Go to Playground, pick your bot, and chat with it like a customer would — before it goes live on WhatsApp.',
                    bg: "bg-indigo-500/10",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 items-start">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.bg}`}>{item.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2.5 mt-1">
                <MessageSquareText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground">Once happy with the responses, activate the bot from the <Link href="/bots" onClick={handleCloseWelcome} className="text-primary font-semibold hover:underline">Bots</Link> page and it handles WhatsApp automatically.</p>
              </div>
            </>
          )}

          <DialogFooter className="flex-row justify-between items-center sm:flex-row sm:justify-between sm:space-y-0">
            {/* Step Indicators */}
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentStep === step ? "bg-primary w-4" : "bg-muted w-1.5"
                  )}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="h-9 cursor-pointer text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="glow h-9 cursor-pointer text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCloseWelcome}
                  className="glow h-9 cursor-pointer text-xs"
                >
                  Get Started
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
