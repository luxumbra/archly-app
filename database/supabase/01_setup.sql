-- Yore Database Setup - Complete Schema
-- This file creates all core tables for the Yore archaeological discovery app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE point_action_type AS ENUM (
    'discover_place',
    'visit_place',
    'favorite_place',
    'upload_photo',
    'write_review',
    'daily_login',
    'weekly_streak',
    'monthly_streak',
    'achievement_unlock',
    'ai_chat'
);

CREATE TYPE achievement_type AS ENUM (
    'discovery',
    'visitation',
    'social',
    'streak',
    'exploration',
    'knowledge'
);

CREATE TYPE place_site_type AS ENUM (
    'stone_circle',
    'roman_villa',
    'medieval_castle',
    'neolithic_monument',
    'bronze_age_site',
    'iron_age_fort',
    'anglo_saxon_site',
    'prehistoric_site',
    'historic_building',
    'archaeological_site',
    'other'
);

CREATE TYPE historical_period AS ENUM (
    'prehistoric',
    'neolithic',
    'bronze_age',
    'iron_age',
    'roman',
    'anglo_saxon',
    'medieval',
    'post_medieval',
    'modern',
    'unknown'
);

CREATE TYPE photo_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    places_discovered INTEGER DEFAULT 0 CHECK (places_discovered >= 0),
    places_visited INTEGER DEFAULT 0 CHECK (places_visited >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    last_login_date DATE,
    preferences JSONB DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT username_length CHECK (length(username) >= 3 AND length(username) <= 30),
    CONSTRAINT bio_length CHECK (length(bio) <= 500)
);

-- Archaeological Places/Sites
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_place_id TEXT UNIQUE,
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    place_type TEXT,
    site_type place_site_type,
    historical_period historical_period,
    description TEXT,
    ai_description TEXT,
    wikipedia_url TEXT,
    wikipedia_summary TEXT,
    google_rating DECIMAL(2,1) CHECK (google_rating >= 0 AND google_rating <= 5),
    google_user_ratings_total INTEGER DEFAULT 0 CHECK (google_user_ratings_total >= 0),
    avg_rating DECIMAL(2,1) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
    total_visits INTEGER DEFAULT 0 CHECK (total_visits >= 0),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    first_discovered_by UUID REFERENCES user_profiles(id),
    google_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT name_length CHECK (length(name) >= 2 AND length(name) <= 200),
    CONSTRAINT description_length CHECK (length(description) <= 2000),
    CONSTRAINT ai_description_length CHECK (length(ai_description) <= 2000),
    CONSTRAINT wikipedia_url_format CHECK (wikipedia_url IS NULL OR wikipedia_url LIKE 'https://%.wikipedia.org/%')
);

-- Point Transactions (all point awards/deductions)
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    action_type point_action_type NOT NULL,
    base_points INTEGER NOT NULL CHECK (base_points >= 0),
    bonus_points INTEGER DEFAULT 0 CHECK (bonus_points >= 0),
    total_points INTEGER NOT NULL CHECK (total_points >= 0),
    multiplier DECIMAL(3,2) DEFAULT 1.0 CHECK (multiplier >= 0.1 AND multiplier <= 10.0),
    place_id UUID REFERENCES places(id),
    reference_id UUID,
    metadata JSONB DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Place Visits
CREATE TABLE place_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    location_verified BOOLEAN DEFAULT false,
    gps_accuracy DECIMAL(10,2) CHECK (gps_accuracy IS NULL OR gps_accuracy >= 0),
    visit_duration INTEGER CHECK (visit_duration IS NULL OR visit_duration >= 0),
    notes TEXT,
    photos TEXT[],
    metadata JSONB DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_date DATE,
    CONSTRAINT notes_length CHECK (length(notes) <= 1000)
);

-- User Favorite Places
CREATE TABLE place_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

-- User-uploaded Photos
CREATE TABLE place_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    status photo_status DEFAULT 'pending',
    moderation_notes TEXT,
    metadata JSONB DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT photo_url_format CHECK (photo_url LIKE 'http%'),
    CONSTRAINT caption_length CHECK (length(caption) <= 500),
    CONSTRAINT moderation_notes_length CHECK (length(moderation_notes) <= 1000)
);

-- User Reviews and Ratings
CREATE TABLE place_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    metadata JSONB DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, place_id),
    CONSTRAINT review_length CHECK (length(review) <= 2000)
);

