import { NextRequest, NextResponse } from "next/server";

// Appwrite redirects here after OAuth. The actual session secret is exchanged
// client-side in /auth-callback/page.tsx using the browser's Appwrite session.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/auth-callback", request.url));
}
