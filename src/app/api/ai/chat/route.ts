import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai-service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { hasSession } from "@/lib/api-auth";
import { z } from "zod";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

const ChatSchema = z.object({
  model: z.string().max(100).optional(),
  systemPrompt: z.string().max(5000).optional(),
  userMessage: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        sender: z.enum(["user", "assistant", "system"]),
        content: z.string().max(4000),
      })
    )
    .max(20)
    .optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`ai:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: corsHeaders() }
    );
  }

  if (!hasSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { model, systemPrompt, userMessage, history } = parsed.data;

    const text = await generateAIResponse(
      model || "models/gemini-flash-lite-latest",
      systemPrompt || "",
      userMessage,
      history || []
    );

    return NextResponse.json({ text }, { headers: corsHeaders() });
  } catch (error: unknown) {
    console.error("[AI Chat Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate response." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
