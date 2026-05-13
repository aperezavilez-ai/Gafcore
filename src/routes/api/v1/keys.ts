// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonOk, jsonError, requireApiAuth, sha256Hex } from "./-_auth";
import { enforceRateLimit } from "./-_ratelimit";

const ALLOWED_SCOPES = [
  "read:profile",
  "read:credits",
  "read:releases",
  "read:analytics",
  "read:generations",
  "write:ai",
] as const;

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  scopes: z.array(z.enum(ALLOWED_SCOPES)).min(1).max(ALLOWED_SCOPES.length).default(["read:profile"]),
  expires_in_days: z.number().int().min(1).max(365).optional(),
});

function randomSecret(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/v1/keys")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireApiAuth(request);
        if (auth instanceof Response) return auth;
        // Solo JWT puede gestionar claves
        if (auth.keyId) return jsonError(403, "jwt_required", "API key management requires a session token.");
        const limited = await enforceRateLimit(auth.userId);
        if (limited) return limited;

        const { data, error } = await supabaseAdmin
          .from("api_keys")
          .select("id, name, key_prefix, scopes, last_used_at, expires_at, revoked_at, created_at")
          .eq("user_id", auth.userId)
          .order("created_at", { ascending: false });

        if (error) return jsonError(500, "server_error", error.message);
        return jsonOk({ items: data ?? [] });
      },
      POST: async ({ request }) => {
        const auth = await requireApiAuth(request);
        if (auth instanceof Response) return auth;
        if (auth.keyId) return jsonError(403, "jwt_required", "API key management requires a session token.");
        const limited = await enforceRateLimit(auth.userId);
        if (limited) return limited;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "invalid_json", "Body must be valid JSON.");
        }
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) {
          return jsonError(400, "invalid_body", parsed.error.issues[0]?.message ?? "Invalid body.");
        }
        const { name, scopes, expires_in_days } = parsed.data;

        const env = "live"; // futuro: distinguir test/live
        const secret = randomSecret(32);
        const fullKey = `gck_${env}_${secret}`;
        const key_prefix = `gck_${env}_${secret.slice(0, 8)}`;
        const key_hash = await sha256Hex(fullKey);

        const expires_at = expires_in_days
          ? new Date(Date.now() + expires_in_days * 86400 * 1000).toISOString()
          : null;

        const { data, error } = await supabaseAdmin
          .from("api_keys")
          .insert({
            user_id: auth.userId,
            name,
            key_prefix,
            key_hash,
            scopes,
            expires_at,
          })
          .select("id, name, key_prefix, scopes, expires_at, created_at")
          .single();

        if (error) return jsonError(500, "server_error", error.message);

        // El secreto en claro se devuelve UNA SOLA VEZ.
        return jsonOk({ ...data, secret: fullKey }, { status: 201 });
      },
    },
  },
});
