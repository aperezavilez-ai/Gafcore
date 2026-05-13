import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export interface Subscription {
  id: string;
  user_id: string;
  paddle_subscription_id: string;
  paddle_customer_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
}

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const env = getStripeEnvironment();

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetchSub = () => {
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          setSubscription(data as Subscription | null);
          setLoading(false);
        });
    };

    const fetchAdmin = () => {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(!!data);
        });
    };

    fetchSub();
    fetchAdmin();

    // Realtime updates. Use a unique topic per hook instance because this hook
    // can be mounted more than once on dashboard pages.
    const channelName = `sub-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchSub()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, env]);

  const subActive = !!subscription && (
    (["active", "trialing", "past_due"].includes(subscription.status) &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())) ||
    (subscription.status === "canceled" &&
      !!subscription.current_period_end && new Date(subscription.current_period_end) > new Date())
  );

  const isActive = isAdmin || subActive;

  const planName = isAdmin ? "Master" :
                   subscription?.price_id === "plan_creador_monthly" ? "Label" :
                   subscription?.price_id === "plan_premium_monthly" ? "Pro" :
                   subscription?.price_id === "plan_pro_monthly" ? "Creator" :
                   subscription?.price_id === "plan_basico_monthly" ? "Starter" : null;

  // Tier: "creador" => unlimited (fair-use). All other paid plans grant full access.
  const planTier: "basico" | "pro" | "premium" | "creador" | null =
    isAdmin ? "creador" :
    subscription?.price_id === "plan_creador_monthly" ? "creador" :
    subscription?.price_id === "plan_premium_monthly" ? "premium" :
    subscription?.price_id === "plan_pro_monthly" ? "pro" :
    subscription?.price_id === "plan_basico_monthly" ? "basico" :
    null;

  return { subscription, isActive, planName, planTier, loading, isAdmin };
}
