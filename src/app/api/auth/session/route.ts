import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieOptions } from "@/lib/appwrite/auth";

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    if (!secret) {
      return NextResponse.json({ error: "Missing session secret" }, { status: 400 });
    }

    // Set the cookie securely
    (await cookies()).set("appwrite-session", secret, await getCookieOptions());

    console.log("[Auth Session API]: Session cookie set successfully via client-side callback");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Auth Session API Error]:", msg);
    return NextResponse.json({ error: "Failed to set session cookie", details: msg }, { status: 500 });
  }
}
