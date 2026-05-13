/**
 * One-shot: reads .env and runs `vercel env add` per line (production).
 * Delete this file after use if desired.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const text = readFileSync(join(root, ".env"), "utf8");

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
  if (!key) continue;
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
