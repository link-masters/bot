import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Only accept calls from internal services using shared secret
    const syncSecret = process.env.INTERNAL_SYNC_SECRET;
    if (syncSecret) {
      const incoming = req.headers.get("x-internal-secret");
      if (incoming !== syncSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await req.json();
    console.log("[Chat Sync] session=%s ts=%s", payload.sessionId, payload.timestamp);

    return NextResponse.json({
      success: true,
      status: "synced",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("[Chat Sync Error]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
