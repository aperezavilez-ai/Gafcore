import { useMemo, useState } from "react";
import { Check, Lock, Shield, ShieldCheck, Star, ArrowRight, Gift, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Link } from "@tanstack/react-router";

export interface CheckoutPlanSummary {
  id: string;
  name: string;
  price: number;
  credits: string;
  desc?: string;
  features: readonly string[];
}

interface Props {
  plan: CheckoutPlanSummary;
  user: { id: string; email?: string };
  returnUrl: string;
  brand?: "gafcore" | "gafcore";
}

type Step = 1 | 2 | 3;

export function CheckoutExperience({ plan, user, returnUrl, brand = "gafcore" }: Props) {
  const [step, setStep] = useState<Step>(1);

  const totals = useMemo(() => {
    const subtotal = plan.price;
    const taxes = 0;
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  }, [plan.price]);

  const isFree = plan.price === 0;
  const brandLabel = brand === "gafcore" ? "GafCore" : "GafCore";

  return (
    <div className="w-full">
      {/* Top secure bar */}
      <div className="flex items-center justify-end gap-2 mb-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2.5 py-1">
          <Lock size={12} /> Secure checkout
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2.5 py-1">
          <ShieldCheck size={12} /> SSL Encrypted
        </span>
      </div>

      {/* Stepper */}
      <Stepper step={step} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT: Order summary (always visible on desktop, only step 1 on mobile) */}
        <div className={step === 1 ? "block" : "hidden lg:block"}>
          <OrderSummary plan={plan} totals={totals} brandLabel={brandLabel} />

          {step === 1 && (
            <div className="mt-5 lg:hidden">
              <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                Continuar al siguiente paso <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT: Payment details */}
        <div className={step === 1 ? "hidden lg:block" : "block"}>
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="lg:hidden mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={14} /> Volver al resumen
            </button>
          )}

          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Detalles de pago</h2>
            <p className="text-sm text-muted-foreground mb-5">Completa tu pago de forma segura.</p>

            {isFree ? (
              <FreePlanConfirm returnUrl={returnUrl} />
            ) : (
              <div className="rounded-xl overflow-hidden bg-background/60">
                <StripeEmbeddedCheckout
                  priceId={plan.id}
                  userId={user.id}
                  customerEmail={user.email}
                  returnUrl={returnUrl}
                />
              </div>
            )}

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-3 text-xs text-muted-foreground">
              <Shield size={16} className="mt-0.5 shrink-0 text-primary" />
              <p>
                Tu pago está protegido con encriptación de nivel bancario. Nunca almacenamos los datos de tu tarjeta.
              </p>
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Al continuar, aceptas nuestros{" "}
              <Link to="/terms" className="text-primary hover:underline">Términos de Servicio</Link> y{" "}
              <Link to="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>.
            </p>
          </div>

          {/* Desktop continue from step 1 */}
          {step === 1 && (
            <div className="hidden lg:block mt-5">
              <Button size="lg" className="w-full" onClick={() => setStep(2)}>
                Continuar al siguiente paso <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items = [
    { n: 1, label: "Plan" },
    { n: 2, label: "Payment" },
    { n: 3, label: "Confirm" },
  ] as const;
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {items.map((it, idx) => {
        const active = step === it.n;
        const done = step > it.n;
        return (
          <div key={it.n} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                  active
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                    : done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {done ? <Check size={14} /> : it.n}
              </span>
              <span className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                {it.label}
              </span>
            </div>
            {idx < items.length - 1 && (
              <span className="h-px w-8 sm:w-16 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSummary({
  plan,
  totals,
  brandLabel,
}: {
  plan: CheckoutPlanSummary;
  totals: { subtotal: number; taxes: number; total: number };
  brandLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-foreground mb-1">Resumen del pedido</h2>
        <p className="text-sm text-muted-foreground mb-5">Revisa tu plan antes de continuar.</p>

        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-500/20">
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{brandLabel} · Plan {plan.name}</div>
                <div className="text-xs text-muted-foreground">{plan.credits} créditos / mes</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-foreground">${plan.price}</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">/mes</div>
            </div>
          </div>

          <div className="my-4 h-px bg-border/60" />

          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={`$${totals.subtotal.toFixed(2)}`} />
            <Row label="Impuestos" value={`$${totals.taxes.toFixed(2)}`} />
          </div>

          <div className="my-4 h-px bg-border/60" />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                ${totals.total.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
        <h3 className="font-semibold text-foreground mb-3">Qué incluye tu plan {plan.name}</h3>
        <ul className="space-y-2.5 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check size={11} />
              </span>
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {plan.price === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-4">
          <Gift size={22} className="shrink-0 text-fuchsia-400" />
          <p className="text-sm text-muted-foreground">
            Disfruta {plan.credits} créditos gratis cada mes para construir, probar y crear sin límites.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function FreePlanConfirm({ returnUrl }: { returnUrl: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-5 text-center">
      <p className="text-sm text-muted-foreground mb-4">
        Tu plan Free no requiere pago. Continúa para activarlo.
      </p>
      <Button asChild size="lg" className="w-full">
        <a href={returnUrl}>Activar plan Free <ArrowRight size={16} /></a>
      </Button>
    </div>
  );
}
