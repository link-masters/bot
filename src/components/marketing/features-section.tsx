"use client";

import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Workflow,
  Globe,
  Clock,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Responses",
    description:
      "Powered by Google Gemini AI for intelligent, context-aware conversations that feel natural.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Workflow,
    title: "n8n Workflow Automation",
    description:
      "Connect your bot to any tool with n8n. CRM, email, Sheets, Slack - automate everything.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: MessageSquare,
    title: "Multi-Bot Management",
    description:
      "Manage multiple WhatsApp numbers and bots from a single, intuitive dashboard.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track messages, response rates, user satisfaction, and bot performance in real-time.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "End-to-end encryption, session management, and enterprise-grade security for your data.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Your bot never sleeps. Provide instant responses to customers around the clock.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Respond in any language. AI automatically detects and replies in the user's language.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Sparkles,
    title: "Custom AI Personality",
    description:
      "Define your bot's personality, tone, and knowledge base with custom system prompts.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "Scan a QR code, configure your AI, and your bot is live in under 2 minutes.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mt-2 mb-4">
              Everything You Need to Automate WhatsApp
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete platform to build, deploy, and scale your WhatsApp AI
              automation without any coding.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-border hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
