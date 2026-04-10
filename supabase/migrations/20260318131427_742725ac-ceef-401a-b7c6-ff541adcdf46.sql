CREATE OR REPLACE FUNCTION public.hash_password(_password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT crypt(_password, gen_salt('bf', 10));
$$;

CREATE OR REPLACE FUNCTION public.check_password(_password text, _hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT _hash = crypt(_password, _hash);
$$;