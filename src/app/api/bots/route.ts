import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore, BotConfig } from "@/lib/server-store";

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.bots);
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const store = getStore();

    if (!payload.id) {
      return NextResponse.json({ success: false, error: "Missing bot ID attribute" }, { status: 400 });
    }

    const idx = store.bots.findIndex((b) => b.id === payload.id);
    if (idx !== -1) {
      // Update
      store.bots[idx] = {
        ...store.bots[idx],
        ...payload
      };
    } else {
      // Insert
      const newBot: BotConfig = {
        id: payload.id,
        name: payload.name || "New AI Bot",
        description: payload.description || "",
        phoneNumber: payload.phoneNumber || "Linked Number",
        status: payload.status || "active",
        aiModel: payload.aiModel || "models/gemini-flash-lite-latest",
        systemPrompt: payload.systemPrompt || "You are a friendly AI chatbot.",
        welcomeMessage: payload.welcomeMessage || "Hello! How can I help you today?"
      };
      store.bots.push(newBot);
    }

    const success = saveStore(store);
    if (!success) {
      throw new Error("Unable to save bot configurations to database.");
    }

    return NextResponse.json({ success: true, bots: store.bots });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("id");

    if (!botId) {
      return NextResponse.json({ success: false, error: "Missing bot ID query parameter" }, { status: 400 });
    }

    const store = getStore();
    store.bots = store.bots.filter((b) => b.id !== botId);

    const success = saveStore(store);
    if (!success) {
      throw new Error("Failed to remove bot configuration from database.");
    }

    return NextResponse.json({ success: true, bots: store.bots });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
  }
}
