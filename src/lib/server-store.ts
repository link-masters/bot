import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src/lib/data.json");

export interface BotConfig {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  status: "active" | "inactive";
  aiModel: string;
  systemPrompt: string;
  welcomeMessage: string;
}

export interface AppConfig {
  geminiKey: string;
  openwaKey: string;
  openwaUrl: string;
  n8nWebhookUrl: string;
  automationBackend: "builtin" | "n8n";
  bots: BotConfig[];
}

const defaultConfig: AppConfig = {
  geminiKey: "",
  openwaKey: "dev-admin-key",
  openwaUrl: "http://127.0.0.1:2785",
  n8nWebhookUrl: "http://localhost:5678/webhook/whatsapp-webhook",
  automationBackend: "builtin",
  bots: [
    {
      id: "1",
      name: "Sales Assistant",
      description: "Answers product questions and handles lead capture.",
      phoneNumber: "+1 (555) 019-2834",
      status: "active",
      aiModel: "models/gemini-flash-lite-latest",
      systemPrompt: "You are a friendly sales representative for BotFlow. Help users understand our plans and sign up.",
      welcomeMessage: "Hi there! I am your sales assistant. How can I help you grow your business today?"
    },
    {
      id: "2",
      name: "Support Bot",
      description: "Handles common ticket resolutions and FAQs.",
      phoneNumber: "+1 (555) 014-9382",
      status: "active",
      aiModel: "models/gemini-flash-lite-latest",
      systemPrompt: "You are a customer support agent. Resolve customer inquiries politely based on our help docs.",
      welcomeMessage: "Hello! Welcome to Support. Please describe your issue and I will resolve it for you."
    }
  ]
};

export function getStore(): AppConfig {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Ensure the directory exists
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8");
      return defaultConfig;
    }

    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(fileContent) as AppConfig;
  } catch (error) {
    console.error("[Server Store Read Error]:", error);
    return defaultConfig;
  }
}

export function saveStore(config: AppConfig): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("[Server Store Write Error]:", error);
    return false;
  }
}
