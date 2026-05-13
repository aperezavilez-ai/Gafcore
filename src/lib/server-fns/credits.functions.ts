// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const consumeCreditsSchema = z.object({
  amount: z.number().int().positive().max(1000),
  reason: z.string().trim().min(1).max(120),
  metadata: z.record(z.unknown()).default({}),
});

export const consumeCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => consumeCreditsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await supabaseAdmin.rpc("consume_credits", {
      p_user_id: context.userId,
      p_amount: data.amount,
      p_reason: data.reason,
      p_metadata: data.metadata as never,
    });

    if (error) throw new Error(error.message);
    return result as { ok: boolean; balance?: number; error?: string; unlimited?: boolean; daily_limit?: number };
  });