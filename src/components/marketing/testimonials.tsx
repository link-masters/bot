"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Customer Success Lead",
    company: "Shopify Merchant",
    content:
      "BotFlow transformed our support desk. We automated 80% of our tracking queries on WhatsApp in just an afternoon, and our ratings went up instantly.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    initials: "SJ",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Co-Founder",
    company: "SaaS Rocket",
    content:
      "The Gemini AI integration works flawlessly. The bot holds actual, context-aware conversations and resolves booking tasks without manual oversight.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    initials: "DC",
    rating: 5,
  },
  {
    name: "Elena Rostova",
    role: "Operations Director",
    company: "Apex Agency",
    content:
      "We connected our bot to HubSpot CRM using n8n workflows. It auto-updates contacts and sends notifications without writing a single line of API code.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    initials: "ER",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Reviews
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mt-2 mb-4">
              Loved by Businesses & Developers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our users are automating their sales pipelines and customer service channels.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative p-8 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-between"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-muted-foreground/10" />

              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic text-left">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              {/* User details */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
