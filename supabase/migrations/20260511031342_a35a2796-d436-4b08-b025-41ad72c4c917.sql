UPDATE auth.users
SET encrypted_password = crypt('Carolina1028', gen_salt('bf')),
    updated_at = now()
WHERE email = 'aperezavilez@gmail.com';