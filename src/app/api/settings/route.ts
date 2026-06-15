import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getSecrets, getConfig } from "@/lib/server-store";
import { z } from "zod";

function sessionClient(secret: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setSession(secret);
  return new Account(client);
}

function isSafeUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const SettingsSchema = z.object({
  openwaUrl: z.string().max(500).optional().refine((v) => !v || isSafeUrl(v), {
    message: "openwaUrl must be a valid http/https URL",
  }),
  n8nWebhookUrl: z.string().max(500).optional().refine((v) => !v || isSafeUrl(v), {
    message: "n8nWebhookUrl must be a valid http/https URL",
  }),
  automationBackend: z.enum(["builtin", "n8n"]).optional(),
});

async function getSession(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`settings:${ip}`, 30, 60_000)) return { error: "rate_limit", secret: null };
  const secret = req.cookies.get("appwrite-session")?.value;
  if (!secret) return { error: "unauthorized", secret: null };
  return { error: null, secret };
}

export async function GET(req: NextRequest) {
  const { error, secret } = await getSession(req);
  if (error === "rate_limit") return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cfg = getConfig();
  const secrets = getSecrets();

  // Merge env var defaults with any user-saved prefs
  let userPrefs: Record<string, string> = {};
  try {
    const account = sessionClient(secret!);
    userPrefs = (await account.getPrefs()) as Record<string, string>;
  } catch {}

  return NextResponse.json({
    hasGeminiKey: !!secrets.geminiKey,
    hasDeepseekKey: !!secrets.deepseekKey,
    hasOpenwaKey: !!secrets.openwaKey,
    openwaUrl: userPrefs.openwaUrl || cfg.openwaUrl,
    n8nWebhookUrl: userPrefs.n8nWebhookUrl || cfg.n8nWebhookUrl,
    automationBackend: userPrefs.automationBackend || cfg.automationBackend,
  });
}

export async function POST(req: NextRequest) {
  const { error, secret } = await getSession(req);
  if (error === "rate_limit") return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = SettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const account = sessionClient(secret!);
    const existing = (await account.getPrefs()) as Record<string, string>;
    const updated: Record<string, string> = { ...existing };

    if (parsed.data.openwaUrl) updated.openwaUrl = parsed.data.openwaUrl;
    if (parsed.data.n8nWebhookUrl) updated.n8nWebhookUrl = parsed.data.n8nWebhookUrl;
    if (parsed.data.automationBackend) updated.automationBackend = parsed.data.automationBackend;

    await account.updatePrefs(updated);
    return NextResponse.json({ success: true, message: "Settings saved." });
  } catch (err) {
    console.error("[Settings POST]:", err);
    return NextResponse.json({ success: false, error: "Failed to save settings." }, { status: 500 });
  }
}
