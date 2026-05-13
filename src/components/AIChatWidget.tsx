import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Zap, Brain, Crown, Sparkles, Code2, LayoutTemplate, Coins } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "fast" | "reasoning" | "pro";

const CHAT_URL = "/api/chat";

const MODES: Record<Mode, { label: string; desc: string; icon: typeof Zap }> = {
  fast: { label: "Rápido", desc: "Responde rápidamente", icon: Zap },
  reasoning: { label: "Razonamiento", desc: "Resuelve problemas complejos", icon: Brain },
  pro: { label: "Pro", desc: "Máxima capacidad creativa", icon: Crown },
};

const QUICK_TOOLS = [
  { to: "/gafcore/app" as const, label: "Abrir IDE", icon: Code2, color: "from-[#3a7bff] to-[#6366f1]" },
  { to: "/gafcore" as const, label: "Planes GafCore", icon: Coins, color: "from-[#22d3ee] to-[#3a7bff]" },
  { to: "/gafcore" as const, hash: "producto" as const, label: "Producto", icon: LayoutTemplate, color: "from-[#a04cff] to-[#e040b0]" },
  { to: "/gafcore/register" as const, label: "Crear cuenta", icon: Sparkles, color: "from-[#ff5e3a] to-[#e0376b]" },
];

async function streamChat({
  messages,
  mode,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  mode: Mode;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, mode }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    onError(err.error || "Connection error");
    return;
  }
  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const CHAT_TOGGLE_EVENT = "gafcore:chat-toggle";

export function openAIChat() {
  window.dispatchEvent(new CustomEvent(CHAT_TOGGLE_EVENT, { detail: { open: true } }));
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("fast");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setOpen((prev) => (typeof detail?.open === "boolean" ? detail.open : !prev));
    };
    window.addEventListener(CHAT_TOGGLE_EVENT, handler);
    return () => window.removeEventListener(CHAT_TOGGLE_EVENT, handler);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        mode,
        onDelta: upsert,
        onDone: () => setLoading(false),
        onError: (msg) => {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
      setLoading(false);
    }
  }, [input, loading, messages, mode]);

  const ModeIcon = MODES[mode].icon;
  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Chat panel — abre desde el header (botón "Chat") */}
      {open && (
        <div
          className="fixed bottom-28 left-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden sm:left-auto sm:right-6 sm:w-[400px]"
          style={{ height: "min(560px, calc(100vh - 12rem))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 gradient-primary">
            <Bot size={20} className="text-primary-foreground" />
            <div className="flex-1">
              <p className="text-sm font-bold text-primary-foreground">{t("chat.title")}</p>
              <p className="text-xs text-primary-foreground/70">{t("chat.subtitle")}</p>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center min-h-full py-8 text-center gap-5">
                <div>
                  <p className="text-2xl font-bold text-foreground">Hola</p>
                  <p className="mt-1 text-base text-muted-foreground">¿En qué te ayudo hoy?</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  {QUICK_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={`${tool.to}-${tool.label}`}
                        to={tool.to}
                        {...("hash" in tool && tool.hash ? { hash: tool.hash } : {})}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-background hover:border-primary/50 hover:bg-muted/40 px-3 py-1.5 text-xs font-medium transition"
                      >
                        <Icon size={13} className={`bg-gradient-to-r ${tool.color} bg-clip-text text-transparent`} />
                        {tool.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Bot size={14} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}
                {loading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Bot size={14} />
                    </div>
                    <div className="rounded-xl bg-muted px-3 py-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input + selector de modo */}
          <div className="border-t border-border p-3 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t("chat.placeholder")}
                disabled={loading}
                rows={4}
                className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-h-[110px] max-h-56"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground disabled:opacity-50 transition-opacity"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModeMenu((s) => !s)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs font-medium transition"
                >
                  <ModeIcon size={12} /> {MODES[mode].label}
                </button>
                {showModeMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-border bg-card shadow-2xl z-30 overflow-hidden">
                    {(Object.keys(MODES) as Mode[]).map((k) => {
                      const m = MODES[k];
                      const Icon = m.icon;
                      return (
                        <button
                          key={k}
                          onClick={() => {
                            setMode(k);
                            setShowModeMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 text-left ${
                            mode === k ? "bg-muted/40" : ""
                          }`}
                        >
                          <Icon size={14} className="shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">Enter para enviar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
