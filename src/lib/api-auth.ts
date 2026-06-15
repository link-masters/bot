import { NextRequest } from "next/server";
import { Client, Account } from "node-appwrite";

export function hasSession(req: NextRequest): boolean {
  return !!req.cookies.get("appwrite-session")?.value;
}

// Returns the Appwrite user.$id for the current request's session.
// Returns null if the session is missing or invalid.
export async function getRequestUserId(req: NextRequest): Promise<string | null> {
  const secret = req.cookies.get("appwrite-session")?.value;
  if (!secret) return null;
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(secret);
    const user = await new Account(client).get();
    return user.$id;
  } catch {
    return null;
  }
}
