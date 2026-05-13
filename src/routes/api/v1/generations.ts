// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonOk, jsonError, requireApiAuth, requireScope } from "./-_auth";
import { enforceRateLimit } from "./-_ratelimit";

const QuerySchema = z.object({
  module: z.string().min(1).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const Route = createFileRoute("/api/v1/generations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireApiAuth(request);
        if (auth instanceof Response) return auth;
        const denied = requireScope(auth, "read:generations");
        if (denied) return denied;
        const limited = await enforceRateLimit(auth.userId);
        if (limited) return limited;

        const url = new URL(request.url);
        const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
        if (!parsed.success) {
          return jsonError(400, "invalid_query", parsed.error.issues[0]?.message ?? "Invalid query parameters.");
        }
        const { module, limit, offset } = parsed.data;

        let q = supabaseAdmin
          .from("generations")
          .select("id, module, prompt, result, created_at", { count: "exact" })
          .eq("user_id", auth.userId)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (module) q = q.eq("module", module);

        const { data, count, error } = await q;
        if (error) return jsonError(500, "server_error", error.message);
        return jsonOk({ items: data ?? [], total: count ?? 0, limit, offset });
      },
    },
  },
});
