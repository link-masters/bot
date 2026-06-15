// Runtime configuration read exclusively from environment variables.
// All mutable data (bots, user settings) lives in Appwrite — no file I/O.

export interface AppSecrets {
  geminiKey: string;
  deepseekKey: string;
  openwaKey: string;
}

export interface AppConfig {
  openwaUrl: string;
  n8nWebhookUrl: string;
  automationBackend: "builtin" | "n8n";
}

export function getConfig(): AppConfig {
  return {
    openwaUrl: process.env.OPENWA_BASE_URL || "http://127.0.0.1:2785",
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/whatsapp-webhook",
    automationBackend: (process.env.AUTOMATION_BACKEND as "builtin" | "n8n") || "builtin",
  };
}

export function getSecrets(): AppSecrets {
  return {
    geminiKey: process.env.GEMINI_API_KEY || "",
    deepseekKey: process.env.DEEPSEEK_API_KEY || "",
    openwaKey: process.env.OPENWA_API_KEY || "",
  };
}

// Legacy alias — keeps old call-sites compiling while we migrate them.
export const getStore = getConfig;
