import { FileCode, Plus, Trash2, Pencil, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileItem } from "@/components/ide/CodeEditor";

const langFromName = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "txt";
  const map: Record<string, string> = {
    js: "javascript", ts: "typescript", tsx: "typescript", jsx: "javascript",
    html: "html", css: "css", json: "json", md: "markdown",
  };
  return map[ext] || "plaintext";
};

export function FileSidebar({
  files,
  activeIndex,
  onSelect,
  setFiles,
  setActiveIndex,
}: {
  files: FileItem[];
  activeIndex: number;
  onSelect: (i: number) => void;
  setFiles: (f: FileItem[]) => void;
  setActiveIndex: (i: number) => void;
}) {
  const addFile = () => {
    const name = prompt("Nombre del archivo (ej: util.js):");
    if (!name) return;
    if (files.some((f) => f.name === name)) {
      alert("Ya existe un archivo con ese nombre.");
      return;
    }
    const next = [...files, { name, language: langFromName(name), content: "" }];
    setFiles(next);
    setActiveIndex(next.length - 1);
  };

  const renameFile = (i: number) => {
    const name = prompt("Nuevo nombre:", files[i].name);
    if (!name || name === files[i].name) return;
    if (files.some((f, idx) => f.name === name && idx !== i)) {
      alert("Ya existe un archivo con ese nombre.");
      return;
    }
    const next = [...files];
    next[i] = { ...next[i], name, language: langFromName(name) };
    setFiles(next);
  };

  const deleteFile = (i: number) => {
    if (files.length === 1) {
      alert("Debe haber al menos un archivo.");
      return;
    }
    if (!confirm(`¿Eliminar ${files[i].name}?`)) return;
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    if (activeIndex >= next.length) setActiveIndex(next.length - 1);
    else if (i < activeIndex) setActiveIndex(activeIndex - 1);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Files className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider">Archivos</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={addFile} className="h-6 w-6">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <ul className="py-1">
          {files.map((f, i) => (
            <li key={f.name + i}>
              <div
                className={`group flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer ${
                  i === activeIndex
                    ? "bg-primary/15 text-foreground border-l-2 border-l-primary"
                    : "text-muted-foreground hover:bg-card border-l-2 border-l-transparent"
                }`}
                onClick={() => onSelect(i)}
              >
                <FileCode className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{f.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); renameFile(i); }}
                  className="opacity-0 group-hover:opacity-100 hover:text-foreground"
                  title="Renombrar"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                  title="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
