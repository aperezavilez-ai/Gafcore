import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * GafCore Billing Hub — endpoint público.
 * Cualquier proyecto del ecosistema (GafSuite, GafMusic, GafAds, generados)
 * consulta aquí el estado de suscripción de un usuario usando una API key.
 *
 * GET/POST /api/public/billing/check
 *   Headers: x-api-key: <key>
 *   Body/Query: { user_id: uuid }
 *   Response: { plan, active, expires_at, features, source }
 */

const PRICE_TO_PLAN: Record<string, string> = {
  plan_basico_monthly: "starter",
  plan_pro_monthly: "creator",
  plan_premium_monthly: "pro",
  plan_creador_monthly: "label",
};

const FEATURES: Record<string, Record<string, boolean>> = {
  free: { ai_basic: true, ai_pro: false, distribute: false, label_tools: false, white_label: false, priority_support: false },
  starter: { ai_basic: true, ai_pro: false, distribute: true, label_tools: false, white_label: false, priority_support: false },
  creator: { ai_basic: true, ai_pro: true, distribute: true, label_tools: false, white_label: false, priority_support: false },
  pro: { ai_basic: true, ai_pro: true, distribute: true, label_tools: true, white_label: false, priority_support: true },
  label: { ai_basic: true, ai_pro: true, distribute: true, label_tools: true, white_label: true, priority_support: true },
};

const ACTIVE = ["active", "trialing", "past_due"];
const InputSchema = z.object({ user_id: z.string().uuid() });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
};

async function authenticate(request: Request) {
  const key = request.headers.get("x-api-key") || "";
  if (!key) return null;
  const hash = createHash("sha256").update(key).digest("hex");
  const { data } = await supabaseAdmin
    .from("project_api_keys")
    .select("id,project_name,scopes,is_active")
    .eq("key_hash", hash)
    .maybeSingle();
  if (!data || !data.is_active) return null;
  if (!data.scopes?.includes("billing:read")) return null;
  // marca de uso (best-effort)
  supabaseAdmin
    .from("project_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});
  return data;
}

async function check(userId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("price_id,plan_tier,status,current_period_end,cancel_at_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = Date.now();
  const ends = data?.current_period_end ? new Date(data.current_period_end).getTime() : null;
  const active =
    !!data &&
    ACTIVE.includes(data.status) &&
    (ends === null || ends > now);

  const plan = active
    ? PRICE_TO_PLAN[data!.price_id ?? ""] || data!.plan_tier || "free"
    : "free";

  return {
    plan,
    active,
    expires_at: data?.current_period_end ?? null,
    cancel_at_period_end: data?.cancel_at_period_end ?? false,
    features: FEATURES[plan] ?? FEATURES.free,
    source: "gafcore-billing-hub",
  };
}

async function handle(request: Request, payload: any) {
  const auth = await authenticate(request);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
  const parsed = InputSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
  const result = await check(parsed.data.user_id);
  return new Response(JSON.stringify({ ...result, project: auth.project_name }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/billing/check")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return handle(request, { user_id: url.searchParams.get("user_id") });
      },
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {}
        return handle(request, body);
      },
    },
  },
});
