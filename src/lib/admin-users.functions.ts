import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getUserStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Verify caller is admin
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      throw new Error("forbidden");
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Exclude admins (and any cuenta interna/de prueba marcada como admin) del conteo.
    const { data: adminRows } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminIds = new Set((adminRows ?? []).map((r: { user_id: string }) => r.user_id));

    const [profilesRes, paidRows, activeRows] = await Promise.all([
      supabaseAdmin.from("profiles").select("user_id, email"),
      supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .in("status", ["active", "trialing", "past_due"]),
      supabaseAdmin
        .from("credit_transactions")
        .select("user_id")
        .gte("created_at", since24h),
    ]);

    // Solo cuentan usuarios reales: existen en profiles, no son admin,
    // y tienen email válido (descarta cuentas demo/test sin email o con
    // dominios de prueba como demo@, test@, +test@, ejemplo@, etc.)
    const TEST_EMAIL_RE = /(^|[+.@])(demo|test|qa|prueba|ejemplo|example)\b|@(example|test|mailinator|tempmail)\./i;
    const realProfileIds = new Set(
      (profilesRes.data ?? [])
        .filter((r: { user_id: string; email: string | null }) =>
          r.user_id &&
          !adminIds.has(r.user_id) &&
          r.email &&
          !TEST_EMAIL_RE.test(r.email),
        )
        .map((r: { user_id: string }) => r.user_id),
    );

    const realUserFilter = (id: string) => realProfileIds.has(id);

    const registered = realProfileIds.size;

    const paidSet = new Set(
      (paidRows.data ?? [])
        .map((r: { user_id: string }) => r.user_id)
        .filter(realUserFilter),
    );
    const activeSet = new Set(
      (activeRows.data ?? [])
        .map((r: { user_id: string }) => r.user_id)
        .filter(realUserFilter),
    );

    return {
      registered,
      paid: paidSet.size,
      active: activeSet.size,
    };
  });
