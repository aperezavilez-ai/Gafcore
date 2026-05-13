
DO $outer$
DECLARE v_admin uuid;
BEGIN
  SELECT user_id INTO v_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  IF v_admin IS NOT NULL THEN
    UPDATE public.projects SET user_id = v_admin WHERE user_id IS NULL;
  END IF;
END $outer$;

DELETE FROM public.projects WHERE user_id IS NULL;
ALTER TABLE public.projects ALTER COLUMN user_id SET NOT NULL;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $outer$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_oauth_states') THEN
    PERFORM cron.schedule(
      'cleanup_oauth_states',
      '*/10 * * * *',
      'SELECT public.cleanup_expired_oauth_states();'
    );
  END IF;
END $outer$;

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role manage webhook_events"
ON public.webhook_events
FOR ALL TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "admins read webhook_events"
ON public.webhook_events
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events (processed_at DESC);
