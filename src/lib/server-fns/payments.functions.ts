import { createServerFn } from "@tanstack/react-start";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PRICE_RE = /^[a-zA-Z0-9_-]+$/;

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      priceId: string;
      customerEmail?: string;
      userId?: string;
      returnUrl: string;
      environment: StripeEnv;
      accessToken: string;
    }) => {
      if (!PRICE_RE.test(data.priceId)) throw new Error("Invalid priceId");
      if (data.environment !== "sandbox" && data.environment !== "live") {
        throw new Error("Invalid environment");
      }
      if (!data.accessToken) throw new Error("Unauthorized");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(data.accessToken);
    if (authError || !authData.user) throw new Error("Unauthorized");

    const stripe = createStripeClient(data.environment);
    const userId = authData.user.id;

    const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      ...((data.customerEmail || authData.user.email) && {
        customer_email: data.customerEmail || authData.user.email,
      }),
      metadata: { userId, gafcorePriceId: data.priceId },
      ...(isRecurring && {
        subscription_data: { metadata: { userId } },
      }),
      ...(!isRecurring && {
        payment_intent_data: {
          metadata: { userId, gafcorePriceId: data.priceId },
        },
      }),
    });

    if (!session.client_secret) throw new Error("Checkout session did not return a client secret");
    return { clientSecret: session.client_secret };
  });
