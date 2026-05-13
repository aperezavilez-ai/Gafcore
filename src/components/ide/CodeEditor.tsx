import Editor from "@monaco-editor/react";

export type FileItem = { name: string; language: string; content: string };

const initialFiles: FileItem[] = [
  {
    name: "index.html",
    language: "html",
    content: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GafCore App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`,
  },
  {
    name: "main.tsx",
    language: "typescript",
    content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
`,
  },
  {
    name: "App.tsx",
    language: "typescript",
    content: `import React from "react";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">GafCore</p>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
          Hola desde GafCore
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Tu página ya está renderizando correctamente. Edita este archivo para convertirla en tu sitio final.
        </p>
      </section>
    </main>
  );
}
`,
  },
  {
    name: "styles.css",
    language: "css",
    content: `:root { color-scheme: light; --accent: #2563eb; }
html, body, #root { height: 100%; margin: 0; }
body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #ffffff; color: #0f172a; }
`,
  },
];

export function CodeEditor({
  files,
  setFiles,
  activeIndex,
}: {
  files: FileItem[];
  setFiles: (f: FileItem[]) => void;
  activeIndex: number;
}) {
  const active = Math.min(activeIndex, files.length - 1);
  const file = files[active];

  const updateContent = (val: string | undefined) => {
    const next = [...files];
    next[active] = { ...next[active], content: val ?? "" };
    setFiles(next);
  };

  return (
    <div className="h-full bg-background">
      <Editor
        height="100%"
        theme="light"
        path={file?.name}
        language={file?.language}
        value={file?.content}
        onChange={updateContent}
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          padding: { top: 12 },
          lineNumbers: "on",
          renderLineHighlight: "all",
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}

export { initialFiles };
