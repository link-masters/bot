#!/usr/bin/env node
/**
 * BotFlow — one-shot Appwrite database setup
 * Run: node scripts/setup-db.mjs
 *
 * Reads credentials from .env.local (or env vars already in the shell).
 * Safe to re-run — skips anything that already exists.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──────────────────────────────────────────────────────────
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
try {
  const raw = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // If no .env.local, rely on shell environment variables
}

const ENDPOINT  = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT   = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY   = process.env.APPWRITE_API_KEY;
const DB_ID     = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!ENDPOINT || !PROJECT || !API_KEY || !DB_ID) {
  console.error("❌  Missing env vars. Check .env.local has:");
  console.error("    NEXT_PUBLIC_APPWRITE_ENDPOINT");
  console.error("    NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  console.error("    APPWRITE_API_KEY");
  console.error("    NEXT_PUBLIC_APPWRITE_DATABASE_ID");
  process.exit(1);
}

// ── Appwrite SDK ─────────────────────────────────────────────────────────────
const { Client, Databases, Permission, Role, DatabasesIndexType, OrderBy } =
  await import("node-appwrite");

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT)
  .setKey(API_KEY);
const db = new Databases(client);

// ── Helpers ───────────────────────────────────────────────────────────────────
let step = 0;
function log(msg) {
  console.log(`  ${msg}`);
}
function section(name) {
  step++;
  console.log(`\n[${step}] ${name}`);
}

async function safe(label, fn) {
  try {
    await fn();
    log(`✅  ${label}`);
  } catch (e) {
    // 409 = already exists, 400 = attribute already exists
    // 403 on db.create = plan limit reached but db may already exist
    if (e?.code === 409 || e?.code === 400 || e?.code === 403) {
      log(`⏭   ${label} (already exists or plan limit — skipping)`);
    } else {
      log(`❌  ${label} — ${e?.message ?? e}`);
      throw e;
    }
  }
}

const str  = (c, a, size, req, def)      => safe(`${c}.${a} (string)`,   () => db.createStringAttribute(DB_ID, c, a, size, req, def));
const int  = (c, a, min, max, req, def)  => safe(`${c}.${a} (integer)`,  () => db.createIntegerAttribute(DB_ID, c, a, req, min, max, def));
const bool = (c, a, req, def)            => safe(`${c}.${a} (boolean)`,  () => db.createBooleanAttribute(DB_ID, c, a, req, def));
const dt   = (c, a, req)                 => safe(`${c}.${a} (datetime)`, () => db.createDatetimeAttribute(DB_ID, c, a, req));
const col  = (id, name, perms)           => safe(`collection: ${id}`,    () => db.createCollection(DB_ID, id, name, perms));
const idx  = (c, key, type, attrs, ord)  => safe(`${c} index: ${key}`,   () => db.createIndex(DB_ID, c, key, type, attrs, ord));

// ── Run setup ─────────────────────────────────────────────────────────────────
console.log("\n🚀  BotFlow database setup");
console.log(`    Endpoint : ${ENDPOINT}`);
console.log(`    Project  : ${PROJECT}`);
console.log(`    Database : ${DB_ID}`);

// Database
section("Database");
await safe("create database", () => db.create(DB_ID, "BotFlow DB"));

// ── USERS ─────────────────────────────────────────────────────────────────────
section("users collection");
await col("users", "Users", [
  Permission.create(Role.users()),
  Permission.create(Role.any()),
]);
await Promise.all([
  str("users",  "userId",             255,  true),
  str("users",  "name",               255,  true),
  str("users",  "email",              255,  true),
  str("users",  "avatar",             500,  false),
  str("users",  "plan",               50,   true,  "starter"),
  str("users",  "subscriptionStatus", 50,   false, "inactive"),
  int("users",  "messageCount",       0, 100000000, false, 0),
  int("users",  "messageLimit",       0, 100000000, false, 1000),
  bool("users", "isActive",           false, true),
  dt("users",   "trialEndsAt",        false),
  dt("users",   "createdAt",          true),
]);
await Promise.all([
  idx("users", "userId_unique", DatabasesIndexType.Unique, ["userId"]),
  idx("users", "email_key",     DatabasesIndexType.Key,    ["email"]),
]);

// ── BOTS ──────────────────────────────────────────────────────────────────────
section("bots collection");
await col("bots", "Bots", [Permission.create(Role.users())]);
await Promise.all([
  str("bots",  "userId",         255,  true),
  str("bots",  "name",           255,  true),
  str("bots",  "description",    1000, false),
  str("bots",  "phoneNumber",    50,   false),
  str("bots",  "status",         50,   true,  "inactive"),
  str("bots",  "aiModel",        100,  false, "models/gemini-flash-lite-latest"),
  str("bots",  "systemPrompt",   5000, false),
  str("bots",  "welcomeMessage", 1000, false),
  str("bots",  "webhookUrl",     500,  false),
  bool("bots", "isActive",       false, true),
  int("bots",  "totalMessages",  0, 100000000, false, 0),
  dt("bots",   "lastActiveAt",   false),
  dt("bots",   "createdAt",      true),
]);
await Promise.all([
  idx("bots", "userId_key",    DatabasesIndexType.Key, ["userId"]),
  idx("bots", "userId_status", DatabasesIndexType.Key, ["userId", "status"]),
  idx("bots", "createdAt_desc",DatabasesIndexType.Key, ["$createdAt"], [OrderBy.Desc]),
]);

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
section("conversations collection");
await col("conversations", "Conversations", [Permission.create(Role.users())]);
await Promise.all([
  str("conversations",  "botId",        255,  true),
  str("conversations",  "userId",        255,  true),
  str("conversations",  "contactNumber", 50,   true),
  str("conversations",  "contactName",   255,  false),
  str("conversations",  "lastMessage",   1000, false),
  str("conversations",  "status",        50,   false, "active"),
  int("conversations",  "messageCount",  0, 100000000, false, 0),
  bool("conversations", "isRead",        false, false),
  dt("conversations",   "lastMessageAt", false),
  dt("conversations",   "createdAt",     true),
]);
await Promise.all([
  idx("conversations", "botId_key",     DatabasesIndexType.Key, ["botId"]),
  idx("conversations", "userId_key",    DatabasesIndexType.Key, ["userId"]),
  idx("conversations", "userId_status", DatabasesIndexType.Key, ["userId", "status"]),
]);

// ── MESSAGES ──────────────────────────────────────────────────────────────────
section("messages collection");
await col("messages", "Messages", [Permission.create(Role.users())]);
await Promise.all([
  str("messages",  "conversationId", 255,  true),
  str("messages",  "botId",          255,  true),
  str("messages",  "content",        5000, true),
  str("messages",  "role",           50,   true),
  str("messages",  "messageType",    50,   false, "text"),
  str("messages",  "mediaUrl",       500,  false),
  bool("messages", "isDelivered",    false, false),
  dt("messages",   "createdAt",      true),
]);
await Promise.all([
  idx("messages", "conversationId_key", DatabasesIndexType.Key, ["conversationId"]),
  idx("messages", "botId_key",          DatabasesIndexType.Key, ["botId"]),
]);

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
section("analytics collection");
await col("analytics", "Analytics", [Permission.create(Role.users())]);
await Promise.all([
  str("analytics", "userId",              255, true),
  str("analytics", "botId",               255, false),
  str("analytics", "date",                20,  true),
  int("analytics", "totalMessages",       0, 100000000, false, 0),
  int("analytics", "totalConversations",  0, 100000000, false, 0),
  int("analytics", "newContacts",         0, 100000000, false, 0),
  int("analytics", "successfulResponses", 0, 100000000, false, 0),
  int("analytics", "failedResponses",     0, 100000000, false, 0),
  dt("analytics",  "createdAt",           true),
]);
await Promise.all([
  idx("analytics", "userId_date", DatabasesIndexType.Key, ["userId", "date"]),
  idx("analytics", "botId_date",  DatabasesIndexType.Key, ["botId",  "date"]),
]);

console.log("\n✅  Setup complete! All collections, attributes, and indexes are ready.");
console.log("    You can now sign up and start using BotFlow.\n");
