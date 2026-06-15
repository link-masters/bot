import { NextRequest, NextResponse } from "next/server";
import { getConfig, getSecrets } from "@/lib/server-store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { hasSession } from "@/lib/api-auth";

const ALLOWED_SUBPATHS = ["/health", "/sessions", "/api/sessions"];

function isAllowedSubpath(subpath: string): boolean {
  return ALLOWED_SUBPATHS.some(
    (p) => subpath === p || subpath.startsWith(p + "/")
  );
}

async function handleProxy(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`openwa:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!hasSession(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subpath = req.nextUrl.pathname.replace(/^\/api\/openwa/, "");

  if (!isAllowedSubpath(subpath)) {
    return NextResponse.json({ error: "Forbidden proxy target." }, { status: 403 });
  }

  const cfg = getConfig();
  const secrets = getSecrets();
  const openwaUrl = cfg.openwaUrl || "http://127.0.0.1:2785";
  const openwaToken = secrets.openwaKey;

  const query = req.nextUrl.search;
  const baseHost = openwaUrl.endsWith("/") ? openwaUrl.slice(0, -1) : openwaUrl;
  const targetUrl = `${baseHost}/api${subpath}${query}`;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (openwaToken) {
    headers.set("Authorization", `Bearer ${openwaToken}`);
    headers.set("X-API-Key", openwaToken);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    let body: string | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const res = await fetch(targetUrl, { 
      method: req.method, 
      headers, 
      body,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": contentType || "text/plain" },
      });
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("[OpenWA Proxy Error]:", error);
    return NextResponse.json({ error: "Failed to connect to OpenWA server." }, { status: 502 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as DELETE, handleProxy as PUT };
