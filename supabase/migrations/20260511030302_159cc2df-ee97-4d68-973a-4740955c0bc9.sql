UPDATE auth.users
SET encrypted_password = crypt('GafCore#Admin2026', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE id = '2a979e64-7acf-42a0-860f-3179ce0870b8';