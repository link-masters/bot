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
        <div className="flex-1 flex items-center justify-center max-w-md w-full mx-auto py-12">
          {children}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BotFlow. All rights reserved.
        </div>
      </div>

      {/* Right panel: Visual Banner */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/30 border-l border-border/50 relative overflow-hidden">
        {/* Inline CSS animation for marquee */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes authMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: authMarquee 45s linear infinite;
          }
        ` }} />

        {/* Background Gradients */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative z-10 my-auto max-w-xl mx-auto text-center flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg glow">
              <Bot className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold font-serif leading-tight">
              Automate WhatsApp Support in Minutes
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
              Link your phone number, configure custom Gemini AI rules, and let your bot handle customer conversations 24/7. Connect your CRM seamlessly with n8n.
            </p>
          </div>

          {/* Infinite Horizontal Image Marquee */}
          <div className="relative w-full overflow-hidden py-3 select-none">
            {/* Left and Right fade overlay gradients */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background/10 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background/10 to-transparent z-20 pointer-events-none" />

            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
              <div className="flex gap-6 pr-6 flex-shrink-0">
                {[
                  { src: "/whatsapp_automation_dashboard.png", alt: "SaaS Dashboard" },
                  { src: "/ai_chat_assistant.png", alt: "WhatsApp Assistant Chat" },
                  { src: "/n8n_integration_flow.png", alt: "n8n Workflow Integration" },
                  { src: "/ai_leads_pipeline.png", alt: "CRM Leads Pipeline" },
                  { src: "/whatsapp_chatbot_settings.png", alt: "Chatbot Configurator" },
                  { src: "/ai_insights_charts.png", alt: "Analytics Insights" },
                  { src: "/live_agent_chat.png", alt: "Live Chat Takeover" }
                ].map((img, index) => (
                  <div 
                    key={index}
                    className="w-72 h-44 rounded-xl overflow-hidden border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-card/65 backdrop-blur-xs flex-shrink-0 group hover:border-primary/40 transition-all duration-300 hover:scale-[1.01]"
                  >
                    <img 
                      src={img.src} 
                      alt={img.alt} 
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-6 pr-6 flex-shrink-0">
                {[
                  { src: "/whatsapp_automation_dashboard.png", alt: "SaaS Dashboard" },
                  { src: "/ai_chat_assistant.png", alt: "WhatsApp Assistant Chat" },
                  { src: "/n8n_integration_flow.png", alt: "n8n Workflow Integration" },
                  { src: "/ai_leads_pipeline.png", alt: "CRM Leads Pipeline" },
                  { src: "/whatsapp_chatbot_settings.png", alt: "Chatbot Configurator" },
                  { src: "/ai_insights_charts.png", alt: "Analytics Insights" },
                  { src: "/live_agent_chat.png", alt: "Live Chat Takeover" }
                ].map((img, index) => (
                  <div 
                    key={`dup-${index}`}
                    className="w-72 h-44 rounded-xl overflow-hidden border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-card/65 backdrop-blur-xs flex-shrink-0 group hover:border-primary/40 transition-all duration-300 hover:scale-[1.01]"
                  >
                    <img 
                      src={img.src} 
                      alt={img.alt} 
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center relative z-10">
          Secure and encrypted connection provided by OpenWA API.
        </div>
      </div>
    </div>
  );
}
