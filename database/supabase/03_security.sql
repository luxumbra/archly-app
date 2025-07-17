-- Yore Database Security - Row Level Security Policies
-- This file sets up RLS policies for secure data access

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can view their own profile and public data of others (exclude soft deleted)
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id AND is_deleted = false);

CREATE POLICY "Users can view public profile data" ON user_profiles
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id AND is_deleted = false);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Places Policies
-- Places are public for reading, but only authenticated users can modify (exclude soft deleted)
CREATE POLICY "Anyone can view places" ON places
    FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert places" ON places
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update places they discovered" ON places
    FOR UPDATE USING (auth.uid() = first_discovered_by AND is_deleted = false);

-- Point Transactions Policies
-- Users can only view their own point transactions (exclude soft deleted)
CREATE POLICY "Users can view their own point transactions" ON point_transactions
    FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "System can insert point transactions" ON point_transactions
    FOR INSERT WITH CHECK (true);

-- Place Visits Policies
-- Users can only view and manage their own visits (exclude soft deleted)
CREATE POLICY "Users can view their own visits" ON place_visits
    FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can insert their own visits" ON place_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visits" ON place_visits
    FOR UPDATE USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can delete their own visits" ON place_visits
    FOR DELETE USING (auth.uid() = user_id AND is_deleted = false);

-- Place Favorites Policies
-- Users can only view and manage their own favorites (exclude soft deleted)
CREATE POLICY "Users can view their own favorites" ON place_favorites
    FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can insert their own favorites" ON place_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON place_favorites
    FOR DELETE USING (auth.uid() = user_id AND is_deleted = false);

-- Place Photos Policies
-- Users can view approved photos, and manage their own photos
CREATE POLICY "Anyone can view approved photos" ON place_photos
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own photos" ON place_photos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" ON place_photos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON place_photos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON place_photos
    FOR DELETE USING (auth.uid() = user_id);

-- Place Reviews Policies
-- Reviews are public for reading, users can manage their own reviews
CREATE POLICY "Anyone can view reviews" ON place_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON place_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON place_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON place_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements Policies
-- Achievements are public for reading
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

-- User Achievements Policies
-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements" ON user_achievements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update user achievements" ON user_achievements
    FOR UPDATE USING (true);

-- Daily Streaks Policies
-- Users can view their own streak data
CREATE POLICY "Users can view their own streaks" ON daily_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert daily streaks" ON daily_streaks
    FOR INSERT WITH CHECK (true);

-- Place Discoveries Policies
-- Discoveries are public for reading
CREATE POLICY "Anyone can view place discoveries" ON place_discoveries
    FOR SELECT USING (true);

CREATE POLICY "System can insert place discoveries" ON place_discoveries
    FOR INSERT WITH CHECK (true);

-- AI Chat Sessions Policies
-- Users can only view and manage their own chat sessions
CREATE POLICY "Users can view their own chat sessions" ON ai_chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON ai_chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON ai_chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON ai_chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create admin role and policies
-- Admin users can manage all data (for moderation purposes)
CREATE ROLE yore_admin;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO yore_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO yore_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO yore_admin;

-- Admin policies for moderation
CREATE POLICY "Admins can manage all photos" ON place_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND preferences->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can manage all places" ON places
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND preferences->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can view all user data" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND preferences->>'role' = 'admin'
        )
    );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
        AND preferences->>'role' = 'admin'
    );
END;
$$;

-- Function to grant admin role
CREATE OR REPLACE FUNCTION grant_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only existing admins can grant admin role
    IF NOT is_admin() THEN
        RETURN false;
    END IF;
    
    UPDATE user_profiles
    SET preferences = preferences || jsonb_build_object('role', 'admin'),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Function to revoke admin role
CREATE OR REPLACE FUNCTION revoke_admin_role(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only existing admins can revoke admin role
    IF NOT is_admin() THEN
        RETURN false;
    END IF;
    
    UPDATE user_profiles
    SET preferences = preferences - 'role',
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_profiles (id, username, display_name, preferences)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'preferences', '{}')
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_delete() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean up user data (cascade should handle most of this)
    DELETE FROM user_profiles WHERE id = OLD.id;
    RETURN OLD;
END;
$$;

-- Create trigger for user deletion
CREATE OR REPLACE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_delete();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON places TO anon;
GRANT SELECT ON achievements TO anon;
GRANT SELECT ON place_reviews TO anon;
GRANT SELECT ON place_photos TO anon;
GRANT SELECT ON place_discoveries TO anon;
GRANT EXECUTE ON FUNCTION get_nearby_places TO anon;
GRANT EXECUTE ON FUNCTION get_place_with_user_data TO anon;