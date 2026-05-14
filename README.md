# GafCore

**GafCore** — plataforma donde los usuarios crean y gestionan **sitios web y apps**. Dominio único: **gafcore.com**.

> Proyecto independiente. No mezclar con GafSuite, GafMusic ni otros del workspace.

---

## Stack

- **Framework:** [TanStack Start v1](https://tanstack.com/start) (React 19, SSR + server functions) sobre **Vite 7**
- **Routing:** TanStack Router con file-based routing en `src/routes/`
- **Estilos:** Tailwind CSS v4 (configurado en `src/styles.css` vía `@import` y theme tokens — sin `tailwind.config.js`)
- **UI:** shadcn/ui sobre Radix UI, lucide-react, sonner, recharts
- **Estado/datos:** @tanstack/react-query
- **Backend:** Supabase — Postgres + Auth + Storage + Edge Functions (proyecto propio)
- **Pagos:** Stripe + Paddle (SDKs oficiales)
- **IA:** API compatible OpenAI (`src/lib/ai-chat-completions.server.ts`) — OpenRouter, OpenAI u otro endpoint vía env
- **SSR / deploy:** TanStack Start + Nitro (p. ej. preset Vercel en `vite.config.ts`)
- **Lenguaje:** TypeScript estricto
- **Package manager:** Bun (también compatible con npm)

---

## Comandos

```bash
bun install            # instalar dependencias (o: npm install)
bun run dev            # arranca Vite dev server con HMR
bun run build          # build de producción
bun run build:dev      # build en modo development (sourcemaps, sin minify)
bun run preview        # sirve el build de producción local
bun run lint           # ESLint
bun run format         # Prettier --write .
bun run gafcore:doctor # revisa .env (Supabase + IA), sin mostrar secretos
```

Si no tienes Bun en el PATH: `npm run gafcore:doctor`, `npm run dev`, etc.

---

## Estructura del proyecto

```
src/
├── routes/                      # File-based routing (TanStack Router)
│   ├── __root.tsx               # Layout raíz (html/head/body + providers)
│   ├── index.tsx                # Home (/)
│   ├── gafcore.tsx              # Landing GafCore
│   ├── gafcore_.app.tsx         # Plataforma protegida (IDE)
│   ├── gafcore_.login.tsx       # Login
│   ├── gafcore_.register.tsx    # Registro
│   ├── dashboard/               # Dashboard de usuario (rutas anidadas)
│   │   ├── index.tsx
│   │   ├── releases.tsx
│   │   ├── analytics.tsx
│   │   ├── billing.tsx
│   │   ├── gaflyrics.tsx        # Módulo IA: letras
│   │   ├── gafcover.tsx         # Módulo IA: portadas
│   │   ├── gafads.tsx           # Módulo IA: anuncios
│   │   ├── gafsites.tsx         # Módulo IA: sitios / landings
│   │   └── ...
│   └── api/                     # Server routes (HTTP / webhooks)
│       ├── chat.ts              # Streaming chat IA
│       ├── elevenlabs/          # ElevenLabs (música, isolate)
│       └── public/              # Endpoints públicos: webhooks, OAuth callbacks
│           ├── payments/webhook.ts
│           ├── oauth.youtube.callback.ts
│           └── hooks/
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── ide/                     # Editor IDE de GafCore (Monaco, panels, dialogs)
│   └── ...                      # Secciones de landing, dashboard, etc.
├── hooks/                       # React hooks (useAuth, useCredits, useBilling, ...)
├── lib/
│   ├── server-fns/              # createServerFn (RPC tipado cliente↔servidor)
│   ├── *.functions.ts           # Server functions ad hoc
│   ├── *.server.ts              # Helpers solo servidor (bloqueados en bundle cliente)
│   ├── stripe.ts / stripe.server.ts
│   ├── paddle.ts / paddle.server.ts
│   └── utils.ts
├── integrations/
│   └── supabase/                # client.ts (auto), client.server.ts, auth-middleware.ts, types.ts (auto)
├── i18n/                        # Internacionalización (es / en)
├── styles.css                   # Tailwind v4 + design tokens (oklch)
├── router.tsx                   # Router config
└── start.ts / server.ts         # Entradas SSR
supabase/
└── config.toml                  # Config del proyecto Supabase (NO editar project_id)
```

---

## Convenciones

### Server functions (RPC tipado)

Usar `createServerFn` para llamadas cliente→servidor. Ubicación: archivos `*.functions.ts(x)` en `src/lib/` (NO en `src/server/`).

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const myFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    // process.env.* solo dentro de .handler()
    return { ok: true };
  });
