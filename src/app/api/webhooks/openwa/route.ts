import { NextRequest, NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";
import { getConfig, getSecrets } from "@/lib/server-store";
import { generateAIResponse } from "@/lib/ai-service";

const DB_ID    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BOTS_COL = process.env.NEXT_PUBLIC_COLLECTION_BOTS!;

function adminDb() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook shared secret to prevent spoofed events
    const webhookSecret = process.env.OPENWA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const incomingSecret =
        req.headers.get("x-openwa-secret") ||
        req.headers.get("x-webhook-secret");
      if (incomingSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await req.json();
    console.log("[OpenWA Webhook] event=%s session=%s", payload.event, payload.sessionId || payload.session);

    const event = payload.event;
    const sessionId = payload.sessionId || payload.session;

    if (event !== "message.received" && event !== "message" && event !== "message.create") {
      return NextResponse.json({ success: true, reason: "Ignored event type" });
    }

    const msgData = payload.payload || payload.data || payload;
    if (!msgData) {
      return NextResponse.json({ success: false, error: "Empty message payload" }, { status: 400 });
    }

    const fromMe = msgData.fromMe || msgData.self || msgData.key?.fromMe;
    if (fromMe) {
      return NextResponse.json({ success: true, reason: "Ignored self-message" });
    }

    const chatId = msgData.from || msgData.chatId || msgData.key?.remoteJid;
    const messageText = msgData.body || msgData.text || msgData.message || "";

    if (!chatId || !messageText) {
      return NextResponse.json({ success: true, reason: "Empty chat ID or message content" });
    }

    const cfg = getConfig();
    const secrets = getSecrets();

    if (cfg.automationBackend === "n8n") {
      return NextResponse.json({ success: true, reason: "Delegated to n8n backend" });
    }

    // Look up bot from Appwrite DB (document ID = OpenWA session ID)
    let bot: { aiModel?: string; systemPrompt?: string; status?: string; [k: string]: unknown };
    try {
      bot = await adminDb().getDocument(DB_ID, BOTS_COL, sessionId);
    } catch {
      return NextResponse.json({ success: true, reason: "Bot not found" });
    }
    if (bot.status === "inactive") {
      return NextResponse.json({ success: true, reason: "Bot inactive" });
    }

    const openwaUrl = cfg.openwaUrl;

    // Pull recent chat history for multi-turn context
    let history: { sender: "user" | "assistant" | "system"; content: string }[] = [];
    try {
      const openwaHost = openwaUrl;
      const openwaToken = secrets.openwaKey;

      const historyRes = await fetch(
        `${openwaHost}/api/sessions/${sessionId}/messages?chatId=${encodeURIComponent(chatId)}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${openwaToken}`,
            "X-API-Key": openwaToken,
          },
        }
      );

      interface OpenWAMessage {
        body?: string;
        text?: string;
        fromMe?: boolean;
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (Array.isArray(historyData)) {
          history = historyData
            .filter((m: OpenWAMessage) => m.body || m.text)
            .map((m: OpenWAMessage) => ({
              sender: m.fromMe ? "assistant" : ("user" as const),
              content: m.body || m.text || "",
            }));
        }
      }
    } catch {
      console.warn("[OpenWA Webhook] Could not fetch conversation history");
    }

    const replyText = await generateAIResponse(
      (bot.aiModel as string) || "models/gemini-flash-lite-latest",
      (bot.systemPrompt as string) || "",
      messageText,
      history
    );

    const sendRes = await fetch(`${openwaUrl}/api/sessions/${sessionId}/messages/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secrets.openwaKey}`,
        "X-API-Key": secrets.openwaKey,
      },
      body: JSON.stringify({ chatId, text: replyText }),
    });

    if (!sendRes.ok) {
      throw new Error(`OpenWA send failed: HTTP ${sendRes.status}`);
    }

    // Internal chat-sync — fire and forget with shared secret
    try {
      const appHost = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
      const syncSecret = process.env.INTERNAL_SYNC_SECRET || "";
      await fetch(`${appHost}/api/webhooks/chat-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": syncSecret,
        },
        body: JSON.stringify({
          sessionId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      console.warn("[OpenWA Webhook] Chat-sync call failed");
    }

    return NextResponse.json({ success: true, replySent: true });
  } catch (error: unknown) {
    console.error("[OpenWA Webhook Error]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
