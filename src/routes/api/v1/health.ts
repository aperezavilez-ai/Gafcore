import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            data: { status: "ok", service: "gafcore-api", version: "v1", time: new Date().toISOString() },
            error: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
