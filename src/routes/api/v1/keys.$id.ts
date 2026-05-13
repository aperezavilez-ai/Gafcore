// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonOk, jsonError, requireApiAuth } from "./-_auth";

export const Route = createFileRoute("/api/v1/keys/$id")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        const auth = await requireApiAuth(request);
        if (auth instanceof Response) return auth;
        if (auth.keyId) return jsonError(403, "jwt_required", "API key management requires a session token.");

        if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
          return jsonError(400, "invalid_id", "Key id must be a UUID.");
        }

        const { error, count } = await supabaseAdmin
          .from("api_keys")
          .delete({ count: "exact" })
          .eq("id", params.id)
          .eq("user_id", auth.userId);

        if (error) return jsonError(500, "server_error", error.message);
        if (!count) return jsonError(404, "not_found", "API key not found.");
        return jsonOk({ deleted: true, id: params.id });
      },
    },
  },
});
