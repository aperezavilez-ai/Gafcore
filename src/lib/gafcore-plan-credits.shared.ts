/** Cupo mensual de referencia en UI para usuarios sin suscripción de pago activa (alineado con landing #planes). */
export const GAFCORE_FREE_TIER_MONTHLY_CAP = 10;

/**
 * Para la barra de créditos: si no hay suscripción activa, el denominador no debe quedar en 0
 * (evita “0 créditos” sin contexto cuando `monthly_allowance` aún no se ha reparado en BD).
 */
export function displayMonthlyAllowanceForUi(args: {
  isAdmin: boolean;
  subActive: boolean;
  monthlyAllowance: number;
}): number {
  const { isAdmin, subActive, monthlyAllowance } = args;
  if (isAdmin) return Math.max(0, monthlyAllowance);
  if (subActive) return Math.max(0, monthlyAllowance);
  return Math.max(monthlyAllowance, GAFCORE_FREE_TIER_MONTHLY_CAP);
}