-- Available Achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    type achievement_type NOT NULL,
    icon_url TEXT,
    points_reward INTEGER DEFAULT 0 CHECK (points_reward >= 0),
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT name_length_achievement CHECK (length(name) >= 2 AND length(name) <= 100),
    CONSTRAINT description_length_achievement CHECK (length(description) >= 10 AND length(description) <= 500)
);

-- User Achievement Progress
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id),
    CONSTRAINT completion_consistency CHECK (
        (is_completed = true AND completed_at IS NOT NULL) OR 
        (is_completed = false AND completed_at IS NULL)
    )
);

-- Daily Login Streaks
CREATE TABLE daily_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    login_date DATE NOT NULL,
    streak_count INTEGER NOT NULL CHECK (streak_count >= 1),
    is_weekly_bonus BOOLEAN DEFAULT false,
    is_monthly_bonus BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, login_date),
    CONSTRAINT login_date_not_future CHECK (login_date <= CURRENT_DATE)
);

-- Place Discoveries (track first discoverer)
CREATE TABLE place_discoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    discovered_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    discovery_method TEXT,
    points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0),
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(place_id),
    CONSTRAINT discovery_method_length CHECK (length(discovery_method) <= 100)
);

-- AI Chat Sessions
CREATE TABLE ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id),
    session_data JSONB NOT NULL,
    message_count INTEGER DEFAULT 0 CHECK (message_count >= 0),
    total_tokens INTEGER DEFAULT 0 CHECK (total_tokens >= 0),
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
-- Geographic indexes (most critical for location-based queries)
CREATE INDEX idx_places_location ON places USING GIST (location) WHERE is_deleted = false;
CREATE INDEX idx_places_location_verified ON places USING GIST (location) WHERE is_verified = true AND is_deleted = false;

-- Places indexes
CREATE INDEX idx_places_site_type ON places (site_type) WHERE is_deleted = false;
CREATE INDEX idx_places_historical_period ON places (historical_period) WHERE is_deleted = false;
CREATE INDEX idx_places_google_place_id ON places (google_place_id) WHERE is_deleted = false;
CREATE INDEX idx_places_first_discovered_by ON places (first_discovered_by) WHERE is_deleted = false;
CREATE INDEX idx_places_avg_rating ON places (avg_rating DESC) WHERE is_deleted = false;
CREATE INDEX idx_places_total_visits ON places (total_visits DESC) WHERE is_deleted = false;
CREATE INDEX idx_places_created_at ON places (created_at DESC) WHERE is_deleted = false;

-- User profiles indexes
CREATE INDEX idx_user_profiles_username ON user_profiles (username) WHERE is_deleted = false;
CREATE INDEX idx_user_profiles_total_points ON user_profiles (total_points DESC) WHERE is_deleted = false;
CREATE INDEX idx_user_profiles_current_level ON user_profiles (current_level DESC) WHERE is_deleted = false;
CREATE INDEX idx_user_profiles_last_login ON user_profiles (last_login_date DESC) WHERE is_deleted = false;

