import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — GafCore" },
      { name: "description", content: "GafCore refund policy — our 30-day money-back guarantee." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-4 prose prose-invert prose-sm">
          <h1 className="text-3xl font-black text-foreground mb-8">Refund Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: May 2, 2026</p>

          <h2 className="text-xl font-bold text-foreground mt-8">30-Day Money-Back Guarantee</h2>
          <p className="text-muted-foreground">
            We want you to be completely satisfied with GafCore. If you're not happy with your purchase,
            you can request a full refund within <strong className="text-foreground">30 days</strong> of your order date.
            No questions asked.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">How to Request a Refund</h2>
          <p className="text-muted-foreground">
            Refunds are processed by our payment provider, <strong className="text-foreground">Paddle</strong>.
            To request a refund, you can:
          </p>
          <ul className="text-muted-foreground list-disc pl-6 space-y-1">
            <li>Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.net</a> and locate your transaction</li>
            <li>Or contact our support team at{" "}
              <a href="mailto:support@gafcore.com" className="text-primary hover:underline">support@gafcore.com</a> and
              we'll process it for you</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">Refund Processing</h2>
          <p className="text-muted-foreground">
            Once approved, refunds are typically processed within 5–10 business days. The refund will be credited
            to the original payment method used during purchase.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">After a Refund</h2>
          <p className="text-muted-foreground">
            If you receive a refund, your paid subscription features will be revoked at the end of your current
            billing period. Your account and any free-tier features will remain accessible.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8">Contact</h2>
          <p className="text-muted-foreground">
            Questions about refunds? Reach us at{" "}
            <a href="mailto:support@gafcore.com" className="text-primary hover:underline">support@gafcore.com</a>.
          </p>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}
