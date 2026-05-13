// Auth helper for /api/v1/* — accepts:
//   - "Authorization: Bearer gck_<env>_<secret>"  (GafCore API key)
//   - "Authorization: Bearer <supabase_jwt>"      (Supabase session token)
//
// Returns { userId, scopes, keyId? } on success, or a Response (401/403) on failure.
// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ApiAuth = {
  userId: string;
  scopes: string[];
  keyId: string | null; // null when authenticated via JWT
};

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function jsonError(status: number, code: string, message: string): Response {
  return new Response(JSON.stringify({ data: null, error: { code, message } }), {
    status,
    headers: JSON_HEADERS,
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return res === 0;
}

/** Validates the Authorization header and returns the resolved user. */
export async function requireApiAuth(request: Request): Promise<ApiAuth | Response> {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return jsonError(401, "unauthorized", "Missing Bearer token in Authorization header.");
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) return jsonError(401, "unauthorized", "Empty Bearer token.");

  // 1) GafCore API key path
  if (token.startsWith("gck_")) {
    const parts = token.split("_");
    // Expected: gck_<env>_<secret>  → key_prefix = "gck_<env>_<first 8 of secret>"
    if (parts.length < 3 || parts[2].length < 16) {
      return jsonError(401, "invalid_api_key", "API key format is invalid.");
    }
    const env = parts[1];
    const secret = parts.slice(2).join("_");
    const prefix = `gck_${env}_${secret.slice(0, 8)}`;
    const hash = await sha256Hex(token);

    const { data: keys, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id, key_hash, scopes, revoked_at, expires_at")
      .eq("key_prefix", prefix)
      .limit(1);

    if (error) {
      console.error("[api/v1 auth] key lookup error:", error);
      return jsonError(500, "server_error", "Could not validate API key.");
    }
    const key = keys?.[0];
    if (!key) return jsonError(401, "invalid_api_key", "API key not found.");
    if (key.revoked_at) return jsonError(401, "key_revoked", "API key has been revoked.");
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return jsonError(401, "key_expired", "API key has expired.");
    }
    if (!timingSafeEqualHex(hash, key.key_hash)) {
      return jsonError(401, "invalid_api_key", "API key is invalid.");
    }

    // Best-effort: stamp last_used_at (don't fail the request if it errors)
    supabaseAdmin.rpc("touch_api_key_used", { p_key_id: key.id }).then(({ error: e }) => {
      if (e) console.warn("[api/v1 auth] touch_api_key_used error:", e.message);
    });

    return {
      userId: key.user_id as string,
      scopes: (key.scopes as string[]) ?? [],
      keyId: key.id as string,
    };
  }

  // 2) Supabase JWT path
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return jsonError(500, "server_misconfigured", "Auth backend is not configured.");
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data, error } = await sb.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return jsonError(401, "unauthorized", "Invalid or expired session token.");
  }
  return {
    userId: data.claims.sub as string,
    // JWT path grants all scopes (it's the user's own session).
    scopes: ["*"],
    keyId: null,
  };
}

/** Returns true when the auth context grants the requested scope. */
export function hasScope(auth: ApiAuth, required: string): boolean {
  if (auth.scopes.includes("*")) return true;
  return auth.scopes.includes(required);
}

export function requireScope(auth: ApiAuth, required: string): Response | null {
  if (hasScope(auth, required)) return null;
  return jsonError(403, "insufficient_scope", `Missing required scope: ${required}`);
}

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ data, error: null }), {
    status: init?.status ?? 200,
    headers: {
      ...JSON_HEADERS,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...(init?.headers ?? {}),
    },
  });
}

export { jsonError, sha256Hex };
