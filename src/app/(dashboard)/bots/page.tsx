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
import { Bot, Plus, QrCode, Loader2, CheckCircle2, Trash2, MessageSquare, Send, AlertCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import type { BotItem, OpenWASession, ServerBotItem } from "@/lib/types";

async function callGeminiViaServer(
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: { sender: "user" | "assistant"; content: string }[]
): Promise<string> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, systemPrompt, userMessage, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI request failed");
  return data.text as string;
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
      fill="url(#gemini-sparkle-grad-bots)"
    />
    <defs>
      <linearGradient id="gemini-sparkle-grad-bots" x1="3" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
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

  // Edit bot states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotItem | null>(null);
  const [editBotName, setEditBotName] = useState("");
  const [editBotDesc, setEditBotDesc] = useState("");
  const [editBotModel, setEditBotModel] = useState("models/gemini-flash-lite-latest");
  const [editBotPrompt, setEditBotPrompt] = useState("");
  const [editBotWelcome, setEditBotWelcome] = useState("");

  // Load bots from server store and enrich with live OpenWA session status
  useEffect(() => {
    const fetchBotsAndSessions = async () => {
      setIsLoading(true);
      try {
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
        try {
          const sessionRes = await fetch("/api/openwa/sessions");

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

  const handleOpenEdit = (bot: BotItem) => {
    setEditingBot(bot);
    setEditBotName(bot.name);
    setEditBotDesc(bot.description);
    setEditBotModel(bot.aiModel);
    setEditBotPrompt(bot.systemPrompt);
    setEditBotWelcome(bot.welcomeMessage);
    setEditDialogOpen(true);
  };

  const handleSaveEditBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    if (!editBotName) {
      toast.error("Please enter a name for the bot.");
      return;
    }

    const updatedBot: BotItem = {
      ...editingBot,
      name: editBotName,
      description: editBotDesc,
      aiModel: editBotModel,
      systemPrompt: editBotPrompt,
      welcomeMessage: editBotWelcome,
    };

    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedBot)
      });
      if (res.ok) {
        setBots((prev) =>
          prev.map((b) => (b.id === updatedBot.id ? updatedBot : b))
        );
        toast.success("Bot configuration updated successfully!");
      } else {
        throw new Error("Failed to sync updated bot configuration to server database.");
      }
    } catch (err) {
      console.error("Bot update error:", err);
      toast.error("Failed to update bot configuration.");
    }

    setEditDialogOpen(false);
    setEditingBot(null);
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
      const history = playgroundMessages.slice(1).map(m => ({
        sender: m.sender as "user" | "assistant",
        content: m.content,
      }));

      let replyText = "";
      try {
        replyText = await callGeminiViaServer(
          selectedBot.aiModel,
          selectedBot.systemPrompt,
          userMsg,
          history
        );
      } catch (apiErr) {
        const msg = apiErr instanceof Error ? apiErr.message : "";
        if (msg.includes("not configured")) {
          await new Promise(resolve => setTimeout(resolve, 800));
          replyText = `[Demo Mode] As "${selectedBot.name}", responding to: "${userMsg}".\n\nConfigure your Gemini API Key in Settings to get real AI responses.`;
        } else {
          throw apiErr;
        }
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
      const action = currentState ? "stop" : "start";
      const res = await fetch(`/api/openwa/sessions/${botId}/${action}`, {
        method: "POST",
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
      // Step A: Create the session on OpenWA container first
      const createRes = await fetch("/api/openwa/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetSessionName }),
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
        headers: { "Content-Type": "application/json" },
      });

      if (!startRes.ok) {
        throw new Error(`Failed to start session on OpenWA. HTTP status ${startRes.status}`);
      }

      setSessionStatus("Loading QR Code...");

      // Step C: Get QR Code url using the correct ID
      const qrRes = await fetch(`/api/openwa/sessions/${actualSessionId}/qr`);
      
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
    if (!shouldPoll) return;

    let pollCount = 0;
    const MAX_POLLS = 100; // ~5 minutes at 5s interval

    const activeInterval = setInterval(async () => {
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
        const res = await fetch(`/api/openwa/sessions/${currentSessionId}`);
        
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
            
            // Register Webhook — URL resolved server-side so Docker internal
            // hostname is used correctly regardless of where the app runs
            try {
              const cfgRes = await fetch("/api/config");
              const cfg = cfgRes.ok ? await cfgRes.json() : {};
              const backend: string = cfg.automationBackend || "builtin";
              const webhookTargetUrl: string = cfg.webhookUrl || "";

              if (webhookTargetUrl) {
                try {
                  const webhookRes = await fetch(`/api/openwa/sessions/${currentSessionId}/webhooks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      url: webhookTargetUrl,
                      events: ["message.received", "message"],
                      secret: "botflow-secret",
                    }),
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
            } catch (cfgErr) {
              console.warn("Could not fetch settings for webhook registration:", cfgErr);
            }
          }
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 5000); // Poll every 5 seconds (was 3s — reduced frequency)
    
    // Safety timeout: stop polling after 5 minutes
    const pollTimeoutId = setTimeout(() => {
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
      const res = await fetch(`/api/openwa/sessions/${botId}`, {
        method: "DELETE",
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
        <DialogContent className="sm:max-w-xl text-left max-h-[90vh] overflow-y-auto p-6 md:p-8">
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
                        <SelectItem value="models/gemini-2.5-flash">
                          <span className="flex items-center gap-2">
                            <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            Gemini 2.5 Flash
                          </span>
                        </SelectItem>
                        <SelectItem value="models/gemini-2.5-pro">
                          <span className="flex items-center gap-2">
                            <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            Gemini 2.5 Pro
                          </span>
                        </SelectItem>
                        <SelectItem value="models/gemini-2.0-flash">
                          <span className="flex items-center gap-2">
                            <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            Gemini 2.0 Flash
                          </span>
                        </SelectItem>
                        <SelectItem value="models/gemini-flash-lite-latest">
                          <span className="flex items-center gap-2">
                            <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            Gemini Flash Lite
                          </span>
                        </SelectItem>
                        <SelectItem value="deepseek-v4-flash">
                          <span className="flex items-center gap-2">
                            <DeepSeekIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            DeepSeek-V4 Flash
                          </span>
                        </SelectItem>
                        <SelectItem value="deepseek-v4-pro">
                          <span className="flex items-center gap-2">
                            <DeepSeekIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            DeepSeek-V4 Pro
                          </span>
                        </SelectItem>
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
            <Card key={bot.id} className="border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md flex flex-col justify-between relative overflow-hidden hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-5 space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-6",
                      isActive ? "bg-green-500/10 text-green-500 dark:bg-green-500/20" : "bg-muted dark:bg-muted/40 text-muted-foreground"
                    )}>
                      <Bot className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-none transition-colors group-hover:text-primary">{bot.name}</h3>
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
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-background/40 py-0.5 px-2 rounded-md border-border/40">
                    {bot.aiModel.replace(/^models\//, "")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize font-semibold tracking-wide py-0.5 px-2 rounded-md border",
                      isActive 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-muted dark:bg-muted/40 text-muted-foreground border-border/40"
                    )}
                  >
                    {bot.status}
                  </Badge>
                </div>
              </div>

              {/* Bot stats footer */}
              <div className="py-3 px-5 bg-muted/40 dark:bg-muted/15 border-t border-border/40 flex items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => handleOpenPlayground(bot)}
                    className="flex-1 py-2.5 px-2 rounded-lg bg-muted/50 border border-border/40 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wide"
                    title="Test Bot Playground"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(bot)}
                    className="flex-1 py-2.5 px-2 rounded-lg bg-muted/50 border border-border/40 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
                    title="Edit Bot Settings"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setBotToDelete(bot);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex-1 py-2.5 px-2 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wide"
                    aria-label="Delete Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
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
          <DialogHeader className="p-6 border-b border-border/40 bg-card/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 flex-shrink-0" />
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
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10 dark:bg-muted/5">
            {playgroundMessages.map((m, idx) => {
              const isAssistant = m.sender === "assistant";
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex max-w-[80%] flex-col",
                    isAssistant ? "mr-auto items-start" : "ml-auto items-end"
                  )}
                >
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl text-sm leading-relaxed text-left whitespace-pre-line shadow-sm",
                      isAssistant
                        ? "bg-card border border-border/40 text-foreground rounded-tl-none"
                        : "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-[0_4px_12px_hsl(var(--primary)/0.15)] rounded-tr-none"
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{m.time}</span>
                </div>
              );
            })}

            {isPlaygroundThinking && (
              <div className="flex max-w-[80%] flex-col mr-auto items-start animate-pulse">
                <div className="p-3.5 rounded-2xl text-sm text-muted-foreground bg-card border border-border/40 rounded-tl-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="font-medium">{selectedBot?.name} is drafting a response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendPlaygroundMessage} className="p-4 border-t border-border/40 bg-card/95 backdrop-blur-sm flex items-center gap-3">
            <Input
              placeholder={`Ask ${selectedBot?.name} anything to test...`}
              value={playgroundInput}
              onChange={(e) => setPlaygroundInput(e.target.value)}
              disabled={isPlaygroundThinking}
              className="flex-1 h-11 border-border/60 focus-visible:ring-primary/30"
            />
            <Button type="submit" size="icon" disabled={isPlaygroundThinking || !playgroundInput.trim()} className="w-11 h-11 rounded-xl glow flex-shrink-0 cursor-pointer hover:scale-102 hover:-translate-y-0.5 transition-all">
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

      {/* Edit Bot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setEditingBot(null);
      }}>
        <DialogContent className="sm:max-w-3xl text-left max-h-[90vh] overflow-y-auto p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold">Edit Bot Details</DialogTitle>
            <DialogDescription>
              Update the AI persona, rules, and greeting messages for this WhatsApp instance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditBot} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="edit-bot-name">Bot Name</Label>
                <Input
                  id="edit-bot-name"
                  placeholder="e.g. Sales Assistant"
                  value={editBotName}
                  onChange={(e) => setEditBotName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="edit-bot-model">AI Model</Label>
                <Select value={editBotModel} onValueChange={setEditBotModel}>
                  <SelectTrigger id="edit-bot-model" className="bg-background/50 border-border/40 h-9">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40 backdrop-blur-md shadow-md">
                    <SelectItem value="models/gemini-2.5-flash" className="text-xs cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        Gemini 2.5 Flash
                      </span>
                    </SelectItem>
                    <SelectItem value="models/gemini-2.5-pro" className="text-xs cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        Gemini 2.5 Pro
                      </span>
                    </SelectItem>
                    <SelectItem value="models/gemini-2.0-flash" className="text-xs cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        Gemini 2.0 Flash
                      </span>
                    </SelectItem>
                    <SelectItem value="models/gemini-flash-lite-latest" className="text-xs cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <GeminiIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        Gemini Flash Lite
                      </span>
                    </SelectItem>
                    <SelectItem value="deepseek-v4-flash" className="text-xs cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <DeepSeekIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        DeepSeek-V4 Flash
                      </span>
                    </SelectItem>
                    <SelectItem value="deepseek-v4-pro" className="text-xs cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <DeepSeekIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        DeepSeek-V4 Pro
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bot-desc">Short Description</Label>
              <Input
                id="edit-bot-desc"
                placeholder="e.g. Help users understand our service"
                value={editBotDesc}
                onChange={(e) => setEditBotDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bot-welcome">Welcome Message</Label>
              <Textarea
                id="edit-bot-welcome"
                placeholder="Sent as the first reply when a new contact texts."
                value={editBotWelcome}
                onChange={(e) => setEditBotWelcome(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bot-prompt">System/AI Prompt</Label>
              <Textarea
                id="edit-bot-prompt"
                placeholder="Define bot rules, guidelines, knowledge, and limitations."
                value={editBotPrompt}
                onChange={(e) => setEditBotPrompt(e.target.value)}
                rows={6}
                className="min-h-[100px] max-h-[200px] resize-y"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full sm:w-auto py-2.5 text-sm font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
