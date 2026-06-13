"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Copy,
  Check,
  Bot,
  Settings2,
  MessageSquare,
  Send,
  Loader2,
  Globe,
  Monitor,
  Layout,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
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

const defaultBots: BotItem[] = [
  {
    id: "1",
    name: "Sales Assistant",
    description: "Answers product questions and handles lead capture.",
    phoneNumber: "+1 (555) 019-2834",
    status: "active",
    aiModel: "models/gemini-flash-lite-latest",
    systemPrompt: "You are a friendly sales representative for BotFlow. Help users understand our plans and sign up.",
    welcomeMessage: "Hi there! I am your sales assistant. How can I help you grow your business today?",
    totalMessages: 3412,
  },
  {
    id: "2",
    name: "Support Bot",
    description: "Handles common ticket resolutions and FAQs.",
    phoneNumber: "+1 (555) 014-9382",
    status: "active",
    aiModel: "models/gemini-flash-lite-latest",
    systemPrompt: "You are a customer support agent. Resolve customer inquiries politely based on our help docs.",
    welcomeMessage: "Hello! Welcome to Support. Please describe your issue and I will resolve it for you.",
    totalMessages: 4920,
  },
];

const colorPresets = [
  { name: "Indigo", value: "#4f46e5", bgClass: "bg-[#4f46e5]" },
  { name: "Emerald", value: "#10b981", bgClass: "bg-[#10b981]" },
  { name: "Violet", value: "#8b5cf6", bgClass: "bg-[#8b5cf6]" },
  { name: "Rose", value: "#f43f5e", bgClass: "bg-[#f43f5e]" },
  { name: "Blue", value: "#3b82f6", bgClass: "bg-[#3b82f6]" },
];

export default function IntegrationPage() {
  const [mounted, setMounted] = useState(false);
  const [bots] = useState<BotItem[]>(defaultBots);
  const [selectedBotId, setSelectedBotId] = useState("1");
  const [widgetTitle, setWidgetTitle] = useState("Chat Assistant");
  const [themeColor, setThemeColor] = useState("#4f46e5");
  const [position, setPosition] = useState<"right" | "left">("right");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! How can we help you today?");
  
  // Script / Snippet formats
  const [activeFormat, setActiveFormat] = useState<"script" | "iframe" | "react">("script");
  const [copied, setCopied] = useState(false);

  // Widget preview states
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "assistant"; content: string; time: string }[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];

  // Update chat initial message when welcome message or bot changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setChatMessages([
        {
          sender: "assistant",
          content: welcomeMessage || selectedBot.welcomeMessage || "Hi! How can I help you today?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 0);
    return () => clearTimeout(timer);
  }, [welcomeMessage, selectedBotId, selectedBot.welcomeMessage]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { sender: "user", content: userText, time }]);
    setChatInput("");
    setIsThinking(true);

    try {
      const apiKey = localStorage.getItem("botflow_gemini_key");
      const hasRealKey = apiKey && apiKey !== "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx" && apiKey.startsWith("AIzaSy");

      let replyText = "";
      if (hasRealKey) {
        // Prepare simplified context history
        const history = chatMessages.map(m => ({
          sender: m.sender,
          content: m.content
        }));
        replyText = await callGeminiAPI(
          apiKey,
          selectedBot.aiModel,
          selectedBot.systemPrompt + `\n\nWidget instructions: Respond to website visitor politely.`,
          userText,
          history
        );
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));
        replyText = `[Demo Widget Preview] Thanks for testing! This widget is connected to "${selectedBot.name}" using model ${selectedBot.aiModel}.\n\nTo see real answers based on your system prompts, enter a valid Gemini API key under the Settings page.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: "assistant",
          content: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      toast.error("Failed to generate response.");
      setChatMessages(prev => [
        ...prev,
        {
          sender: "assistant",
          content: "Sorry, I am having trouble connecting. Please check your Gemini API key in Settings.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Generate snippets
  const scriptSnippet = `<!-- BotFlow AI Chatbot Widget -->
<script>
  window.BotFlowConfig = {
    botId: "${selectedBot.id}",
    title: "${widgetTitle}",
    themeColor: "${themeColor}",
    welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}",
    position: "${position}"
  };
</script>
<script src="https://cdn.botflow.ai/widget/v1.js" async defer></script>`;

  const iframeSnippet = `<iframe
  src="https://botflow.ai/embed/${selectedBot.id}?color=${encodeURIComponent(themeColor)}&title=${encodeURIComponent(widgetTitle)}&welcome=${encodeURIComponent(welcomeMessage)}"
  style="border: none; position: fixed; bottom: 20px; ${position === "right" ? "right" : "left"}: 20px; width: 360px; height: 550px; z-index: 999999;"
