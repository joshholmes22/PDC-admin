-- Admin Setup SQL for Palace Drum Clinic Database
-- Run this in your Supabase SQL Editor to set up admin privileges

-- 1. Add missing columns to AppUser table
ALTER TABLE "AppUser" 
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();

-- 2. Create an enum for user roles if needed
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- 3. Update the role column to use the enum
ALTER TABLE "AppUser" 
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE user_role USING "role"::user_role,
ALTER COLUMN "role" SET DEFAULT 'user'::user_role;

-- 4. Update Josh's record with admin role and email
UPDATE "AppUser" 
SET 
  "role" = 'admin',
  "email" = 'josh@glowingmanagement.com',
  "updatedAt" = NOW()
WHERE "authUserID" = 'e30e19df-a71b-400e-b95d-d2e145036ec1';

-- 5. Create a function to automatically sync email from auth.users
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS trigger AS $$
BEGIN
  -- Update AppUser email when auth.users email changes
  UPDATE "AppUser" 
  SET "email" = NEW.email, "updatedAt" = NOW()
  WHERE "authUserID" = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to keep emails in sync
DROP TRIGGER IF EXISTS sync_user_email_trigger ON auth.users;
CREATE TRIGGER sync_user_email_trigger
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();

-- 7. Initial sync of all existing emails
UPDATE "AppUser" 
SET 
  "email" = auth_users.email,
  "updatedAt" = NOW()
FROM auth.users AS auth_users
WHERE "AppUser"."authUserID" = auth_users.id::text
AND "AppUser"."email" IS NULL;

-- 8. Create RLS policies for admin access
-- First, enable RLS if not already enabled
ALTER TABLE "AppUser" ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to read all users
CREATE POLICY "Admins can read all users" ON "AppUser"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "AppUser" admin_user 
      WHERE admin_user."authUserID" = auth.uid()::text 
      AND admin_user."role" IN ('admin', 'super_admin')
    )
  );

-- Create policy for admins to update users
CREATE POLICY "Admins can update all users" ON "AppUser"
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "AppUser" admin_user 
      WHERE admin_user."authUserID" = auth.uid()::text 
      AND admin_user."role" IN ('admin', 'super_admin')
    )
  );

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON "AppUser"
  FOR SELECT TO authenticated
  USING ("authUserID" = auth.uid()::text);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile" ON "AppUser"
  FOR UPDATE TO authenticated
  USING ("authUserID" = auth.uid()::text);

-- 9. Verify the changes
SELECT 
  id,
  "authUserID",
  "firstName",
  "lastName",
  email,
  role,
  "createdAt"
FROM "AppUser" 
WHERE "authUserID" = 'e30e19df-a71b-400e-b95d-d2e145036ec1';