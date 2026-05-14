-- =============================================================================
-- GafCore: limpiar proyectos duplicados por usuario (mismo nombre)
-- =============================================================================
-- Para borrar TODOS los «Nuevo Proyecto» de una vez: delete-all-nuevo-proyecto-projects.sql
-- =============================================================================
-- Uso: Supabase → SQL Editor (rol con permisos suficientes, p. ej. postgres).
-- Por defecto solo afecta a filas cuyo nombre normalizado es «nuevo proyecto».
--
-- Regla: por cada (user_id, nombre normalizado) se conserva UN proyecto:
--   1) el que tenga más filas en project_files
--   2) si empate, el created_at más reciente
--   3) si empate, el id mayor (determinista)
--
-- Antes de borrar: revisa el SELECT de vista previa (descomenta o ejecuta solo esa parte).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Vista previa (opcional): descomenta y ejecuta SOLO este bloque sin BEGIN/COMMIT
-- ---------------------------------------------------------------------------
/*
WITH norm AS (
  SELECT
    id,
    user_id,
    name,
    lower(trim(both from name)) AS name_key,
    created_at
  FROM public.projects
  WHERE lower(trim(both from name)) = 'nuevo proyecto'
),
file_counts AS (
  SELECT project_id, count(*)::int AS n
  FROM public.project_files
  GROUP BY project_id
),
ranked AS (
  SELECT
    n.id,
    n.user_id,
    n.name,
    coalesce(fc.n, 0) AS file_count,
    row_number() OVER (
      PARTITION BY n.user_id, n.name_key
      ORDER BY coalesce(fc.n, 0) DESC, n.created_at DESC, n.id DESC
    ) AS rk,
    count(*) OVER (PARTITION BY n.user_id, n.name_key) AS grp_size
  FROM norm n
  LEFT JOIN file_counts fc ON fc.project_id = n.id
)
SELECT id, user_id, name, file_count, rk, grp_size
FROM ranked
WHERE grp_size > 1
ORDER BY user_id, name_key, rk;
*/

CREATE TEMP TABLE tmp_projects_to_drop (id uuid PRIMARY KEY) ON COMMIT DROP;

WITH norm AS (
  SELECT
    id,
    user_id,
    lower(trim(both from name)) AS name_key,
    created_at
  FROM public.projects
  WHERE lower(trim(both from name)) = 'nuevo proyecto'
),
file_counts AS (
  SELECT project_id, count(*)::int AS n
  FROM public.project_files
  GROUP BY project_id
),
ranked AS (
  SELECT
    n.id,
    row_number() OVER (
      PARTITION BY n.user_id, n.name_key
      ORDER BY coalesce(fc.n, 0) DESC, n.created_at DESC, n.id DESC
    ) AS rk,
    count(*) OVER (PARTITION BY n.user_id, n.name_key) AS grp_size
  FROM norm n
  LEFT JOIN file_counts fc ON fc.project_id = n.id
)
INSERT INTO tmp_projects_to_drop (id)
SELECT id
FROM ranked
WHERE grp_size > 1
  AND rk > 1;

-- Tablas con project_id sin ON DELETE hacia projects (mismo orden que en la app)
DELETE FROM public.chat_messages WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.project_snapshots WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.project_secrets WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.mcp_connections WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);
DELETE FROM public.project_publishes WHERE project_id IN (SELECT id FROM tmp_projects_to_drop);

-- project_files se elimina en cascada al borrar projects (FK ON DELETE CASCADE)
DELETE FROM public.projects WHERE id IN (SELECT id FROM tmp_projects_to_drop);

COMMIT;

-- =============================================================================
-- Variante: deduplicar CUALQUIER nombre repetido por usuario (más agresivo)
-- =============================================================================
-- Sustituye el CTE «norm» por:
--   SELECT id, user_id, lower(trim(both from name)) AS name_key
--   FROM public.projects
-- y quita el filtro «= 'nuevo proyecto'».
-- =============================================================================
