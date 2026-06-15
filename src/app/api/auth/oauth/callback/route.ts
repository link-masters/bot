import { NextRequest, NextResponse } from "next/server";
import { Client, Account, Users, Databases, ID, Query } from "node-appwrite";

const ENDPOINT  = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT   = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY   = process.env.APPWRITE_API_KEY!;
const DB_ID     = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COL = process.env.NEXT_PUBLIC_COLLECTION_USERS!;

function adminClient() {
  const c = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
  return { account: new Account(c), users: new Users(c), databases: new Databases(c) };
}

async function fetchGoogleAvatar(userId: string, users: Users): Promise<string | null> {
  try {
    const res = await users.listIdentities({ queries: [Query.equal("userId", userId)] });
    const google = (res.identities ?? []).find(
      (i: { provider: string; providerAccessToken?: string }) => i.provider === "google"
    );
    if (!google?.providerAccessToken) return null;
    const r = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${google.providerAccessToken}`
    );
    if (!r.ok) return null;
    const p = await r.json() as { picture?: string };
    return p.picture ?? null;
  } catch {
    return null;
  }
}

// Appwrite redirects here after Google OAuth with ?userId=...&secret=...
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const secret = req.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  // ── CRITICAL ─────────────────────────────────────────────────────────────
  // Exchange the one-time token for a real session.
  // If this fails the OAuth flow itself failed — redirect to error.
  let sessionSecret: string;
  try {
    const { account } = adminClient();
    const session = await account.createSession(userId, secret);
    sessionSecret = session.secret;
  } catch (err) {
    console.error("[OAuth Callback] createSession failed:", err);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  // ── BEST EFFORT ───────────────────────────────────────────────────────────
  // Sync avatar + user document. Failures here are non-fatal: getLoggedInUser
  // will create the document on first dashboard load if this is skipped.
  try {
    const { account, users, databases } = adminClient();

    const sessionCl = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT)
      .setSession(sessionSecret);
    const authUser = await new Account(sessionCl).get();

    const avatar = await fetchGoogleAvatar(userId, users);

    const existing = await databases.listDocuments(DB_ID, USERS_COL, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);

    if (existing.documents.length === 0) {
      await databases.createDocument(DB_ID, USERS_COL, ID.unique(), {
        userId,
        name: authUser.name,
        email: authUser.email,
        avatar: avatar ?? null,
        plan: "starter",
        subscriptionStatus: "inactive",
        messageCount: 0,
        messageLimit: 1000,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    } else if (avatar && !existing.documents[0].avatar) {
      await databases.updateDocument(
        DB_ID,
        USERS_COL,
        existing.documents[0].$id,
        { avatar }
      );
    }
  } catch (err) {
    console.error("[OAuth Callback] user doc sync failed (non-critical):", err);
  }

  // ── RESPOND ───────────────────────────────────────────────────────────────
  const isHttps = req.headers.get("x-forwarded-proto") === "https";
  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set("appwrite-session", sessionSecret, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
