import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  Settings as SettingsIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Activity,
  History,
} from "lucide-react";
import { toast } from "sonner";
import {
  listPublishes,
  recordPublish,
  updatePublishRecord,
  type PublishRow,
} from "@/lib/userSupabase";
import type { GafcoreDeployResult } from "@/lib/gafcore-deploy.shared";
import { normalizeDeployHost } from "@/lib/gafcore-deploy.shared";

type CheckStatus = "idle" | "running" | "ok" | "fail";
type CheckResult = {
  status: CheckStatus;
  httpStatus?: number;
  ms?: number;
  error?: string;
};

type Visibility = "public" | "private";

type Props = {
  children: React.ReactNode;
  /** Hostname del sitio del usuario (sin https://). */
  siteHost?: string | null;
  projectId?: string | null;
  canPublish?: boolean;
  isUpdating?: boolean;
  onUpdate?: () => Promise<GafcoreDeployResult>;
  onOpenSettings?: () => void;
};

export function PublishDialog({
  children,
  siteHost,
  projectId,
  canPublish = true,
  isUpdating = false,
  onUpdate,
  onOpenSettings,
}: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [check, setCheck] = useState<CheckResult>({ status: "idle" });
  const [history, setHistory] = useState<PublishRow[]>([]);

  const host = normalizeDeployHost(siteHost ?? null);
  const fullUrl = host ? `https://${host}` : null;

  const reloadHistory = useCallback(async () => {
    const rows = await listPublishes(8, projectId ?? undefined);
    setHistory(rows);
  }, [projectId]);

  useEffect(() => {
    if (open) void reloadHistory();
  }, [open, reloadHistory]);

  const runVerification = async (publishId?: string | null, verifyHost?: string | null) => {
    const target = normalizeDeployHost(verifyHost ?? host);
    if (!target) {
      setCheck({
        status: "fail",
        error: "Configura la URL del sitio en Configuración → GitHub Deploy",
      });
      if (publishId) {
        void updatePublishRecord(publishId, {
          status: "fail",
          error: "missing_deploy_site_url",
        });
      }
      toast.error("Falta la URL del sitio publicado en configuración");
      return;
    }

    setCheck({ status: "running" });
    const started = performance.now();
    const verifyUrl = `https://${target}`;

    try {
      const res = await fetch(`${verifyUrl}/?_=${Date.now()}`, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      }).catch((e) => {
        throw new Error("No respondió: " + (e instanceof Error ? e.message : "network"));
      });

      const ms = Math.round(performance.now() - started);
      const ok = res.ok;
      setCheck({
        status: ok ? "ok" : "fail",
        httpStatus: res.status,
        ms,
        error: ok ? undefined : `HTTP ${res.status}`,
      });
      if (publishId) {
        void updatePublishRecord(publishId, {
          status: ok ? "ok" : "fail",
          http_status: res.status,
          latency_ms: ms,
          error: ok ? null : `http_${res.status}`,
        });
      }
      if (ok) toast.success(`Sitio accesible (${ms} ms)`);
      else toast.error(`Verificación falló — HTTP ${res.status}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      setCheck({ status: "fail", error: message });
      if (publishId) {
        void updatePublishRecord(publishId, { status: "fail", error: message });
      }
      toast.error("No se pudo verificar: " + message);
    }
  };

  const handleUpdate = async () => {
    if (!canPublish) {
      toast.error("Configura GitHub y un proyecto activo antes de publicar", {
        action: onOpenSettings
          ? { label: "Configuración", onClick: onOpenSettings }
          : undefined,
      });
      return;
    }
    if (!onUpdate) return;

    let result: GafcoreDeployResult;
    try {
      result = await onUpdate();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error al publicar";
      toast.error(message);
      return;
    }

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    const verifyHost = result.siteHost ?? host;
    const urlForRecord = verifyHost ? `https://${verifyHost}` : fullUrl;

    const publishId = await recordPublish({
      projectId: projectId ?? undefined,
      url: urlForRecord ?? undefined,
      visibility,
      status: "pending",
      fileCount: result.fileCount ?? 0,
      metadata: {
        repoUrl: result.repoUrl,
        message: result.message,
      },
    });

    toast.success(result.message);
    void reloadHistory();

    if (verifyHost) {
      setTimeout(() => {
        void runVerification(publishId, verifyHost);
      }, 5000);
    } else {
      toast.message("Publicado en GitHub. Añade la URL de Vercel en Configuración para verificar.");
    }
  };

  const handleCopy = async () => {
    if (!fullUrl) {
      toast.error("Configura la URL del sitio en Configuración");
      return;
    }
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("URL copiada");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Publicar proyecto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL del sitio</label>
            {host ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                <span className="flex-1 truncate text-sm text-foreground">{host}</span>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="text-muted-foreground hover:text-foreground"
                  title="Copiar"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <a
                  href={fullUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  title="Abrir"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay URL. Tras conectar Vercel al repo, pégala en{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={onOpenSettings}
                >
                  Configuración
                </button>
                .
              </p>
            )}
          </div>

          {history.length > 0 && (
            <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <History className="h-3.5 w-3.5" />
                Últimas publicaciones
              </p>
              <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {history.map((row) => (
                  <li key={row.id} className="flex justify-between gap-2">
                    <span className="truncate">{row.url ?? "—"}</span>
                    <span
                      className={
                        row.status === "ok"
                          ? "shrink-0 text-primary"
                          : row.status === "fail"
                            ? "shrink-0 text-destructive"
                            : "shrink-0"
                      }
                    >
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={() => void handleUpdate()}
              disabled={isUpdating || check.status === "running" || !canPublish}
              className="w-full gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publicando…
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Publicar en GitHub
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Sube los archivos del IDE al repo configurado. Si añadiste un Deploy Hook de Vercel,
              se dispara el build automáticamente.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void runVerification()}
              disabled={check.status === "running" || isUpdating || !host}
              className="w-full gap-2 text-xs"
            >
              {check.status === "running" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Activity className="h-3.5 w-3.5" />
              )}
              Verificar sitio ahora
            </Button>

            {check.status !== "idle" && (
              <div
                className={`rounded-md border p-3 text-xs space-y-1 ${
                  check.status === "ok"
                    ? "border-primary/40 bg-primary/5"
                    : check.status === "fail"
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {check.status === "ok" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  {check.status === "fail" && <XCircle className="h-4 w-4 text-destructive" />}
                  {check.status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>
                    {check.status === "ok" && "Sitio accesible"}
                    {check.status === "fail" && "Verificación falló"}
                    {check.status === "running" && "Verificando…"}
                  </span>
                </div>
                {host && (
                  <p className="text-muted-foreground">
                    Host: <span className="text-foreground">{host}</span>
                  </p>
                )}
                {check.httpStatus !== undefined && (
                  <p className="text-muted-foreground">
                    HTTP: <span className="text-foreground">{check.httpStatus}</span>
                    {check.ms !== undefined ? ` · ${check.ms} ms` : ""}
                  </p>
                )}
                {check.error && <p className="text-destructive">{check.error}</p>}
              </div>
            )}
          </div>

          {onOpenSettings && (
            <Button variant="outline" size="sm" onClick={onOpenSettings} className="w-full gap-1.5">
              <SettingsIcon className="h-4 w-4" />
              Configuración de deploy
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
