"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Plus, QrCode, Loader2, Sparkles, CheckCircle2, Trash2, MessageSquare, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { callGeminiAPI } from "@/lib/gemini";

interface BotItem {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  status: "active" | "inactive" | "connecting" | "qr_pending";
  aiModel: string;
  systemPrompt: string;
  welcomeMessage: string;
  totalMessages: number;
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [connectionStep, setConnectionStep] = useState<"init" | "qr" | "success">("init");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionId, setSessionId] = useState("whatsapp-bot");
  // Track whether the QR has been obtained — prevents re-fetching every poll cycle
  const [qrObtained, setQrObtained] = useState(false);
  // Track whether the initial session setup is done and we should start polling
  const [shouldPoll, setShouldPoll] = useState(false);
  // Ref so the polling closure always reads the latest session ID
  const sessionIdRef = useRef(sessionId);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Form states for adding a new bot
  const [newBotName, setNewBotName] = useState("");
  const [newBotDesc, setNewBotDesc] = useState("");
  const [newBotModel, setNewBotModel] = useState("models/gemini-flash-lite-latest");
  const [newBotPrompt, setNewBotPrompt] = useState("");
  const [newBotWelcome, setNewBotWelcome] = useState("");
  const [qrError, setQrError] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<BotItem | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("Initializing browser...");

  // Playground states
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<BotItem | null>(null);
  const [playgroundMessages, setPlaygroundMessages] = useState<{ sender: "user" | "assistant"; content: string; time: string }[]>([]);
  const [playgroundInput, setPlaygroundInput] = useState("");
  const [isPlaygroundThinking, setIsPlaygroundThinking] = useState(false);

  // Load bots from server store and enrich with live OpenWA session status
  useEffect(() => {
    const fetchBotsAndSessions = async () => {
      setIsLoading(true);
      try {
        interface ServerBotItem {
          id: string;
          name: string;
          description?: string;
          phoneNumber?: string;
          status?: "active" | "inactive";
          aiModel?: string;
          systemPrompt?: string;
          welcomeMessage?: string;
          totalMessages?: number;
        }

        interface OpenWASession {
          id: string;
          name?: string;
          phone?: string;
          status?: string;
          state?: string;
        }

        // Step 1: Fetch bots from Next.js server store (source of truth)
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

        // Step 2: Fetch live sessions from OpenWA to enrich status & phone number
        const openwaHost = localStorage.getItem("botflow_openwa_url") || "http://127.0.0.1:2785";
        const openwaToken = localStorage.getItem("botflow_openwa_key") || "";

        try {
          const sessionRes = await fetch("/api/openwa/sessions", {
            headers: {
              "x-openwa-url": openwaHost,
              "Authorization": `Bearer ${openwaToken}`,
              "X-API-Key": openwaToken
            }
          });

          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (Array.isArray(sessionData)) {
              // Enrich server-store bots with live session data
              // OpenWA returns { id, name, status, phone, ... } — match on `s.id`
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
                // No matching live session — keep server-store status as-is
                return bot;
              });
            }
          }
        } catch (openwaErr) {
          console.warn("OpenWA session fetch failed (using store data only):", openwaErr);
        }

        // Only show bots from the server store — never auto-create from raw OpenWA sessions
        setBots(storeBots);
      } catch (err) {
        console.warn("Could not retrieve bots:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotsAndSessions();
  }, []);

  const handleOpenPlayground = (bot: BotItem) => {
    setSelectedBot(bot);
    setPlaygroundMessages([
      {
        sender: "assistant",
        content: bot.welcomeMessage || `Hi! I am ${bot.name}. How can I assist you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setPlaygroundOpen(true);
  };

  const handleSendPlaygroundMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundInput.trim() || !selectedBot) return;

    const userMsg = playgroundInput;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setPlaygroundMessages(prev => [...prev, { sender: "user", content: userMsg, time }]);
    setPlaygroundInput("");
    setIsPlaygroundThinking(true);

    try {
      const apiKey = localStorage.getItem("botflow_gemini_key");
      const hasRealKey = apiKey && apiKey !== "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx" && apiKey.startsWith("AIzaSy");

      let replyText = "";
      if (hasRealKey) {
        const history = playgroundMessages.slice(1).map(m => ({
          sender: m.sender,
          content: m.content
        }));
        replyText = await callGeminiAPI(apiKey, selectedBot.aiModel, selectedBot.systemPrompt, userMsg, history);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500)); // simulate thinking latency
        replyText = `[Demo Mode] Hi! As "${selectedBot.name}" (Model: ${selectedBot.aiModel}), here is a simulated response to "${userMsg}". \n\nSystem Prompt guidelines active: "${selectedBot.systemPrompt}". \n\n*Configure your Gemini API Key in Settings to get real-time AI responses.*`;
      }

      setPlaygroundMessages(prev => [
        ...prev,
        {
          sender: "assistant",
          content: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      toast.error("Failed to generate AI response. Using mock fallback.");
      const fallbackText = `I ran into an issue connecting to Gemini. Please verify your API Key in Settings. \n\nPrompt Context: "${selectedBot.systemPrompt}"`;
      setPlaygroundMessages(prev => [...prev, { sender: "assistant", content: fallbackText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsPlaygroundThinking(false);
    }
  };

  const handleToggleBot = async (botId: string, currentState: boolean) => {
    try {
      const openwaHost = localStorage.getItem("botflow_openwa_url") || "http://127.0.0.1:2886";
      const openwaToken = localStorage.getItem("botflow_openwa_key") || "";

      // Call start or stop on the container
      const action = currentState ? "stop" : "start";
      const res = await fetch(`/api/openwa/sessions/${botId}/${action}`, {
        method: "POST",
        headers: {
          "x-openwa-url": openwaHost,
          "Authorization": `Bearer ${openwaToken}`,
          "X-API-Key": openwaToken
        }
      });
 
      if (res.ok) {
        setBots((prev) =>
          prev.map((bot) =>
            bot.id === botId
              ? { ...bot, status: currentState ? ("inactive" as const) : ("active" as const) }
              : bot
          )
        );
        toast.success(`Bot session ${currentState ? "stopped" : "started"} successfully!`);
      } else {
        throw new Error("Failed to change session status on OpenWA container");
      }
    } catch (err) {
      console.warn(err);
      // Local fallback
      setBots((prev) =>
        prev.map((bot) =>
          bot.id === botId
            ? { ...bot, status: currentState ? ("inactive" as const) : ("active" as const) }
            : bot
        )
      );
      toast.success(`Demo Mode: Bot ${currentState ? "deactivated" : "activated"} locally.`);
    }
  };
 
  const handleGenerateQr = async () => {
    setIsGeneratingQr(true);
    setConnectionStep("qr");
    setQrError(false);
    setQrObtained(false);
    setShouldPoll(false);
    setSessionStatus("Creating WhatsApp session...");
    const targetSessionName = `botflow-${Math.random().toString(36).substring(7)}`;

    try {
      const openwaHost = localStorage.getItem("botflow_openwa_url") || "http://127.0.0.1:2785";
      const openwaToken = localStorage.getItem("botflow_openwa_key") || "";

      // Step A: Create the session on OpenWA container first
      const createRes = await fetch("/api/openwa/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openwa-url": openwaHost,
          "Authorization": `Bearer ${openwaToken}`,
          "X-API-Key": openwaToken
        },
        body: JSON.stringify({
          name: targetSessionName
        })
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create session on OpenWA. HTTP status ${createRes.status}`);
      }

      const createData = await createRes.json();
      // Support both nested: { success: true, data: { id: "..." } } or flat: { id: "..." }
      const sessionData = createData.data || createData;
      const actualSessionId = sessionData.id || sessionData.name || targetSessionName;

      // Save the actual UUID / session ID for subsequent operations (polling, webhooks, deletion)
      setSessionId(actualSessionId);
      sessionIdRef.current = actualSessionId;
      setSessionStatus("Launching WhatsApp browser (takes ~1 min)...");

      // Step B: Request session start using the correct ID
      const startRes = await fetch(`/api/openwa/sessions/${actualSessionId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openwa-url": openwaHost,
          "Authorization": `Bearer ${openwaToken}`,
          "X-API-Key": openwaToken
        }
      });

      if (!startRes.ok) {
        throw new Error(`Failed to start session on OpenWA. HTTP status ${startRes.status}`);
      }

      setSessionStatus("Loading QR Code...");

      // Step C: Get QR Code url using the correct ID
      const qrRes = await fetch(`/api/openwa/sessions/${actualSessionId}/qr`, {
        headers: {
          "x-openwa-url": openwaHost,
          "Authorization": `Bearer ${openwaToken}`,
          "X-API-Key": openwaToken
        }
      });
      
      if (qrRes.ok) {
        const contentType = qrRes.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const qrData = await qrRes.json();
          const nestedData = qrData.data || qrData;
          const qrCodeStr = nestedData.qrCode || nestedData.image || nestedData.qr || nestedData.code || qrData.code || "";
          
          if (qrCodeStr.startsWith("data:image")) {
            setQrUrl(qrCodeStr);
            setQrObtained(true);
            setSessionStatus("Waiting for WhatsApp scan...");
          } else if (qrCodeStr) {
            const qrImg = await QRCode.toDataURL(qrCodeStr);
            setQrUrl(qrImg);
            setQrObtained(true);
            setSessionStatus("Waiting for WhatsApp scan...");
          }
        } else {
          const qrText = await qrRes.text();
          if (qrText.startsWith("data:image")) {
            setQrUrl(qrText);
            setQrObtained(true);
            setSessionStatus("Waiting for WhatsApp scan...");
          } else if (qrText) {
            const qrImg = await QRCode.toDataURL(qrText);
            setQrUrl(qrImg);
            setQrObtained(true);
            setSessionStatus("Waiting for WhatsApp scan...");
          }
        }
      } else {
        throw new Error("Unable to retrieve QR pairing token from OpenWA.");
      }

      // Now that session is fully set up and QR obtained, start polling for connection
      setShouldPoll(true);
    } catch (error) {
      console.warn("Could not connect to real OpenWA:", error);
      setQrError(true);
      setShouldPoll(false);
      toast.error("Failed to generate QR Code. OpenWA server may be unreachable.");
    } finally {
      setIsGeneratingQr(false);
    }
  };
 
  // Poll for scanning and connection success — only runs after QR setup is complete
  useEffect(() => {
    let activeInterval: NodeJS.Timeout;
    let pollTimeoutId: NodeJS.Timeout;

    if (!shouldPoll) return;

    const openwaHost = localStorage.getItem("botflow_openwa_url") || "http://127.0.0.1:2785";
    const openwaToken = localStorage.getItem("botflow_openwa_key") || "";
    let pollCount = 0;
    const MAX_POLLS = 100; // ~5 minutes at 3s interval

    activeInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > MAX_POLLS) {
        clearInterval(activeInterval);
        setShouldPoll(false);
        setSessionStatus("QR code expired. Please try again.");
        setQrError(true);
        toast.error("QR code expired after 5 minutes. Please generate a new one.");
        return;
      }

      const currentSessionId = sessionIdRef.current;
      try {
        const res = await fetch(`/api/openwa/sessions/${currentSessionId}`, {
          headers: {
            "x-openwa-url": openwaHost,
            "Authorization": `Bearer ${openwaToken}`,
            "X-API-Key": openwaToken
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const matchedStatus = data.data || data;
          const status = (matchedStatus.status || "").toLowerCase();

          // Update live status label
          if (status === "initializing") {
            setSessionStatus("Launching WhatsApp browser (takes ~1 min)...");
          } else if (status === "scan_qr" || status === "qr_ready") {
            setSessionStatus("Waiting for WhatsApp scan...");
          } else if (status === "connecting") {
            setSessionStatus("Connecting to WhatsApp...");
          } else if (status === "connected" || status === "active" || status === "ready") {
            setSessionStatus("WhatsApp connected!");
          }
          
          const isConnected = status === "connected" || status === "active" || status === "ready" || (matchedStatus.state || "").toUpperCase() === "CONNECTED";
          
          if (isConnected) {
            clearInterval(activeInterval);
            setShouldPoll(false);
            setConnectionStep("success");
            toast.success("WhatsApp account linked successfully!");
            
            // Register Webhook based on selected automation engine
            const backend = localStorage.getItem("botflow_automation_backend") || "builtin";
            let webhookTargetUrl = "";
            if (backend === "builtin") {
              // Use host.docker.internal so the Docker container can reach the host machine.
              // 'localhost' fails OpenWA's URL validator (no TLD) and is unreachable from inside Docker.
              webhookTargetUrl = `http://host.docker.internal:3000/api/webhooks/openwa`;
            } else {
              webhookTargetUrl = localStorage.getItem("botflow_n8n_webhook_url") || "";
            }

            if (webhookTargetUrl) {
              try {
                const webhookRes = await fetch(`/api/openwa/sessions/${currentSessionId}/webhooks`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-openwa-url": openwaHost,
                    "Authorization": `Bearer ${openwaToken}`,
                    "X-API-Key": openwaToken
                  },
                  body: JSON.stringify({
                    url: webhookTargetUrl,
                    events: ["message.received", "message"],
                    secret: "botflow-secret"
                  })
                });
                if (webhookRes.ok) {
                  toast.success(`${backend === "builtin" ? "Built-in AI" : "n8n"} Webhook registered successfully.`);
                } else {
                  console.error("Failed to register webhook on OpenWA:", await webhookRes.text());
                  toast.error("Failed to register webhook on OpenWA.");
                }
              } catch (err) {
                console.warn("Could not register webhook on OpenWA:", err);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 5000); // Poll every 5 seconds (was 3s — reduced frequency)
    
    // Safety timeout: stop polling after 5 minutes
    pollTimeoutId = setTimeout(() => {
      clearInterval(activeInterval);
      setShouldPoll(false);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(activeInterval);
      clearTimeout(pollTimeoutId);
    };
  }, [shouldPoll]);
 
  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName) {
      toast.error("Please enter a name for the bot.");
      return;
    }
 
    const newBot: BotItem = {
      id: sessionId,
      name: newBotName,
      description: newBotDesc,
      phoneNumber: "+1 (555) 012-9900", // simulated
      status: "active",
      aiModel: newBotModel,
      systemPrompt: newBotPrompt,
      welcomeMessage: newBotWelcome,
      totalMessages: 0,
    };
 
    try {
      // Sync bot config to Next.js server store
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newBot)
      });
      if (res.ok) {
        setBots((prev) => {
          const filtered = prev.filter(b => b.id !== newBot.id);
          return [...filtered, newBot];
        });
        toast.success("Bot configuration saved and synced successfully!");
      } else {
        throw new Error("Failed to sync bot configuration to server database.");
      }
    } catch (err) {
      console.error("Bot sync error:", err);
      toast.error("Failed to sync bot to server store. Saving locally.");
      setBots((prev) => [...prev, newBot]);
    }
 
    setDialogOpen(false);
    resetForm();
  };
 
  const resetForm = () => {
    setNewBotName("");
    setNewBotDesc("");
    setNewBotModel("models/gemini-flash-lite-latest");
    setNewBotPrompt("");
    setNewBotWelcome("");
    setConnectionStep("init");
    setQrUrl("");
    setQrError(false);
    setQrObtained(false);
    setShouldPoll(false);
    setSessionStatus("Initializing browser...");
  };
 
  const handleDeleteBot = async (botId: string) => {
    try {
      const openwaHost = localStorage.getItem("botflow_openwa_url") || "http://127.0.0.1:2886";
      const openwaToken = localStorage.getItem("botflow_openwa_key") || "";
 
      const res = await fetch(`/api/openwa/sessions/${botId}`, {
        method: "DELETE",
        headers: {
          "x-openwa-url": openwaHost,
          "Authorization": `Bearer ${openwaToken}`,
          "X-API-Key": openwaToken
        }
      });
 
      if (res.ok) {
        toast.success("Bot session deleted on OpenWA container.");
      }
    } catch (err) {
      console.warn("Could not delete bot session on OpenWA:", err);
    }
 
    try {
      const storeRes = await fetch(`/api/bots?id=${botId}`, {
        method: "DELETE"
      });
      if (storeRes.ok) {
        toast.success("Bot configuration removed from server database.");
      }
    } catch (err) {
      console.error("Could not sync bot deletion to server:", err);
    }
 
    setBots((prev) => prev.filter((b) => b.id !== botId));
    toast.success("Bot deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div className="text-left">
          <p className="text-sm md:text-[15px] text-muted-foreground font-medium">
            Create, configure, and monitor your WhatsApp automation instances.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="glow h-10 px-4 rounded-lg flex items-center justify-center font-medium cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create AI Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl text-left max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold">Configure WhatsApp AI Bot</DialogTitle>
              <DialogDescription>
                Link your phone number and design the AI persona.
              </DialogDescription>
            </DialogHeader>

            {connectionStep === "init" && (
              <div className="space-y-6 py-4">
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-2xl bg-muted/10 text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">Step 1: Link WhatsApp Number</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      We connect your instance securely via an OpenWA virtual browser. You will need your WhatsApp app to scan a QR code.
                    </p>
                  </div>
                  <Button onClick={handleGenerateQr} className="glow">
                    Generate Connection QR
                  </Button>
                </div>
              </div>
            )}

            {connectionStep === "qr" && (
              <div className="space-y-6 py-4 flex flex-col items-center text-center">
                <div className="p-4 bg-white rounded-2xl border border-border/80 shadow-md w-fit min-h-48 min-w-48 flex items-center justify-center">
                  {isGeneratingQr ? (
                    <div className="w-48 h-48 flex items-center justify-center bg-muted/10">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : qrError ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center bg-red-500/5 text-red-500 p-4 rounded-xl gap-2">
                      <AlertCircle className="w-8 h-8" />
                      <span className="text-[10px] font-semibold leading-normal">Server Connection Failed</span>
                    </div>
                  ) : (
                    qrUrl && <img src={qrUrl} alt="WhatsApp connection QR Code" className="w-48 h-48" />
                  )}
                </div>
                <div className="space-y-2 max-w-sm">
                  {qrError ? (
                    <p className="text-xs text-muted-foreground">
                      Could not reach OpenWA container. Please verify your **OpenWA Server URL** and **API Key** inside the **Settings** panel.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                        {!qrObtained && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {sessionStatus}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Open WhatsApp on your mobile device, tap Menu or Settings &gt; Linked Devices, and scan the QR code.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {connectionStep === "success" && (
              <form onSubmit={handleSaveBot} className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 text-left">
                    WhatsApp Connected! Let&apos;s configure your AI agent now.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input
                      id="bot-name"
                      placeholder="e.g. Sales Assistant"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label htmlFor="bot-model">AI Model</Label>
                    <Select value={newBotModel} onValueChange={setNewBotModel}>
                      <SelectTrigger id="bot-model">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="models/gemini-flash-lite-latest">Gemini Flash Lite (Ultra Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bot-desc">Short Description</Label>
                  <Input
                    id="bot-desc"
                    placeholder="e.g. Help users understand our service"
                    value={newBotDesc}
                    onChange={(e) => setNewBotDesc(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bot-welcome">Welcome Message</Label>
                  <Textarea
                    id="bot-welcome"
                    placeholder="Sent as the first reply when a new contact texts."
                    value={newBotWelcome}
                    onChange={(e) => setNewBotWelcome(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bot-prompt">System/AI Prompt</Label>
                  <Textarea
                    id="bot-prompt"
                    placeholder="Define bot rules, guidelines, knowledge, and limitations."
                    value={newBotPrompt}
                    onChange={(e) => setNewBotPrompt(e.target.value)}
                    rows={6}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full sm:w-auto glow">
                    Save Bot Instance
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Bots Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50 bg-card/50 overflow-hidden animate-pulse">
              <div className="p-5 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-muted rounded" />
                    <div className="h-2.5 w-36 bg-muted/60 rounded" />
                  </div>
                </div>
                <div className="h-8 w-full bg-muted/40 rounded" />
                <div className="h-5 w-48 bg-muted/30 rounded" />
              </div>
              <div className="py-3 px-5 bg-muted/20 border-t border-border/40 h-10" />
            </Card>
          ))}
        </div>
      ) : bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-1">No Bots Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create your first WhatsApp AI bot by clicking the &quot;Create AI Bot&quot; button above.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => {
          const isActive = bot.status === "active";
          return (
            <Card key={bot.id} className="border-border/50 bg-card/50 flex flex-col justify-between relative overflow-hidden">
              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      isActive ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-none">{bot.name}</h3>
                      <span className="text-xs text-muted-foreground">{bot.phoneNumber}</span>
                    </div>
                  </div>

                  <Switch
                    checked={isActive}
                    onCheckedChange={() => handleToggleBot(bot.id, isActive)}
                  />
                </div>

                <p className="text-xs text-muted-foreground text-left min-h-8 line-clamp-2 leading-relaxed">
                  {bot.description || "No description provided."}
                </p>

                <div className="flex items-center gap-2 pt-1 text-left">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-background/50 py-0.5 px-2 rounded-md">
                    {bot.aiModel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize font-medium py-0.5 px-2 rounded-md",
                      isActive ? "bg-green-500/5 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {bot.status}
                  </Badge>
                </div>
              </div>

              {/* Bot stats footer */}
              <div className="py-3 px-5 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{bot.totalMessages.toLocaleString()} Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPlayground(bot)}
                    className="py-1 px-2 rounded hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-medium"
                    title="Test Bot Playground"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Test Playground</span>
                  </button>
                  <button
                    onClick={() => {
                      setBotToDelete(bot);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    aria-label="Delete Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}

      {/* AI Chatbot Playground Dialog */}
      <Dialog open={playgroundOpen} onOpenChange={setPlaygroundOpen}>
        <DialogContent className="sm:max-w-2xl text-left h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <DialogTitle className="font-serif text-lg font-bold">
                  AI Playground: {selectedBot?.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Testing Model: <span className="font-mono text-primary font-semibold">{selectedBot?.aiModel}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5">
            {playgroundMessages.map((m, idx) => {
              const isAssistant = m.sender === "assistant";
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex max-w-[85%] flex-col",
                    isAssistant ? "mr-auto items-start" : "ml-auto items-end"
                  )}
                >
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl text-sm leading-relaxed text-left whitespace-pre-line shadow-sm",
                      isAssistant
                        ? "bg-card border border-border/50 text-foreground rounded-tl-none"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{m.time}</span>
                </div>
              );
            })}

            {isPlaygroundThinking && (
              <div className="flex max-w-[85%] flex-col mr-auto items-start">
                <div className="p-3 rounded-2xl text-sm text-muted-foreground bg-card border border-border/50 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>{selectedBot?.name} is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendPlaygroundMessage} className="p-4 border-t border-border/50 bg-card flex items-center gap-3">
            <Input
              placeholder={`Send a message to test prompt instructions...`}
              value={playgroundInput}
              onChange={(e) => setPlaygroundInput(e.target.value)}
              disabled={isPlaygroundThinking}
              className="flex-1 py-5"
            />
            <Button type="submit" size="icon" disabled={isPlaygroundThinking || !playgroundInput.trim()} className="w-10 h-10 rounded-lg glow flex-shrink-0 cursor-pointer">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md text-left p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="font-serif text-lg font-bold text-foreground">
                Delete Bot: {botToDelete?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-2 text-xs text-muted-foreground leading-relaxed">
            Deleting this instance will permanently disconnect the WhatsApp session associated with <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">{botToDelete?.phoneNumber}</span> and terminate its webhook integrations.
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setBotToDelete(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (botToDelete) {
                  await handleDeleteBot(botToDelete.id);
                  setDeleteConfirmOpen(false);
                  setBotToDelete(null);
                }
              }}
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
