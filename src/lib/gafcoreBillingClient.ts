/**
 * Cliente de facturación GafCore (planes de creación con IA).
 */

export const GAFCORE_BILLING_ENDPOINT =
  "https://gafcore.com/api/public/billing/check";

/** Features built-in. Se pueden agregar más en runtime con registerTool(). */
export type GafFeature =
  | "ai_basic"
  | "ai_pro"
  | "distribute"
  | "label_tools"
  | "white_label"
  | "priority_support"
  | (string & {}); // permite features dinámicas sin perder autocompletado

/** Definición de una herramienta del ecosistema GafCore. */
export interface GafTool {
  /** ID interno (slug). Ej: "gafcore", "gafvideoclips". */
  id: string;
  /** Nombre visible. */
  name: string;
  /** Ruta en la app GafCore donde vive la herramienta. */
  path: string;
  /** Feature flag que la desbloquea. Si la suscripción no la tiene → bloqueada. */
  requires: GafFeature;
  /** Plan mínimo recomendado (informativo, para upsell). */
  minPlan?: "free" | "starter" | "creator" | "pro" | "label";
  /** Metadata libre (icono, color, descripción, módulo padre, etc.). */
  meta?: Record<string, unknown>;
}

/** Registro vivo de herramientas. Cualquier módulo puede llamar registerTool(). */
const TOOL_REGISTRY = new Map<string, GafTool>();

/** Registra (o actualiza) una herramienta. GafCore la reconocerá automáticamente. */
export function registerTool(tool: GafTool): void {
  TOOL_REGISTRY.set(tool.id, tool);
}

/** Registra varias en una sola llamada. */
export function registerTools(tools: GafTool[]): void {
  tools.forEach(registerTool);
}

/** Devuelve todas las herramientas registradas. */
export function listTools(): GafTool[] {
  return Array.from(TOOL_REGISTRY.values());
}

/** Devuelve sólo las herramientas que el usuario puede usar según su plan. */
export function listAllowedTools(status: BillingStatus): GafTool[] {
  return listTools().filter((t) => status.has(t.requires as GafFeature));
}

// Herramienta principal expuesta en la app GafCore.
registerTools([
  { id: "gafcore", name: "GafCore IDE", path: "/gafcore/app", requires: "ai_basic", minPlan: "free" },
]);


export interface BillingStatus {
  plan: string;
  active: boolean;
  expires_at: string | null;
  cancel_at_period_end: boolean;
  features: Partial<Record<GafFeature, boolean>>;
  source: string;
  project?: string;
  has: (feature: GafFeature) => boolean;
}

export interface BillingClientOptions {
  /** Endpoint completo. Por defecto el dominio de producción. */
  endpoint?: string;
  /** API key emitida desde el panel de administración → API Keys (gck_live_*). */
  apiKey?: string;
  /** Cache TTL en ms (default 60_000). 0 = sin cache. */
  cacheTtlMs?: number;
}

interface CacheEntry {
  expiresAt: number;
  value: BillingStatus;
}

const FREE_FALLBACK: Omit<BillingStatus, "has"> = {
  plan: "free",
  active: false,
  expires_at: null,
  cancel_at_period_end: false,
  features: { ai_basic: true },
  source: "fallback",
};

function withHas(s: Omit<BillingStatus, "has">): BillingStatus {
  return { ...s, has: (f) => !!s.features[f] };
}

export class GafcoreBillingClient {
  private endpoint: string;
  private apiKey?: string;
  private cacheTtl: number;
  private cache = new Map<string, CacheEntry>();

  constructor(opts: BillingClientOptions = {}) {
    this.endpoint = opts.endpoint || GAFCORE_BILLING_ENDPOINT;
    this.apiKey =
      opts.apiKey ||
      (typeof import.meta !== "undefined"
        ? (import.meta as any).env?.VITE_GAFCORE_API_KEY
        : undefined);
    this.cacheTtl = opts.cacheTtlMs ?? 60_000;
  }

  /** Limpia el cache (útil tras un upgrade/downgrade). */
  invalidate(userId?: string) {
    if (userId) this.cache.delete(userId);
    else this.cache.clear();
  }

  async check(userId: string): Promise<BillingStatus> {
    if (!userId) return withHas(FREE_FALLBACK);

    const now = Date.now();
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > now) return cached.value;

    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
        },
        body: JSON.stringify({ user_id: userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        const fb = withHas({ ...FREE_FALLBACK, source: `error:${json.error || res.status}` });
        return fb;
      }
      const value = withHas({
        plan: json.plan ?? "free",
        active: !!json.active,
        expires_at: json.expires_at ?? null,
        cancel_at_period_end: !!json.cancel_at_period_end,
        features: json.features ?? {},
        source: json.source ?? "gafcore-billing-hub",
        project: json.project,
      });
      if (this.cacheTtl > 0) {
        this.cache.set(userId, { expiresAt: now + this.cacheTtl, value });
      }
      return value;
    } catch (e: any) {
      return withHas({ ...FREE_FALLBACK, source: `network:${e?.message || "error"}` });
    }
  }
}

/** Singleton listo para importar en cualquier módulo de la Suite. */
export const gafcoreBillingClient = new GafcoreBillingClient();
