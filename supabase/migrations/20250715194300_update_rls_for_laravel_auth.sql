-- Migration: Update RLS policies to work with Laravel auth
-- This migration modifies RLS policies to be compatible with Laravel-based authentication

-- Disable RLS for public read access and use application-level authorization
-- Keep RLS for sensitive operations but make them less restrictive

-- User Profiles: Allow public read access, restrict writes
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view public profile data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- More permissive policies for Laravel auth integration
CREATE POLICY "Allow read access to user profiles" ON user_profiles
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Allow authenticated insert/update on user profiles" ON user_profiles
    FOR ALL USING (true);

-- Places: Keep public read access
DROP POLICY IF EXISTS "Anyone can view places" ON places;
DROP POLICY IF EXISTS "Authenticated users can insert places" ON places;
DROP POLICY IF EXISTS "Users can update places they discovered" ON places;

CREATE POLICY "Allow read access to places" ON places
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Allow authenticated operations on places" ON places
    FOR ALL USING (true);

-- Point Transactions: Allow authenticated access
DROP POLICY IF EXISTS "Users can view their own point transactions" ON point_transactions;
DROP POLICY IF EXISTS "System can insert point transactions" ON point_transactions;

CREATE POLICY "Allow authenticated access to point transactions" ON point_transactions
    FOR ALL USING (is_deleted = false);

-- Place Visits: Allow authenticated access
DROP POLICY IF EXISTS "Users can view their own visits" ON place_visits;
DROP POLICY IF EXISTS "Users can insert their own visits" ON place_visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON place_visits;
DROP POLICY IF EXISTS "Users can delete their own visits" ON place_visits;

CREATE POLICY "Allow authenticated access to place visits" ON place_visits
    FOR ALL USING (is_deleted = false);

-- Place Favorites: Allow authenticated access
DROP POLICY IF EXISTS "Users can view their own favorites" ON place_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON place_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON place_favorites;

CREATE POLICY "Allow authenticated access to place favorites" ON place_favorites
    FOR ALL USING (is_deleted = false);

-- Place Photos: Keep some restrictions
DROP POLICY IF EXISTS "Anyone can view approved photos" ON place_photos;
DROP POLICY IF EXISTS "Users can view their own photos" ON place_photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON place_photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON place_photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON place_photos;

CREATE POLICY "Allow read access to photos" ON place_photos
    FOR SELECT USING (
        (status = 'approved' AND is_deleted = false) OR 
        is_deleted = false
    );

CREATE POLICY "Allow authenticated operations on photos" ON place_photos
    FOR ALL USING (true);

-- Place Reviews: Public read, authenticated write
DROP POLICY IF EXISTS "Anyone can view reviews" ON place_reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON place_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON place_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON place_reviews;

CREATE POLICY "Allow read access to reviews" ON place_reviews
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Allow authenticated operations on reviews" ON place_reviews
    FOR ALL USING (true);

-- Achievements: Keep public read access
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;

CREATE POLICY "Allow read access to achievements" ON achievements
    FOR SELECT USING (is_active = true AND is_deleted = false);

-- User Achievements: Allow authenticated access
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can insert user achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can update user achievements" ON user_achievements;

CREATE POLICY "Allow authenticated access to user achievements" ON user_achievements
    FOR ALL USING (is_deleted = false);

-- Daily Streaks: Allow authenticated access
DROP POLICY IF EXISTS "Users can view their own streaks" ON daily_streaks;
DROP POLICY IF EXISTS "System can insert daily streaks" ON daily_streaks;

CREATE POLICY "Allow authenticated access to daily streaks" ON daily_streaks
    FOR ALL USING (is_deleted = false);

-- Place Discoveries: Keep public read access
DROP POLICY IF EXISTS "Anyone can view place discoveries" ON place_discoveries;
DROP POLICY IF EXISTS "System can insert place discoveries" ON place_discoveries;

CREATE POLICY "Allow read access to place discoveries" ON place_discoveries
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Allow authenticated operations on place discoveries" ON place_discoveries
    FOR ALL USING (true);

-- AI Chat Sessions: Allow authenticated access
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON ai_chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON ai_chat_sessions;

CREATE POLICY "Allow authenticated access to ai chat sessions" ON ai_chat_sessions
    FOR ALL USING (is_deleted = false);