-- Unique constraint para upsert de project_secrets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'project_secrets_project_id_name_key'
  ) THEN
    ALTER TABLE public.project_secrets
      ADD CONSTRAINT project_secrets_project_id_name_key UNIQUE (project_id, name);
  END IF;
END $$;

-- Tabla project_publishes: histórico de publicaciones del proyecto
CREATE TABLE IF NOT EXISTS public.project_publishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  url text,
  visibility text NOT NULL DEFAULT 'public',
  snapshot_id uuid,
  file_count integer NOT NULL DEFAULT 0,
  http_status integer,
  latency_ms integer,
  error text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_publishes_project ON public.project_publishes(project_id, created_at DESC);
ALTER TABLE public.project_publishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own publishes" ON public.project_publishes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "users insert own publishes" ON public.project_publishes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own publishes" ON public.project_publishes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Tabla mcp_connections: conectores reales que el usuario activa dentro de su proyecto
CREATE TABLE IF NOT EXISTS public.mcp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  connector_id text NOT NULL,
  display_name text NOT NULL,
  kind text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'connected',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, connector_id)
);
CREATE INDEX IF NOT EXISTS idx_mcp_connections_project ON public.mcp_connections(project_id);
ALTER TABLE public.mcp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own mcp_connections" ON public.mcp_connections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_mcp_connections_updated
  BEFORE UPDATE ON public.mcp_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_project_publishes_updated
  BEFORE UPDATE ON public.project_publishes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();