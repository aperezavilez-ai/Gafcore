import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";

function isGafcoreSubscriptionPeriodActive(row: {
  status: string;
  current_period_end: string | null;
} | null): boolean {
  if (!row) return false;
  const end = row.current_period_end ? new Date(row.current_period_end) : null;
  return !!(
    (["active", "trialing", "past_due"].includes(row.status) && (!end || end > new Date())) ||
    (row.status === "canceled" && end && end > new Date())
  );
}

const inputSchema = z.object({
  accountType: z.enum(["user", "demo", "admin"]),
  adminCode: z.string().optional(),
});

export const assignGafcoreAccountType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    // Identity is derived from the verified session — never from the client.
    const userId = context.userId as string;
    if (!userId) throw new Error("No autenticado");

    const { accountType, adminCode } = data;

    if (accountType === "admin") {
      // Only an existing admin can grant admin (defense in depth on top of the code).
      const { data: existing } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      const expected = process.env.GAFCORE_ADMIN_CODE;
      const codeOk = !!expected && !!adminCode && adminCode === expected;
      if (!existing && !codeOk) {
        throw new Error("Código de administrador inválido");
      }
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
      await supabaseAdmin.rpc("add_credits", {
        p_user_id: userId,
        p_amount: 10000,
        p_reason: "admin_grant",
        p_metadata: {},
      });
      return { ok: true, role: "admin" as const };
    }

    if (accountType === "demo") {
      await supabaseAdmin
        .from("profiles")
        .update({ onboarding_data: { demo: true } })
        .eq("user_id", userId);
      await supabaseAdmin.rpc("add_credits", {
        p_user_id: userId,
        p_amount: 50,
        p_reason: "demo_grant",
        p_metadata: {},
      });
      return { ok: true, role: "demo" as const };
    }

    /** Usuario normal: reparar monthly_allowance en 0 (p. ej. plan Creador vía Stripe); bienvenida si saldo 0 sin movimientos. */
    if (accountType === "user") {
      const { data: creditRow, error: creditErr } = await supabaseAdmin
        .from("user_credits")
        .select("balance, monthly_allowance, daily_limit")
        .eq("user_id", userId)
        .maybeSingle();
      if (creditErr) throw new Error(creditErr.message);

      const monthly = creditRow?.monthly_allowance ?? 0;
      if (creditRow && monthly === 0) {
        const env = getStripeEnvironment();
        const { data: sub, error: subErr } = await supabaseAdmin
          .from("subscriptions")
          .select("status, current_period_end, price_id, plan_tier")
          .eq("user_id", userId)
          .eq("environment", env)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (subErr) throw new Error(subErr.message);

        const subOk = isGafcoreSubscriptionPeriodActive(sub);
        const isCreadorFairUse =
          subOk &&
          (sub?.price_id === "plan_creador_monthly" ||
            String(sub?.plan_tier ?? "").toLowerCase() === "creador");

        const patch = isCreadorFairUse
          ? { monthly_allowance: 1000, daily_limit: 1000 }
          : { monthly_allowance: 10, daily_limit: 10 };

        const { error: repairErr } = await supabaseAdmin.from("user_credits").update(patch).eq("user_id", userId);
        if (repairErr) throw new Error(repairErr.message);
      }

      const { data: balRow } = await supabaseAdmin
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      const bal = balRow?.balance ?? 0;
      if (bal === 0) {
        const { count, error: countErr } = await supabaseAdmin
          .from("credit_transactions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if (countErr) throw new Error(countErr.message);
        if (!count) {
          const { error: rpcErr } = await supabaseAdmin.rpc("add_credits", {
            p_user_id: userId,
            p_amount: 10,
            p_reason: "welcome_grant",
            p_metadata: {},
          });
          if (rpcErr) throw new Error(rpcErr.message);
        }
      }
    }

    return { ok: true, role: "user" as const };
  });
