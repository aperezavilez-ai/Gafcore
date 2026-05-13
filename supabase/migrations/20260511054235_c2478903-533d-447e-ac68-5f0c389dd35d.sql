
DELETE FROM public.project_files a
USING public.project_files b
WHERE a.project_id = b.project_id AND a.name = b.name AND a.ctid < b.ctid;

ALTER TABLE public.project_files
  DROP CONSTRAINT IF EXISTS project_files_project_id_name_key;
ALTER TABLE public.project_files
  ADD CONSTRAINT project_files_project_id_name_key UNIQUE (project_id, name);
