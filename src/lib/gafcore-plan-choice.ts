/** Bloquea /gafcore/app hasta que el usuario elija plan en /gafcore#planes (tras registro). */
const PREFIX = "gafcore_plan_pending_";

export function setPlanChoicePending(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PREFIX}${userId}`, "1");
  } catch {
    /* ignore */
  }
}

export function clearPlanChoicePending(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${PREFIX}${userId}`);
  } catch {
    /* ignore */
  }
}

export function isPlanChoicePending(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`${PREFIX}${userId}`) === "1";
  } catch {
    return false;
  }
}
