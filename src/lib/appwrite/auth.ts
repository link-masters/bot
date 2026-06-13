// lib/appwrite/auth.ts
"use server";

import { createAdminClient, createSessionClient } from "./server";
import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(data: {
  name: string;
  email: string;
  password: string;
}) {
  const { account, databases } = createAdminClient();

  try {
    // Create account
    const user = await account.create(
      ID.unique(),
      data.email,
      data.password,
      data.name
    );

    // Create session
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );

    // Set cookie
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Create user document
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      "users",
      ID.unique(),
      {
        userId: user.$id,
        name: data.name,
        email: data.email,
        plan: "starter",
        subscriptionStatus: "trialing",
        messageCount: 0,
        messageLimit: 1000,
        isActive: true,
        trialEndsAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
      }
    );

    return { success: true, userId: user.$id };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export async function signIn(data: { email: string; password: string }) {
  const { account } = createAdminClient();

  try {
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return { success: true };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export async function signOut() {
  const sessionCookie = (await cookies()).get("appwrite-session");
  if (!sessionCookie) return;

  const { account } = createSessionClient(sessionCookie.value);

  try {
    await account.deleteSession("current");
  } catch {}

  (await cookies()).delete("appwrite-session");
  redirect("/login");
}

export async function getLoggedInUser() {
  const sessionCookie = (await cookies()).get("appwrite-session");
  if (!sessionCookie) return null;

  try {
    const { account, databases } = createSessionClient(sessionCookie.value);
    const authUser = await account.get();

    const userDocs = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      "users",
      [Query.equal("userId", authUser.$id)]
    );

    if (userDocs.documents.length === 0) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return userDocs.documents[0] as any;
  } catch {
    return null;
  }
}

export async function forgotPassword(email: string) {
  const { account } = createAdminClient();

  try {
    await account.createRecovery(
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    );
    return { success: true };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export async function resetPassword(
  userId: string,
  secret: string,
  password: string
) {
  const { account } = createAdminClient();

  try {
    await account.updateRecovery(userId, secret, password);
    return { success: true };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
