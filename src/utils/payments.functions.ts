import { createServerFn } from "@tanstack/react-start";
import { gatewayFetch, type PaddleEnv } from '@/lib/paddle.server';
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PRICE_RE = /^[a-zA-Z0-9_-]+$/;

export const resolvePaddlePrice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; environment: PaddleEnv }) => {
    if (!PRICE_RE.test(data.priceId)) throw new Error("Invalid priceId");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    return data;
  })
  .handler(async ({ data }) => {
    const response = await gatewayFetch(data.environment, `/prices?external_id=${encodeURIComponent(data.priceId)}`);
    const result = await response.json();
    if (!result.data?.length) throw new Error("Price not found");
    return result.data[0].id;
  });
