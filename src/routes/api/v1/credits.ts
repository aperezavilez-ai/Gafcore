// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonOk, requireApiAuth, requireScope } from "./-_auth";
import { enforceRateLimit } from "./-_ratelimit";

export const Route = createFileRoute("/api/v1/credits")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireApiAuth(request);
        if (auth instanceof Response) return auth;
        const denied = requireScope(auth, "read:credits");
        if (denied) return denied;
        const limited = await enforceRateLimit(auth.userId);
        if (limited) return limited;

        const { data } = await supabaseAdmin
          .from("user_credits")
          .select("balance, monthly_allowance, daily_limit, updated_at")
          .eq("user_id", auth.userId)
          .maybeSingle();

        return jsonOk(data ?? { balance: 0, monthly_allowance: 0, daily_limit: 0 });
      },
    },
  },
});
