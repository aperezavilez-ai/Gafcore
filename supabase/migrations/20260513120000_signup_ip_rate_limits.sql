-- Límite de intentos de registro por IP (ventana = día UTC). Solo service_role.
CREATE TABLE IF NOT EXISTS public.signup_ip_rate_limits (
  ip_hash text NOT NULL,
  bucket text NOT NULL DEFAULT 'signup_day',
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, bucket, window_start)
);

CREATE INDEX IF NOT EXISTS signup_ip_rate_limits_window_idx
  ON public.signup_ip_rate_limits (window_start);

ALTER TABLE public.signup_ip_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.signup_rate_limit_hit(p_ip_hash text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz;
  v_count int;
BEGIN
  v_window := date_trunc('day', timezone('utc', now()));

  INSERT INTO public.signup_ip_rate_limits (ip_hash, bucket, window_start, count)
  VALUES (p_ip_hash, 'signup_day', v_window, 1)
  ON CONFLICT (ip_hash, bucket, window_start)
  DO UPDATE SET count = public.signup_ip_rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.signup_rate_limit_hit(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.signup_rate_limit_hit(text) TO service_role;
