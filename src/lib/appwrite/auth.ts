"use server";

import { cache as reactCache } from "react";
import { Client, Account, Databases, ID, Query, Permission, Role } from "node-appwrite";
import { cookies, headers } from "next/headers";
import { cache as ttlCache, TTL } from "@/lib/cache";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY  = process.env.APPWRITE_API_KEY!;
const DB_ID    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COL = process.env.NEXT_PUBLIC_COLLECTION_USERS!;

export async function getCookieOptions() {
  const proto = (await headers()).get("x-forwarded-proto") || "http";
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: proto === "https",
    maxAge: 60 * 60 * 24 * 30,
  };
}

function createAdminClient() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT)
    .setKey(API_KEY);
  return { account: new Account(client), databases: new Databases(client) };
}

function createSessionClient(secret: string) {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT)
    .setSession(secret);
  return { account: new Account(client) };
}

async function ensureUserDoc(
  userId: string,
  name: string,
  email: string,
  avatar?: string
) {
  const { databases } = createAdminClient();
  const res = await databases.listDocuments(DB_ID, USERS_COL, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  if (res.documents.length > 0) {
    // Update avatar if we newly have one and it's not stored yet
    const doc = res.documents[0];
    if (avatar && !doc.avatar) {
      await databases.updateDocument(DB_ID, USERS_COL, doc.$id, { avatar });
      return { ...doc, avatar };
    }
    return doc;
  }
  // Row-level security: only the owning user can read/update their profile
  const docPerms = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
  ];
  return databases.createDocument(DB_ID, USERS_COL, ID.unique(), {
    userId,
    name,
    email,
    avatar: avatar || null,
    plan: "starter",
    subscriptionStatus: "inactive",
    messageCount: 0,
    messageLimit: 1000,
    isActive: true,
    createdAt: new Date().toISOString(),
  }, docPerms);
}

export async function signUp(data: { name: string; email: string; password: string }) {
  const { account } = createAdminClient();
  await account.create(ID.unique(), data.email, data.password, data.name);
  return signIn({ email: data.email, password: data.password });
}

export async function signIn(data: { email: string; password: string }) {
  const { account } = createAdminClient();
  const session = await account.createEmailPasswordSession(data.email, data.password);
  (await cookies()).set("appwrite-session", session.secret, await getCookieOptions());
  return { success: true };
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");
  if (sessionCookie?.value) {
    try {
      const { account } = createSessionClient(sessionCookie.value);
      await account.deleteSession("current");
    } catch {
      // Session already expired — still clear the cookie
    }
  }
  const secret = sessionCookie?.value;
  if (secret) ttlCache.del(`user:${secret.slice(-16)}`);
  cookieStore.delete("appwrite-session");
  // Do NOT call redirect() here — it throws NEXT_REDIRECT which the client
  // catches as an error. Navigation is handled by the caller instead.
}

// Internal implementation — not exported directly
async function _getLoggedInUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("appwrite-session");
  if (!sessionCookie?.value) return null;

  const sessionSecret = sessionCookie.value;

  // Short-circuit with cached value (avoids hitting Appwrite on every component)
  const cacheKey = `user:${sessionSecret.slice(-16)}`; // last 16 chars as key
  const cached = ttlCache.get(cacheKey);
  if (cached !== null) return cached;

  // Validate the session with Appwrite
  let authUser: { $id: string; name: string; email: string; $createdAt: string };
  try {
    const { account } = createSessionClient(sessionSecret);
    authUser = await account.get();
  } catch (err) {
    const code = (err as { code?: number }).code;
    const isAuthFailure = code === 401 || code === 403;
    if (isAuthFailure) {
      // Session is genuinely expired or revoked — remove the stale cookie
      console.error("[getLoggedInUser] Session expired/revoked:", code);
      cookieStore.delete("appwrite-session");
    } else {
      // Transient error (network timeout, DNS, Appwrite outage) — keep the
      // cookie so the user isn't logged out on the next request
      console.warn("[getLoggedInUser] Transient Appwrite error, keeping session:", (err as Error).message);
    }
    return null;
  }

  // Fetch or lazily create the DB user document
  let result: unknown;
  try {
    result = await ensureUserDoc(authUser.$id, authUser.name, authUser.email);
  } catch (err) {
    console.error("[getLoggedInUser] DB error (fallback to auth data):", err);
    result = {
      $id: authUser.$id,
      userId: authUser.$id,
      name: authUser.name,
      email: authUser.email,
      avatar: null,
      plan: "starter",
      subscriptionStatus: "inactive",
      messageCount: 0,
      messageLimit: 1000,
      isActive: true,
      createdAt: authUser.$createdAt,
    };
  }

  ttlCache.set(cacheKey, result, TTL.USER);
  return result;
}

// React cache() deduplicates multiple calls within the same server request
export const getLoggedInUser = reactCache(_getLoggedInUser);

export async function forgotPassword(email: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { account } = createAdminClient();
  await account.createRecovery(email, `${appUrl}/reset-password`);
  return { success: true };
}

export async function resetPassword(userId: string, secret: string, password: string) {
  const { account } = createAdminClient();
  await account.updateRecovery(userId, secret, password);
  return { success: true };
}
