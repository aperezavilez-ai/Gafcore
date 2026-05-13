import { useState } from "react";
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
  Shield,
  Settings as SettingsIcon,
  Loader2,
  BarChart3,
  Lock,
  Plus,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { recordPublish, updatePublishRecord } from "@/lib/userSupabase";

type CheckStatus = "idle" | "running" | "ok" | "fail";
type CheckResult = {
  status: CheckStatus;
  httpStatus?: number;
  finalUrl?: string;
  redirectsToGafcore?: boolean;
  ms?: number;
  error?: string;
};

type Visibility = "public" | "private";

type Props = {
  children: React.ReactNode;
  siteUrl?: string;
  customDomain?: string | null;
  visitors?: number;
  isUpdating?: boolean;
  onUpdate?: () => void | Promise<void>;
  onOpenSettings?: () => void;
};

export function PublishDialog({
  children,
  siteUrl = "gafcore.com",
  customDomain = "gafcore.com",
  visitors = 0,
  isUpdating = false,
  onUpdate,
  onOpenSettings,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [check, setCheck] = useState<CheckResult>({ status: "idle" });
  const displayUrl = customDomain ?? siteUrl;
  const fullUrl = `https://${displayUrl}`;
  // Always verify against the temp URL (custom domain may still be propagating)
  const verifyUrl = `https://${siteUrl}`;

  const runVerification = async (publishId?: string | null) => {
    setCheck({ status: "running" });
    const started = performance.now();
    try {
      const rootRes = await fetch(verifyUrl + "/?_=" + Date.now(), {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      }).catch((e) => {
        throw new Error("No respondió: " + (e?.message ?? "network"));
      });

      const ms = Math.round(performance.now() - started);

      const html = await rootRes.text();
      const looksLikeGafCore =
        /GafCore/i.test(html) || /Cargando GafCore/i.test(html) || /\/gafcore/.test(html);

      const gafRes = await fetch(verifyUrl + "/gafcore?_=" + Date.now(), {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      });

      const ok = rootRes.ok && gafRes.ok && looksLikeGafCore;
      setCheck({
        status: ok ? "ok" : "fail",
        httpStatus: rootRes.status,
        finalUrl: rootRes.url,
        redirectsToGafcore: looksLikeGafCore,
        ms,
        error: ok ? undefined : "Respondió pero no coincide con GafCore publicado",
      });
      if (publishId) {
        void updatePublishRecord(publishId, {
          status: ok ? "ok" : "fail",
          http_status: rootRes.status,
          latency_ms: ms,
          error: ok ? null : "verification_mismatch",
        });
      }
      if (ok) toast.success(`Publicación verificada (${ms} ms)`);
      else toast.error("Verificación falló — revisa los detalles");
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
    await onUpdate?.();
    // Registrar la publicación
    const publishId = await recordPublish({
      url: fullUrl,
      visibility,
      status: "pending",
    });
    setTimeout(() => { void runVerification(publishId); }, 3000);
  };

  const handleCopy = async () => {
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
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Publicado
            </span>
            <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              {visitors} visitantes
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                URL del sitio web
              </label>
              <button
                type="button"
                onClick={() => toast.info("Abre Project Settings → Domains para conectar tu dominio.")}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Agregar dominio personalizado
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
              <span className="flex-1 truncate text-sm text-foreground">{displayUrl}</span>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground"
                title="Copiar"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                title="Abrir"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ¿Quién puede ver este sitio web?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition ${
                  visibility === "public"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Público</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Cualquiera con la URL
                </span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition ${
                  visibility === "private"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Privado</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Solo miembros del workspace
                </span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Ejecutando análisis de seguridad…")}
              className="gap-1.5"
            >
              <Shield className="h-4 w-4" />
              Revisar seguridad
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="gap-1.5"
            >
              <SettingsIcon className="h-4 w-4" />
              Editar configuración
            </Button>
          </div>

          {/* Update + Verify */}
          <div className="space-y-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating || check.status === "running"}
              className="w-full gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando…
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Actualizar y verificar
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void runVerification()}
              disabled={check.status === "running" || isUpdating}
              className="w-full gap-2 text-xs"
            >
              {check.status === "running" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Activity className="h-3.5 w-3.5" />
              )}
              Verificar publicación ahora
            </Button>

            {check.status !== "idle" && (
              <div
                className={`rounded-md border p-3 text-xs space-y-1 ${
                  check.status === "ok"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : check.status === "fail"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {check.status === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {check.status === "fail" && <XCircle className="h-4 w-4 text-destructive" />}
                  {check.status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>
                    {check.status === "ok" && "Publicación activa"}
                    {check.status === "fail" && "Verificación falló"}
                    {check.status === "running" && "Verificando…"}
                  </span>
                </div>
                <ul className="ml-5 list-disc text-muted-foreground space-y-0.5">
                  <li>URL temporal: <code className="text-foreground">{siteUrl}</code></li>
                  {check.httpStatus !== undefined && (
                    <li>HTTP: <span className="text-foreground">{check.httpStatus}</span></li>
                  )}
                  {check.ms !== undefined && (
                    <li>Latencia: <span className="text-foreground">{check.ms} ms</span></li>
                  )}
                  <li>
                    Redirige a /gafcore:{" "}
                    <span className={check.redirectsToGafcore ? "text-emerald-500" : "text-destructive"}>
                      {check.redirectsToGafcore ? "sí" : "no"}
                    </span>
                  </li>
                  {check.error && <li className="text-destructive">{check.error}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
