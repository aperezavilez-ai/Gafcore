import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreditsOutModal } from "@/components/CreditsOutModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/credits")({
  component: CreditsRoute,
});

function CreditsRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/gafcore/app?credits=success`
      : "/gafcore/app?credits=success";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/gafcore/app">Volver al IDE</Link>
        </Button>
        <span className="text-sm font-medium">Paquetes de créditos</span>
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        <CreditsOutModal
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) void navigate({ to: "/gafcore/app" });
          }}
          userId={user?.id}
          userEmail={user?.email ?? undefined}
          reason="buy"
          returnUrl={returnUrl}
        />
      </div>
    </div>
  );
}
