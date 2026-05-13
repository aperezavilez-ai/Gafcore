import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitCompare } from "lucide-react";
import { createTwoFilesPatch } from "diff";
import type { FileItem } from "@/components/ide/CodeEditor";
import { cn } from "@/lib/utils";

export function SnapshotDiffDialog({
  open,
  onOpenChange,
  current,
  snapshot,
  snapshotLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current: FileItem[];
  snapshot: FileItem[];
  snapshotLabel?: string | null;
}) {
  const fileNames = useMemo(() => {
    const set = new Set<string>();
    current.forEach((f) => set.add(f.name));
    snapshot.forEach((f) => set.add(f.name));
    return Array.from(set).sort();
  }, [current, snapshot]);

  const [active, setActive] = useState<string | null>(fileNames[0] ?? null);
  const activeName = active ?? fileNames[0] ?? null;

  const diffText = useMemo(() => {
    if (!activeName) return "";
    const a = snapshot.find((f) => f.name === activeName)?.content ?? "";
    const b = current.find((f) => f.name === activeName)?.content ?? "";
    if (a === b) return "(sin cambios)";
    return createTwoFilesPatch(activeName, activeName, a, b, "snapshot", "actual");
  }, [activeName, current, snapshot]);

  const changedSet = useMemo(() => {
    const s = new Set<string>();
    fileNames.forEach((n) => {
      const a = snapshot.find((f) => f.name === n)?.content ?? "";
      const b = current.find((f) => f.name === n)?.content ?? "";
      if (a !== b) s.add(n);
    });
    return s;
  }, [fileNames, current, snapshot]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Diff: {snapshotLabel ?? "snapshot"} ↔ actual
          </DialogTitle>
          <DialogDescription>
            {changedSet.size} archivo(s) con cambios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[200px_1fr] gap-3">
          <ScrollArea className="h-[420px] rounded-md border">
            <div className="divide-y">
              {fileNames.map((n) => (
                <button
                  key={n}
                  onClick={() => setActive(n)}
                  className={cn(
                    "block w-full truncate px-2 py-1.5 text-left text-xs hover:bg-muted",
                    activeName === n && "bg-muted font-medium",
                    changedSet.has(n) && "text-primary",
                  )}
                  title={n}
                >
                  {changedSet.has(n) ? "● " : "  "}
                  {n}
                </button>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea className="h-[420px] rounded-md border bg-muted/30">
            <pre className="p-3 text-xs font-mono leading-relaxed">
              {diffText.split("\n").map((line, i) => {
                let cls = "";
                if (line.startsWith("+") && !line.startsWith("+++"))
                  cls = "text-emerald-500";
                else if (line.startsWith("-") && !line.startsWith("---"))
                  cls = "text-red-500";
                else if (line.startsWith("@@")) cls = "text-blue-500";
                return (
                  <div key={i} className={cls}>
                    {line || " "}
                  </div>
                );
              })}
            </pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
