-- Add email column to user_profiles table for Laravel user bridging

ALTER TABLE user_profiles 
ADD COLUMN email TEXT UNIQUE;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO service_role;