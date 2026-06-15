"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Code2,
  Copy,
  Check,
  Bot,
  Send,
  Loader2,
  RefreshCw,
  ChevronDown,
  Zap,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BotItem, ServerBotItem } from "@/lib/types";

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

const colorPresets = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Emerald", value: "#10b981" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Orange", value: "#f97316" },
];

const GeminiIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    fillRule="evenodd"
    className={className}
  >
    <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" />
  </svg>
);

const DeepSeekIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
  >
    <path fill="#4D6BFE" d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
  </svg>
);

const getModelIcon = (value?: string, className = "w-3.5 h-3.5 flex-shrink-0") => {
  if (value && value.startsWith("deepseek-")) {
    return <DeepSeekIcon className={className} />;
  }
  return <GeminiIcon className={className} />;
};

const AI_MODELS = [
  { label: "Gemini 2.5 Flash", value: "models/gemini-2.5-flash" },
  { label: "Gemini 2.5 Pro", value: "models/gemini-2.5-pro" },
  { label: "Gemini 2.0 Flash", value: "models/gemini-2.0-flash" },
  { label: "Gemini Flash Lite", value: "models/gemini-flash-lite-latest" },
  { label: "DeepSeek-V4 Flash", value: "deepseek-v4-flash" },
  { label: "DeepSeek-V4 Pro", value: "deepseek-v4-pro" },
];

