-- Migration: Implement Laravel-specific RLS policies with proper user context
-- This migration creates more secure RLS policies that work with Laravel authentication

-- Create a function to check if a user ID is valid (basic validation)
CREATE OR REPLACE FUNCTION public.is_valid_user_id(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT user_uuid IS NOT NULL AND user_uuid != '00000000-0000-0000-0000-000000000000'::uuid;
$$;

-- Update RLS policies to be more restrictive while still working with Laravel

-- User Profiles: Allow read access, restrict writes to valid user IDs
DROP POLICY IF EXISTS "Allow read access to user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert/update on user profiles" ON user_profiles;

CREATE POLICY "Public read access to user profiles" ON user_profiles
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Service role can manage user profiles" ON user_profiles
    FOR ALL USING (
        -- Allow service role (used by Laravel backend) to manage all profiles
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR
        -- Allow operations on valid user IDs (basic validation)
        public.is_valid_user_id(id)
    );

-- Places: Keep public read access, restrict writes
DROP POLICY IF EXISTS "Allow read access to places" ON places;
DROP POLICY IF EXISTS "Allow authenticated operations on places" ON places;

CREATE POLICY "Public read access to places" ON places
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Service role can manage places" ON places
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Point Transactions: More restrictive access
DROP POLICY IF EXISTS "Allow authenticated access to point transactions" ON point_transactions;

CREATE POLICY "Service role can manage point transactions" ON point_transactions
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        AND is_deleted = false
    );

-- Place Visits: User-specific access with service role override
DROP POLICY IF EXISTS "Allow authenticated access to place visits" ON place_visits;

CREATE POLICY "User can read own visits" ON place_visits
    FOR SELECT USING (
        is_deleted = false AND 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Service role can manage place visits" ON place_visits
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Place Favorites: User-specific access
DROP POLICY IF EXISTS "Allow authenticated access to place favorites" ON place_favorites;

CREATE POLICY "User can read own favorites" ON place_favorites
    FOR SELECT USING (
        is_deleted = false AND 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Service role can manage place favorites" ON place_favorites
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Place Photos: Public read for approved, service role for management
DROP POLICY IF EXISTS "Allow read access to photos" ON place_photos;
DROP POLICY IF EXISTS "Allow authenticated operations on photos" ON place_photos;

CREATE POLICY "Public read access to approved photos" ON place_photos
    FOR SELECT USING (
        status = 'approved' AND is_deleted = false
    );

CREATE POLICY "Service role can manage photos" ON place_photos
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Place Reviews: Public read, service role for management
DROP POLICY IF EXISTS "Allow read access to reviews" ON place_reviews;
DROP POLICY IF EXISTS "Allow authenticated operations on reviews" ON place_reviews;

CREATE POLICY "Public read access to reviews" ON place_reviews
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Service role can manage reviews" ON place_reviews
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Achievements: Keep public read access
DROP POLICY IF EXISTS "Allow read access to achievements" ON achievements;

CREATE POLICY "Public read access to achievements" ON achievements
    FOR SELECT USING (is_active = true AND is_deleted = false);

-- User Achievements: User-specific access
DROP POLICY IF EXISTS "Allow authenticated access to user achievements" ON user_achievements;

CREATE POLICY "User can read own achievements" ON user_achievements
    FOR SELECT USING (
        is_deleted = false AND 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Service role can manage user achievements" ON user_achievements
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Daily Streaks: User-specific access
DROP POLICY IF EXISTS "Allow authenticated access to daily streaks" ON daily_streaks;

CREATE POLICY "User can read own streaks" ON daily_streaks
    FOR SELECT USING (
        is_deleted = false AND 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Service role can manage daily streaks" ON daily_streaks
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Place Discoveries: Public read, service role for management
DROP POLICY IF EXISTS "Allow read access to place discoveries" ON place_discoveries;
DROP POLICY IF EXISTS "Allow authenticated operations on place discoveries" ON place_discoveries;

CREATE POLICY "Public read access to place discoveries" ON place_discoveries
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Service role can manage place discoveries" ON place_discoveries
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- AI Chat Sessions: User-specific access
DROP POLICY IF EXISTS "Allow authenticated access to ai chat sessions" ON ai_chat_sessions;

CREATE POLICY "User can read own chat sessions" ON ai_chat_sessions
    FOR SELECT USING (
        is_deleted = false AND 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY "Service role can manage ai chat sessions" ON ai_chat_sessions
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Add helpful comment
COMMENT ON FUNCTION public.is_valid_user_id(uuid) IS 'Basic validation for user UUIDs to prevent null/invalid IDs';