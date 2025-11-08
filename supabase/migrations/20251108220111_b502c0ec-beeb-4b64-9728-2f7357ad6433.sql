-- Create function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_password text;
BEGIN
  SELECT value INTO stored_password
  FROM settings
  WHERE key = 'admin_password'
  LIMIT 1;
  
  RETURN stored_password = password_input;
END;
$$;