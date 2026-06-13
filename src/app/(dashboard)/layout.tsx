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
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Code2,
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bots", label: "Bots", icon: Bot },
  { href: "/conversations", label: "Live Chat", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integration", label: "Integrations", icon: Code2 },
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID === "your_project_id" || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        toast.success("Demo Mode: Logged out successfully");
        router.push("/login");
        return;
      }
      await signOut();
      toast.success("Logged out successfully");
      router.push("/login");
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
          "hidden lg:flex flex-col bg-card border-r border-border/50 p-4 justify-between flex-shrink-0 h-full relative z-20 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >


        <div className="space-y-6">
          {/* Logo */}
          <div className={cn("flex items-center h-10 px-2", isCollapsed ? "justify-center" : "justify-start")}>
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isCollapsed && <span className="font-bold text-xl font-serif">BotFlow</span>}
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
                    "flex items-center rounded-lg text-sm font-medium transition-colors text-left",
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary text-primary-foreground glow"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Expand/Collapse & Sign Out */}
        <div className="pt-4 border-t border-border/50 space-y-2 overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full text-muted-foreground hover:text-foreground rounded-lg cursor-pointer",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span className="ml-2">Collapse Sidebar</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
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
        <header className="h-16 border-b border-border/50 bg-card dark:bg-card/50 dark:backdrop-blur-md px-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md hover:bg-accent lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg md:text-xl font-serif text-left">{activeItem.label}</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md relative">
              <Bell className="w-[1.2rem] h-[1.2rem]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </Button>
            <div className="w-px h-6 bg-border/50 mx-1" />
            
            {/* Header Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none rounded-full cursor-pointer transition-transform hover:scale-105">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 text-left p-1.5">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-1.5 border border-border/40">
                  <Avatar className="w-9 h-9 border border-border flex-shrink-0">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">Demo User</span>
                    <span className="text-xs text-muted-foreground truncate">user@botflow.ai</span>
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
