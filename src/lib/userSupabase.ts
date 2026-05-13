import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FileItem } from "@/components/ide/CodeEditor";
import { supabase as defaultSupabase } from "@/integrations/supabase/client";

const CFG_KEY = "ide.supabase.config";
const PROJECT_KEY = "ide.project.id";
const PROJECT_NAME = "Nuevo Proyecto";
const SEEDED_KEY = "ide.projects.seeded";

// GafCore es la plataforma; cada usuario tiene su propio proyecto en backend.
// Los proyectos son los que el usuario crea dentro de GafCore.
const ECOSYSTEM_PROJECTS = [
  { name: "GafCore", description: "Plantilla y documentación de la plataforma GafCore (creación con IA)." },
];

let cached: { url: string; key: string; client: SupabaseClient } | null = null;

export function getUserSupabase(): SupabaseClient | null {
  try {
    const cfg = JSON.parse(localStorage.getItem(CFG_KEY) ?? "{}");
    if (!cfg.url || !cfg.apiKey) {
      // Fallback al proyecto Supabase configurado en variables de entorno
      return defaultSupabase as unknown as SupabaseClient;
    }
    if (cached && cached.url === cfg.url && cached.key === cfg.apiKey) {
      return cached.client;
    }
    const client = createClient(cfg.url, cfg.apiKey, {
      auth: { persistSession: false },
    });
    cached = { url: cfg.url, key: cfg.apiKey, client };
    return client;
  } catch {
    return defaultSupabase as unknown as SupabaseClient;
  }
}

export async function ensureProjectId(): Promise<string | null> {
  const sb = getUserSupabase();
  if (!sb) return null;

  // Validate cached id actually exists in the projects table
  const cachedId = localStorage.getItem(PROJECT_KEY);
  if (cachedId) {
    const { data: check } = await sb
      .from("projects")
      .select("id")
      .eq("id", cachedId)
      .maybeSingle();
    if (check?.id) return check.id as string;
    // Stale cache — clear and continue
    localStorage.removeItem(PROJECT_KEY);
  }

  // Try to find any existing project, else create one
  const { data: existing } = await sb
    .from("projects")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    localStorage.setItem(PROJECT_KEY, existing.id);
    return existing.id as string;
  }

  const { data: userRes } = await sb.auth.getUser();
  const userId = userRes?.user?.id;
  const payload: Record<string, unknown> = { name: PROJECT_NAME };
  if (userId) payload.user_id = userId;
  const { data: created, error } = await sb
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error || !created) {
    console.error("[Supabase] create project error:", error);
    return null;
  }
  localStorage.setItem(PROJECT_KEY, created.id);
  return created.id as string;
}

export type ProjectRow = { id: string; name: string; created_at?: string };

async function seedEcosystemProjects(sb: SupabaseClient) {
  try {
    const { data: existing } = await sb
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });
    const rows = (existing ?? []) as Array<{ id: string; name: string }>;
    const byName = (n: string) =>
      rows.find((r) => (r.name ?? "").trim().toLowerCase() === n.toLowerCase());

    // GafCore es la PLATAFORMA, no un proyecto. Renombrar filas legacy
    // creadas automáticamente ("GafCore" o "AI Studio Project") al nombre
    // del ecosistema disponible o a "Nuevo Proyecto".
    const legacyNames = new Set(["gafcore", "ai studio project"]);
    const legacy = rows.filter((r) =>
      legacyNames.has((r.name ?? "").trim().toLowerCase()),
    );
    for (const row of legacy) {
      const target = ECOSYSTEM_PROJECTS.find((p) => !byName(p.name));
      const newName = target?.name ?? "Nuevo Proyecto";
      await sb.from("projects").update({ name: newName }).eq("id", row.id);
      row.name = newName;
    }

    // 2) Insert any still-missing ecosystem projects
    const toCreate = ECOSYSTEM_PROJECTS.filter((p) => !byName(p.name));
    if (toCreate.length > 0) {
      const { data: userRes } = await sb.auth.getUser();
      const userId = userRes?.user?.id;
      const rows = toCreate.map((p) => (userId ? { ...p, user_id: userId } : p));
      await sb.from("projects").insert(rows);
    }
    localStorage.setItem(SEEDED_KEY, "1");
  } catch (e) {
    console.warn("[Supabase] seed projects skipped:", e);
  }
}

export async function listProjects(): Promise<ProjectRow[]> {
  const sb = getUserSupabase();
  if (!sb) return [];
  await seedEcosystemProjects(sb);
  const { data, error } = await sb
    .from("projects")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[Supabase] list projects error:", error);
    return [];
  }
  return (data ?? []) as ProjectRow[];
}

