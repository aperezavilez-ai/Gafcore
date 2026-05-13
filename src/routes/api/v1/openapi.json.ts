// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "GafCore API",
    version: "1.0.0",
    description:
      "API REST pública de GafCore para integraciones con Cursor, Claude, ChatGPT y otros agentes IA. Autenticación con API key (gck_live_...) o JWT de sesión.",
  },
  servers: [{ url: "https://gafcore.com" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "API key or JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          data: { nullable: true },
          error: {
            type: "object",
            properties: { code: { type: "string" }, message: { type: "string" } },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/v1/health": { get: { summary: "Health check", security: [], responses: { "200": { description: "OK" } } } },
    "/api/v1/me": { get: { summary: "Current user profile + credits", responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" } } } },
    "/api/v1/credits": { get: { summary: "Credit balance", responses: { "200": { description: "OK" } } } },
    "/api/v1/generations": {
      get: {
        summary: "AI generation history",
        parameters: [
          { name: "module", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/ai/generate": {
      post: {
        summary: "Generate text/JSON via OpenAI-compatible API (consumes 1 credit)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["prompt"],
                properties: {
                  prompt: { type: "string", maxLength: 8000 },
                  system: { type: "string", maxLength: 4000 },
                  model: { type: "string", enum: ["google/gemini-3-flash-preview", "google/gemini-2.5-flash", "google/gemini-2.5-pro", "openai/gpt-5", "openai/gpt-5-mini"] },
                  json: { type: "boolean" },
                  module: { type: "string" },
                  save: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "402": { description: "Insufficient credits" }, "429": { description: "Rate limited" } },
      },
    },
    "/api/v1/keys": {
      get: { summary: "List API keys (JWT only)", responses: { "200": { description: "OK" } } },
      post: {
        summary: "Create API key (JWT only). Secret returned ONCE.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", maxLength: 80 },
                  scopes: { type: "array", items: { type: "string" } },
                  expires_in_days: { type: "integer", minimum: 1, maximum: 365 },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/keys/{id}": {
      delete: {
        summary: "Delete API key (JWT only)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

export const Route = createFileRoute("/api/v1/openapi/json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(spec), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});
