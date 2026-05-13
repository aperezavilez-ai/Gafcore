-- Index to make rate-limit lookups fast
CREATE INDEX IF NOT EXISTS idx_gafads_events_rate_lookup
  ON public.gafads_events (campaign_id, ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.tg_gafads_events_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_count integer;
BEGIN
  IF NEW.ip_hash IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.gafads_events
  WHERE ip_hash = NEW.ip_hash
    AND (campaign_id IS NOT DISTINCT FROM NEW.campaign_id)
    AND created_at > now() - interval '1 minute';

  IF v_count >= 60 THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING HINT = 'Too many ad events from this client; try again later.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gafads_events_rate_limit ON public.gafads_events;
CREATE TRIGGER gafads_events_rate_limit
  BEFORE INSERT ON public.gafads_events
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_gafads_events_rate_limit();