CREATE TABLE public.project_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['billing:read']::text[],
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_api_keys_hash ON public.project_api_keys(key_hash);
CREATE INDEX idx_project_api_keys_active ON public.project_api_keys(is_active);

ALTER TABLE public.project_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage project_api_keys"
ON public.project_api_keys
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_project_api_keys_updated
BEFORE UPDATE ON public.project_api_keys
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();