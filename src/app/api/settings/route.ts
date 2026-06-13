import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/server-store";

export async function GET() {
  const store = getStore();
  return NextResponse.json({
    geminiKey: store.geminiKey,
    openwaKey: store.openwaKey,
    openwaUrl: store.openwaUrl,
    n8nWebhookUrl: store.n8nWebhookUrl,
    automationBackend: store.automationBackend
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const store = getStore();

    if (payload.geminiKey !== undefined) store.geminiKey = payload.geminiKey;
    if (payload.openwaKey !== undefined) store.openwaKey = payload.openwaKey;
    if (payload.openwaUrl !== undefined) store.openwaUrl = payload.openwaUrl;
    if (payload.n8nWebhookUrl !== undefined) store.n8nWebhookUrl = payload.n8nWebhookUrl;
    if (payload.automationBackend !== undefined) store.automationBackend = payload.automationBackend;

    const success = saveStore(store);
    if (!success) {
      throw new Error("Failed to write configurations to server storage file.");
    }

    return NextResponse.json({ success: true, message: "Settings saved to server database." });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
  }
}
