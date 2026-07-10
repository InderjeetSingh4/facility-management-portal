CREATE OR REPLACE FUNCTION public.sync_user_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data 
    || jsonb_build_object('plant_id', NEW.plant_id)
    || jsonb_build_object('approval_status', NEW.approval_status)
    || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-trigger it for all users to fix the data
UPDATE public.users SET id = id;
