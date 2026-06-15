import type { NextConfig } from "next";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
// Extract just the origin (e.g. https://sgp.cloud.appwrite.io)
const APPWRITE_ORIGIN = APPWRITE_ENDPOINT
  ? new URL(APPWRITE_ENDPOINT).origin
  : "https://cloud.appwrite.io";

const securityHeaders = [
  // Prevent the app from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the app doesn't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Force HTTPS for 2 years (only meaningful in production)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline/eval for its runtime scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // Allow images from Appwrite (avatars), Google (OAuth photos), and data URIs
      `img-src 'self' data: blob: https: ${APPWRITE_ORIGIN}`,
      "font-src 'self'",
      // API calls: self + Appwrite endpoint + Google APIs (avatar fetch) + websockets
      `connect-src 'self' ${APPWRITE_ORIGIN} https://www.googleapis.com wss: ws:`,
      // No iframes from any origin
      "frame-ancestors 'none'",
      // Only allow form actions to self
      "form-action 'self'",
      // Block mixed content
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
