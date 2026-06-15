import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query, Permission, Role } from "node-appwrite";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestUserId } from "@/lib/api-auth";
import { cache as ttlCache, TTL, withCache } from "@/lib/cache";
import { z } from "zod";

const DB_ID    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BOTS_COL = process.env.NEXT_PUBLIC_COLLECTION_BOTS!;

function adminDb() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Databases(client);
}

const BotSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  phoneNumber: z.string().max(30).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  aiModel: z.string().max(100).optional(),
  systemPrompt: z.string().max(5000).optional(),
  welcomeMessage: z.string().max(1000).optional(),
});

async function requireUser(req: NextRequest) {
  const userId = await getRequestUserId(req);
  const { limited, reason } = checkRateLimit(req, "bots", userId, {
    ipLimit: 60,
    userLimit: 40,
    windowMs: 60_000,
  });
  if (limited) {
    return { error: NextResponse.json({ error: reason }, { status: 429 }), userId: null };
  }
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }
  return { error: null, userId };
}

export async function GET(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  try {
    const bots = await withCache(`bots:${userId}`, TTL.BOTS, async () => {
      const db = adminDb();
      const res = await db.listDocuments(DB_ID, BOTS_COL, [
        Query.equal("userId", userId!),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return res.documents;
    });
    return NextResponse.json(bots);
  } catch (err) {
    console.error("[Bots GET]:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = BotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, name, description, phoneNumber, status, aiModel, systemPrompt, welcomeMessage } = parsed.data;
    const db = adminDb();

    let doc;
    try {
      const existing = await db.getDocument(DB_ID, BOTS_COL, id);
      if (existing.userId !== userId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      doc = await db.updateDocument(DB_ID, BOTS_COL, id, {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(status !== undefined && { status }),
        ...(aiModel !== undefined && { aiModel }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
      });
    } catch {
      // Document doesn't exist — create with row-level permissions
      doc = await db.createDocument(DB_ID, BOTS_COL, id, {
        userId: userId!,
        name: name || "New AI Bot",
        description: description || "",
        phoneNumber: phoneNumber || "",
        status: status || "inactive",
        aiModel: aiModel || "models/gemini-flash-lite-latest",
        systemPrompt: systemPrompt || "You are a friendly AI chatbot.",
        welcomeMessage: welcomeMessage || "Hello! How can I help you today?",
        isActive: true,
        totalMessages: 0,
        createdAt: new Date().toISOString(),
      }, [
        Permission.read(Role.user(userId!)),
        Permission.update(Role.user(userId!)),
        Permission.delete(Role.user(userId!)),
      ]);
    }

    // Bust cache so next GET reflects the change
    ttlCache.del(`bots:${userId}`);

    const list = await db.listDocuments(DB_ID, BOTS_COL, [
      Query.equal("userId", userId!),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return NextResponse.json({ success: true, bots: list.documents });
  } catch (err) {
    console.error("[Bots POST]:", err);
    return NextResponse.json({ success: false, error: "Failed to save bot." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  try {
    const botId = req.nextUrl.searchParams.get("id");
    if (!botId || botId.length > 100) {
      return NextResponse.json({ success: false, error: "Invalid bot ID." }, { status: 400 });
    }

    const db = adminDb();
    const existing = await db.getDocument(DB_ID, BOTS_COL, botId);
    if (existing.userId !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    await db.deleteDocument(DB_ID, BOTS_COL, botId);

    ttlCache.del(`bots:${userId}`);

    const list = await db.listDocuments(DB_ID, BOTS_COL, [
      Query.equal("userId", userId!),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return NextResponse.json({ success: true, bots: list.documents });
  } catch (err) {
    console.error("[Bots DELETE]:", err);
    return NextResponse.json({ success: false, error: "Failed to delete bot." }, { status: 500 });
  }
}
