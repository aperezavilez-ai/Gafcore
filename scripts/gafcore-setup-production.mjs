/**
 * Aplica todo lo que se puede desde el repo (sin panel web).
 *
 *   npm run gafcore:setup-production
 *
 * Requiere en .env.local: Supabase, IA, Stripe (para bootstrap), opcional REPLICATE.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function envHas(key) {
  if (process.env[key]?.trim()) return true;
  for (const name of [".env.local", ".env"]) {
    const p = resolve(root, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      if (t.slice(0, eq).trim() === key && t.slice(eq + 1).trim()) return true;
    }
  }
  return false;
}

function run(cmd, args, label) {
  console.log(`\n--- ${label} ---\n`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true, env: process.env });
  return r.status === 0;
}

console.log("\n=== GafCore — setup producción (automático) ===\n");

const hasLocal = existsSync(resolve(root, ".env.local"));
const hasEnv = existsSync(resolve(root, ".env"));
if (!hasLocal && !hasEnv) {
  console.log(
    "Crea .env.local desde .env.example (Supabase + OPENROUTER_API_KEY o OPENAI_API_KEY + Stripe test).",
  );
}

run("node", ["scripts/check-gafcore-setup.mjs"], "Diagnóstico .env");

if (envHas("STRIPE_SANDBOX_API_KEY")) {
  run("node", ["scripts/bootstrap-stripe-gafcore.mjs"], "Stripe catálogo (test)");
} else {
  console.log("\n--- Stripe bootstrap omitido (añade STRIPE_SANDBOX_API_KEY a .env.local) ---\n");
}

if (hasLocal || hasEnv) {
  console.log("\n--- Vercel env (opcional; requiere `vercel login` y proyecto enlazado) ---\n");
  const vercelOk = run("npx", ["vercel@latest", "whoami"], "Vercel CLI");
  if (vercelOk) {
    run("node", ["scripts/push-vercel-env-once.mjs"], "Subir variables a Vercel Production");
  } else {
    console.log("Omitido: inicia sesión con `npx vercel login` y enlaza el proyecto gafcore.");
  }
} else {
  console.log("\nOmitido Vercel: sin .env.local / .env\n");
}

console.log(`
--- Supabase (manual o CLI) ---
  • Panel → Auth → URL Configuration (gafcore.com + localhost)
  • Panel → SMTP (nombre remitente GafCore)
  • CLI: npx supabase@latest link --project-ref hbfbqqwetaynblmkezeu && npx supabase@latest db push
  • CLI: npx supabase@latest config push   (auth URLs desde supabase/config.toml)

--- DNS ---
  • Dominio apuntando solo a Vercel (no Lovable)

Listo. Ajusta precios reales en Stripe Dashboard cuando quieras.
`);
