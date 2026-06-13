"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  Clock,
  Circle,
  Pause,
  Play,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { callGeminiAPI } from "@/lib/gemini";

interface ChatSession {
  id: string;
  name: string;
  number: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  botName: string;
  botActive: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  time: string;
  delivered: boolean;
}

const initialSessions: ChatSession[] = [
  {
    id: "1",
    name: "Alex Rivera",
    number: "+1 (555) 012-3928",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    lastMessage: "Do you offer custom pricing for multiple numbers?",
    time: "2m ago",
    unread: true,
    botName: "Sales Assistant",
    botActive: true,
  },
  {
    id: "2",
    name: "Marcus Vance",
    number: "+44 20 7946 0958",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    lastMessage: "I need support with my n8n node configuration.",
    time: "15m ago",
    unread: false,
    botName: "Support Bot",
    botActive: true,
  },
  {
    id: "3",
    name: "Priya Sharma",
    number: "+91 98765 43210",
    lastMessage: "Thanks, the demo video was very helpful!",
    time: "1h ago",
    unread: false,
    botName: "Lead Generator",
    botActive: false,
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  "1": [
    { id: "1", sender: "user", content: "Hi, I am interested in your BotFlow plans.", time: "10:30 AM", delivered: true },
    { id: "2", sender: "assistant", content: "Hello! Welcome to BotFlow. We have Starter ($29), Growth ($79), and Business ($199) plans. Which matches your team size?", time: "10:31 AM", delivered: true },
    { id: "3", sender: "user", content: "We are an agency managing 12 clients.", time: "10:32 AM", delivered: true },
    { id: "4", sender: "assistant", content: "Great! For agencies, we recommend our Business plan which features unlimited bots, phone numbers, and full white-label capabilities.", time: "10:33 AM", delivered: true },
    { id: "5", sender: "user", content: "Do you offer custom pricing for multiple numbers?", time: "10:34 AM", delivered: true },
  ],
  "2": [
    { id: "1", sender: "user", content: "Hey, my n8n webhook isn't receiving messages.", time: "09:15 AM", delivered: true },
    { id: "2", sender: "assistant", content: "Hi Marcus! Make sure you copied the webhook URL from your active n8n trigger and added it to the webhook input in your BotFlow Settings.", time: "09:16 AM", delivered: true },
    { id: "3", sender: "user", content: "Ah! I had the test URL instead of production.", time: "09:18 AM", delivered: true },
    { id: "4", sender: "assistant", content: "Yes! Next.js production builds route messages only to active production workflows. Let me know if updating it works.", time: "09:19 AM", delivered: true },
    { id: "5", sender: "user", content: "I need support with my n8n node configuration.", time: "09:20 AM", delivered: true },
  ],
  "3": [
    { id: "1", sender: "user", content: "Is there a demo of the Gemini prompt settings?", time: "Yesterday", delivered: true },
    { id: "2", sender: "assistant", content: "Sure! Let me send you a video walk-through demonstrating system prompt rules.", time: "Yesterday", delivered: true },
    { id: "3", sender: "user", content: "Thanks, the demo video was very helpful!", time: "Yesterday", delivered: true },
  ],
};

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>("1");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(initialMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeChatMessages = messages[activeSessionId] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: String(activeChatMessages.length + 1),
      sender: "assistant", // manual override sent by agent console
      content: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      delivered: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), newMsg],
    }));

    // Update last message in session list
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, lastMessage: inputText, time: "Just now", unread: false }
          : s
      )
    );

    setInputText("");
    toast.success("Message sent successfully!");

    // Simulate a customer reply after 4 seconds if bot is active!
    if (activeSession.botActive) {
      setTimeout(() => {
        const customerMsgText = "Thanks for the manual reply! Can you explain how the AI bot configuration prompt works?";
        const customerMsg: ChatMessage = {
          id: String(Date.now()),
          sender: "user", // simulating client reply
          content: customerMsgText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          delivered: true,
        };

        setMessages((prev) => {
          const currentList = prev[activeSessionId] || [];
          const newList = [...currentList, customerMsg];

          // Simulate AI Bot thinking and responding to the client's message!
          setTimeout(async () => {
            const apiKey = localStorage.getItem("botflow_gemini_key");
            const hasRealKey = apiKey && apiKey !== "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx" && apiKey.startsWith("AIzaSy");

            let botReplyText = "";
            if (hasRealKey) {
              try {
                const botModel = "models/gemini-flash-lite-latest";
                const systemPrompt = activeSession.botName === "Sales Assistant"
                  ? "You are a sales assistant for BotFlow. You reply to customer questions about BotFlow plans ($29 Starter, $79 Growth, $199 Business) in a friendly and professional manner."
                  : "You are a customer support agent. Answer questions about WhatsApp APIs, webhooks, and integrations concisely.";

                const history = newList.map(m => ({
                  sender: m.sender,
                  content: m.content
                }));

                botReplyText = await callGeminiAPI(apiKey, botModel, systemPrompt, customerMsgText, history);
              } catch {
                botReplyText = `[Active AI Bot: ${activeSession.botName}] Hello! I am the automated agent. Real-time Gemini API failed. Please verify your credentials in Settings.`;
              }
            } else {
              botReplyText = `[Demo Bot Mode] Hi! As the automated "${activeSession.botName}" instance, I have received your message: "${customerMsgText}". \n\n*Configure your Gemini API Key in Settings to get real-time AI responses.*`;
            }

            const aiReply: ChatMessage = {
              id: String(Date.now() + 1),
              sender: "assistant", // bot reply
              content: botReplyText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              delivered: true,
            };

            setMessages((prevInner) => ({
              ...prevInner,
              [activeSessionId]: [...(prevInner[activeSessionId] || []), aiReply],
            }));

            setSessions((prevSessions) =>
              prevSessions.map((s) =>
                s.id === activeSessionId
                  ? { ...s, lastMessage: botReplyText, time: "Just now", unread: false }
                  : s
              )
            );
          }, 1500);

          return {
            ...prev,
            [activeSessionId]: newList,
          };
        });

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, lastMessage: customerMsgText, time: "Just now", unread: true }
              : s
          )
        );
      }, 4000);
    }
  };

  const handleToggleBot = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, botActive: !s.botActive } : s
      )
    );
    toast.success(`AI Bot response ${activeSession.botActive ? "paused" : "resumed"} for this chat!`);
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSessionId]);

  return (
    <div className="h-[calc(100vh-8.5rem)] flex border border-border/50 rounded-2xl overflow-hidden bg-card dark:bg-card/40 dark:backdrop-blur-sm">
      {/* Sessions list */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-card dark:bg-card/60">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-bold text-base font-serif text-left">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/20">
          {sessions.map((s) => {
            const active = s.id === activeSessionId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  // Mark as read
                  setSessions((prev) =>
                    prev.map((session) =>
                      session.id === s.id ? { ...session, unread: false } : session
                    )
                  );
                }}
                className={cn(
                  "w-full p-4 flex gap-3 text-left transition-colors",
                  active ? "bg-accent/80" : "hover:bg-accent/40"
                )}
              >
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={s.avatar} alt={s.name} />
                  <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground">{s.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
                    {s.lastMessage}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-primary/80 font-medium flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {s.botName}
                    </span>
                    {s.unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex-1 flex flex-col justify-between bg-background/20">
        {/* Chat Header */}
        <div className="px-6 h-16 border-b border-border/50 flex items-center justify-between bg-card/40">
          <div className="flex items-center gap-3 text-left">
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage src={activeSession.avatar} />
              <AvatarFallback>{activeSession.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{activeSession.name}</span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-muted">
                  {activeSession.number}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Circle className="w-2 h-2 text-green-500 fill-green-500" />
                Active bot: {activeSession.botName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleBot}
              className={cn(
                "text-xs py-5 px-3.5",
                activeSession.botActive ? "hover:text-amber-500" : "hover:text-green-500"
              )}
            >
              {activeSession.botActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Pause AI
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Resume AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Messages threads */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeChatMessages.map((m) => {
            const isMe = m.sender === "assistant";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex max-w-[70%] flex-col",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3.5 rounded-2xl text-sm leading-relaxed text-left shadow-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border/50 text-foreground rounded-tl-none"
                  )}
                >
                  {m.content}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{m.time}</span>
                  {isMe && (
                    <CheckCheck className="w-3 h-3 text-primary" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-border/50 bg-card/40 flex items-center gap-3">
          <Input
            placeholder="Type a manual response... (This will temporarily override the bot)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 py-6 border-border/50"
          />
          <Button type="submit" size="icon" className="w-12 h-12 rounded-xl glow flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
