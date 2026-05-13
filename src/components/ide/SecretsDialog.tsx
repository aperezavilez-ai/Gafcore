import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeyRound, Plus, Trash2, Loader2, Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { listSecrets, upsertSecret, deleteSecret, revealSecret, type SecretRow } from "@/lib/userSupabase";

export function SecretsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [secrets, setSecrets] = useState<SecretRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const toggleReveal = async (id: string) => {
    if (revealed[id] !== undefined) {
      setRevealed((r) => {
        const n = { ...r };
        delete n[id];
        return n;
      });
      return;
    }
    const v = await revealSecret(id);
    if (v == null) {
      toast.error("No se pudo descifrar");
      return;
    }
    setRevealed((r) => ({ ...r, [id]: v }));
  };

  const refresh = async () => {
    setLoading(true);
    setSecrets(await listSecrets());
    setLoading(false);
  };

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const handleAdd = async () => {
    if (!name.trim() || !value.trim()) {
      toast.error("Nombre y valor son requeridos");
      return;
    }
    setBusy("__new");
    const ok = await upsertSecret(name, value, description.trim() || undefined);
    setBusy(null);
    if (ok) {
      toast.success(`Secreto ${name.toUpperCase()} guardado`);
      setName("");
      setValue("");
      setDescription("");
      refresh();
    } else {
      toast.error("No se pudo guardar el secreto");
    }
  };

  const handleDelete = async (id: string, secretName: string) => {
    if (!confirm(`¿Eliminar el secreto ${secretName}?`)) return;
    setBusy(id);
    const ok = await deleteSecret(id);
    setBusy(null);
    if (ok) {
      toast.success("Secreto eliminado");
      refresh();
    } else {
      toast.error("No se pudo eliminar");
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Secretos del proyecto
          </DialogTitle>
          <DialogDescription>
            Guarda API keys y tokens del proyecto. Se exportan como <code>.env</code> al
            publicar a GitHub. Los nombres se normalizan a MAYÚSCULAS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md border p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="NOMBRE_DEL_SECRETO"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-xs"
            />
            <Input
              type="password"
              placeholder="Valor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <Input
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={busy === "__new"} size="sm" className="w-full">
            {busy === "__new" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Agregar / Actualizar secreto
          </Button>
        </div>

        <ScrollArea className="h-64 rounded-md border">
          <div className="divide-y">
            {loading && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…
              </div>
            )}
            {!loading && secrets.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No hay secretos en este proyecto.
              </div>
            )}
            {secrets.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-xs font-semibold">{s.name}</span>
                    {s.description && (
                      <span className="truncate text-[10px] text-muted-foreground">
                        · {s.description}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {revealed[s.id] !== undefined ? revealed[s.id] : "•".repeat(24)}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => void toggleReveal(s.id)}
                >
                  {revealed[s.id] !== undefined ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => revealed[s.id] !== undefined && copy(revealed[s.id])}
                  disabled={revealed[s.id] === undefined}
                  title={revealed[s.id] === undefined ? "Revela primero" : "Copiar"}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleDelete(s.id, s.name)}
                  disabled={busy === s.id}
                >
                  {busy === s.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
