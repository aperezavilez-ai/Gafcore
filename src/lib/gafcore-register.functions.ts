import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyTurnstileToken } from "@/lib/turnstile-verify.server";

const inputSchema = z.object({
  email: z.string().trim().email().max(320),
  turnstileToken: z.string().trim().min(1).max(4096).optional(),
});

function clientIpFromRequest(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const xr = req.headers.get("x-real-ip")?.trim();
  if (xr) return xr.slice(0, 128);
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 128);
  return "unknown";
}

function hashIp(ip: string): string {
  const salt =
    process.env.GAFCORE_SIGNUP_IP_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 24) ||
    "gafcore_signup_salt_undefined";
  return createHash("sha256").update(`${salt}:${ip}`, "utf8").digest("hex");
}

/**
 * Antes de `supabase.auth.signUp`: bloquea correo ya dado de alta y aplica cupo por IP/día.
 * No sustituye captcha ni WAF; refuerza abuso de cuentas gratis.
 */
export const assertGafcoreSignupAllowed = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (!request) {
      throw new Error("No se pudo validar el registro. Inténtalo de nuevo.");
    }

    const email = data.email.trim().toLowerCase();
    const ip = clientIpFromRequest(request);

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
    if (turnstileSecret) {
      const token = data.turnstileToken?.trim();
      if (!token) {
        throw new Error("TURNSTILE_REQUIRED");
      }
      const ok = await verifyTurnstileToken(token, ip);
      if (!ok) {
        throw new Error("INVALID_TURNSTILE");
      }
    }

    const { data: existing, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (profErr) {
      console.error("assertGafcoreSignupAllowed profiles:", profErr);
      throw new Error("No se pudo validar el correo. Inténtalo más tarde.");
    }
    if (existing?.user_id) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }

    const maxPerIp = Math.min(
      50,
      Math.max(1, Number.parseInt(process.env.GAFCORE_SIGNUP_MAX_PER_IP_PER_DAY ?? "8", 10) || 8),
    );

    const ipHash = hashIp(ip);

    const { data: hit, error: rpcErr } = await supabaseAdmin.rpc("signup_rate_limit_hit", {
      p_ip_hash: ipHash,
    });

    if (rpcErr) {
      if (rpcErr.code === "42883" || rpcErr.message?.includes("signup_rate_limit_hit")) {
        console.warn(
          "[GafCore] signup_rate_limit_hit no existe en la base (aplica migraciones). Límite por IP omitido.",
        );
      } else {
        console.error("assertGafcoreSignupAllowed rpc:", rpcErr);
        throw new Error("No se pudo validar el registro. Inténtalo más tarde.");
      }
    } else {
      const n = typeof hit === "number" ? hit : Number(hit);
      if (Number.isFinite(n) && n > maxPerIp) {
        throw new Error("SIGNUP_IP_RATE_LIMIT");
      }
    }

    return { ok: true as const };
  });
