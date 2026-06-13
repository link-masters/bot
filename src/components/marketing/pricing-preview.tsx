"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { PLANS } from "@/types";
import Link from "next/link";

export function PricingPreviewSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Pricing Plans
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mt-2 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your business. Start with a 14-day free trial.
            </p>

            {/* Toggle Button */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="w-12 h-6 rounded-full bg-muted border border-border p-1 flex items-center transition-colors focus:outline-none"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-primary transition-transform duration-300 ${
                    isYearly ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium flex items-center gap-1.5 ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
                Yearly Billing
                <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20 py-0 px-1.5">
                  Save 20%+
                </Badge>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => {
            const price = isYearly ? plan.yearlyPrice : plan.price;
            const hasYearly = plan.yearlyPrice > 0;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col bg-card border transition-all duration-300 ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105 z-10 glow"
                    : "border-border/50 shadow-sm hover:border-border hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-serif mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$</span>
                  <span className="text-5xl font-extrabold tracking-tight">
                    {hasYearly ? price : plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <Button
                  asChild
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full py-6 text-base ${plan.popular ? "glow" : ""}`}
                >
                  <Link href={`/register?plan=${plan.id}`}>
                    {plan.popular && <Zap className="w-4 h-4 mr-2 fill-primary-foreground" />}
                    Get Started with {plan.name}
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
