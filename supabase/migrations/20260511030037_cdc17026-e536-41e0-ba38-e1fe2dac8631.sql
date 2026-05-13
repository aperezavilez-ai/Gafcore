CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (user_id, email, first_name, last_name, artist_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'artist_name'
  )
  on conflict (user_id) do update set email = excluded.email;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  insert into public.user_credits (user_id, balance, monthly_allowance, daily_limit)
  values (new.id, 10, 10, 10)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;