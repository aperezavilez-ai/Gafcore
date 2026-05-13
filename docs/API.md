# GafCore API v1

API REST pública para integraciones con Cursor, Claude, ChatGPT y otros agentes IA.

- **Base URL:** `https://gafcore.com/api/v1`
- **OpenAPI spec:** `https://gafcore.com/api/v1/openapi.json`

## Autenticación

Cabecera `Authorization: Bearer <token>` en todas las rutas (excepto `/health`). Dos métodos:

1. **API key** — `gck_live_xxxxxxxxxxxxxxxxxxxx` (recomendado para apps externas).
2. **JWT de sesión Supabase** — útil para que el propio frontend de GafCore o el usuario logueado consuma la API.

La gestión de claves (`POST/GET/DELETE /api/v1/keys`) requiere obligatoriamente JWT.

## Crear una API key

```bash
# 1. Obtén tu JWT (lo encuentras en localStorage del navegador como sb-*-auth-token, campo access_token)
JWT="eyJhbGciOi..."

# 2. Crea la clave
curl -X POST https://gafcore.com/api/v1/keys \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cursor","scopes":["read:profile","read:releases","read:analytics","write:ai"]}'
```

Respuesta (el campo `secret` solo se muestra **una vez**):

```json
{ "data": { "id":"...", "name":"Cursor", "key_prefix":"gck_live_a1b2c3d4",
            "secret": "gck_live_a1b2c3d4...32hex...", "scopes":[...],
            "expires_at": null, "created_at": "..." }, "error": null }
```

## Endpoints

| Método | Ruta | Scope | Descripción |
|---|---|---|---|
| GET    | `/health`              | —                  | Health check |
| GET    | `/me`                  | `read:profile`     | Perfil + créditos |
| GET    | `/credits`             | `read:credits`     | Saldo de créditos |
| GET    | `/releases`            | `read:releases`    | Lista de releases (`?limit&offset&status`) |
| GET    | `/releases/{id}`       | `read:releases`    | Detalle + tracks |
| GET    | `/analytics`           | `read:analytics`   | Stats agregadas (`?days=30`) |
| GET    | `/generations`         | `read:generations` | Histórico IA (`?module&limit&offset`) |
| POST   | `/ai/generate`         | `write:ai`         | Generar texto/JSON (1 crédito) |
| GET    | `/keys`                | JWT                | Listar claves |
| POST   | `/keys`                | JWT                | Crear clave |
| DELETE | `/keys/{id}`           | JWT                | Borrar clave |

### Formato de respuesta

```json
{ "data": { ... }, "error": null }
```

```json
{ "data": null, "error": { "code": "rate_limited", "message": "..." } }
```

## Ejemplos

### curl

```bash
KEY="gck_live_xxxx..."
curl -H "Authorization: Bearer $KEY" https://gafcore.com/api/v1/me
curl -H "Authorization: Bearer $KEY" "https://gafcore.com/api/v1/releases?limit=10"
curl -X POST https://gafcore.com/api/v1/ai/generate \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"prompt":"Escribe una bio de artista urbano de 60 palabras"}'
```

### Cursor / Windsurf / Claude Desktop

Importa la spec OpenAPI directamente:

```
https://gafcore.com/api/v1/openapi.json
```

Configura un header global:

```
Authorization: Bearer gck_live_xxxx...
```

### ChatGPT Custom GPT (Action)

1. Configure → Actions → Import from URL → `https://gafcore.com/api/v1/openapi.json`
2. Authentication → API Key → Bearer → pega tu `gck_live_...`

### TypeScript / Node

```ts
const res = await fetch("https://gafcore.com/api/v1/ai/generate", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.GAFCORE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ prompt: "Dame 5 hashtags virales para reggaeton" }),
});
const { data, error } = await res.json();
```

## Scopes disponibles

- `read:profile` · `read:credits` · `read:releases` · `read:analytics` · `read:generations` · `write:ai`

Una clave creada con scopes mínimos solo puede acceder a esos endpoints. Sin el scope correcto: `403 insufficient_scope`.

## Rate limiting

- **60 req/min** por usuario (todos los endpoints).
- **10 req/min adicionales** en `/ai/generate`.
- Excedido → `429 rate_limited` con header `Retry-After`.

## Códigos de error

| Código | Significado |
|---|---|
| `unauthorized` | Falta o token inválido |
| `invalid_api_key` / `key_revoked` / `key_expired` | Problema con la API key |
| `insufficient_scope` | El scope no permite ese endpoint |
| `jwt_required` | Endpoint solo accesible con JWT (gestión de claves) |
| `invalid_query` / `invalid_body` / `invalid_json` / `invalid_id` | Validación |
| `not_found` | Recurso inexistente o sin permisos |
| `rate_limited` | Demasiadas peticiones |
| `insufficient_credits` | Saldo IA insuficiente |
| `ai_upstream_error` / `ai_credits_exhausted` / `ai_rate_limited` | Problemas del proveedor IA |
| `server_error` / `server_misconfigured` | Error interno |

## Seguridad

- TLS obligatorio (Cloudflare).
- Las claves se almacenan **solo como hash SHA-256**; el secreto en claro nunca se persiste ni se vuelve a mostrar.
- Comparación de hashes en tiempo constante.
- Todas las queries respetan la propiedad `user_id` del autenticado.
- Revoca una clave al instante con `DELETE /api/v1/keys/{id}`.

## Versionado

Esta es `v1`. Futuras versiones (`v2`, etc.) coexistirán para no romper integraciones.
