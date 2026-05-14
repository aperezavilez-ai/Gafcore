import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias amigable: muchos enlaces usan `/signup`; el flujo canónico vive en `/gafcore/register`. */
export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { plan?: string; redirect?: string } => {
    const plan = typeof search.plan === "string" ? search.plan : undefined;
    const redir =
      typeof search.redirect === "string" && search.redirect.startsWith("/") && !search.redirect.startsWith("//")
        ? search.redirect
        : undefined;
    return { plan, redirect: redir };
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/gafcore/register",
      search: {
        ...(search.plan ? { plan: search.plan } : {}),
        ...(search.redirect ? { redirect: search.redirect } : {}),
      },
    });
  },
});
