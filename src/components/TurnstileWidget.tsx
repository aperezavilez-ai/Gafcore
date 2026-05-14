import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile_script"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function isTurnstileSiteKeyConfigured(): boolean {
  try {
    return Boolean(String(import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "").trim());
  } catch {
    return false;
  }
}

/**
 * Widget Turnstile (registro). Requiere `VITE_TURNSTILE_SITE_KEY` en el host.
 */
export function TurnstileWidget({
  onToken,
  theme = "auto",
}: {
  onToken: (token: string | null) => void;
  theme?: "light" | "dark" | "auto";
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const cbRef = useRef(onToken);
  cbRef.current = onToken;

  const siteKey = String(import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "").trim();

  useEffect(() => {
    if (!siteKey || !hostRef.current) return;

    let cancelled = false;

    void (async () => {
      try {
        await loadTurnstileScript();
        if (cancelled || !hostRef.current || !window.turnstile) return;
        const id = window.turnstile.render(hostRef.current, {
          sitekey: siteKey,
          theme,
          callback: (t) => cbRef.current(t),
          "expired-callback": () => cbRef.current(null),
          "error-callback": () => cbRef.current(null),
        });
        widgetIdRef.current = id;
      } catch {
        cbRef.current(null);
      }
    })();

    return () => {
      cancelled = true;
      const wid = widgetIdRef.current;
      widgetIdRef.current = null;
      if (wid && window.turnstile?.remove) {
        try {
          window.turnstile.remove(wid);
        } catch {
          /* */
        }
      }
    };
  }, [siteKey, theme]);

  if (!siteKey) return null;

  return (
    <div
      ref={hostRef}
      className="flex min-h-[65px] w-full max-w-[300px] items-center justify-center"
      aria-label="Verificación humana"
    />
  );
}
