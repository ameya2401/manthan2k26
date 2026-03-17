-- Run this in the Supabase SQL Editor to allow the 'viewer' role

-- 1. Drop the existing constraint
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- 2. Add the updated constraint with 'viewer' role
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'staff', 'viewer'));

-- 3. (Optional) Create the viewer account directly if you haven't run the script
-- Replace the UUID below with a real auth user ID if you want to do it manually
-- INSERT INTO admin_users (id, email, role, name) 
-- VALUES ('AUTH_USER_ID', 'viewer@manthan.in', 'viewer', 'Manthan Viewer')
-- ON CONFLICT (email) DO UPDATE SET role = 'viewer';
