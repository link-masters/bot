import { NextRequest, NextResponse } from "next/server";

async function handleProxy(req: NextRequest) {
  const openwaUrl = req.headers.get("x-openwa-url") || "http://127.0.0.1:2886";
  
  // Extract the target subpath
  const subpath = req.nextUrl.pathname.replace(/^\/api\/openwa/, "");
  const query = req.nextUrl.search;
  
  // Ensure the target URL matches the OpenWA API path prefix (/api)
  const baseHost = openwaUrl.endsWith("/") ? openwaUrl.slice(0, -1) : openwaUrl;
  const targetUrl = `${baseHost}/api${subpath}${query}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Avoid forwarding host or specific client headers that cause proxy issues
    const k = key.toLowerCase();
    if (!["host", "connection", "x-openwa-url", "content-length"].includes(k)) {
      headers.set(key, value);
    }
  });

  // Automatically map Authorization Bearer token to X-API-Key for OpenWA compatibility
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token) {
      headers.set("X-API-Key", token);
    }
  } else if (authHeader) {
    headers.set("X-API-Key", authHeader);
  }

  try {
    let body: string | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    const contentType = res.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": contentType || "text/plain" }
      });
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[OpenWA Proxy Error]:", error);
    return NextResponse.json(
      { error: "Failed to connect to OpenWA server. Please verify your host URL in settings.", details: errMsg },
      { status: 502 }
    );
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as DELETE, handleProxy as PUT };