></iframe>`;

  const reactSnippet = `import { useEffect } from 'react';

export default function BotFlowWidget() {
  useEffect(() => {
    // Initialize config
    window.BotFlowConfig = {
      botId: "${selectedBot.id}",
      title: "${widgetTitle}",
      themeColor: "${themeColor}",
      welcomeMessage: "${welcomeMessage.replace(/"/g, '\\"')}",
      position: "${position}"
    };

    // Load widget script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.botflow.ai/widget/v1.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}`;

  const currentSnippetText = 
    activeFormat === "script" ? scriptSnippet : 
    activeFormat === "iframe" ? iframeSnippet : 
    reactSnippet;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-left border-b border-border/40 pb-5">
        <p className="text-sm md:text-[15px] text-muted-foreground font-medium">
          Deploy your WhatsApp AI bot as a floating chat widget directly on any website with just a few lines of code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customization controls & installation scripts */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="p-6">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold font-serif">Widget Configurator</CardTitle>
                  <CardDescription>Tailor the appearance and personality of your web widget.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Bot */}
                <div className="space-y-1.5">
                  <Label htmlFor="integ-bot">Select Source AI Bot</Label>
                  <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                    <SelectTrigger id="integ-bot">
                      <SelectValue placeholder="Select Bot" />
                    </SelectTrigger>
                    <SelectContent>
                      {bots.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.aiModel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Header Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="widget-title">Widget Header Title</Label>
                  <Input
                    id="widget-title"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    placeholder="e.g. Chat Assistant"
                  />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-1.5">
                <Label htmlFor="welcome-msg">Welcome Greeting Message</Label>
                <Input
                  id="welcome-msg"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Hello! How can we help you today?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Theme Color Selection */}
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex items-center gap-2.5">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setThemeColor(preset.value)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex-shrink-0",
                          themeColor === preset.value ? "border-foreground scale-105" : "border-transparent"
                        )}
                        title={preset.name}
                      >
                        <span className={cn("block w-full h-full rounded-full", preset.bgClass)} />
                      </button>
                    ))}
                    
                    {/* Hex custom picker */}
                    <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 py-1 bg-background/50 flex-1 min-w-0">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent flex-shrink-0"
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
                </div>

                {/* Widget Position */}
                <div className="space-y-2">
                  <Label>Widget Placement</Label>
                  <div className="grid grid-cols-2 gap-2 bg-muted/30 border border-border/40 rounded-lg p-1">
                    <button
                      onClick={() => setPosition("right")}
                      className={cn(
                        "py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                        position === "right"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Bottom Right
                    </button>
                    <button
                      onClick={() => setPosition("left")}
                      className={cn(
                        "py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer",
                        position === "left"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Bottom Left
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed scripts snippets */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start flex-wrap gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold font-serif">Widget Embed Code</CardTitle>
                    <CardDescription>Copy and paste this code before the closing tags on your website.</CardDescription>
                  </div>
                </div>

                {/* Code Format Switcher */}
                <div className="flex border border-border/40 rounded-lg p-0.5 bg-muted/20">
                  <button
                    onClick={() => setActiveFormat("script")}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md transition-colors font-medium cursor-pointer",
                      activeFormat === "script" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    HTML Script
                  </button>
                  <button
                    onClick={() => setActiveFormat("iframe")}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md transition-colors font-medium cursor-pointer",
                      activeFormat === "iframe" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Iframe
                  </button>
                  <button
                    onClick={() => setActiveFormat("react")}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md transition-colors font-medium cursor-pointer",
                      activeFormat === "react" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    React/Next.js
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="relative group">
                <pre className="p-4 rounded-xl bg-muted/60 dark:bg-muted/30 border border-border/50 font-mono text-[11px] sm:text-xs overflow-x-auto text-left whitespace-pre select-all leading-relaxed max-h-72">
                  <code>{currentSnippetText}</code>
                </pre>
                <Button
                  onClick={() => handleCopy(currentSnippetText)}
                  className="absolute top-2.5 right-2.5 h-8 w-8 p-0 opacity-90 hover:opacity-100 glow"
                  title="Copy Embed Code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* Step By Step Guide details */}
              <div className="rounded-xl border border-border/40 p-4 bg-muted/25 text-left space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-foreground/80">
                  <Globe className="w-4 h-4 text-primary" /> Setup Guides & Platforms
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">Standard HTML</span>
                    <p className="text-muted-foreground leading-normal">
                      Paste the HTML snippet just before the closing <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">&lt;/body&gt;</code> tag in your <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">index.html</code>.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">WordPress / Webflow</span>
                    <p className="text-muted-foreground leading-normal">
                      Install a header/footer plugin or use a custom code block in your settings. Paste the snippet into the Footer script area.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">Shopify Integration</span>
                    <p className="text-muted-foreground leading-normal">
                      Go to Online Store &gt; Themes &gt; Edit Code. Open your <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">theme.liquid</code> file and paste the snippet right above <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">&lt;/body&gt;</code>.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">React / SPA Apps</span>
                    <p className="text-muted-foreground leading-normal">
                      Use the React code example snippet to initialize the script inside a <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">useEffect</code> hook or layout component.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Simulator Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/50 bg-card/50 overflow-hidden flex flex-col h-[650px] relative">
            <CardHeader className="p-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
              <div className="text-left flex items-center gap-2">
                <Monitor className="w-4.5 h-4.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Interactive Website Preview</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-green-500/5 text-green-500 border-green-500/10">
                Live Simulator
              </Badge>
            </CardHeader>
            
            {/* Mock website background */}
            <div className="flex-1 bg-muted/30 relative flex flex-col p-6 overflow-hidden">
              <div className="space-y-4 max-w-sm text-left">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <Layout className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-serif font-bold text-xs text-foreground/80">Acme Corp Inc.</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-black tracking-tight leading-tight">
                    Scale Automation With Precision
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Connecting all your tools in a centralized system to optimize sales, support workflows, and lead operations dynamically.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-[11px] rounded-md px-3 bg-foreground hover:bg-foreground/90 text-background">
                    Get Started
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-md px-3 bg-card/50">
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Decorative components */}
              <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-3 opacity-30 select-none">
                <div className="h-20 rounded-xl bg-card border border-border/50" />
                <div className="h-20 rounded-xl bg-card border border-border/50" />
              </div>

              {/* Floating Chatbot Bubble Trigger */}
              <button
                onClick={() => setWidgetOpen(!widgetOpen)}
                style={{ backgroundColor: themeColor }}
                className={cn(
                  "absolute bottom-5 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer z-50",
                  position === "right" ? "right-5" : "left-5"
                )}
                aria-label="Toggle widget preview"
              >
                {widgetOpen ? (
                  <span className="text-lg font-bold">×</span>
                ) : (
                  <MessageSquare className="w-5 h-5" />
                )}
              </button>

              {/* Floating Widget Chat Window Mockup */}
              {widgetOpen && (
                <div
                  className={cn(
                    "absolute bottom-20 w-80 h-96 bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-5",
                    position === "right" ? "right-5" : "left-5"
                  )}
                >
                  {/* Widget Header */}
                  <div
                    style={{ backgroundColor: themeColor }}
                    className="p-4 text-white flex items-center justify-between text-left flex-shrink-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm leading-tight truncate">{widgetTitle}</h4>
                        <span className="text-[10px] text-white/80 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Online AI agent
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message Panel list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10 text-xs flex flex-col justify-start">
                    {chatMessages.map((msg, idx) => {
                      const isAss = msg.sender === "assistant";
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex max-w-[85%] flex-col",
                            isAss ? "mr-auto items-start" : "ml-auto items-end"
                          )}
                        >
                          <div
                            className={cn(
                              "p-2.5 rounded-xl leading-relaxed text-left whitespace-pre-wrap shadow-xs",
                              isAss
                                ? "bg-card border border-border/50 text-foreground rounded-tl-none"
                                : "text-white rounded-tr-none"
                            )}
                            style={isAss ? undefined : { backgroundColor: themeColor }}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-0.5 px-0.5">{msg.time}</span>
                        </div>
                      );
                    })}

                    {isThinking && (
                      <div className="flex max-w-[85%] flex-col mr-auto items-start">
                        <div className="p-2 rounded-xl text-muted-foreground bg-card border border-border/50 rounded-tl-none flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-2 border-t border-border/50 bg-card flex items-center gap-2 flex-shrink-0">
                    <Input
                      placeholder="Type your question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isThinking}
                      className="flex-1 text-xs py-3 h-8 bg-muted/20"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isThinking || !chatInput.trim()}
                      className="w-8 h-8 rounded-lg glow flex-shrink-0 cursor-pointer"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Send className="w-3 h-3 text-white" />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Hint alert */}
            <div className="p-4 bg-muted/10 border-t border-border/40 text-[11px] text-muted-foreground flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>
                Click the chat bubble on the right to test how your visitors will interact with the bot. Real responses require a configured Gemini API Key in the Settings panel.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
