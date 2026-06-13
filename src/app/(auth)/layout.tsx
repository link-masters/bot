"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel: Form */}
      <div className="flex flex-col justify-between p-8 lg:p-12 bg-background">
        <Link href="/" className="flex items-center gap-2 group self-start">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl font-serif">BotFlow</span>
        </Link>
        <div className="flex-1 flex items-center justify-center max-w-md w-full mx-auto py-12">
          {children}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BotFlow. All rights reserved.
        </div>
      </div>

      {/* Right panel: Visual Banner */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/30 border-l border-border/50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative z-10 my-auto max-w-lg mx-auto text-center flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg glow">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold font-serif leading-tight">
            Automate WhatsApp Support in Minutes
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Link your phone number, configure custom Gemini AI rules, and let your bot handle customer conversations 24/7. Connect your CRM seamlessly with n8n.
          </p>
        </div>

        <div className="text-xs text-muted-foreground text-center relative z-10">
          Secure and encrypted connection provided by OpenWA API.
        </div>
      </div>
    </div>
  );
}
