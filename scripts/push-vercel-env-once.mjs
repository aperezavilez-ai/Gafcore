/**
 * One-shot: reads .env and runs `vercel env add` per line (production).
 * Delete this file after use if desired.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = [join(root, ".env.local"), join(root, ".env")].find((p) => {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
});
if (!envPath) {
  console.error("No existe .env.local ni .env en la raíz del proyecto.");
  process.exit(1);
}
console.log(`Leyendo: ${envPath}\n`);
const text = readFileSync(envPath, "utf8");

for (let line of text.split(/\r?\n/)) {
  line = line.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq === -1) continue;
  const key = line.slice(0, eq).trim();
  let val = line.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  if (!key || val.length === 0) continue;
  process.stdout.write(`Pushing ${key} …\n`);
  const r = spawnSync(
    "npx",
    ["vercel@latest", "env", "add", key, "production", "--value", val, "--yes", "--force"],
    { cwd: root, stdio: "inherit", shell: true, env: process.env },
  );
  if (r.status !== 0) {
    process.stderr.write(`Failed for ${key} (exit ${r.status})\n`);
    process.exit(r.status ?? 1);
  }
}
