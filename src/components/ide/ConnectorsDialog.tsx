import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Cloud, Sparkles, Mic, ShoppingBag, CreditCard, Shield, Database, Briefcase, Brain, HardDrive, BarChart3, Mail, FileText, Globe, Calendar, MessageSquare, Phone, Bot, Users, Workflow, FileSpreadsheet, FileImage, Headphones, Search as SearchIcon, Send, Music, Video, Plug, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  listMcpConnections,
  upsertMcpConnection,
  deleteMcpConnection,
} from "@/lib/userSupabase";

type Connector = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Cloud;
  color: string;
  enabled?: boolean;
  featured?: boolean;
};

const CONNECTORS: Connector[] = [
  { id: "cloud", name: "Nube", desc: "Backend integrado, listo para usar.", icon: Cloud, color: "#0ea5e9", enabled: true, featured: true },
  { id: "ai", name: "AI", desc: "Desbloquea potentes funciones de IA.", icon: Sparkles, color: "#a855f7", enabled: true, featured: true },
  { id: "elevenlabs", name: "ElevenLabs", desc: "Generación de voz por IA, conversión de texto a voz y clonación.", icon: Mic, color: "#6366f1", enabled: true, featured: true },
  { id: "shop", name: "Tienda", desc: "Crea una tienda de comercio electrónico.", icon: ShoppingBag, color: "#22c55e", enabled: true, featured: true },
  { id: "stripe", name: "Raya", desc: "Configurar pagos.", icon: CreditCard, color: "#635bff", enabled: true, featured: true },
  { id: "aikido", name: "Aikido", desc: "Escaneo de seguridad y pruebas de penetración con IA.", icon: Shield, color: "#7c3aed" },
  { id: "airtable", name: "Airtable", desc: "Plataforma híbrida de hojas de cálculo y bases de datos.", icon: FileSpreadsheet, color: "#fbbf24" },
  { id: "asana", name: "Asana", desc: "Plataforma de gestión del trabajo para tareas y proyectos.", icon: Briefcase, color: "#ef4444" },
  { id: "ashby", name: "Ashby", desc: "Sistema de reclutamiento y seguimiento de candidatos.", icon: Users, color: "#1f2937" },
  { id: "attention", name: "Atención", desc: "API de inteligencia y coaching para conversaciones de ventas.", icon: Brain, color: "#f97316" },
  { id: "aws_s3", name: "AWS S3", desc: "Leer y escribir archivos de datos en buckets de AWS S3.", icon: HardDrive, color: "#16a34a" },
  { id: "bigquery", name: "BigQuery", desc: "Consulta y analiza datos en BigQuery.", icon: BarChart3, color: "#3b82f6" },
  { id: "brevo", name: "Brevo", desc: "API de correo electrónico, SMS, CRM y automatización.", icon: Mail, color: "#0ea5e9" },
  { id: "contentful", name: "Contento", desc: "Sistema de gestión de contenido (CMS) sin interfaz gráfica.", icon: FileText, color: "#0ea5e9" },
  { id: "databricks", name: "Databricks", desc: "Plataforma unificada de analítica y datos.", icon: Database, color: "#dc2626" },
  { id: "firecrawl", name: "Firecrawl", desc: "Scraper, búsqueda y recuperación con IA.", icon: SearchIcon, color: "#f59e0b" },
  { id: "fireflies", name: "Fireflies", desc: "Transcripción de reuniones e inteligencia conversacional.", icon: Headphones, color: "#ef4444" },
  { id: "gemini", name: "Gemini Enterprise", desc: "Busca, consulta y resume datos de Google.", icon: Sparkles, color: "#4285f4" },
  { id: "gmail", name: "Gmail", desc: "Lee, envía y administra tus correos.", icon: Mail, color: "#ea4335" },
  { id: "gcal", name: "Google Calendar", desc: "Crea y administra eventos de Google Calendar.", icon: Calendar, color: "#4285f4" },
  { id: "gdocs", name: "Google Docs", desc: "Crea y edita documentos.", icon: FileText, color: "#4285f4" },
  { id: "gdrive", name: "Google Drive", desc: "Sube y descarga archivos a Google Drive.", icon: Cloud, color: "#0f9d58" },
  { id: "gsheets", name: "Google Sheets", desc: "Lee y actualiza datos de hojas de cálculo.", icon: FileSpreadsheet, color: "#0f9d58" },
  { id: "gslides", name: "Google Slides", desc: "Crea y administra presentaciones.", icon: FileImage, color: "#fbbf24" },
  { id: "granola", name: "Granola", desc: "Notas de reuniones y transcripciones con IA.", icon: FileText, color: "#84cc16" },
  { id: "hubspot", name: "HubSpot", desc: "Plataforma CRM para ventas y marketing.", icon: Users, color: "#ff7a59" },
  { id: "inngest", name: "Inngest", desc: "Funciones duraderas, jobs y workflows.", icon: Workflow, color: "#6366f1" },
  { id: "linear", name: "Linear", desc: "Gestión de proyectos y tickets para equipos de software.", icon: Briefcase, color: "#5e6ad2" },
  { id: "ms_excel", name: "Microsoft Excel", desc: "Lee y escribe hojas de cálculo.", icon: FileSpreadsheet, color: "#16a34a" },
  { id: "ms_onedrive", name: "Microsoft OneDrive", desc: "Sube y lee archivos.", icon: Cloud, color: "#0ea5e9" },
  { id: "ms_onenote", name: "Microsoft OneNote", desc: "Lee y escribe notas.", icon: FileText, color: "#7c3aed" },
  { id: "ms_outlook", name: "Microsoft Outlook", desc: "Lee, envía y administra correos.", icon: Mail, color: "#0078d4" },
  { id: "ms_powerpoint", name: "Microsoft PowerPoint", desc: "Lee y escribe presentaciones.", icon: FileImage, color: "#dc2626" },
  { id: "ms_teams", name: "Microsoft Teams", desc: "Envía mensajes y administra canales.", icon: MessageSquare, color: "#6264a7" },
  { id: "ms_word", name: "Microsoft Word", desc: "Lee y escribe documentos.", icon: FileText, color: "#2563eb" },
  { id: "perplexity", name: "Perplexity", desc: "Motor de búsqueda y respuestas con IA.", icon: Brain, color: "#22c55e" },
  { id: "resend", name: "Resend", desc: "API de correo para desarrolladores.", icon: Send, color: "#000000" },
  { id: "slack", name: "Slack", desc: "Envía mensajes e interactúa con espacios de Slack.", icon: MessageSquare, color: "#4a154b" },
  { id: "snowflake", name: "Snowflake", desc: "Plataforma de datos en la nube para analítica e IA.", icon: Database, color: "#29b5e8" },
  { id: "storyblok", name: "Storyblok", desc: "CMS headless y constructor visual de páginas.", icon: FileText, color: "#09b3af" },
  { id: "telegram", name: "Telegram", desc: "Plataforma de mensajería con Bot API.", icon: Bot, color: "#0088cc" },
  { id: "twilio", name: "Twilio", desc: "Comunicaciones en la nube: SMS, voz y mensajes.", icon: Phone, color: "#f22f46" },
  { id: "twitch", name: "Twitch", desc: "Streaming en vivo para gaming y contenido creativo.", icon: Video, color: "#9146ff" },
  { id: "wordpress", name: "WordPress.com", desc: "Accede a sitios, posts y medios de WordPress.", icon: Globe, color: "#0073aa" },
  { id: "wiz", name: "Wiz", desc: "Plataforma de seguridad y postura cloud.", icon: Shield, color: "#0ea5e9" },
];

