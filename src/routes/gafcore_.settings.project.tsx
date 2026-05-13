import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Pencil,
  Settings as SettingsIcon,
  Globe,
  GitBranch,
  Users,
  CreditCard,
  Cloud,
  Shield,
  Smartphone,
  User as UserIcon,
  ExternalLink,
  Lock,
  Copy,
  LogOut,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useCredits } from "@/hooks/useCredits";
import { getCurrentProjectId, renameProject, listProjects } from "@/lib/userSupabase";
import { getIdeConfig, setIdeConfig } from "@/lib/ideConfig";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gafcore_/settings/project")({
  component: ProjectSettingsPage,
  head: () => ({ meta: [{ title: "Configuración del proyecto — GafCore" }] }),
});

const SIDEBAR_GROUPS = [
  {
    label: "Proyecto",
    items: [
      { id: "project", label: "Configuración del proyecto", icon: SettingsIcon },
      { id: "domains", label: "Dominios", icon: Globe },
      { id: "git", label: "Git", icon: GitBranch },
    ],
  },
  {
    label: "Espacio de trabajo",
    items: [
      { id: "workspace", label: "GafCore Workspace", icon: UserIcon },
      { id: "people", label: "Gente", icon: Users },
      { id: "plans", label: "Planes y créditos", icon: CreditCard },
      { id: "cloud", label: "Equilibrio entre la nube y la IA", icon: Cloud },
      { id: "wsdomains", label: "Dominios del espacio de trabajo", icon: Globe },
      { id: "privacy", label: "Privacidad y seguridad", icon: Shield },
      { id: "devices", label: "Dispositivos y aplicaciones", icon: Smartphone },
    ],
  },
];

function ProjectSettingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useSubscription(user?.id);
  const { balance } = useCredits(user?.id);
  const [projectName, setProjectName] = useState("GafCore");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("GafCore");
  const [subdomain] = useState("gafcore");
  const [createdAt, setCreatedAt] = useState<string>("—");
  const [activeSection, setActiveSection] = useState("project");
  const [messageCount] = useState(350);
  const [editsCount] = useState(175);

  useEffect(() => {
    (async () => {
      const list = await listProjects();
      const id = getCurrentProjectId();
      const found = list.find((p) => p.id === id);
      if (found) {
        setProjectName(found.name);
        setDraftName(found.name);
        if (found.created_at) {
          setCreatedAt(new Date(found.created_at).toLocaleString("es-MX"));
        }
      }
    })();
  }, []);

  const saveName = async () => {
    const id = getCurrentProjectId();
    if (!id) {
      toast.error("Sin proyecto activo");
      return;
    }
    const ok = await renameProject(id, draftName);
    if (ok) {
      setProjectName(draftName);
      setEditingName(false);
      toast.success("Nombre actualizado");
    } else {
      toast.error("No se pudo renombrar");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center">
          <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h1 className="mb-2 text-lg font-semibold">Inicia sesión</h1>
          <p className="mb-4 text-sm text-muted-foreground">Necesitas una cuenta para ver los ajustes.</p>
          <Button asChild className="w-full">
            <Link to="/gafcore/login" search={{ redirect: "/gafcore/app" }}>Entrar</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r bg-card/40 p-4">
        <button
          onClick={() => navigate({ to: "/gafcore/app" })}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </div>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition ${
                      active ? "bg-primary/10 font-medium text-primary" : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
        <div className="mt-6 border-t pt-4">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Cuenta</div>
          <div className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {(user.email ?? "U")[0].toUpperCase()}
            </div>
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          <SectionPanel
            section={activeSection}
            user={user}
            isAdmin={isAdmin}
            balance={balance}
            projectName={projectName}
            draftName={draftName}
            setDraftName={setDraftName}
            editingName={editingName}
            setEditingName={setEditingName}
            saveName={saveName}
            subdomain={subdomain}
            createdAt={createdAt}
            messageCount={messageCount}
            editsCount={editsCount}
          />
        </div>
      </main>
    </div>
  );
}

type PanelProps = {
  section: string;
  user: { email?: string | null; id: string };
  isAdmin: boolean;
  balance: number;
  projectName: string;
  draftName: string;
  setDraftName: (v: string) => void;
  editingName: boolean;
  setEditingName: (v: boolean) => void;
  saveName: () => void;
  subdomain: string;
  createdAt: string;
  messageCount: number;
  editsCount: number;
};

function SectionPanel(p: PanelProps) {
  switch (p.section) {
    case "domains": return <DomainsPanel subdomain={p.subdomain} />;
    case "git": return <GitPanel />;
    case "workspace": return <WorkspacePanel email={p.user.email ?? ""} isAdmin={p.isAdmin} />;
    case "people": return <PeoplePanel isAdmin={p.isAdmin} />;
    case "plans": return <PlansPanel isAdmin={p.isAdmin} balance={p.balance} />;
    case "cloud": return <CloudPanel />;
    case "wsdomains": return <DomainsPanel subdomain={p.subdomain} workspace />;
    case "privacy": return <PrivacyPanel />;
    case "devices": return <DevicesPanel />;
    default: return <ProjectOverviewPanel {...p} />;
  }
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </>
  );
}

