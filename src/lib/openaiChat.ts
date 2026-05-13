import type { FileItem } from "@/components/ide/CodeEditor";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export type CodeEditResult = {
  reply: string;
  files?: FileItem[]; // updated full file list (if model returned changes)
};

const SYSTEM = `Eres un asistente que modifica el código de un proyecto del usuario.
Recibes el listado actual de archivos (nombre, lenguaje, contenido) y una instrucción.
Responde SIEMPRE en JSON puro con esta forma exacta:
{
  "reply": "explicación breve para el usuario en español",
  "files": [ { "name": "...", "language": "...", "content": "..." } ]
}
Reglas:
- "files" debe contener TODOS los archivos del proyecto tras tus cambios (reemplazo completo del árbol).
- Si no hay cambios de código, devuelve "files": [] (omitir también vale).
- No incluyas markdown, no envuelvas en \`\`\`. Solo JSON válido.`;

export async function chatEditCode(
  apiKey: string,
  model: string,
  history: ChatMsg[],
  userInstruction: string,
  files: FileItem[],
): Promise<CodeEditResult> {
  const filesContext = JSON.stringify(files);
  const messages: ChatMsg[] = [
    { role: "system", content: SYSTEM },
    ...history,
    {
      role: "user",
      content: `Archivos actuales:\n${filesContext}\n\nInstrucción:\n${userInstruction}`,
    },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "{}";
  let parsed: CodeEditResult;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { reply: content };
  }
  if (parsed.files && Array.isArray(parsed.files) && parsed.files.length === 0) {
    delete parsed.files;
  }
  return parsed;
}
