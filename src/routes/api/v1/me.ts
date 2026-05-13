// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonOk, jsonError, requireApiAuth, requireScope } from "./-_auth";
import { enforceRateLimit } from "./-_ratelimit";

export const Route = createFileRoute("/api/v1/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireApiAuth(request);
        if (auth instanceof Response) return auth;
        const denied = requireScope(auth, "read:profile");
        if (denied) return denied;
        const limited = await enforceRateLimit(auth.userId);
        if (limited) return limited;

        const [{ data: profile }, { data: credits }] = await Promise.all([
          supabaseAdmin.from("profiles").select("user_id, email, first_name, last_name, artist_name, created_at").eq("user_id", auth.userId).maybeSingle(),
          supabaseAdmin.from("user_credits").select("balance, monthly_allowance, daily_limit, updated_at").eq("user_id", auth.userId).maybeSingle(),
        ]);

        if (!profile) return jsonError(404, "not_found", "Profile not found.");

        return jsonOk({
          id: auth.userId,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          artist_name: profile.artist_name,
          created_at: profile.created_at,
          credits: credits ?? null,
          auth: { method: auth.keyId ? "api_key" : "jwt", scopes: auth.scopes },
        });
      },
    },
  },
});