```

Funciones protegidas con `requireSupabaseAuth` **no** se pueden llamar desde un `loader` de ruta pública (falla en SSR/prerender). Llamarlas desde el componente con `useServerFn` + `useQuery`, o ponerlas bajo `_authenticated/`.

### HTTP / webhooks

Endpoints públicos (webhooks, OAuth, cron) van en `src/routes/api/public/*` — siempre validar firma antes de procesar.

### Estilos y design tokens

- **Nunca** usar clases tipo `text-white`, `bg-black` directamente en componentes.
- Usar tokens semánticos: `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, etc.
- Definir nuevos colores en `src/styles.css` con `oklch(...)`.

### Roles y seguridad

- Roles en tabla aparte (`user_roles`) con función `has_role(uuid, app_role)` `SECURITY DEFINER`. **Nunca** en `profiles`.
- RLS activado en todas las tablas con datos de usuario.
- Nunca confiar en `localStorage` para chequear admin.

### Archivos auto-generados — NO editar

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/routeTree.gen.ts`
- `.env`, `.env.development`, `.env.production`

---

## Variables de entorno

**Cliente (Vite):** definir en el host o en `.env.local`:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

**Servidor:** secretos del proveedor de hosting (p. ej. Vercel). Mínimo para IA: `OPENROUTER_API_KEY` o `OPENAI_API_KEY`, o bien `AI_CHAT_COMPLETIONS_URL` + `AI_API_KEY`. Resto: Stripe, Paddle, ElevenLabs, etc. — ver `.env.example`.

---

## Despliegue

1. Conectar el repositorio al proveedor de hosting (p. ej. Vercel) y configurar el comando de build (`bun run build` o `npm run build` según el proyecto).
2. Copiar variables de entorno de cliente y servidor desde `.env.example` al panel del host.
3. En **Supabase:** aplicar migraciones, revisar RLS y URLs de redirect OAuth para tu dominio (p. ej. `https://gafcore.com/...`).
4. En **Stripe:** webhook apuntando a tu URL pública (`/api/public/payments/webhook` o la ruta que uses); precios con `lookup_key` o metadata `gafcore_price_id` según `payments.functions.ts` / webhook.
5. Tras cada push al branch conectado, el host despliega el frontend; el backend de datos sigue siendo Supabase (panel / CLI).

Dominio de producción: **gafcore.com**.

---

## Checklist “listo para producción”

| Paso | Dónde | Qué comprobar |
|------|--------|----------------|
| 1 | Host (Vercel, etc.) | `VITE_*` Supabase + secretos servidor (`OPENROUTER_API_KEY` / `OPENAI_API_KEY` / pareja `AI_*`) |
| 2 | Supabase Auth | Redirect URLs = tu dominio + rutas de login/callback reales |
| 3 | Stripe | Webhook secret + precios alineados con metadata / `lookup_key` |
| 4 | Paddle | API key y entorno (sandbox vs production) |
| 5 | Email transaccional | Si antes dependías de un proveedor externo, configurar Resend/SMTP y enlazar en el flujo que uses |

---

## Documentación adicional

- `AGENTS.md` — instrucciones para agentes IA (Claude Code, Codex, Aider, etc.)
- `.cursorrules` — reglas para Cursor
- [Docs TanStack Start](https://tanstack.com/start/latest/docs)
- [Supabase Docs](https://supabase.com/docs)
