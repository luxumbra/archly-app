-- Remove foreign key constraint from user_profiles table to allow standalone profiles for Laravel users

-- Drop the foreign key constraint
ALTER TABLE user_profiles 
DROP CONSTRAINT user_profiles_id_fkey;

-- The id column is now just a regular UUID column, not tied to auth.users