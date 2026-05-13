/**
 * Cliente OpenAI-compatible (`/v1/chat/completions`).
 * Configura una de: `AI_CHAT_COMPLETIONS_URL` + `AI_API_KEY`, o `OPENROUTER_API_KEY`, o `OPENAI_API_KEY`.
 */
export type AiChatConfig = {
  url: string;
  apiKey: string;
  extraHeaders: Record<string, string>;
};

export function getAiChatConfig(): AiChatConfig {
  const explicitUrl = process.env.AI_CHAT_COMPLETIONS_URL?.trim();
  const explicitKey = process.env.AI_API_KEY?.trim();

  if (explicitUrl && explicitKey) {
    return { url: explicitUrl, apiKey: explicitKey, extraHeaders: {} };
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openrouterKey) {
    return {
      url: explicitUrl ?? "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      extraHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER?.trim() || "https://gafcore.com",
        "X-Title": process.env.OPENROUTER_APP_TITLE?.trim() || "GafCore",
      },
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      url: explicitUrl ?? "https://api.openai.com/v1/chat/completions",
      apiKey: openaiKey,
      extraHeaders: {},
    };
  }

  throw new Error(
    "AI no configurado: define AI_CHAT_COMPLETIONS_URL + AI_API_KEY, o OPENROUTER_API_KEY, o OPENAI_API_KEY.",
  );
}

export async function postChatCompletions(body: unknown): Promise<Response> {
  const { url, apiKey, extraHeaders } = getAiChatConfig();
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}
