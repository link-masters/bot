"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Zap,
  Shield,
  Star,
  Play,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 text-sm border-primary/30 bg-primary/5"
            >
              <Star className="w-3 h-3 mr-1 text-primary fill-primary" />
              Powered by Gemini AI + OpenWA
              <ArrowRight className="w-3 h-3 ml-1" />
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-serif leading-tight mb-6"
          >
            Build{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">
              AI WhatsApp Bots
            </span>{" "}
            That Actually Work
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Automate customer conversations, boost sales, and provide 24/7
            support with intelligent WhatsApp bots powered by Gemini AI and
            n8n workflows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button size="lg" className="text-base glow group" asChild>
              <Link href="/register">
                <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="#demo">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-16"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              No credit card required
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Setup in 2 minutes
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              14-day free trial
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                    app.botflow.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Mock Dashboard */}
              <div className="p-6 bg-gradient-to-br from-card to-background min-h-64">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Active Bots", value: "3", icon: Bot, color: "text-blue-500" },
                    { label: "Messages Today", value: "1,248", icon: MessageSquare, color: "text-green-500" },
                    { label: "Response Rate", value: "99.2%", icon: Zap, color: "text-yellow-500" },
                    { label: "Satisfaction", value: "4.9★", icon: Star, color: "text-purple-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border/50">
                      <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chat preview */}
                <div className="bg-card rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Live Conversations</div>
                      <div className="text-xs text-muted-foreground">3 active now</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {["Customer asking about pricing...", "Order status inquiry...", "Technical support request..."].map((msg, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{String.fromCharCode(65 + i)}</span>
                        </div>
                        <div className="flex-1 text-xs text-muted-foreground truncate text-left">{msg}</div>
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg animate-bounce">
              ✓ Bot Connected!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-border px-3 py-1.5 rounded-full text-xs shadow-lg animate-float">
              🤖 AI Responding...
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
