import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { requireUser } from "./elevenlabs/-_auth";
import { resolveGafcoreModelDefaults } from "@/lib/gafcore-chat.shared";
import { getAiChatConfig, postChatCompletions } from "@/lib/ai-chat-completions.server";

const SYSTEM_PROMPT = `Eres GafCore AI, asistente de la plataforma de creación con IA. Responde en español de forma clara, breve y útil. Usa markdown cuando ayude.`;

type Mode = "fast" | "reasoning" | "pro";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;

        let aiCfg: ReturnType<typeof getAiChatConfig>;
        try {
          aiCfg = getAiChatConfig();
        } catch {
          return new Response(JSON.stringify({ error: "AI not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { fast, deep } = resolveGafcoreModelDefaults(aiCfg.url);
        const MODEL_BY_MODE: Record<Mode, string> = {
          fast,
          reasoning: deep,
          pro: deep,
        };

        let body: { messages?: Array<{ role: string; content: string }>; mode?: Mode };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "messages required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const mode: Mode = body.mode && body.mode in MODEL_BY_MODE ? body.mode : "fast";
        const model = MODEL_BY_MODE[mode];

        const upstream = await postChatCompletions({
          model,
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        });

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          let msg = `AI error (${upstream.status})`;
          if (upstream.status === 429) msg = "Rate limit, intenta en unos segundos.";
          if (upstream.status === 402) msg = "Sin créditos de IA en el proveedor.";
          return new Response(JSON.stringify({ error: msg, detail: text.slice(0, 300) }), {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
