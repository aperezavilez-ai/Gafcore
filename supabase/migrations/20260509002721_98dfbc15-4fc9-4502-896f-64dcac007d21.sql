CREATE TABLE public.project_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (project_id, name)
);

CREATE INDEX idx_project_secrets_project ON public.project_secrets (project_id);

ALTER TABLE public.project_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own project secrets" ON public.project_secrets
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users create own project secrets" ON public.project_secrets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own project secrets" ON public.project_secrets
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users delete own project secrets" ON public.project_secrets
  FOR DELETE TO authenticated
  USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_project_secrets_updated_at
  BEFORE UPDATE ON public.project_secrets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();