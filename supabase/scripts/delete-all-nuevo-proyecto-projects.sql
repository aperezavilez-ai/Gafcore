-- =============================================================================
-- GafCore: borrar TODOS los proyectos cuyo nombre es «Nuevo Proyecto» (normalizado)
-- =============================================================================
-- Ejecutar en Supabase → SQL Editor con rol postgres / service role.
--
-- Qué borra: cualquier fila en public.projects donde el nombre, sin distinguir
-- mayúsculas y tras recortar espacios, sea exactamente «nuevo proyecto».
-- También limpia tablas hijas sin ON DELETE hacia projects; project_files
-- se borra en cascada al eliminar la fila del proyecto.
--
-- Solo tu cuenta: descomenta el AND user_id y sustituye el UUID (Auth → Users).
-- =============================================================================

BEGIN;

CREATE TEMP TABLE tmp_projects_to_drop (id uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO tmp_projects_to_drop (id)
SELECT p.id
FROM public.projects p
WHERE lower(regexp_replace(trim(both from p.name), '\s+', ' ', 'g')) = 'nuevo proyecto';
-- AND p.user_id = 'PON_AQUI_TU_USER_UUID'::uuid

-- Vista previa (opcional): antes del BEGIN, ejecuta solo:
-- SELECT id, user_id, name, created_at FROM public.projects
-- WHERE lower(regexp_replace(trim(both from name), '\s+', ' ', 'g')) = 'nuevo proyecto';

DELETE FROM public.chat_messages WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.project_snapshots WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.project_secrets WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.mcp_connections WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.project_publishes WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);

DELETE FROM public.projects WHERE id IN (SELECT id FROM tmp_projects_to_drop);

COMMIT;
