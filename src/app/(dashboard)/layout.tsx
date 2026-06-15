"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { signOut } from "@/lib/appwrite/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/bots", label: "Bots", icon: Bot },
  { href: "/playground", label: "Playground", icon: FlaskConical },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (r.status === 401) {
        // Stale or expired session — the API already cleared the cookie
        window.location.replace("/login");
        return;
      }
      if (r.ok) {
        const data = await r.json();
        setUser(data);
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.replace("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeItem = menuItems.find((item) => pathname === item.href) || menuItems[0];

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      {/* Sidebar for Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card/95 dark:bg-card/80 backdrop-blur-md border-r border-border/40 p-4 justify-between flex-shrink-0 h-full relative z-20 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >


        <div className="space-y-6">
          {/* Logo */}
          <div className={cn("flex items-center h-10 px-2", isCollapsed ? "justify-center" : "justify-start")}>
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm group-hover:shadow-[0_0_12px_rgba(var(--primary),0.2)]">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isCollapsed && <span className="font-bold text-xl font-serif tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">BotFlow</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-all duration-200 text-left group cursor-pointer",
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_4px_12px_hsl(var(--primary)/0.25)] dark:shadow-[0_4px_12px_hsl(var(--primary)/0.4)] translate-x-0.5"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:translate-x-0.5"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                    !active && "group-hover:scale-110 group-active:scale-95"
                  )} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Expand/Collapse & Sign Out */}
        <div className="pt-4 border-t border-border/40 space-y-2 overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-all duration-200 group",
              isCollapsed ? "justify-center px-0" : "justify-start hover:translate-x-0.5"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span className="ml-2">Collapse Sidebar</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-all duration-200 group",
              isCollapsed ? "justify-center px-0" : "justify-start hover:translate-x-0.5"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Sidebar for Mobile */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        {/* Drawer */}
        <aside className="fixed top-0 bottom-0 left-0 w-64 bg-card border-r border-border p-6 flex flex-col justify-between z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl font-serif">BotFlow</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      active
                        ? "bg-primary text-primary-foreground glow"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/40 bg-card/80 dark:bg-card/45 backdrop-blur-md px-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md hover:bg-accent/60 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg md:text-xl font-serif text-left tracking-tight">{activeItem.label}</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-px h-6 bg-border/40 mx-1" />
            
            {/* Header Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none rounded-full cursor-pointer transition-transform hover:scale-105">
                  <Avatar className="w-8 h-8 border border-border">
                    {user?.avatar && <AvatarImage src={user.avatar} />}
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 text-left p-1.5">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-1.5 border border-border/40">
                  <Avatar className="w-9 h-9 border border-border flex-shrink-0">
                    {user?.avatar && <AvatarImage src={user.avatar} />}
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">{user?.name ?? "—"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email ?? "—"}</span>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer flex items-center gap-2 py-2 px-2.5 rounded-md">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer flex items-center gap-2 py-2 px-2.5 rounded-md">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span>Billing & Plans</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer hover:bg-destructive/10 flex items-center gap-2 py-2 px-2.5 rounded-md">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
