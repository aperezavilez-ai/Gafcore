import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, X, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const TYPE_COLORS: Record<string, string> = {
  release_approved: "bg-emerald-500/15 text-emerald-300",
  release_rejected: "bg-red-500/15 text-red-300",
  release_live: "bg-cyan-500/15 text-cyan-300",
  release_failed: "bg-red-500/15 text-red-300",
  post_published: "bg-emerald-500/15 text-emerald-300",
  post_failed: "bg-red-500/15 text-red-300",
  commercial_ready: "bg-fuchsia-500/15 text-fuchsia-300",
  commercial_failed: "bg-red-500/15 text-red-300",
};

export function NotificationsBell() {
  const { user } = useAuth();
  const { items, unread, markRead, markAllRead, remove } = useNotifications(user?.id);
  const [open, setOpen] = useState(false);

  const onItemClick = async (n: AppNotification) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/40 text-foreground hover:bg-accent transition-colors"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-fuchsia-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllRead()}>
              <CheckCheck size={14} className="mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No tienes notificaciones todavía.
            </div>
          ) : (
            items.map((n) => {
              const color = TYPE_COLORS[n.type] || "bg-muted text-muted-foreground";
              const body = (
                <div
                  className={`group flex gap-2 px-3 py-2.5 border-b border-border/50 hover:bg-accent/40 transition-colors ${
                    n.read_at ? "opacity-70" : ""
                  }`}
                >
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${n.read_at ? "bg-transparent" : "bg-fuchsia-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${color}`}>
                        {n.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground truncate">{n.title}</div>
                    {n.message && (
                      <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read_at && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead(n.id); }}
                        className="p-1 rounded hover:bg-accent text-muted-foreground"
                        title="Marcar leída"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(n.id); }}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                      title="Eliminar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} to={n.link as any} onClick={() => onItemClick(n)} className="block">
                  {body}
                </Link>
              ) : (
                <div key={n.id} onClick={() => onItemClick(n)} className="cursor-pointer">
                  {body}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
