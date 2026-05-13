import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getIdeConfig, setIdeConfig } from "@/lib/ideConfig";

export function SettingsDialog({
  children,
  open: openProp,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    setInternalOpen(v);
  };
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubExcludeEnv, setGithubExcludeEnv] = useState(true);

  useEffect(() => {
    const c = getIdeConfig();
    setSupabaseUrl(c.supabaseUrl ?? "");
    setSupabaseKey(c.supabaseKey ?? "");
    setOpenaiKey(c.openaiKey ?? "");
    setOpenaiModel(c.openaiModel ?? "gpt-4o-mini");
    setGithubToken(c.githubToken ?? "");
    setGithubRepo(c.githubRepo ?? "");
    setGithubBranch(c.githubBranch ?? "main");
    setGithubExcludeEnv(c.githubExcludeEnv ?? true);
  }, [open]);

  const save = () => {
    setIdeConfig({
      supabaseUrl,
      supabaseKey,
      openaiKey,
      openaiModel,
      githubToken,
      githubRepo,
      githubBranch,
      githubExcludeEnv,
    });
    toast.success("Configuración guardada");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {openProp === undefined && (
        <DialogTrigger asChild>
          {children ?? (
            <Button variant="outline" size="sm" className="gap-2 border-border bg-card">
              <Settings className="h-4 w-4" />
              Configuración
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del IDE</DialogTitle>
          <DialogDescription>
            Conecta Supabase, OpenAI y GitHub. Las credenciales se guardan localmente en tu
            navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Supabase</h3>
            <div className="space-y-2">
              <Label htmlFor="sb-url">URL</Label>
              <Input id="sb-url" placeholder="https://xxxx.supabase.co" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sb-key">API Key</Label>
              <Input id="sb-key" type="password" placeholder="eyJhbGciOi..." value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">OpenAI</h3>
            <div className="space-y-2">
              <Label htmlFor="oa-key">API Key</Label>
              <Input id="oa-key" type="password" placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oa-model">Modelo</Label>
              <Input id="oa-model" placeholder="gpt-4o-mini" value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">GitHub Deploy</h3>
            <div className="space-y-2">
              <Label htmlFor="gh-token">Personal Access Token (repo scope)</Label>
              <Input id="gh-token" type="password" placeholder="ghp_..." value={githubToken} onChange={(e) => setGithubToken(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="gh-repo">Repo (owner/repo)</Label>
                <Input id="gh-repo" placeholder="usuario/mi-app" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gh-branch">Rama</Label>
                <Input id="gh-branch" placeholder="main" value={githubBranch} onChange={(e) => setGithubBranch(e.target.value)} />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={githubExcludeEnv}
                onChange={(e) => setGithubExcludeEnv(e.target.checked)}
              />
              <span>
                No subir <code>.env</code> al repo (recomendado). Se añadirá <code>.env</code> a{" "}
                <code>.gitignore</code> automáticamente.
              </span>
            </label>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Volver al IDE
          </Button>
          <Button onClick={save} className="bg-primary hover:bg-primary/90">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
