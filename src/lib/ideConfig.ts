export type IdeConfig = {
  supabaseUrl?: string;
  supabaseKey?: string;
  openaiKey?: string;
  openaiModel?: string;
  githubToken?: string;
  githubRepo?: string; // "owner/repo"
  githubBranch?: string;
  githubExcludeEnv?: boolean; // No subir .env al repo
};

const KEY = "ide.config";

export function getIdeConfig(): IdeConfig {
  try {
    const main = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    // Back-compat with old supabase-only key
    const legacy = JSON.parse(localStorage.getItem("ide.supabase.config") ?? "{}");
    return {
      supabaseUrl: main.supabaseUrl ?? legacy.url,
      supabaseKey: main.supabaseKey ?? legacy.apiKey,
      openaiKey: main.openaiKey,
      openaiModel: main.openaiModel ?? "gpt-4o-mini",
      githubToken: main.githubToken,
      githubRepo: main.githubRepo,
      githubBranch: main.githubBranch ?? "main",
      githubExcludeEnv: main.githubExcludeEnv ?? true,
    };
  } catch {
    return {};
  }
}

export function setIdeConfig(cfg: IdeConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
  // Mirror Supabase part to legacy key consumed by userSupabase.ts
  localStorage.setItem(
    "ide.supabase.config",
    JSON.stringify({ url: cfg.supabaseUrl ?? "", apiKey: cfg.supabaseKey ?? "" }),
  );
}
