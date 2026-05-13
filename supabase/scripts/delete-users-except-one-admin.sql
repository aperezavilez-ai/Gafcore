-- =============================================================================
-- SOLO EJECUTAR EN SUPABASE → SQL Editor (con cuenta dueña del proyecto).
-- Borra TODOS los usuarios de Auth salvo UN administrador (primera fila en
-- user_roles con role = 'admin', por created_at).
--
-- ANTES: haz backup / export si necesitas datos de prueba.
-- DESPUÉS: revisa Authentication → Users en el panel (solo debe quedar 1).
-- =============================================================================

BEGIN;

-- 1) UUID del admin que se conserva (ajusta si tienes un correo concreto).
CREATE TEMP TABLE _keeper AS
SELECT ur.user_id AS id
FROM public.user_roles ur
WHERE ur.role = 'admin'
ORDER BY ur.created_at ASC NULLS LAST
LIMIT 1;

DO $$
DECLARE
  k uuid;
  n int;
BEGIN
  SELECT id INTO k FROM _keeper;
  IF k IS NULL THEN
    RAISE EXCEPTION 'No hay ningún usuario con role = admin en public.user_roles. Crea o promueve un admin antes.';
  END IF;
  RAISE NOTICE 'Se conserva únicamente el usuario admin: %', k;
END $$;

-- 2) Vista previa (opcional: descomenta para revisar correos que se borrarán).
-- SELECT id, email, created_at FROM auth.users WHERE id <> (SELECT id FROM _keeper);

-- 3) Datos públicos que referencian user_id (orden seguro: hijos antes que padres donde aplique).
-- Si alguna tabla no existe en tu proyecto, comenta esa línea o ejecuta por bloques.

DELETE FROM public.credit_transactions WHERE user_id <> (SELECT id FROM _keeper);
DELETE FROM public.user_credits WHERE user_id <> (SELECT id FROM _keeper);
DELETE FROM public.subscriptions WHERE user_id <> (SELECT id FROM _keeper);
DELETE FROM public.notifications WHERE user_id <> (SELECT id FROM _keeper);

DELETE FROM public.project_files
WHERE project_id IN (
  SELECT p.id FROM public.projects p WHERE p.user_id <> (SELECT id FROM _keeper)
);
DELETE FROM public.projects WHERE user_id <> (SELECT id FROM _keeper);

DELETE FROM public.generations WHERE user_id <> (SELECT id FROM _keeper);

DELETE FROM public.user_roles WHERE user_id <> (SELECT id FROM _keeper);

DELETE FROM public.profiles WHERE user_id <> (SELECT id FROM _keeper);

-- 4) Sesiones e identidades en Auth (orden habitual antes de borrar auth.users).
DELETE FROM auth.refresh_tokens
WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id <> (SELECT id FROM _keeper));
DELETE FROM auth.sessions WHERE user_id <> (SELECT id FROM _keeper);
DELETE FROM auth.identities WHERE user_id <> (SELECT id FROM _keeper);

-- 5) Usuarios en Auth.
DELETE FROM auth.users WHERE id <> (SELECT id FROM _keeper);

COMMIT;

-- Comprueba en: Authentication → Users (debe haber 1 fila).
