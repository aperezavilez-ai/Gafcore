-- 1. project_files: remove the "ownerless project" loophole
DROP POLICY IF EXISTS "Users can view own project files" ON public.project_files;
DROP POLICY IF EXISTS "Users can create own project files" ON public.project_files;
DROP POLICY IF EXISTS "Users can update own project files" ON public.project_files;
DROP POLICY IF EXISTS "Users can delete own project files" ON public.project_files;

CREATE POLICY "Users can view own project files" ON public.project_files
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND (p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));

CREATE POLICY "Users can create own project files" ON public.project_files
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can update own project files" ON public.project_files
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND (p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))))
WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND (p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));

CREATE POLICY "Users can delete own project files" ON public.project_files
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_files.project_id AND (p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))));

-- 2. project_secrets: drop plaintext requirement, blank existing values
UPDATE public.project_secrets SET value = '' WHERE value <> '';
ALTER TABLE public.project_secrets ALTER COLUMN value DROP NOT NULL;
ALTER TABLE public.project_secrets ALTER COLUMN value DROP DEFAULT;

-- 3. realtime.messages RLS for chat_messages topic scoping
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read own chat realtime" ON realtime.messages;
CREATE POLICY "Authenticated users read own chat realtime" ON realtime.messages
FOR SELECT TO authenticated
USING (
  (realtime.topic() LIKE 'chat-%')
  AND (realtime.topic() LIKE ('%-' || auth.uid()::text || '-%')
    OR realtime.topic() LIKE ('chat-' || auth.uid()::text)
    OR realtime.topic() = ('chat-user-' || auth.uid()::text))
);
