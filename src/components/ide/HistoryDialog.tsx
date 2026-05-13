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
import { History, Plus, RotateCcw, Trash2, Loader2, GitCompare } from "lucide-react";
import { toast } from "sonner";
import {
  listSnapshots,
  createSnapshot,
  loadSnapshotFiles,
  deleteSnapshot,
  type SnapshotRow,
} from "@/lib/userSupabase";
import type { FileItem } from "@/components/ide/CodeEditor";
import { SnapshotDiffDialog } from "@/components/ide/SnapshotDiffDialog";

export function HistoryDialog({
  open,
  onOpenChange,
  files,
  onRestore,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  files: FileItem[];
  onRestore: (files: FileItem[]) => void;
}) {
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [diffSnap, setDiffSnap] = useState<{ files: FileItem[]; label: string | null } | null>(null);

  const refresh = async () => {
    setLoading(true);
    const list = await listSnapshots();
    setSnapshots(list);
    setLoading(false);
  };

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  const handleCreate = async () => {
    setBusyId("__new");
    const ok = await createSnapshot(files, label.trim() || undefined);
    setBusyId(null);
    if (ok) {
      toast.success("Versión guardada");
      setLabel("");
      refresh();
    } else {
      toast.error("No se pudo guardar la versión");
    }
  };

  const handleRestore = async (id: string) => {
    setBusyId(id);
    const restored = await loadSnapshotFiles(id);
    setBusyId(null);
    if (restored && restored.length > 0) {
      onRestore(restored);
      toast.success(`Versión restaurada (${restored.length} archivos)`);
      onOpenChange(false);
    } else {
      toast.error("No se pudo restaurar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta versión?")) return;
    setBusyId(id);
    const ok = await deleteSnapshot(id);
    setBusyId(null);
    if (ok) {
      toast.success("Versión eliminada");
      refresh();
    } else {
      toast.error("No se pudo eliminar");
    }
  };

  const handleDiff = async (s: SnapshotRow) => {
    setBusyId(s.id);
    const snapFiles = await loadSnapshotFiles(s.id);
    setBusyId(null);
    if (snapFiles) setDiffSnap({ files: snapFiles, label: s.label });
    else toast.error("No se pudo cargar el diff");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de versiones
          </DialogTitle>
          <DialogDescription>
            Guarda capturas del estado actual del proyecto y restáuralas cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Etiqueta (opcional): 'antes de refactor'"
          />
          <Button onClick={handleCreate} disabled={busyId === "__new"} size="sm">
            {busyId === "__new" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Guardar versión
          </Button>
        </div>

        <ScrollArea className="h-72 rounded-md border">
          <div className="divide-y">
            {loading && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…
              </div>
            )}
            {!loading && snapshots.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Aún no hay versiones guardadas.
              </div>
            )}
            {snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {s.label ?? "Sin etiqueta"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()} · {s.file_count} archivos
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDiff(s)}
                    disabled={!!busyId}
                    title="Ver cambios"
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(s.id)}
                    disabled={!!busyId}
                  >
                    {busyId === s.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(s.id)}
                    disabled={!!busyId}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
      {diffSnap && (
        <SnapshotDiffDialog
          open={!!diffSnap}
          onOpenChange={(v) => !v && setDiffSnap(null)}
          current={files}
          snapshot={diffSnap.files}
          snapshotLabel={diffSnap.label}
        />
      )}
    </Dialog>
  );
}
