import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const claimMasterAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    if (!input || typeof input.code !== "string" || input.code.length > 200) {
      throw new Error("Invalid code");
    }
    return { code: input.code };
  })
  .handler(async ({ data, context }) => {
    const expected = process.env.MASTER_SIGNUP_CODE;
    if (!expected) throw new Error("Master code not configured");
    if (data.code !== expected) {
      // Generic error to avoid leaking info
      throw new Error("Invalid master code");
    }

    const { userId } = context;
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase.from("user_roles").select("role");
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r) => r.role as string) };
  });
