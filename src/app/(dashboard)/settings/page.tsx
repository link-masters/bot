"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Lock, CreditCard, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  $id: string;
  userId: string;
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: string;
  messageCount: number;
  messageLimit: number;
  isActive: boolean;
  trialEndsAt?: string;
  createdAt: string;
  avatar?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (r.status === 401) {
        window.location.replace("/login");
        return;
      }
      if (r.ok) {
        const data = await r.json();
        setUser(data);
        setName(data.name || "");
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update.");
      setUser((prev) => prev ? { ...prev, name } : prev);
      toast.success("Name updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const usagePct = user
    ? Math.min(Math.round((user.messageCount / (user.messageLimit || 1000)) * 100), 100)
    : 0;

  const planLabel =
    user?.plan === "pro"
      ? "Pro"
      : user?.plan === "growth"
      ? "Growth"
      : user?.plan === "enterprise"
      ? "Enterprise"
      : "Starter";

  const statusColor =
    user?.subscriptionStatus === "active"
      ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <p className="text-sm text-muted-foreground text-left">
        Manage your account profile, security, and billing.
      </p>

      {/* ── PROFILE ── */}
      <Card className="border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-left">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base font-bold font-serif">Profile</CardTitle>
              <CardDescription className="text-xs">Your public display name and email.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar + identity */}
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-border">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          <Separator className="border-border/40" />

          <form onSubmit={handleSaveName} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prof-name">Full Name</Label>
                <Input
                  id="prof-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={savingProfile}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-email">Email Address</Label>
                <Input
                  id="prof-email"
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="bg-muted/40 cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed here.</p>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              className="glow h-9 px-5 cursor-pointer"
              disabled={savingProfile || name === user?.name}
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Name
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── PASSWORD ── */}
      <Card className="border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-left">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base font-bold font-serif">Password</CardTitle>
              <CardDescription className="text-xs">
                Update your password. Leave blank if you signed in with Google.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={savingPassword}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={savingPassword}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-9 px-5 cursor-pointer"
              disabled={savingPassword || !currentPassword || !newPassword}
            >
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ── SUBSCRIPTION ── */}
      <Card className="border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-left">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base font-bold font-serif">Subscription</CardTitle>
              <CardDescription className="text-xs">Your current plan and billing status.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 gap-3">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm font-serif">{planLabel} Plan</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] py-0 px-2 uppercase font-mono tracking-wider font-semibold border ${statusColor}`}
                >
                  {user?.subscriptionStatus ?? "inactive"}
                </Badge>
              </div>
              {user?.trialEndsAt && (
                <p className="text-xs text-muted-foreground">
                  Trial ends {new Date(user.trialEndsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" disabled>
              Manage Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── USAGE ── */}
      <Card className="border-border/40 bg-gradient-to-b from-card/85 to-card/75 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-left">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-base font-bold font-serif">Usage</CardTitle>
              <CardDescription className="text-xs">Messages processed this billing period.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Messages</span>
              <span className="text-muted-foreground">
                {(user?.messageCount ?? 0).toLocaleString()} / {(user?.messageLimit ?? 1000).toLocaleString()}
              </span>
            </div>
            <Progress value={usagePct} className="h-2 bg-muted/40" />
            <p className="text-[10px] text-muted-foreground">{usagePct}% of limit used</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
