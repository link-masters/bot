"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const { account } = await import("@/lib/appwrite/config");
        
        // Get the current session from the Appwrite Client SDK
        const session = await account.getSession("current");
        
        if (!session || !session.secret) {
          throw new Error("No active Appwrite session found.");
        }

        // Post the session secret to our Next.js API to set the HTTP-only cookie
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: session.secret }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to set session cookie on server");
        }

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[AuthCallback Client Error]:", msg);
        setError(msg);
        
        // Redirect back to login after 3 seconds if it fails
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-4">
        {error ? (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-destructive font-serif">Authentication Failed</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground animate-pulse">Redirecting you to login page...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <h2 className="text-lg font-bold font-serif">Completing Sign-In</h2>
            <p className="text-sm text-muted-foreground animate-pulse">Synchronizing secure session with server...</p>
          </div>
        )}
      </div>
    </div>
  );
}
