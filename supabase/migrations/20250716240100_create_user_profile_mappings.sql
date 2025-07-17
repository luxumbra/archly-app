-- Create user_profile_mappings table to bridge Laravel users with Supabase user profiles
-- This allows us to map Laravel integer user IDs to Supabase UUIDs for discovery tracking

CREATE TABLE user_profile_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laravel_user_id INTEGER NOT NULL UNIQUE,
    laravel_email TEXT NOT NULL UNIQUE,
    supabase_profile_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_user_mappings_laravel_id ON user_profile_mappings(laravel_user_id);
CREATE INDEX idx_user_mappings_email ON user_profile_mappings(laravel_email);
CREATE INDEX idx_user_mappings_supabase_id ON user_profile_mappings(supabase_profile_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profile_mappings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profile_mappings TO postgres;

-- RLS policy to allow service role full access
ALTER TABLE user_profile_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage user mappings" ON user_profile_mappings
    FOR ALL USING (true) WITH CHECK (true);