const MCP_CONNECTORS: Connector[] = [
  { id: "amplitude", name: "Amplitud", desc: "Acceda a los análisis y comentarios de su producto Amplitude.", icon: BarChart3, color: "#1e40af" },
  { id: "atlassian", name: "Atlassian", desc: "Acceda a sus incidencias de Jira y a sus páginas de Confluence.", icon: Briefcase, color: "#2563eb" },
  { id: "confidence_exp", name: "Experiencia de confianza", desc: "Analice sus pruebas A/B y lanzamientos de confianza.", icon: BarChart3, color: "#7c3aed" },
  { id: "confidence_flags", name: "Indicadores de confianza", desc: "Cree, modifique y gestione sus indicadores de características.", icon: Workflow, color: "#7c3aed" },
  { id: "figma", name: "Figma", desc: "Utilice el servidor MCP local de Figma desde Figma Desktop.", icon: FileImage, color: "#f24e1e" },
  { id: "granola_mcp", name: "Granola", desc: "Acceda a las notas y transcripciones de sus reuniones.", icon: FileText, color: "#84cc16" },
  { id: "hex", name: "Maleficio", desc: "Acceda a sus cuadernos y proyectos de datos Hex.", icon: Database, color: "#5b21b6" },
  { id: "heygen", name: "HeyGen", desc: "Crea vídeos y avatares con IA, y traduce contenido.", icon: Video, color: "#10b981" },
  { id: "linear_mcp", name: "Lineal", desc: "Acceda a sus incidencias y datos de proyecto de Linear.", icon: Briefcase, color: "#5e6ad2" },
  { id: "miro", name: "Miró", desc: "Acceda a sus tableros y diagramas de Miro.", icon: FileImage, color: "#fbbf24" },
  { id: "n8n", name: "n8n", desc: "Acceda y potencie sus aplicaciones con los flujos de trabajo de n8n.", icon: Workflow, color: "#ef4444" },
  { id: "notion", name: "Noción", desc: "Acceda a sus páginas y bases de datos de Notion.", icon: FileText, color: "#000000" },
  { id: "polar", name: "Polar", desc: "Configurar la facturación por suscripción.", icon: CreditCard, color: "#000000" },
  { id: "posthog", name: "PostHog", desc: "Acceda a sus análisis, indicadores de funciones y experimentos.", icon: BarChart3, color: "#f59e0b" },
  { id: "sanity", name: "Cordura", desc: "Acceda a la gestión de contenido de Sanity.", icon: FileText, color: "#dc2626" },
  { id: "sentry", name: "Centinela", desc: "Acceda a los problemas, errores e información sobre sus proyectos.", icon: Shield, color: "#7c3aed" },
  { id: "custom_mcp", name: "Costumbre", desc: "Conecta tu propio MCP.", icon: Plug, color: "#64748b" },
];

