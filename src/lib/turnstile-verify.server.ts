/**
 * Verificación servidor de Cloudflare Turnstile (`/siteverify`).
 * Secretos solo en `TURNSTILE_SECRET_KEY` (nunca en el cliente).
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp?.trim()) body.append("remoteip", remoteIp.trim().slice(0, 128));

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
