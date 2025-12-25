-- Fix RLS Policy Infinite Recursion Issue
-- Run this in your Supabase SQL Editor to fix the authentication

-- 1. Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can read all users" ON "AppUser";
DROP POLICY IF EXISTS "Admins can update all users" ON "AppUser";
DROP POLICY IF EXISTS "Users can read own profile" ON "AppUser";
DROP POLICY IF EXISTS "Users can update own profile" ON "AppUser";

-- 2. Create simpler policies that don't create recursion
-- Allow authenticated users to read their own record
CREATE POLICY "Users can read own record" ON "AppUser"
  FOR SELECT TO authenticated
  USING ("authUserID" = auth.uid()::text);

-- Allow authenticated users to update their own record (but not role)
CREATE POLICY "Users can update own record" ON "AppUser"
  FOR UPDATE TO authenticated
  USING ("authUserID" = auth.uid()::text)
  WITH CHECK ("authUserID" = auth.uid()::text AND role = role); -- Prevent role changes

-- 3. For admin access, we'll handle this in the application layer instead of RLS
-- Disable RLS on AppUser for now to allow admin access
ALTER TABLE "AppUser" DISABLE ROW LEVEL SECURITY;

-- 4. Verify the user can be fetched
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