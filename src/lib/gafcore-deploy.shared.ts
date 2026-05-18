/** Resultado del flujo Publicar (GitHub + hook opcional). */
export type GafcoreDeployResult = {
  ok: boolean;
  message: string;
  repoUrl?: string;
  fileCount?: number;
  /** Hostname para verificación HTTP (sin protocolo). */
  siteHost?: string;
  commitHint?: string;
};

export function normalizeDeployHost(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  let s = input.trim();
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/\/+$/, "");
  return s || null;
}

export function deployHostFromGithubRepo(repo: string): string | null {
  const r = repo.trim();
  if (!r.includes("/")) return null;
  return `${r.split("/")[0]}.github.io`;
}
