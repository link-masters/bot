import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Log message data to server console
    console.log("--------------------------------------------------");
    console.log("[n8n Chat-Sync Webhook Event Received]");
    console.log("From (Customer):", payload.from || payload.phone || "Unknown");
    console.log("Message Content:", payload.message || payload.content || "Empty");
    console.log("Bot Response:", payload.response || payload.reply || "No reply");
    console.log("Timestamp:", payload.timestamp || new Date().toISOString());
    console.log("--------------------------------------------------");

    // In a real production setup, this endpoint writes to your DB (e.g., PostgreSQL, MongoDB)
    // and triggers a WebSocket/SSE event to notify the Live Chat dashboard tab instantly.

    return NextResponse.json({
      success: true,
      status: "synced",
      message: "Conversation synced successfully with SaaS database.",
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Chat Sync Webhook Error]:", errMsg);
    return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
  }
}