export async function createProject(name: string): Promise<ProjectRow | null> {
  const sb = getUserSupabase();
  if (!sb) return null;
  const { data: userRes } = await sb.auth.getUser();
  const userId = userRes?.user?.id;
  const payload: Record<string, unknown> = { name };
  if (userId) payload.user_id = userId;
  const { data, error } = await sb
    .from("projects")
    .insert(payload)
    .select("id, name, created_at")
    .single();
  if (error || !data) {
    console.error("[Supabase] create project error:", error);
    return null;
  }
  return data as ProjectRow;
}

export async function renameProject(id: string, name: string): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const { error } = await sb.from("projects").update({ name }).eq("id", id);
  if (error) {
    console.error("[Supabase] rename project error:", error);
    return false;
  }
  return true;
}

export function getCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentProjectId(id: string) {
  try {
    localStorage.setItem(PROJECT_KEY, id);
  } catch {}
}

export async function loadProjectFiles(): Promise<FileItem[] | null> {
  const sb = getUserSupabase();
  if (!sb) return null;
  const projectId = await ensureProjectId();
  if (!projectId) return null;

  const { data, error } = await sb
    .from("project_files")
    .select("name, language, content")
    .eq("project_id", projectId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[Supabase] load files error:", error);
    return null;
  }
  if (!data || data.length === 0) return [];
  // Dedupe by name (keep last occurrence)
  const map = new Map<string, FileItem>();
  for (const f of data as FileItem[]) map.set(f.name, f);
  return Array.from(map.values());
}

export async function saveProjectFiles(files: FileItem[]): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const projectId = await ensureProjectId();
  if (!projectId) return false;

  // Replace all files for this project
  const { error: delErr } = await sb
    .from("project_files")
    .delete()
    .eq("project_id", projectId);
  if (delErr) {
    console.error("[Supabase] delete files error:", delErr);
    return false;
  }

  if (files.length === 0) return true;

  const map = new Map<string, FileItem>();
  for (const f of files) map.set(f.name, f);
  const rows = Array.from(map.values()).map((f) => ({
    project_id: projectId,
    name: f.name,
    language: f.language,
    content: f.content,
  }));

  const { error: insErr } = await sb.from("project_files").insert(rows);
  if (insErr) {
    console.error("[Supabase] insert files error:", insErr);
    return false;
  }
  return true;
}

export type SnapshotRow = {
  id: string;
  label: string | null;
  file_count: number;
  created_at: string;
};

export async function listSnapshots(): Promise<SnapshotRow[]> {
  const sb = getUserSupabase();
  if (!sb) return [];
  const projectId = await ensureProjectId();
  if (!projectId) return [];
  const { data, error } = await sb
    .from("project_snapshots")
    .select("id, label, file_count, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[Supabase] list snapshots error:", error);
    return [];
  }
  return (data ?? []) as SnapshotRow[];
}

export async function createSnapshot(files: FileItem[], label?: string): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const projectId = await ensureProjectId();
  if (!projectId) return false;
  const { data: userRes } = await sb.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) return false;
  const { error } = await sb.from("project_snapshots").insert({
    project_id: projectId,
    user_id: userId,
    label: label ?? null,
    files: files as any,
    file_count: files.length,
  });
  if (error) {
    console.error("[Supabase] create snapshot error:", error);
    return false;
  }
  return true;
}

export async function loadSnapshotFiles(snapshotId: string): Promise<FileItem[] | null> {
  const sb = getUserSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("project_snapshots")
    .select("files")
    .eq("id", snapshotId)
    .maybeSingle();
  if (error || !data) {
    console.error("[Supabase] load snapshot error:", error);
    return null;
  }
  return (data.files ?? []) as FileItem[];
}

export async function deleteSnapshot(snapshotId: string): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const { error } = await sb.from("project_snapshots").delete().eq("id", snapshotId);
  if (error) {
    console.error("[Supabase] delete snapshot error:", error);
    return false;
  }
  return true;
}

export type SecretRow = {
  id: string;
  name: string;
  value: string;
  description: string | null;
  updated_at: string;
};

export async function listSecrets(): Promise<SecretRow[]> {
  const sb = getUserSupabase();
  if (!sb) return [];
  const projectId = await ensureProjectId();
  if (!projectId) return [];
  const { data, error } = await sb
    .from("project_secrets")
    .select("id, name, value, description, updated_at")
    .eq("project_id", projectId)
    .order("name", { ascending: true });
  if (error) {
    console.error("[Supabase] list secrets error:", error);
    return [];
  }
  return (data ?? []) as SecretRow[];
}

export async function upsertSecret(name: string, value: string, description?: string): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const projectId = await ensureProjectId();
  if (!projectId) return false;
  const { data: userRes } = await sb.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) return false;
  const cleanName = name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  if (!cleanName) return false;
  const { error } = await sb
    .from("project_secrets")
    .upsert(
      {
        project_id: projectId,
        user_id: userId,
        name: cleanName,
        value,
        description: description ?? null,
      },
      { onConflict: "project_id,name" },
    );
  if (error) {
    console.error("[Supabase] upsert secret error:", error);
    return false;
  }
  return true;
}