export default function PlaygroundPage() {
  const [mounted, setMounted] = useState(false);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [widgetTitle, setWidgetTitle] = useState("Chat Assistant");
  const [themeColor, setThemeColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! How can I help you today?");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [selectedModel, setSelectedModel] = useState("models/gemini-flash-lite-latest");
  const [copied, setCopied] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "assistant"; content: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);

  const selectedBot =
    selectedBotId === "same_whatsapp"
      ? (bots.find((b) => b.status === "active") || bots[0] || null)
      : null;

  const activeWidgetModel = selectedBot?.aiModel || selectedModel;

  const getPromptTemplates = () => {
    return [
      {
        name: "Same WhatsApp Prompt",
        value: "whatsapp_sync",
        prompt: selectedBot?.systemPrompt || "",
      },
      {
        name: "Custom Prompt",
        value: "custom",
        prompt: "",
      },
    ];
  };

  const templates = getPromptTemplates();
  const currentPreset = templates.find((t) => {
    if (t.value === "custom") return false;
    if (t.value === "whatsapp_sync" && selectedBotId === "custom_bot") return false;
    return t.prompt === systemPrompt;
  })?.value || "custom";
  const currentPresetName = templates.find((t) => t.value === currentPreset)?.name || "Custom Prompt";

  // Check if loaded themeColor is a preset, otherwise show custom color picker
  useEffect(() => {
    if (themeColor) {
      const isPreset = colorPresets.some((p) => p.value.toLowerCase() === themeColor.toLowerCase());
      setShowCustomColorPicker(!isPreset);
    }
  }, [selectedBotId]);



  useEffect(() => {
    setMounted(true);

    const loadBots = async () => {
      try {
        const res = await fetch("/api/bots");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: BotItem[] = data.map((b: ServerBotItem) => ({
              id: b.id,
              name: b.name,
              description: b.description || "",
              phoneNumber: b.phoneNumber || "",
              status: b.status === "active" ? "active" : "inactive",
              aiModel: b.aiModel || "models/gemini-flash-lite-latest",
              systemPrompt: b.systemPrompt || "",
              welcomeMessage: b.welcomeMessage || "Hi! How can I help you today?",
              totalMessages: b.totalMessages || 0,
            }));
            setBots(mapped);
            setSelectedBotId("same_whatsapp");
            const activeBot = mapped.find((b) => b.status === "active") || mapped[0];
            if (activeBot) {
              setSystemPrompt(activeBot.systemPrompt);
              setSelectedModel(activeBot.aiModel);
              setWelcomeMessage(activeBot.welcomeMessage);
              setWidgetTitle(activeBot.name);
            }
          } else {
            setSelectedBotId("custom_bot");
          }
        } else {
          setSelectedBotId("custom_bot");
        }
      } catch {
        setSelectedBotId("custom_bot");
      }
    };

    loadBots();
  }, []);

  // Reset chat when bot / welcome message changes
  useEffect(() => {
    const msg = welcomeMessage || selectedBot?.welcomeMessage || "Hi! How can I help you?";
    setChatMessages([
      {
        sender: "assistant",
        content: msg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [selectedBotId, welcomeMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isThinking]);

  // Sync fields when switching bots
  const handleBotChange = (id: string) => {
    setSelectedBotId(id);
    if (id === "same_whatsapp") {
      const activeBot = bots.find((b) => b.status === "active") || bots[0];
      if (activeBot) {
        setSystemPrompt(activeBot.systemPrompt);
        setSelectedModel(activeBot.aiModel);
        setWelcomeMessage(activeBot.welcomeMessage);
        setWidgetTitle(activeBot.name);
      }
    } else if (id === "custom_bot") {
      setSystemPrompt("You are a helpful AI assistant.");
      setSelectedModel("models/gemini-flash-lite-latest");
      setWelcomeMessage("Hi there! How can I help you today?");
      setWidgetTitle("Chat Assistant");
    }
  };

  const resetChat = () => {
    const msg = welcomeMessage || selectedBot?.welcomeMessage || "Hi! How can I help you?";
    setChatMessages([
      {
        sender: "assistant",
        content: msg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages((prev) => [...prev, { sender: "user", content: userText, time }]);
    setChatInput("");
    setIsThinking(true);

    try {
      const history = chatMessages.map((m) => ({
        sender: m.sender as "user" | "assistant",
        content: m.content,
      }));

      let replyText = "";
      try {
        replyText = await callGeminiViaServer(
          selectedModel,
          systemPrompt || "You are a helpful assistant.",
          userText,
          history
        );
      } catch (apiErr) {
        const msg = apiErr instanceof Error ? apiErr.message : "";
        if (msg.includes("not configured")) {
          await new Promise((r) => setTimeout(r, 900));
          replyText = `[Demo Mode] Configure your Gemini API Key in Settings to get real AI responses.`;
        } else {
          throw apiErr;
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          content: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      toast.error("Failed to generate response.");
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          content: "Sorry, something went wrong. Please check your API key in Settings.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const scriptSnippet = `<!-- BotFlow AI Widget -->
<script>
  window.BotFlowConfig = {
    botId: "${selectedBot?.id || ""}",
    title: "${widgetTitle}",
    themeColor: "${themeColor}",
    welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}",
  };
</script>
<script src="https://cdn.botflow.ai/widget/v1.js" async defer></script>`;

  const iframeSnippet = `<iframe
  src="https://botflow.ai/embed/${selectedBot?.id || ""}?color=${encodeURIComponent(themeColor)}&title=${encodeURIComponent(widgetTitle)}"
  style="border:none;position:fixed;bottom:20px;right:20px;width:360px;height:550px;z-index:999999;"
></iframe>`;

  const reactSnippet = `import { useEffect } from 'react';

export default function BotFlowWidget() {
  useEffect(() => {
    window.BotFlowConfig = {
      botId: "${selectedBot?.id || ""}",
      title: "${widgetTitle}",
      themeColor: "${themeColor}",
      welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}",
    };
    const s = document.createElement('script');
    s.src = 'https://cdn.botflow.ai/widget/v1.js';
    s.async = true;
    document.body.appendChild(s);
    return () => document.body.removeChild(s);
  }, []);
  return null;
}`;

  const nextjsSnippet = `'use client';

import Script from 'next/script';

export default function BotFlowWidget() {
  return (
    <>
      <Script
        id="botflow-setup"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: \`
            window.BotFlowConfig = {
              botId: "${selectedBot?.id || ""}",
              title: "${widgetTitle}",
              themeColor: "${themeColor}",
              welcomeMessage: "${welcomeMessage.replace(/"/g, '\\\\"')}"
            };
          \`
        }}
      />
      <Script
        src="https://cdn.botflow.ai/widget/v1.js"
        strategy="afterInteractive"
      />
    </>
  );
}`;

  const aiBuilderPrompt = `Please add the BotFlow AI Chatbot widget to my website so that it renders globally (for example, inside the main layout, app root, or index.html).

Depending on my website project type, please implement it using one of the following code structures:

1. FOR HTML / VITE (VANILLA):
Insert the following script tags right before the closing </body> tag:
\`\`\`html
<script>
  window.BotFlowConfig = {
    botId: "${selectedBot?.id || ""}",
    title: "${widgetTitle}",
    themeColor: "${themeColor}",
    welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}"
  };
</script>
<script src="https://cdn.botflow.ai/widget/v1.js" async defer></script>
\`\`\`

2. FOR NEXT.JS (APP ROUTER):
Create a Client Component and load the scripts using Next.js Script tags:
\`\`\`tsx
'use client';
import Script from 'next/script';

export default function BotFlowWidget() {
  return (
    <>
      <Script
        id="botflow-setup"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: \\\`
            window.BotFlowConfig = {
              botId: "${selectedBot?.id || ""}",
              title: "${widgetTitle}",
              themeColor: "${themeColor}",
              welcomeMessage: "${welcomeMessage.replace(/"/g, '\\\\"')}"
            };
          \\\`
        }}
      />
      <Script
        src="https://cdn.botflow.ai/widget/v1.js"
        strategy="afterInteractive"
      />
    </>
  );
}
\`\`\`

3. FOR REACT (VITE / CRA):
Create a component that dynamically injects the script on mount:
\`\`\`tsx
import { useEffect } from 'react';

export default function BotFlowWidget() {
  useEffect(() => {
    (window as any).BotFlowConfig = {
      botId: "${selectedBot?.id || ""}",
      title: "${widgetTitle}",
      themeColor: "${themeColor}",
      welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}"
    };
    const s = document.createElement('script');
    s.src = 'https://cdn.botflow.ai/widget/v1.js';
    s.async = true;
    document.body.appendChild(s);
    return () => {
      document.body.removeChild(s);
    };
  }, []);
  return null;
}
\`\`\`

4. FOR VUE 3 (VITE):
Create a component that sets the window configuration and loads the script:
\`\`\`vue
<script setup>
import { onMounted, onUnmounted } from 'vue';

let scriptTag = null;

onMounted(() => {
  window.BotFlowConfig = {
    botId: "${selectedBot?.id || ""}",
    title: "${widgetTitle}",
    themeColor: "${themeColor}",
    welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}"
  };
  scriptTag = document.createElement('script');
  scriptTag.src = 'https://cdn.botflow.ai/widget/v1.js';
  scriptTag.async = true;
  document.body.appendChild(scriptTag);
});

onUnmounted(() => {
  if (scriptTag && scriptTag.parentNode) {
    scriptTag.parentNode.removeChild(scriptTag);
  }
});
</script>
<template></template>
\`\`\``;


  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = selectedBotId === "custom_bot" || selectedBot?.status === "active";

  return (
    <div className="h-[calc(100vh-4rem)] -m-6 md:-m-8 flex overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="w-80 xl:w-96 flex-shrink-0 border-r border-border/40 bg-card/90 backdrop-blur-sm flex flex-col overflow-y-auto">

        {/* Bot Status */}
        <div className="p-5 border-b border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                isActive ? "text-green-500" : "text-muted-foreground"
              )}>
                {isActive ? "Active" : bots.length === 0 ? "No Bots" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Bot Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Source Chatbot</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-9 text-sm bg-background/50 border-border/40 hover:bg-muted/10 transition-colors flex items-center justify-between px-3 font-normal rounded-lg cursor-pointer"
                >
                  <span className="truncate">
                    {selectedBotId === "same_whatsapp"
                      ? "Same WhatsApp Chatbot"
                      : "Custom Chatbot"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 flex-shrink-0 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 text-left p-1.5 bg-card/95 border-border/40 backdrop-blur-md">
                <DropdownMenuItem
                  onClick={() => handleBotChange("same_whatsapp")}
                  disabled={bots.length === 0}
                  className={cn(
                    "text-xs cursor-pointer py-2 px-2.5 rounded-md flex items-center gap-2",
                    selectedBotId === "same_whatsapp" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                    bots.length === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Same WhatsApp Chatbot
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleBotChange("custom_bot")}
                  className={cn(
                    "text-xs cursor-pointer py-2 px-2.5 rounded-md flex items-center gap-2",
                    selectedBotId === "custom_bot" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Custom Chatbot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* AI Model */}
        <div className="p-5 border-b border-border/40 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">AI Model</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-9 text-sm bg-background/50 border-border/40 hover:bg-muted/10 transition-colors flex items-center justify-between px-3 font-normal rounded-lg cursor-pointer"
                >
                  <span className="truncate flex items-center gap-2">
                    {getModelIcon(selectedModel)}
                    {AI_MODELS.find((m) => m.value === selectedModel)?.label || "Select Model"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 flex-shrink-0 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 text-left p-1.5 bg-card/95 border-border/40 backdrop-blur-md">
                {AI_MODELS.map((m) => (
                  <DropdownMenuItem
                    key={m.value}
                    onClick={() => setSelectedModel(m.value)}
                    className={cn(
                      "text-xs cursor-pointer py-2 px-2.5 rounded-md flex items-center gap-2",
                      selectedModel === m.value ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {getModelIcon(m.value)}
                    {m.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Widget Appearance */}
        <div className="p-5 border-b border-border/40 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Widget Appearance</p>

          <div className="space-y-1.5">
            <Label htmlFor="widget-title" className="text-xs text-muted-foreground">Header Title</Label>
            <Input
              id="widget-title"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              className="h-9 text-sm bg-background/50"
              placeholder="Chat Assistant"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="welcome-msg" className="text-xs text-muted-foreground">Welcome Message</Label>
            <Input
              id="welcome-msg"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="h-9 text-sm bg-background/50"
              placeholder="Hi! How can I help you?"
            />
          </div>

          {/* Theme Color */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Theme Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setThemeColor(preset.value);
                    setShowCustomColorPicker(false);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex-shrink-0",
                    themeColor === preset.value && !showCustomColorPicker ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:scale-110 flex-shrink-0 transition-transform bg-background/50",
                  showCustomColorPicker ? "border-foreground scale-110 bg-accent" : "border-muted-foreground/30"
                )}
                title="Custom Color"
              >
                <span className="text-[10px] font-semibold text-muted-foreground leading-none">+</span>
              </button>
            </div>

            {showCustomColorPicker && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <Label className="text-[10px] text-muted-foreground">Adjust Custom Color</Label>
                <div className="flex items-center gap-1.5 border border-border/40 rounded-xl px-2.5 py-1 bg-background/50 w-full max-w-[150px]">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-5 h-5 rounded-full border-0 cursor-pointer p-0 bg-transparent flex-shrink-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:rounded-full"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-xs font-mono lowercase p-0"
                    maxLength={7}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Prompt / Instructions */}
        <div className="p-5 border-b border-border/40 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Instructions (System Prompt)
              </Label>
              <Badge variant="outline" className="text-[10px] font-mono">
                Base Instructions
              </Badge>
            </div>

            {selectedBotId !== "custom_bot" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full h-10 text-sm bg-background/50 border-border/40 hover:bg-muted/10 transition-colors flex items-center justify-between px-3 font-normal rounded-xl cursor-pointer"
                  >
                    <span className="truncate">
                      {currentPresetName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 flex-shrink-0 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 text-left p-1.5 bg-card/95 border-border/40 backdrop-blur-md">
                  <DropdownMenuItem
                    onClick={() => {
                      if (selectedBot) setSystemPrompt(selectedBot.systemPrompt);
                    }}
                    className={cn(
                      "text-xs cursor-pointer py-2 px-2.5 rounded-md flex items-center gap-2",
                      currentPreset === "whatsapp_sync" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Same WhatsApp Prompt
                  </DropdownMenuItem>

                  <div className="h-px bg-border/40 my-1.5" />

                  <DropdownMenuItem
                    onClick={() => setSystemPrompt("")}
                    className={cn(
                      "text-xs cursor-pointer py-2 px-2.5 rounded-md flex items-center gap-2",
                      currentPreset === "custom" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Custom Prompt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant for this website. Answer questions politely based on the provided context..."
            className="text-xs font-mono h-36 max-h-36 overflow-y-auto resize-none bg-background/50 leading-relaxed border-border/40"
          />
        </div>

      </div>

      {/* ── RIGHT PANEL — dotted canvas with centred widget ── */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center relative bg-white dark:bg-zinc-950 transition-colors duration-300"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--canvas-dots) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* "Playground" label top-left */}
        <div className="absolute top-5 left-6 flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Playground</span>
          <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-500 border-green-500/20">
            Live Preview
          </Badge>
        </div>

        {/* Reset button & Deploy button top-right */}
        <div className="absolute top-4 right-5 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-card/95 border-border/40 hover:bg-accent cursor-pointer text-xs font-medium rounded-full shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Deploy
                <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 border-border/40 backdrop-blur-md">
              <DropdownMenuItem
                onClick={() => handleCopy(scriptSnippet)}
                className="text-xs cursor-pointer py-2.5 px-2.5 rounded-md flex items-center gap-2"
              >
                <Code2 className="w-3.5 h-3.5 text-primary" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopy(aiBuilderPrompt)}
                className="text-xs cursor-pointer py-2.5 px-2.5 rounded-md flex items-center gap-2"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                Copy Prompt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={resetChat}
            className="w-8 h-8 rounded-full bg-card border border-border/40 hover:bg-accent flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* The widget card — fixed width, full inner height */}
        <div className="w-[380px] h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border/30">

          {/* Widget Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm leading-tight text-left">
                  {widgetTitle || "Chat Assistant"}
                </h3>
                <span className="text-[11px] text-white/75 flex items-center gap-1.5 text-left">
                  {selectedBotId === "same_whatsapp"
                    ? `WhatsApp: ${selectedBot?.name || "None"}`
                    : "Custom Bot"}
                </span>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {chatMessages.map((msg, idx) => {
              const isAss = msg.sender === "assistant";
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isAss ? "mr-auto items-start" : "ml-auto items-end"
                  )}
                >
                  {isAss && (
                    <div className="flex items-center gap-1.5 mb-1 text-left">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {widgetTitle || "Assistant"}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm text-left",
                      isAss
                        ? "bg-muted/60 text-foreground rounded-tl-none"
                        : "text-white rounded-tr-none"
                    )}
                    style={!isAss ? { backgroundColor: themeColor } : undefined}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex flex-col max-w-[80%] mr-auto items-start">
                <div className="flex items-center gap-1.5 mb-1 text-left">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {widgetTitle || "Assistant"}
                  </span>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-muted/60 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSendMessage}
            className="px-3 py-3 border-t border-border/40 bg-background flex items-center gap-2 flex-shrink-0"
          >
            <Input
              placeholder="Message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isThinking}
              className="flex-1 h-10 bg-muted/30 border-border/50 focus-visible:ring-primary/30 text-sm rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isThinking || !chatInput.trim()}
              className="w-10 h-10 rounded-xl flex-shrink-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: themeColor }}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>

          {/* Powered-by */}
          <div className="py-2 flex items-center justify-center bg-background border-t border-border/20">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <Bot className="w-3 h-3" />
              Powered by BotFlow AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
