"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Key,
  CreditCard,
  Eye,
  EyeOff,
  Clipboard,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("user@botflow.ai");
  const [geminiKey, setGeminiKey] = useState("AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx");
  const [openwaKey, setOpenwaKey] = useState("dev-admin-key");
  const [openwaUrl, setOpenwaUrl] = useState("http://127.0.0.1:2785");
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("http://localhost:5678/webhook/whatsapp");
  const [automationBackend, setAutomationBackend] = useState<"builtin" | "n8n">("builtin");
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenwa, setShowOpenwa] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "keys" | "billing">("profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("botflow_user_name");
      const savedEmail = localStorage.getItem("botflow_user_email");
      const savedGemini = localStorage.getItem("botflow_gemini_key");
      const savedOpenwa = localStorage.getItem("botflow_openwa_key");
      const savedOpenwaUrl = localStorage.getItem("botflow_openwa_url");
      const savedN8nWebhookUrl = localStorage.getItem("botflow_n8n_webhook_url");
      const savedBackend = localStorage.getItem("botflow_automation_backend");

      const timer = setTimeout(() => {
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
        if (savedGemini) setGeminiKey(savedGemini);
        if (savedOpenwa) setOpenwaKey(savedOpenwa);
        if (savedOpenwaUrl) setOpenwaUrl(savedOpenwaUrl);
        if (savedN8nWebhookUrl) setN8nWebhookUrl(savedN8nWebhookUrl);
        if (savedBackend) setAutomationBackend(savedBackend as "builtin" | "n8n");
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("botflow_user_name", name);
    localStorage.setItem("botflow_user_email", email);
    toast.success("Profile updated successfully!");
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("botflow_gemini_key", geminiKey);
    localStorage.setItem("botflow_openwa_key", openwaKey);
    localStorage.setItem("botflow_openwa_url", openwaUrl);
    localStorage.setItem("botflow_n8n_webhook_url", n8nWebhookUrl);
    localStorage.setItem("botflow_automation_backend", automationBackend);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          geminiKey,
          openwaKey,
          openwaUrl,
          n8nWebhookUrl,
          automationBackend
        })
      });
      if (res.ok) {
        toast.success("API Credentials & Host settings saved and synced successfully!");
      } else {
        throw new Error("Server sync failed");
      }
    } catch {
      toast.error("Settings saved locally, but failed to sync to Next.js server.");
    }
  };

  const handleCopyKey = (key: string, name: string) => {
    navigator.clipboard.writeText(key);
    toast.success(`${name} copied to clipboard!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-left">
        <p className="text-sm text-muted-foreground">
          Manage your account profile, API integrations, and billing subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation tabs for settings */}
        <div className="md:col-span-1 space-y-2 text-left">
          <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 px-2">Settings</div>
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left",
              activeTab === "profile"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
            )}
          >
            <User className="w-4 h-4" />
            Profile Manager
          </button>
          <button
            onClick={() => setActiveTab("keys")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left",
              activeTab === "keys"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
            )}
          >
            <Key className="w-4 h-4" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer text-left",
              activeTab === "billing"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Subscription & Billing
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "profile" && (
            /* Profile Card */
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="text-left">
                  <CardTitle className="text-lg font-bold font-serif">Profile Settings</CardTitle>
                  <CardDescription>Update your personal and security details.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="prof-name">Full Name</Label>
                      <Input
                        id="prof-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label htmlFor="prof-email">Email Address</Label>
                      <Input
                        id="prof-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-password">Change Password</Label>
                    <Input
                      id="prof-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>

                  <Button type="submit" className="glow py-5 px-6">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "keys" && (
            /* API Keys Card */
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="text-left">
                  <CardTitle className="text-lg font-bold font-serif">API Keys & Integrations</CardTitle>
                  <CardDescription>Manage credentials for Google Gemini AI and OpenWA client.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveKeys} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="key-gemini">Google Gemini API Key</Label>
                      <button
                        type="button"
                        onClick={() => setShowGemini(!showGemini)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showGemini ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="key-gemini"
                        type={showGemini ? "text" : "password"}
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyKey(geminiKey, "Gemini API Key")}
                        className="w-10 h-10 p-0"
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="key-openwa">OpenWA Instance API Key</Label>
                      <button
                        type="button"
                        onClick={() => setShowOpenwa(!showOpenwa)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {showOpenwa ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showOpenwa ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="key-openwa"
                        type={showOpenwa ? "text" : "password"}
                        value={openwaKey}
                        onChange={(e) => setOpenwaKey(e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyKey(openwaKey, "OpenWA API Key")}
                        className="w-10 h-10 p-0"
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="url-openwa">OpenWA Server Host URL</Label>
                    <Input
                      id="url-openwa"
                      type="url"
                      value={openwaUrl}
                      onChange={(e) => setOpenwaUrl(e.target.value)}
                      placeholder="e.g. http://127.0.0.1:2886"
                      className="font-mono text-xs"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Your local or production OpenWA WhatsApp API container address.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="url-n8n">n8n Webhook Target URL</Label>
                    <Input
                      id="url-n8n"
                      type="url"
                      value={n8nWebhookUrl}
                      onChange={(e) => setN8nWebhookUrl(e.target.value)}
                      placeholder="e.g. http://localhost:5678/webhook/whatsapp"
                      className="font-mono text-xs"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      The active Webhook URL displayed in your n8n workflow trigger.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="backend-engine">Active Automation Engine</Label>
                    <Select value={automationBackend} onValueChange={(val: "builtin" | "n8n") => setAutomationBackend(val)}>
                      <SelectTrigger id="backend-engine">
                        <SelectValue placeholder="Select Engine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="builtin">Next.js SaaS Backend (Native / Built-in)</SelectItem>
                        <SelectItem value="n8n">n8n Workflow (External Webhook)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Choose whether Next.js responds to messages directly or forwards them to n8n.
                    </p>
                  </div>

                  <Button type="submit" className="glow py-5 px-6">
                    Save Credentials
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            /* Billing Card */
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="text-left">
                  <CardTitle className="text-lg font-bold font-serif">Subscription Plan</CardTitle>
                  <CardDescription>Overview of your current billing contract.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-primary/20 bg-primary/5 gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base font-serif">Growth Tier</span>
                      <Badge className="bg-primary text-primary-foreground text-[10px] py-0 px-2 uppercase font-mono">
                        Active
                    </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      $79 billed monthly. Renews on September 14, 2026.
                  </p>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto py-5">
                    Manage in Stripe
                </Button>
                </div>

                {/* Resource usage grid */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { name: "Active Bots", limit: "3 / 5" },
                    { name: "Phone Numbers", limit: "2 / 5" },
                    { name: "Messages Limit", limit: "8.9k / 10k" },
                  ].map((usage) => (
                    <div key={usage.name} className="p-3.5 rounded-xl border border-border/40 text-center space-y-1 bg-background/20">
                      <div className="text-sm font-semibold">{usage.limit}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{usage.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
