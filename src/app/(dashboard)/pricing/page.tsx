"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 19,
    yearlyPrice: 15,
    description: "For small businesses getting started with WhatsApp automation",
    features: [
      { text: "2 WhatsApp Bots", included: true },
      { text: "5,000 messages/month", included: true },
      { text: "2 Phone Numbers", included: true },
      { text: "Gemini AI Model", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Email Support", included: true },
      { text: "Webhook Integration", included: false },
      { text: "Custom AI Models", included: false },
      { text: "White Label", included: false },
      { text: "API Access", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 49,
    yearlyPrice: 39,
    description: "For growing businesses that need more power and flexibility",
    features: [
      { text: "10 WhatsApp Bots", included: true },
      { text: "50,000 messages/month", included: true },
      { text: "10 Phone Numbers", included: true },
      { text: "Gemini + DeepSeek AI", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Priority Support", included: true },
      { text: "Webhook Integration", included: true },
      { text: "n8n Workflows", included: true },
      { text: "Custom AI Models", included: false },
      { text: "White Label", included: false },
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 99,
    yearlyPrice: 79,
    description: "For enterprises requiring unlimited scale and customization",
    features: [
      { text: "Unlimited WhatsApp Bots", included: true },
      { text: "Unlimited Messages", included: true },
      { text: "Unlimited Phone Numbers", included: true },
      { text: "Custom AI Models", included: true },
      { text: "Full Analytics Suite", included: true },
      { text: "24/7 Dedicated Support", included: true },
      { text: "Custom Webhooks", included: true },
      { text: "Full API Access", included: true },
      { text: "White Label Option", included: true },
      { text: "Dedicated Server", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const FEATURE_COMPARISON = [
  { feature: "WhatsApp Bots", basic: "2", standard: "10", premium: "Unlimited" },
  { feature: "Messages/month", basic: "5,000", standard: "50,000", premium: "Unlimited" },
  { feature: "Phone Numbers", basic: "2", standard: "10", premium: "Unlimited" },
  { feature: "AI Models", basic: "Gemini", standard: "Gemini + DeepSeek", premium: "Custom" },
  { feature: "Analytics", basic: "Basic", standard: "Advanced", premium: "Full Suite" },
  { feature: "Support", basic: "Email", standard: "Priority", premium: "24/7 Dedicated" },
  { feature: "Webhooks", basic: false, standard: true, premium: true },
  { feature: "n8n Workflows", basic: false, standard: true, premium: true },
  { feature: "API Access", basic: false, standard: false, premium: true },
  { feature: "White Label", basic: false, standard: false, premium: true },
  { feature: "Dedicated Server", basic: false, standard: false, premium: true },
];

const FAQ_ITEMS = [
  {
    question: "What is a WhatsApp Bot?",
    answer: "A WhatsApp Bot is an automated assistant that responds to customer messages on WhatsApp. It uses AI to understand and reply to inquiries 24/7.",
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle.",
  },
  {
    question: "What happens if I exceed my message limit?",
    answer: "If you reach your monthly message limit, additional messages will be queued and processed when your limit resets at the start of the next billing cycle. You can also upgrade your plan for immediate access.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! All plans come with a 14-day free trial. No credit card required to start. You can explore all features of your chosen plan during the trial period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Enterprise plans.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes! When you choose annual billing, you save approximately 20% on all plans. The discount is automatically applied at checkout.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
          Pricing
        </Badge>
        <h1 className="text-4xl font-bold font-serif tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Scale your WhatsApp automation with flexible pricing. Start free, upgrade when you&apos;re ready.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={cn(
            "text-sm font-medium transition-colors",
            !isYearly ? "text-foreground" : "text-muted-foreground"
          )}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn(
              "relative w-14 h-7 rounded-full border transition-colors duration-300 focus:outline-none",
              isYearly
                ? "bg-primary border-primary"
                : "bg-muted border-border"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300",
                isYearly ? "translate-x-7" : "translate-x-0.5"
              )}
            />
          </button>
          <span className={cn(
            "text-sm font-medium flex items-center gap-2 transition-colors",
            isYearly ? "text-foreground" : "text-muted-foreground"
          )}>
            Yearly
            <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 px-1.5 py-0">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {PRICING_PLANS.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.price;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col border transition-all duration-300",
                plan.popular
                  ? "border-primary shadow-lg dark:shadow-primary/20 scale-[1.02] z-10 bg-gradient-to-b from-card to-card/95 overflow-visible"
                  : "border-border/50 hover:border-border hover:shadow-md bg-card"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-xl font-bold font-serif">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col px-6 pb-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold text-muted-foreground">$</span>
                    <span className="text-5xl font-extrabold tracking-tight">{price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {isYearly && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-muted-foreground/50" />
                        </div>
                      )}
                      <span className={cn(
                        feature.included ? "text-foreground" : "text-muted-foreground/60"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className={cn(
                    "w-full py-6 text-sm font-semibold cursor-pointer",
                    plan.popular && "shadow-md hover:shadow-lg transition-shadow"
                  )}
                >
                  {plan.popular && <Zap className="w-4 h-4 mr-2 fill-current" />}
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif mb-2">Feature Comparison</h2>
          <p className="text-muted-foreground text-sm">Detailed breakdown of what&apos;s included in each plan</p>
        </div>

        <Card className="border-border/40 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-foreground">Basic</th>
                  <th className="text-center py-4 px-6 font-semibold text-primary relative">
                    Standard
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-foreground">Premium</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-border/20 last:border-0",
                      idx % 2 === 0 ? "bg-muted/20" : ""
                    )}
                  >
                    <td className="py-3.5 px-6 text-foreground font-medium">{row.feature}</td>
                    <td className="py-3.5 px-6 text-center">
                      {typeof row.basic === "boolean" ? (
                        row.basic ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.basic}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center bg-primary/5">
                      {typeof row.standard === "boolean" ? (
                        row.standard ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="text-foreground font-medium">{row.standard}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {typeof row.premium === "boolean" ? (
                        row.premium ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold font-serif">Frequently Asked Questions</h2>
          </div>
          <p className="text-muted-foreground text-sm">Everything you need to know about our plans</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <Card
              key={idx}
              className={cn(
                "border-border/40 overflow-hidden transition-all duration-200",
                openFaq === idx ? "bg-card shadow-sm" : "bg-card/50 hover:bg-card"
              )}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-foreground pr-4">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                    openFaq === idx ? "rotate-180" : ""
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openFaq === idx ? "max-h-40" : "max-h-0"
                )}
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-muted-foreground text-sm">
          Still have questions? Contact our sales team for a personalized demo.
        </p>
        <Button variant="outline" className="cursor-pointer">
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
