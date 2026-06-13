import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/server-store";
import { callGeminiAPI } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("--------------------------------------------------");
    console.log("[OpenWA Webhook Event Received]");
    console.log("Event Type:", payload.event);
    console.log("Session ID:", payload.sessionId || payload.session);
    console.log("--------------------------------------------------");

    const event = payload.event;
    const sessionId = payload.sessionId || payload.session;

    // We only process incoming message events
    if (event !== "message.received" && event !== "message" && event !== "message.create") {
      return NextResponse.json({ success: true, reason: "Ignored event type: " + event });
    }

    const msgData = payload.payload || payload.data || payload;
    if (!msgData) {
      return NextResponse.json({ success: false, error: "Empty message payload" }, { status: 400 });
    }

    // Prevent infinite loop by ignoring messages sent by the bot itself
    const fromMe = msgData.fromMe || msgData.self || msgData.key?.fromMe;
    if (fromMe) {
      return NextResponse.json({ success: true, reason: "Ignored self-message to prevent loop" });
    }

    const chatId = msgData.from || msgData.chatId || msgData.key?.remoteJid;
    const messageText = msgData.body || msgData.text || msgData.message || "";

    if (!chatId || !messageText) {
      return NextResponse.json({ success: true, reason: "Empty chat ID or message content" });
    }

    const store = getStore();

    // If active backend is set to n8n, skip processing here to let n8n handle it
    if (store.automationBackend === "n8n") {
      return NextResponse.json({ success: true, reason: "Bypassed (delegated to n8n backend)" });
    }

    const bot = store.bots.find((b) => b.id === sessionId);
    if (!bot || bot.status === "inactive") {
      return NextResponse.json({ success: true, reason: `Bot session ${sessionId} is inactive/unconfigured` });
    }

    const apiKey = store.geminiKey;
    if (!apiKey) {
      console.warn("[OpenWA Hook Warn]: Google Gemini API key is missing from server store settings.");
      return NextResponse.json({ success: false, error: "Google Gemini API Key is missing from settings" }, { status: 400 });
    }

    // Attempt to pull recent chat history from OpenWA to build a multi-turn conversation context
    let history: { sender: "user" | "assistant" | "system"; content: string }[] = [];
    try {
      const openwaHost = store.openwaUrl;
      const openwaToken = store.openwaKey;

      const historyRes = await fetch(`${openwaHost}/api/sessions/${sessionId}/messages?chatId=${chatId}&limit=5`, {
        headers: {
          "Authorization": `Bearer ${openwaToken}`,
          "X-API-Key": openwaToken
        }
      });
      
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
              sender: m.fromMe ? "assistant" : "user",
              content: m.body || m.text || ""
            }));
        }
      }
    } catch (err) {
      console.warn("Could not retrieve conversation history from OpenWA API:", err);
    }

    // Call Gemini AI using consolidated flash-lite model
    const replyText = await callGeminiAPI(
      apiKey,
      bot.aiModel || "models/gemini-flash-lite-latest",
      bot.systemPrompt,
      messageText,
      history
    );

    // Send the generated response text back to WhatsApp via OpenWA
    const openwaHost = store.openwaUrl;
    const openwaToken = store.openwaKey;

    const sendRes = await fetch(`${openwaHost}/api/sessions/${sessionId}/messages/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openwaToken}`,
        "X-API-Key": openwaToken
      },
      body: JSON.stringify({
        chatId: chatId,
        text: replyText
      })
    });

    if (!sendRes.ok) {
      throw new Error(`OpenWA message send failed with HTTP status ${sendRes.status}`);
    }

    // Synchronize log with SaaS Live Chat panel
    try {
      const appHost = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
      await fetch(`${appHost}/api/webhooks/chat-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: chatId,
          message: messageText,
          response: replyText,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.warn("SaaS Live Chat sync call failed:", err);
    }

    return NextResponse.json({ success: true, replySent: true, text: replyText });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[OpenWA Webhook Router Error]:", errMsg);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