export function ConnectorsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [connectedIds, setConnectedIds] = useState<Map<string, string>>(new Map());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const rows = await listMcpConnections();
      const map = new Map<string, string>();
      rows.forEach((r) => map.set(r.connector_id, r.id));
      setConnectedIds(map);
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONNECTORS;
    return CONNECTORS.filter((c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }, [query]);

  const filteredMcp = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MCP_CONNECTORS;
    return MCP_CONNECTORS.filter((c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }, [query]);

  const handleConnect = async (c: Connector, kind: "standard" | "mcp") => {
    if (c.enabled) {
      toast.info(`${c.name} ya está activado`);
      return;
    }
    const existingId = connectedIds.get(c.id);
    if (existingId) {
      // Toggle off (disconnect)
      setBusyId(c.id);
      const ok = await deleteMcpConnection(existingId);
      setBusyId(null);
      if (ok) {
        setConnectedIds((m) => {
          const n = new Map(m);
          n.delete(c.id);
          return n;
        });
        toast.success(`${c.name} desconectado`);
      } else {
        toast.error("No se pudo desconectar");
      }
      return;
    }
    setBusyId(c.id);
    const ok = await upsertMcpConnection(c.id, c.name, kind);
    setBusyId(null);
    if (ok) {
      // Re-cargar para obtener id real
      const rows = await listMcpConnections();
      const map = new Map<string, string>();
      rows.forEach((r) => map.set(r.connector_id, r.id));
      setConnectedIds(map);
      toast.success(`${c.name} conectado`);
    } else {
      toast.error(`No se pudo conectar ${c.name}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b px-6 py-4 space-y-0">
          <DialogTitle className="text-lg">Conectores</DialogTitle>
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => void handleConnect(c, "standard")}
                  disabled={busyId === c.id}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${c.color}1a`, color: c.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{c.name}</span>
                      {c.enabled && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Activado
                        </span>
                      )}
                      {!c.enabled && connectedIds.has(c.id) && (
                        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Conectado
                        </span>
                      )}
                      {busyId === c.id && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">{c.desc}</p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                Sin resultados para “{query}”
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold">Conectores de chat</h3>
            <p className="mb-4 mt-1 text-xs text-muted-foreground">
              Agrega MCP que brindan contexto durante el proceso de compilación. Solo disponible para ti.{" "}
              <button
                type="button"
                onClick={() => window.open("https://modelcontextprotocol.io", "_blank", "noopener")}
                className="font-medium text-primary hover:underline"
              >
                Leer más ↗
              </button>
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredMcp.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => void handleConnect(c, "mcp")}
                    disabled={busyId === c.id}
                    className="group flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${c.color}1a`, color: c.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{c.name}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          MCP
                        </span>
                        {connectedIds.has(c.id) && (
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Conectado
                          </span>
                        )}
                        {busyId === c.id && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">{c.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border bg-gradient-to-r from-primary/5 via-fuchsia-500/5 to-amber-500/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plug className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">¿Falta un conector?</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Solicita nuevos conectores o brinda soporte a los que te interesan.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const name = window.prompt("¿Qué conector te gustaría solicitar?");
                  if (name && name.trim()) toast.success(`Solicitud enviada para "${name.trim()}"`);
                }}
              >
                Pedido
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t px-6 py-3">
          <span className="text-[11px] text-muted-foreground">{filtered.length} conectores</span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
