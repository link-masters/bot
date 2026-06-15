import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/appwrite/auth";

export async function GET(_req: NextRequest) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      // Session is invalid or expired — tell the browser to clear the cookie
      // so the middleware stops redirecting to /dashboard on the next request.
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.cookies.delete("appwrite-session");
      return res;
    }
    return NextResponse.json(user);
  } catch (err) {
    console.error("[/api/auth/me]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
