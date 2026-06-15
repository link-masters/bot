import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { hasSession } from "@/lib/api-auth";
import { getConfig } from "@/lib/server-store";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`config:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  if (!hasSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = getConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl =
    cfg.automationBackend === "n8n"
      ? cfg.n8nWebhookUrl
      : `${appUrl}/api/webhooks/openwa`;

  return NextResponse.json({
    automationBackend: cfg.automationBackend,
    webhookUrl,
    openwaReady: !!cfg.openwaUrl,
  });
}
