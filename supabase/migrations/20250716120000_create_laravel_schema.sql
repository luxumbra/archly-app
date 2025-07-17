-- Laravel Schema Setup for Supabase Integration
-- This creates a separate schema for Laravel tables to avoid conflicts with Supabase's public schema

-- Create the laravel schema
CREATE SCHEMA IF NOT EXISTS laravel;

-- Grant necessary permissions to the schema
GRANT USAGE ON SCHEMA laravel TO postgres;
GRANT USAGE ON SCHEMA laravel TO anon;
GRANT USAGE ON SCHEMA laravel TO authenticated;
GRANT USAGE ON SCHEMA laravel TO service_role;

-- Grant table creation permissions
GRANT CREATE ON SCHEMA laravel TO postgres;
GRANT CREATE ON SCHEMA laravel TO service_role;

-- Set up default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA laravel GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA laravel GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- Comment explaining the schema purpose
COMMENT ON SCHEMA laravel IS 'Schema for Laravel application tables, separated from Supabase public schema to avoid conflicts';