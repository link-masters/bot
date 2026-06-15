export interface BotItem {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  status: "active" | "inactive" | "connecting" | "qr_pending";
  aiModel: string;
  systemPrompt: string;
  welcomeMessage: string;
  totalMessages: number;
}

export interface OpenWASession {
  id: string;
  name?: string;
  phone?: string;
  status?: string;
  state?: string;
}

export interface ServerBotItem {
  id: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  status?: "active" | "inactive";
  aiModel?: string;
  systemPrompt?: string;
  welcomeMessage?: string;
  totalMessages?: number;
}