function ProjectOverviewPanel(p: PanelProps) {
  return (
    <>
      <PanelHeader title="Configuración del proyecto" subtitle="Gestiona los detalles, la visibilidad y las preferencias de tu proyecto." />

      <section className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="mb-5 text-base font-semibold">Descripción general</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nombre del proyecto">
            {p.editingName ? (
              <div className="flex gap-2">
                <Input value={p.draftName} onChange={(e) => p.setDraftName(e.target.value)} className="h-8" />
                <Button size="sm" onClick={p.saveName}>Guardar</Button>
                <Button size="sm" variant="ghost" onClick={() => { p.setEditingName(false); p.setDraftName(p.projectName); }}>Cancelar</Button>
              </div>
            ) : (
              <button
                onClick={() => p.setEditingName(true)}
                className="group flex items-center gap-1.5 text-left text-sm font-medium hover:text-primary"
              >
                {p.projectName}
                <Pencil className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </button>
            )}
          </Field>
          <Field label="Dominio">
            <a
              href={`https://gafcore.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary"
            >
              gafcore.com
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Field>
          <Field label="Dueño"><span className="text-sm font-medium">{p.user.email}</span></Field>
          <Field label="Creado en"><span className="text-sm">{p.createdAt}</span></Field>
          <Field label="Pila tecnológica"><span className="text-sm">tanstack_start_ts_2026-05-06</span></Field>
          <Field label="Recuento de mensajes"><span className="text-sm">{p.messageCount}</span></Field>
          <Field label="Recuento de ediciones de IA"><span className="text-sm">{p.editsCount}</span></Field>
          <Field label="Créditos">
            <span className="text-sm">{p.isAdmin ? "Ilimitados ∞" : p.balance.toLocaleString()}</span>
          </Field>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-destructive/30 bg-card p-6">
        <h2 className="text-base font-semibold text-destructive">Zona de peligro</h2>
        <p className="mt-1 text-sm text-muted-foreground">Acciones irreversibles. Procede con cuidado.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.warning("Función disponible próximamente")}>
            Transferir proyecto
          </Button>
          <Button variant="destructive" size="sm" onClick={async () => {
            if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
            const id = getCurrentProjectId();
            if (!id) { toast.error("Sin proyecto activo"); return; }
            const { error } = await supabase.from("projects" as never).delete().eq("id", id);
            if (error) toast.error("No se pudo eliminar"); else { toast.success("Proyecto eliminado"); window.location.href = "/gafcore/app"; }
          }}>
            Eliminar proyecto
          </Button>
        </div>
      </section>
    </>
  );
}

function DomainsPanel({ subdomain, workspace }: { subdomain: string; workspace?: boolean }) {
  const [domain, setDomain] = useState("");
  const [list, setList] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("gafcore.domains") ?? "[]"); } catch { return []; }
  });
  const save = (next: string[]) => { setList(next); localStorage.setItem("gafcore.domains", JSON.stringify(next)); };
  return (
    <>
      <PanelHeader title={workspace ? "Dominios del espacio de trabajo" : "Dominios"} subtitle="Conecta dominios personalizados a tu proyecto publicado." />
      <section className="mt-6 rounded-xl border bg-card p-6">
        <Label>Dominio principal</Label>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">gafcore.com</code>
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`https://gafcore.com`); toast.success("Copiado"); }}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </section>
      <section className="mt-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Conectar dominio personalizado</h2>
        <p className="mt-1 text-sm text-muted-foreground">Apunta un registro A a <code>185.158.133.1</code> y agrega el dominio aquí.</p>
        <div className="mt-3 flex gap-2">
          <Input placeholder="midominio.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <Button onClick={() => { if (!domain) return; save([...list, domain]); setDomain(""); toast.success("Dominio agregado"); }}>Agregar</Button>
        </div>
        <ul className="mt-4 space-y-2">
          {list.length === 0 && <li className="text-sm text-muted-foreground">Aún no hay dominios conectados.</li>}
          {list.map((d) => (
            <li key={d} className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span>{d}</span>
              <Button size="sm" variant="ghost" onClick={() => save(list.filter((x) => x !== d))}>Quitar</Button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function GitPanel() {
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [excludeEnv, setExcludeEnv] = useState(true);
  useEffect(() => {
    const c = getIdeConfig();
    setToken(c.githubToken ?? ""); setRepo(c.githubRepo ?? "");
    setBranch(c.githubBranch ?? "main"); setExcludeEnv(c.githubExcludeEnv ?? true);
  }, []);
  const save = () => { setIdeConfig({ githubToken: token, githubRepo: repo, githubBranch: branch, githubExcludeEnv: excludeEnv }); toast.success("Conexión Git guardada"); };
  return (
    <>
      <PanelHeader title="Git" subtitle="Sincroniza tu proyecto con un repositorio de GitHub." />
      <section className="mt-6 rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2"><Github className="h-4 w-4" /><h2 className="text-base font-semibold">GitHub</h2></div>
        <div className="space-y-2">
          <Label>Personal Access Token (scope: repo)</Label>
          <Input type="password" placeholder="ghp_..." value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Repo (owner/repo)</Label><Input placeholder="usuario/mi-app" value={repo} onChange={(e) => setRepo(e.target.value)} /></div>
          <div className="space-y-2"><Label>Rama</Label><Input value={branch} onChange={(e) => setBranch(e.target.value)} /></div>
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" className="mt-0.5" checked={excludeEnv} onChange={(e) => setExcludeEnv(e.target.checked)} />
          <span>No subir <code>.env</code> al repo (recomendado).</span>
        </label>
        <Button onClick={save}>Guardar conexión</Button>
      </section>
    </>
  );
}

function WorkspacePanel({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const [name, setName] = useState(() => localStorage.getItem("gafcore.workspaceName") ?? "GafCore Workspace");
  return (
    <>
      <PanelHeader title="GafCore Workspace" subtitle="Información general del espacio de trabajo." />
      <section className="mt-6 rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label>Nombre del espacio de trabajo</Label>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={() => { localStorage.setItem("gafcore.workspaceName", name); toast.success("Nombre guardado"); }}>Guardar</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Propietario"><span className="text-sm">{email}</span></Field>
          <Field label="Plan"><span className="text-sm">{isAdmin ? "Admin (interno)" : "Free"}</span></Field>
        </div>
      </section>
    </>
  );
}

function PeoplePanel({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <PanelHeader title="Gente" subtitle="Administra los miembros con acceso al espacio de trabajo." />
      <section className="mt-6 rounded-xl border bg-card p-6">
        {isAdmin ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              La gestión avanzada de usuarios y facturación global se administra desde el backend (Supabase / panel admin).
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Solo administradores pueden gestionar miembros.</p>
        )}
      </section>
    </>
  );
}

function PlansPanel({ isAdmin, balance }: { isAdmin: boolean; balance: number }) {
  return (
    <>
      <PanelHeader title="Planes y créditos" subtitle="Consulta tu plan, créditos disponibles y opciones de pago." />
      <section className="mt-6 rounded-xl border bg-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Plan actual"><span className="text-sm font-medium">{isAdmin ? "Admin (interno)" : "Free"}</span></Field>
          <Field label="Créditos disponibles"><span className="text-sm font-medium">{isAdmin ? "Ilimitados ∞" : balance.toLocaleString()}</span></Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/gafcore" hash="planes">
              Ver planes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:soporte@gafcore.com">Facturación y soporte</a>
          </Button>
        </div>
      </section>
    </>
  );
}

function CloudPanel() {
  const [aiBudget, setAiBudget] = useState(() => Number(localStorage.getItem("gafcore.aiBudget") ?? 1));
  const [cloudBudget, setCloudBudget] = useState(() => Number(localStorage.getItem("gafcore.cloudBudget") ?? 25));
  return (
    <>
      <PanelHeader title="Equilibrio entre la nube y la IA" subtitle="Define límites mensuales de gasto para nube y modelos de IA." />
      <section className="mt-6 rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label>Presupuesto mensual de IA (USD)</Label>
          <Input type="number" min={0} value={aiBudget} onChange={(e) => setAiBudget(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Presupuesto mensual de Cloud (USD)</Label>
          <Input type="number" min={0} value={cloudBudget} onChange={(e) => setCloudBudget(Number(e.target.value))} />
        </div>
        <Button onClick={() => { localStorage.setItem("gafcore.aiBudget", String(aiBudget)); localStorage.setItem("gafcore.cloudBudget", String(cloudBudget)); toast.success("Presupuestos guardados"); }}>Guardar</Button>
      </section>
    </>
  );
}

function PrivacyPanel() {
  const [publicProject, setPublicProject] = useState(() => localStorage.getItem("gafcore.publicProject") === "1");
  const [analytics, setAnalytics] = useState(() => localStorage.getItem("gafcore.analytics") !== "0");
  const exportData = async () => {
    const { data } = await supabase.auth.getUser();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "gafcore-export.json"; a.click();
    URL.revokeObjectURL(url); toast.success("Exportación lista");
  };
  return (
    <>
      <PanelHeader title="Privacidad y seguridad" subtitle="Controla la visibilidad de tu proyecto y tus datos." />
      <section className="mt-6 rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><div className="text-sm font-medium">Proyecto público (remix)</div><div className="text-xs text-muted-foreground">Permite que otros usuarios remixen tu proyecto.</div></div>
          <Switch checked={publicProject} onCheckedChange={(v) => { setPublicProject(v); localStorage.setItem("gafcore.publicProject", v ? "1" : "0"); }} />
        </div>
        <div className="flex items-center justify-between">
          <div><div className="text-sm font-medium">Analítica anónima</div><div className="text-xs text-muted-foreground">Ayuda a mejorar GafCore con métricas anónimas.</div></div>
          <Switch checked={analytics} onCheckedChange={(v) => { setAnalytics(v); localStorage.setItem("gafcore.analytics", v ? "1" : "0"); }} />
        </div>
        <div className="border-t pt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportData}>Exportar mis datos</Button>
          <Button variant="destructive" onClick={async () => {
            if (!confirm("Cerrar sesión en este dispositivo?")) return;
            await supabase.auth.signOut(); window.location.href = "/gafcore";
          }}>Cerrar sesión</Button>
        </div>
      </section>
    </>
  );
}

function DevicesPanel() {
  const [sessionInfo, setSessionInfo] = useState<{ at: string; ua: string } | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionInfo({ at: new Date(data.session.user.last_sign_in_at ?? Date.now()).toLocaleString("es-MX"), ua: navigator.userAgent });
    });
  }, []);
  return (
    <>
      <PanelHeader title="Dispositivos y aplicaciones" subtitle="Sesiones activas con tu cuenta." />
      <section className="mt-6 rounded-xl border bg-card p-6">
        {sessionInfo ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="h-4 w-4" /> Este dispositivo</div>
              <div className="mt-1 text-xs text-muted-foreground break-all">{sessionInfo.ua}</div>
              <div className="mt-1 text-xs text-muted-foreground">Último acceso: {sessionInfo.at}</div>
            </div>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/gafcore"; }}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Cerrar sesión
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay sesión activa.</p>
        )}
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