-- Point transactions indexes
CREATE INDEX idx_point_transactions_user_id ON point_transactions (user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_point_transactions_action_type ON point_transactions (action_type, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_point_transactions_place_id ON point_transactions (place_id, created_at DESC) WHERE is_deleted = false;

-- Place visits indexes
CREATE INDEX idx_place_visits_user_id ON place_visits (user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_visits_place_id ON place_visits (place_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_visits_user_place_date ON place_visits (user_id, place_id, visit_date DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_visits_location_verified ON place_visits (location_verified, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_visits_visit_date ON place_visits (visit_date DESC) WHERE is_deleted = false;

-- Place favorites indexes
CREATE INDEX idx_place_favorites_user_id ON place_favorites (user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_favorites_place_id ON place_favorites (place_id, created_at DESC) WHERE is_deleted = false;

-- Place photos indexes
CREATE INDEX idx_place_photos_user_id ON place_photos (user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_photos_place_id ON place_photos (place_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_photos_status ON place_photos (status, created_at DESC) WHERE is_deleted = false;

-- Place reviews indexes
CREATE INDEX idx_place_reviews_user_id ON place_reviews (user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_reviews_place_id ON place_reviews (place_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_place_reviews_rating ON place_reviews (rating, created_at DESC) WHERE is_deleted = false;

-- Achievements indexes
CREATE INDEX idx_achievements_type ON achievements (type) WHERE is_active = true AND is_deleted = false;
CREATE INDEX idx_achievements_points_reward ON achievements (points_reward DESC) WHERE is_active = true AND is_deleted = false;

-- User achievements indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements (user_id, is_completed, completed_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements (achievement_id, is_completed) WHERE is_deleted = false;
CREATE INDEX idx_user_achievements_completed ON user_achievements (is_completed, completed_at DESC) WHERE is_deleted = false;

-- Daily streaks indexes
CREATE INDEX idx_daily_streaks_user_id ON daily_streaks (user_id, login_date DESC) WHERE is_deleted = false;
CREATE INDEX idx_daily_streaks_login_date ON daily_streaks (login_date DESC) WHERE is_deleted = false;

-- Place discoveries indexes
CREATE INDEX idx_place_discoveries_place_id ON place_discoveries (place_id) WHERE is_deleted = false;
CREATE INDEX idx_place_discoveries_discovered_by ON place_discoveries (discovered_by, created_at DESC) WHERE is_deleted = false;

-- AI chat sessions indexes
CREATE INDEX idx_ai_chat_sessions_user_id ON ai_chat_sessions (user_id, created_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_ai_chat_sessions_place_id ON ai_chat_sessions (place_id, created_at DESC) WHERE is_deleted = false;

-- JSONB indexes for metadata queries
CREATE INDEX idx_places_google_data ON places USING GIN (google_data) WHERE is_deleted = false;
CREATE INDEX idx_user_profiles_preferences ON user_profiles USING GIN (preferences) WHERE is_deleted = false;
CREATE INDEX idx_achievements_requirements ON achievements USING GIN (requirements) WHERE is_active = true AND is_deleted = false;

-- Unique constraint indexes to prevent duplicate visits per day
CREATE UNIQUE INDEX idx_place_visits_user_place_date_unique ON place_visits (user_id, place_id, visit_date) WHERE is_deleted = false;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create visit_date trigger function
CREATE OR REPLACE FUNCTION update_visit_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.visit_date = NEW.created_at::date;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create soft delete trigger function
CREATE OR REPLACE FUNCTION soft_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE user_profiles SET is_deleted = true, deleted_at = NOW() WHERE id = OLD.id;
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_place_photos_updated_at BEFORE UPDATE ON place_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_place_reviews_updated_at BEFORE UPDATE ON place_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_chat_sessions_updated_at BEFORE UPDATE ON ai_chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply visit_date trigger to place_visits table
CREATE TRIGGER update_place_visits_visit_date BEFORE INSERT OR UPDATE ON place_visits FOR EACH ROW EXECUTE FUNCTION update_visit_date_column();

-- Soft delete functions for each table
CREATE OR REPLACE FUNCTION soft_delete_user_profile(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_profiles SET is_deleted = true, deleted_at = NOW() WHERE id = profile_id;
    RETURN FOUND;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_place(place_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE places SET is_deleted = true, deleted_at = NOW() WHERE id = place_id;
    RETURN FOUND;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_place_visit(visit_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE place_visits SET is_deleted = true, deleted_at = NOW() WHERE id = visit_id;
    RETURN FOUND;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_place_favorite(favorite_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE place_favorites SET is_deleted = true, deleted_at = NOW() WHERE id = favorite_id;
    RETURN FOUND;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION restore_soft_deleted_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    CASE table_name
        WHEN 'user_profiles' THEN
            UPDATE user_profiles SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'places' THEN
            UPDATE places SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'place_visits' THEN
            UPDATE place_visits SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'place_favorites' THEN
            UPDATE place_favorites SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'place_photos' THEN
            UPDATE place_photos SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'place_reviews' THEN
            UPDATE place_reviews SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'point_transactions' THEN
            UPDATE point_transactions SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'achievements' THEN
            UPDATE achievements SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'user_achievements' THEN
            UPDATE user_achievements SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'daily_streaks' THEN
            UPDATE daily_streaks SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'place_discoveries' THEN
            UPDATE place_discoveries SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        WHEN 'ai_chat_sessions' THEN
            UPDATE ai_chat_sessions SET is_deleted = false, deleted_at = NULL WHERE id = record_id;
        ELSE
            RETURN false;
    END CASE;
    RETURN FOUND;
END;
$$ language 'plpgsql' SECURITY DEFINER;