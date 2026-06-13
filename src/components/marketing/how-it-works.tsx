"use client";

import { motion } from "framer-motion";
import { QrCode, Sliders, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    step: "01",
    title: "Scan QR Code",
    description:
      "Link your WhatsApp account in seconds by scanning a secure QR code. No complex APIs or approvals required.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Sliders,
    step: "02",
    title: "Define Bot & AI Rules",
    description:
      "Set up custom system prompts, welcome messages, and select the Gemini AI model to align with your business voice.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Automate & Scale",
    description:
      "Your bot automatically answers incoming inquiries, routes workflow tasks via n8n, and lists live conversations.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mt-2 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our setup is designed to be frictionless. No coding or developer credentials needed.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-border -translate-y-12 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/50 shadow-sm"
            >
              <div className="absolute top-4 right-4 text-3xl font-extrabold text-muted/30 font-mono">
                {step.step}
              </div>

              <div
                className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6 shadow-inner`}
              >
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>

              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
