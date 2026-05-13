-- =============================================================
-- API Keys: claves de API para que apps externas (Cursor, Claude,
-- ChatGPT, scripts) consuman /api/v1/* en nombre del usuario.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  name        text NOT NULL,
  key_prefix  text NOT NULL UNIQUE,          -- p.ej. "gck_live_abc12345"
  key_hash    text NOT NULL,                  -- sha256(secret)
  scopes      text[] NOT NULL DEFAULT ARRAY['read:profile']::text[],
  last_used_at timestamptz,
  expires_at  timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_prefix_idx  ON public.api_keys(key_prefix);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Los usuarios ven solo sus claves (sin el hash, vía vista; aquí permitimos SELECT y la app filtra columnas)
CREATE POLICY "users_select_own_api_keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden revocar (UPDATE) sus claves: marcamos revoked_at o name
CREATE POLICY "users_update_own_api_keys"
  ON public.api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden borrar sus claves
CREATE POLICY "users_delete_own_api_keys"
  ON public.api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERTs los hace el servidor (service role) — sin política para anon/authenticated.

-- =============================================================
-- Rate limiting (uso interno del servidor).
-- =============================================================

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  user_id      uuid NOT NULL,
  bucket       text NOT NULL,                  -- 'minute' | 'hour' | 'ai_minute'
  window_start timestamptz NOT NULL,
  count        int  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, bucket, window_start)
);

CREATE INDEX IF NOT EXISTS api_rate_limits_window_idx
  ON public.api_rate_limits(window_start);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
-- Sin policies → solo accesible vía service role.

-- =============================================================
-- Helper: marcar last_used_at sin necesidad de service role en runtime
-- =============================================================

CREATE OR REPLACE FUNCTION public.touch_api_key_used(p_key_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys
     SET last_used_at = now()
   WHERE id = p_key_id;
END;
$$;

-- =============================================================
-- Helper: incrementar contador de rate limit y devolver el total
-- en la ventana actual. Atómico.
-- =============================================================

CREATE OR REPLACE FUNCTION public.api_rate_limit_hit(
  p_user_id uuid,
  p_bucket text,
  p_window_seconds int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count  int;
BEGIN
  v_window := date_trunc('second', now())
              - (extract(epoch FROM now())::bigint % p_window_seconds) * interval '1 second';

  INSERT INTO public.api_rate_limits (user_id, bucket, window_start, count)
  VALUES (p_user_id, p_bucket, v_window, 1)
  ON CONFLICT (user_id, bucket, window_start)
  DO UPDATE SET count = public.api_rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;