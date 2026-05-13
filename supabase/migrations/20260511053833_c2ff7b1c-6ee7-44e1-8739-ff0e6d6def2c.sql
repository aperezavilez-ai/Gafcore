
REVOKE EXECUTE ON FUNCTION public.encrypt_project_secret(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decrypt_project_secret(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_oauth_states() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decrypt_project_secret(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_oauth_states() TO service_role;
