REVOKE EXECUTE ON FUNCTION public.touch_api_key_used(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.api_rate_limit_hit(uuid, text, int) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.touch_api_key_used(uuid) TO service_role;
GRANT  EXECUTE ON FUNCTION public.api_rate_limit_hit(uuid, text, int) TO service_role;