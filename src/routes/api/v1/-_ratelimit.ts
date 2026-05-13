// Basic per-user rate limiter. Uses Postgres for state — good enough for
// abuse mitigation, not a strict global guarantee at edge scale.
// @ts-nocheck
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonError } from "./-_auth";

export type RateLimitConfig = {
  bucket: string;       // logical name: "default" | "ai" | ...
  windowSeconds: number; // e.g. 60
  max: number;          // requests allowed per window
};

export const DEFAULT_LIMIT: RateLimitConfig = { bucket: "default", windowSeconds: 60, max: 60 };
export const AI_LIMIT: RateLimitConfig = { bucket: "ai", windowSeconds: 60, max: 10 };

export async function enforceRateLimit(
  userId: string,
  cfg: RateLimitConfig = DEFAULT_LIMIT,
): Promise<Response | null> {
  const { data, error } = await supabaseAdmin.rpc("api_rate_limit_hit", {
    p_user_id: userId,
    p_bucket: cfg.bucket,
    p_window_seconds: cfg.windowSeconds,
  });
  if (error) {
    // Fail open (don't block legitimate traffic on infra errors), but log.
    console.warn("[api/v1 ratelimit] rpc error:", error.message);
    return null;
  }
  const count = Number(data ?? 0);
  if (count > cfg.max) {
    const retry = cfg.windowSeconds;
    const res = jsonError(429, "rate_limited", `Too many requests. Try again in ${retry}s.`);
    res.headers.set("Retry-After", String(retry));
    res.headers.set("X-RateLimit-Limit", String(cfg.max));
    res.headers.set("X-RateLimit-Remaining", "0");
    return res;
  }
  return null;
}
