/**
 * One-time database setup — creates all Appwrite collections, attributes,
 * indexes, and collection-level permissions.
 *
 * Protected by SETUP_SECRET env var so only you can run it.
 * Safe to re-run — every operation ignores "already exists" errors.
 *
 * Usage:
 *   GET /api/setup?secret=YOUR_SETUP_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Permission, Role, DatabasesIndexType, OrderBy } from "node-appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

function adminDb() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

async function tryCreate(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e: unknown) {
    const code = (e as { code?: number }).code;
    // 409 = already exists, 400 = attribute already exists — both are fine
    if (code !== 409 && code !== 400) throw e;
  }
}

export async function GET(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { error: "Set SETUP_SECRET in your env vars first." },
      { status: 503 }
    );
  }
  if (req.nextUrl.searchParams.get("secret") !== setupSecret) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 401 });
  }
  if (!process.env.APPWRITE_API_KEY || process.env.APPWRITE_API_KEY === "your_api_key") {
    return NextResponse.json({ error: "APPWRITE_API_KEY not configured." }, { status: 503 });
  }

  const db = adminDb();
  const results: Record<string, string> = {};

  try {
    // ── Database ──────────────────────────────────────────────────────────────
    await tryCreate(() => db.create(DB_ID, "BotFlow DB"));
    results.database = "ok";

    // ── Shorthand helpers ─────────────────────────────────────────────────────
    const col = (id: string, name: string, perms: string[]) =>
      tryCreate(() => db.createCollection(DB_ID, id, name, perms));

    const str = (c: string, a: string, size: number, req: boolean, def?: string) =>
      tryCreate(() => db.createStringAttribute(DB_ID, c, a, size, req, def));

    const int = (c: string, a: string, min: number, max: number, req: boolean, def?: number) =>
      tryCreate(() => db.createIntegerAttribute(DB_ID, c, a, req, min, max, def));

    const bool = (c: string, a: string, req: boolean, def?: boolean) =>
      tryCreate(() => db.createBooleanAttribute(DB_ID, c, a, req, def));

    const dt = (c: string, a: string, req: boolean) =>
      tryCreate(() => db.createDatetimeAttribute(DB_ID, c, a, req));

    const idx = (
      c: string,
      key: string,
      type: DatabasesIndexType,
      attrs: string[],
      orders?: OrderBy[]
    ) => tryCreate(() => db.createIndex(DB_ID, c, key, type, attrs, orders));

    // ── USERS ─────────────────────────────────────────────────────────────────
    // Collection-level: any authenticated user (or admin) can create documents.
    // Document-level: set per-document at creation time → only owner can read/update.
    await col("users", "Users", [
      Permission.create(Role.users()),
      Permission.create(Role.any()), // admin creates via API key on behalf of OAuth users
    ]);
    await Promise.all([
      str("users", "userId",             255,  true),
      str("users", "name",               255,  true),
      str("users", "email",              255,  true),
      str("users", "avatar",             500,  false),
      str("users", "plan",               50,   true,  "starter"),
      str("users", "subscriptionStatus", 50,   false, "inactive"),
      int("users", "messageCount",       0, 100_000_000, false, 0),
      int("users", "messageLimit",       0, 100_000_000, false, 1000),
      bool("users","isActive",           false, true),
      dt("users",  "trialEndsAt",        false),
      dt("users",  "createdAt",          true),
    ]);
    await Promise.all([
      idx("users", "userId_unique", DatabasesIndexType.Unique, ["userId"]),
      idx("users", "email_key",     DatabasesIndexType.Key,    ["email"]),
    ]);
    results.users = "ok";

    // ── BOTS ──────────────────────────────────────────────────────────────────
    await col("bots", "Bots", [
      Permission.create(Role.users()),
    ]);
    await Promise.all([
      str("bots", "userId",         255,  true),
      str("bots", "name",           255,  true),
      str("bots", "description",    1000, false),
      str("bots", "phoneNumber",    50,   false),
      str("bots", "status",         50,   true, "inactive"),
      str("bots", "aiModel",        100,  false, "models/gemini-flash-lite-latest"),
      str("bots", "systemPrompt",   5000, false),
      str("bots", "welcomeMessage", 1000, false),
      str("bots", "webhookUrl",     500,  false),
      bool("bots","isActive",       false, true),
      int("bots", "totalMessages",  0, 100_000_000, false, 0),
      dt("bots",  "lastActiveAt",   false),
      dt("bots",  "createdAt",      true),
    ]);
    await Promise.all([
      idx("bots", "userId_key",     DatabasesIndexType.Key, ["userId"]),
      idx("bots", "userId_status",  DatabasesIndexType.Key, ["userId", "status"]),
      idx("bots", "createdAt_desc", DatabasesIndexType.Key, ["$createdAt"], [OrderBy.Desc]),
    ]);
    results.bots = "ok";

    // ── CONVERSATIONS ─────────────────────────────────────────────────────────
    await col("conversations", "Conversations", [
      Permission.create(Role.users()),
    ]);
    await Promise.all([
      str("conversations",  "botId",        255,  true),
      str("conversations",  "userId",        255,  true),
      str("conversations",  "contactNumber", 50,   true),
      str("conversations",  "contactName",   255,  false),
      str("conversations",  "lastMessage",   1000, false),
      str("conversations",  "status",        50,   false, "active"),
      int("conversations",  "messageCount",  0, 100_000_000, false, 0),
      bool("conversations", "isRead",        false, false),
      dt("conversations",   "lastMessageAt", false),
      dt("conversations",   "createdAt",     true),
    ]);
    await Promise.all([
      idx("conversations", "botId_key",     DatabasesIndexType.Key, ["botId"]),
      idx("conversations", "userId_key",    DatabasesIndexType.Key, ["userId"]),
      idx("conversations", "userId_status", DatabasesIndexType.Key, ["userId", "status"]),
    ]);
    results.conversations = "ok";

    // ── MESSAGES ──────────────────────────────────────────────────────────────
    await col("messages", "Messages", [
      Permission.create(Role.users()),
    ]);
    await Promise.all([
      str("messages", "conversationId", 255,  true),
      str("messages", "botId",          255,  true),
      str("messages", "content",        5000, true),
      str("messages", "role",           50,   true),
      str("messages", "messageType",    50,   false, "text"),
      str("messages", "mediaUrl",       500,  false),
      bool("messages","isDelivered",    false, false),
      dt("messages",  "createdAt",      true),
    ]);
    await Promise.all([
      idx("messages", "conversationId_key", DatabasesIndexType.Key, ["conversationId"]),
      idx("messages", "botId_key",          DatabasesIndexType.Key, ["botId"]),
    ]);
    results.messages = "ok";

    // ── ANALYTICS ─────────────────────────────────────────────────────────────
    await col("analytics", "Analytics", [
      Permission.create(Role.users()),
    ]);
    await Promise.all([
      str("analytics", "userId",              255, true),
      str("analytics", "botId",               255, false),
      str("analytics", "date",                20,  true),
      int("analytics", "totalMessages",       0, 100_000_000, false, 0),
      int("analytics", "totalConversations",  0, 100_000_000, false, 0),
      int("analytics", "newContacts",         0, 100_000_000, false, 0),
      int("analytics", "successfulResponses", 0, 100_000_000, false, 0),
      int("analytics", "failedResponses",     0, 100_000_000, false, 0),
      dt("analytics",  "createdAt",           true),
    ]);
    await Promise.all([
      idx("analytics", "userId_date", DatabasesIndexType.Key, ["userId", "date"]),
      idx("analytics", "botId_date",  DatabasesIndexType.Key, ["botId",  "date"]),
    ]);
    results.analytics = "ok";

    return NextResponse.json({
      success: true,
      message: "Database setup complete. All collections, attributes, and indexes are ready.",
      results,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Setup Error]:", err);
    return NextResponse.json(
      { success: false, error: msg, partial: results },
      { status: 500 }
    );
  }
}