export async function deleteSecret(id: string): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const { error } = await sb.from("project_secrets").delete().eq("id", id);
  if (error) {
    console.error("[Supabase] delete secret error:", error);
    return false;
  }
  return true;
}

// ============= MCP / Connector connections =============
export type McpConnectionRow = {
  id: string;
  connector_id: string;
  display_name: string;
  kind: string;
  status: string;
  config: Record<string, unknown>;
  created_at: string;
};

export async function listMcpConnections(): Promise<McpConnectionRow[]> {
  const sb = getUserSupabase();
  if (!sb) return [];
  const projectId = await ensureProjectId();
  if (!projectId) return [];
  const { data, error } = await sb
    .from("mcp_connections")
    .select("id, connector_id, display_name, kind, status, config, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[Supabase] list mcp_connections error:", error);
    return [];
  }
  return (data ?? []) as McpConnectionRow[];
}

export async function upsertMcpConnection(
  connectorId: string,
  displayName: string,
  kind: "standard" | "mcp" = "standard",
  config: Record<string, unknown> = {},
): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const projectId = await ensureProjectId();
  if (!projectId) return false;
  const { data: userRes } = await sb.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) return false;
  const { error } = await sb.from("mcp_connections").upsert(
    {
      project_id: projectId,
      user_id: userId,
      connector_id: connectorId,
      display_name: displayName,
      kind,
      status: "connected",
      config: config as any,
    },
    { onConflict: "project_id,connector_id" },
  );
  if (error) {
    console.error("[Supabase] upsert mcp_connection error:", error);
    return false;
  }
  return true;
}

export async function deleteMcpConnection(id: string): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const { error } = await sb.from("mcp_connections").delete().eq("id", id);
  if (error) {
    console.error("[Supabase] delete mcp_connection error:", error);
    return false;
  }
  return true;
}

// ============= Publish pipeline =============
export type PublishRow = {
  id: string;
  status: string;
  url: string | null;
  visibility: string;
  file_count: number;
  http_status: number | null;
  latency_ms: number | null;
  error: string | null;
  created_at: string;
};

export async function recordPublish(input: {
  url?: string;
  visibility?: "public" | "private";
  fileCount?: number;
  httpStatus?: number;
  latencyMs?: number;
  status?: "pending" | "ok" | "fail";
  error?: string;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  const sb = getUserSupabase();
  if (!sb) return null;
  const projectId = await ensureProjectId();
  if (!projectId) return null;
  const { data: userRes } = await sb.auth.getUser();
  const userId = userRes?.user?.id;
  if (!userId) return null;
  const { data, error } = await sb
    .from("project_publishes")
    .insert({
      project_id: projectId,
      user_id: userId,
      status: input.status ?? "pending",
      url: input.url ?? null,
      visibility: input.visibility ?? "public",
      file_count: input.fileCount ?? 0,
      http_status: input.httpStatus ?? null,
      latency_ms: input.latencyMs ?? null,
      error: input.error ?? null,
      metadata: (input.metadata ?? {}) as any,
    })
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[Supabase] insert project_publishes error:", error);
    return null;
  }
  return (data?.id as string) ?? null;
}

export async function updatePublishRecord(
  id: string,
  patch: Partial<{
    status: string;
    http_status: number;
    latency_ms: number;
    error: string | null;
    metadata: Record<string, unknown>;
  }>,
): Promise<boolean> {
  const sb = getUserSupabase();
  if (!sb) return false;
  const { error } = await sb.from("project_publishes").update(patch as any).eq("id", id);
  if (error) {
    console.error("[Supabase] update project_publishes error:", error);
    return false;
  }
  return true;
}

export async function listPublishes(limit = 20): Promise<PublishRow[]> {
  const sb = getUserSupabase();
  if (!sb) return [];
  const projectId = await ensureProjectId();
  if (!projectId) return [];
  const { data, error } = await sb
    .from("project_publishes")
    .select("id, status, url, visibility, file_count, http_status, latency_ms, error, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[Supabase] list publishes error:", error);
    return [];
  }
  return (data ?? []) as PublishRow[];
}

// Reveal a secret by RPC (decrypts server-side, RLS enforced)
export async function revealSecret(secretId: string): Promise<string | null> {
  const sb = getUserSupabase();
  if (!sb) return null;
  const { data, error } = await sb.rpc("decrypt_project_secret", { _secret_id: secretId });
  if (error) {
    console.error("[Supabase] decrypt_project_secret error:", error);
    return null;
  }
  return (data as string) ?? null;
}
