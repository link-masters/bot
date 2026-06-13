// types/index.ts

export interface User {
  $id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "starter" | "growth" | "business";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: "active" | "inactive" | "trialing" | "canceled";
  messageCount: number;
  messageLimit: number;
  isActive: boolean;
  trialEndsAt?: string;
  createdAt: string;
}

export interface Bot {
  $id: string;
  userId: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  status: "active" | "inactive" | "connecting" | "banned" | "qr_pending";
  openwaInstanceId?: string;
  n8nWorkflowId?: string;
  webhookUrl?: string;
  aiModel: string;
  systemPrompt?: string;
  welcomeMessage?: string;
  isActive: boolean;
  totalMessages: number;
  avatar?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export interface Conversation {
  $id: string;
  botId: string;
  userId: string;
  contactNumber: string;
  contactName?: string;
  lastMessage?: string;
  status: "active" | "closed" | "archived";
  messageCount: number;
  isRead: boolean;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  $id: string;
  conversationId: string;
  botId: string;
  content: string;
  role: "user" | "assistant";
  messageType: "text" | "image" | "audio" | "document";
  mediaUrl?: string;
  isDelivered: boolean;
  createdAt: string;
}

export interface Subscription {
  $id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: string;
  createdAt: string;
}

export interface Analytics {
  $id: string;
  userId: string;
  botId?: string;
  date: string;
  totalMessages: number;
  totalConversations: number;
  newContacts: number;
  successfulResponses: number;
  failedResponses: number;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  stripePriceId: string;
  stripeYearlyPriceId: string;
  description: string;
  features: string[];
  limits: {
    bots: number;
    messagesPerMonth: number;
    phoneNumbers: number;
  };
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    yearlyPrice: 19,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || "",
    stripeYearlyPriceId: "",
    description: "Perfect for individuals and small businesses",
    features: [
      "1 WhatsApp Bot",
      "1,000 messages/month",
      "1 Phone Number",
      "Basic Analytics",
      "AI Responses (Gemini)",
      "Email Support",
    ],
    limits: { bots: 1, messagesPerMonth: 1000, phoneNumbers: 1 },
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    yearlyPrice: 59,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || "",
    stripeYearlyPriceId: "",
    description: "For growing businesses",
    features: [
      "5 WhatsApp Bots",
      "10,000 messages/month",
      "5 Phone Numbers",
      "Advanced Analytics",
      "Custom AI Prompts",
      "Priority Support",
      "Webhook Integration",
      "n8n Workflows",
    ],
    limits: { bots: 5, messagesPerMonth: 10000, phoneNumbers: 5 },
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    yearlyPrice: 149,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || "",
    stripeYearlyPriceId: "",
    description: "For large enterprises",
    features: [
      "Unlimited Bots",
      "Unlimited Messages",
      "Unlimited Phone Numbers",
      "Full Analytics Suite",
      "Custom AI Models",
      "24/7 Priority Support",
      "Custom Webhooks",
      "API Access",
      "White Label Option",
      "Dedicated Server",
    ],
    limits: {
      bots: -1,
      messagesPerMonth: -1,
      phoneNumbers: -1,
    },
  },
];
