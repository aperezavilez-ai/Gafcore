-- Fase 1: configuración de publicación por proyecto (aislamiento + deploy)

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS github_repo text,
  ADD COLUMN IF NOT EXISTS github_branch text NOT NULL DEFAULT 'main',
  ADD COLUMN IF NOT EXISTS deploy_site_url text,
  ADD COLUMN IF NOT EXISTS vercel_deploy_hook_url text;

COMMENT ON COLUMN public.projects.github_repo IS 'owner/repo para push desde el IDE';
COMMENT ON COLUMN public.projects.deploy_site_url IS 'URL pública del sitio (hostname o https://...) para verificación';
COMMENT ON COLUMN public.projects.vercel_deploy_hook_url IS 'Deploy hook de Vercel (opcional) tras push a GitHub';
