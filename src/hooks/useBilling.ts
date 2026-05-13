import { useEffect, useState } from "react";

/**
 * useBilling — hook reutilizable para CUALQUIER proyecto externo del ecosistema.
 *
 * En GafCore, los proyectos consultan a /api/public/billing/check con su API key
 * para saber si el usuario actual tiene un plan activo y qué features puede usar.
 *
 * @example
 * const { plan, active, has, loading } = useBilling(userId, {
 *   endpoint: "https://gafcore.com/api/public/billing/check",
 *   apiKey: import.meta.env.VITE_GAFCORE_API_KEY,
 * });
 */
export interface BillingState {
  loading: boolean;
  error: string | null;
  plan: string;
  active: boolean;
  expiresAt: string | null;
  features: Record<string, boolean>;
  has: (feature: string) => boolean;
  refresh: () => void;
}

export interface UseBillingOptions {
  endpoint?: string;
  apiKey?: string;
}

import { GAFCORE_BILLING_ENDPOINT } from "@/lib/gafcoreBillingClient";

const DEFAULT_ENDPOINT = GAFCORE_BILLING_ENDPOINT;

export function useBilling(
  userId: string | null | undefined,
  options: UseBillingOptions = {}
): BillingState {
  const { endpoint = DEFAULT_ENDPOINT, apiKey } = options;
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<Omit<BillingState, "has" | "refresh">>({
    loading: true,
    error: null,
    plan: "free",
    active: false,
    expiresAt: null,
    features: {},
  });

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setState({ loading: false, error: null, plan: "free", active: false, expiresAt: null, features: {} });
      return;
    }
    (async () => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-api-key": apiKey } : {}),
          },
          body: JSON.stringify({ user_id: userId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ loading: false, error: json.error || "Error", plan: "free", active: false, expiresAt: null, features: {} });
          return;
        }
        setState({
          loading: false,
          error: null,
          plan: json.plan,
          active: json.active,
          expiresAt: json.expires_at,
          features: json.features || {},
        });
      } catch (e: any) {
        if (cancelled) return;
        setState({ loading: false, error: e.message, plan: "free", active: false, expiresAt: null, features: {} });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, endpoint, apiKey, tick]);

  return {
    ...state,
    has: (f) => !!state.features[f],
    refresh: () => setTick((t) => t + 1),
  };
}
