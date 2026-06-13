import type { Metadata } from "next";
import { Lora, Varela_Round } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const varela = Varela_Round({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BotFlow - WhatsApp AI Automation",
    template: "%s | BotFlow",
  },
  description:
    "Build powerful WhatsApp AI bots without coding. Automate customer support, sales, and engagement with AI-powered conversations.",
  keywords: [
    "WhatsApp bot",
    "AI chatbot",
    "WhatsApp automation",
    "customer support",
    "n8n",
    "Gemini AI",
  ],
  authors: [{ name: "BotFlow Team" }],
  creator: "BotFlow",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    title: "BotFlow - WhatsApp AI Automation",
    description: "Build powerful WhatsApp AI bots without coding",
    siteName: "BotFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "BotFlow - WhatsApp AI Automation",
    description: "Build powerful WhatsApp AI bots without coding",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${varela.variable} ${lora.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
