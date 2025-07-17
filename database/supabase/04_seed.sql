-- Yore Database Seed Data
-- This file contains initial data for achievements and test data

-- Insert default achievements
INSERT INTO achievements (id, name, description, type, points_reward, requirements, icon_url) VALUES
-- Discovery Achievements
(uuid_generate_v4(), 'First Discovery', 'Discover your first archaeological site', 'discovery', 50, '{"places_discovered": 1}', '/icons/achievements/first-discovery.svg'),
(uuid_generate_v4(), 'Explorer', 'Discover 5 different archaeological sites', 'discovery', 100, '{"places_discovered": 5}', '/icons/achievements/explorer.svg'),
(uuid_generate_v4(), 'Site Hunter', 'Discover 10 different archaeological sites', 'discovery', 200, '{"places_discovered": 10}', '/icons/achievements/site-hunter.svg'),
(uuid_generate_v4(), 'Master Explorer', 'Discover 25 different archaeological sites', 'discovery', 500, '{"places_discovered": 25}', '/icons/achievements/master-explorer.svg'),
(uuid_generate_v4(), 'Legendary Archaeologist', 'Discover 50 different archaeological sites', 'discovery', 1000, '{"places_discovered": 50}', '/icons/achievements/legendary.svg'),

-- Visitation Achievements
(uuid_generate_v4(), 'First Steps', 'Visit your first archaeological site', 'visitation', 25, '{"places_visited": 1}', '/icons/achievements/first-steps.svg'),
(uuid_generate_v4(), 'Wanderer', 'Visit 5 different archaeological sites', 'visitation', 75, '{"places_visited": 5}', '/icons/achievements/wanderer.svg'),
(uuid_generate_v4(), 'Pilgrim', 'Visit 10 different archaeological sites', 'visitation', 150, '{"places_visited": 10}', '/icons/achievements/pilgrim.svg'),
(uuid_generate_v4(), 'Site Hopper', 'Visit 25 different archaeological sites', 'visitation', 300, '{"places_visited": 25}', '/icons/achievements/site-hopper.svg'),
(uuid_generate_v4(), 'Time Traveler', 'Visit 50 different archaeological sites', 'visitation', 750, '{"places_visited": 50}', '/icons/achievements/time-traveler.svg'),

-- Streak Achievements
(uuid_generate_v4(), 'Daily Devotion', 'Log in for 7 consecutive days', 'streak', 100, '{"streak_days": 7}', '/icons/achievements/daily-devotion.svg'),
(uuid_generate_v4(), 'Committed Explorer', 'Log in for 14 consecutive days', 'streak', 200, '{"streak_days": 14}', '/icons/achievements/committed.svg'),
(uuid_generate_v4(), 'Dedicated Archaeologist', 'Log in for 30 consecutive days', 'streak', 500, '{"streak_days": 30}', '/icons/achievements/dedicated.svg'),
(uuid_generate_v4(), 'Unwavering Passion', 'Log in for 60 consecutive days', 'streak', 1000, '{"streak_days": 60}', '/icons/achievements/unwavering.svg'),
(uuid_generate_v4(), 'Eternal Explorer', 'Log in for 100 consecutive days', 'streak', 2000, '{"streak_days": 100}', '/icons/achievements/eternal.svg'),

-- Social Achievements
(uuid_generate_v4(), 'First Review', 'Write your first site review', 'social', 25, '{"reviews_count": 1}', '/icons/achievements/first-review.svg'),
(uuid_generate_v4(), 'Thoughtful Critic', 'Write 5 site reviews', 'social', 100, '{"reviews_count": 5}', '/icons/achievements/critic.svg'),
(uuid_generate_v4(), 'Site Reviewer', 'Write 10 site reviews', 'social', 200, '{"reviews_count": 10}', '/icons/achievements/reviewer.svg'),
(uuid_generate_v4(), 'Master Reviewer', 'Write 25 site reviews', 'social', 500, '{"reviews_count": 25}', '/icons/achievements/master-reviewer.svg'),

-- Exploration Achievements
(uuid_generate_v4(), 'Stone Age Explorer', 'Visit 3 Neolithic sites', 'exploration', 150, '{"historical_periods": {"neolithic": 3}}', '/icons/achievements/stone-age.svg'),
(uuid_generate_v4(), 'Roman Enthusiast', 'Visit 5 Roman sites', 'exploration', 200, '{"historical_periods": {"roman": 5}}', '/icons/achievements/roman.svg'),
(uuid_generate_v4(), 'Medieval Scholar', 'Visit 5 Medieval sites', 'exploration', 200, '{"historical_periods": {"medieval": 5}}', '/icons/achievements/medieval.svg'),
(uuid_generate_v4(), 'Bronze Age Specialist', 'Visit 3 Bronze Age sites', 'exploration', 150, '{"historical_periods": {"bronze_age": 3}}', '/icons/achievements/bronze-age.svg'),
(uuid_generate_v4(), 'Iron Age Expert', 'Visit 3 Iron Age sites', 'exploration', 150, '{"historical_periods": {"iron_age": 3}}', '/icons/achievements/iron-age.svg'),

-- Knowledge Achievements
(uuid_generate_v4(), 'First Favorite', 'Add your first site to favorites', 'knowledge', 10, '{"favorites_count": 1}', '/icons/achievements/first-favorite.svg'),
(uuid_generate_v4(), 'Curator', 'Add 10 sites to favorites', 'knowledge', 50, '{"favorites_count": 10}', '/icons/achievements/curator.svg'),
(uuid_generate_v4(), 'Photo Contributor', 'Upload 5 photos to sites', 'knowledge', 100, '{"photos_uploaded": 5}', '/icons/achievements/photographer.svg'),
(uuid_generate_v4(), 'Site Documentarian', 'Upload 25 photos to sites', 'knowledge', 300, '{"photos_uploaded": 25}', '/icons/achievements/documentarian.svg');

-- Insert sample places for testing (UK archaeological sites)
INSERT INTO places (
    id, name, location, address, site_type, historical_period,
    description, google_rating, is_verified, created_at
) VALUES
(uuid_generate_v4(), 'Stonehenge', ST_SetSRID(ST_MakePoint(-1.826215, 51.178844), 4326)::GEOGRAPHY, 'Amesbury, Salisbury SP4 7DE, UK', 'stone_circle', 'neolithic', 'Stonehenge is a prehistoric monument in Wiltshire, England, consisting of a ring of standing stones.', 4.4, true, NOW()),
(uuid_generate_v4(), 'Hadrian''s Wall', ST_SetSRID(ST_MakePoint(-2.0269, 54.9896), 4326)::GEOGRAPHY, 'Hadrian''s Wall Path, Hexham, UK', 'roman_villa', 'roman', 'Hadrian''s Wall is a former defensive fortification built by the Roman Empire across Northern England.', 4.6, true, NOW()),
(uuid_generate_v4(), 'Avebury Stone Circle', ST_SetSRID(ST_MakePoint(-1.8557, 51.4285), 4326)::GEOGRAPHY, 'Avebury, Marlborough SN8 1RF, UK', 'stone_circle', 'neolithic', 'Avebury is a Neolithic henge monument containing three stone circles.', 4.5, true, NOW()),
(uuid_generate_v4(), 'Maiden Castle', ST_SetSRID(ST_MakePoint(-2.4667, 50.6833), 4326)::GEOGRAPHY, 'Maiden Castle Rd, Dorchester DT2 9PP, UK', 'iron_age_fort', 'iron_age', 'Maiden Castle is an Iron Age hill fort located near Dorchester, Dorset.', 4.3, true, NOW()),
(uuid_generate_v4(), 'Silbury Hill', ST_SetSRID(ST_MakePoint(-1.8575, 51.4158), 4326)::GEOGRAPHY, 'A4 Bath Rd, Avebury, Marlborough SN8 1QJ, UK', 'neolithic_monument', 'neolithic', 'Silbury Hill is a prehistoric artificial chalk mound near Avebury in Wiltshire.', 4.2, true, NOW()),
(uuid_generate_v4(), 'Caerphilly Castle', ST_SetSRID(ST_MakePoint(-3.2178, 51.5744), 4326)::GEOGRAPHY, 'Castle St, Caerphilly CF83 1JD, UK', 'medieval_castle', 'medieval', 'Caerphilly Castle is a medieval fortification in Wales, the second largest castle in Britain.', 4.5, true, NOW()),
(uuid_generate_v4(), 'Skara Brae', ST_SetSRID(ST_MakePoint(-3.3425, 59.0489), 4326)::GEOGRAPHY, 'Skara Brae, Stromness KW16 3LR, UK', 'neolithic_monument', 'neolithic', 'Skara Brae is a stone-built Neolithic settlement on the Orkney Islands.', 4.6, true, NOW()),
(uuid_generate_v4(), 'Roman Baths', ST_SetSRID(ST_MakePoint(-2.3590, 51.3813), 4326)::GEOGRAPHY, 'Abbey Churchyard, Bath BA1 1LZ, UK', 'roman_villa', 'roman', 'The Roman Baths are a well-preserved thermae in the city of Bath, Somerset.', 4.4, true, NOW()),
(uuid_generate_v4(), 'Warwick Castle', ST_SetSRID(ST_MakePoint(-1.4851, 52.2793), 4326)::GEOGRAPHY, 'Warwick CV34 4QU, UK', 'medieval_castle', 'medieval', 'Warwick Castle is a medieval castle developed from a wooden fort built by William the Conqueror.', 4.3, true, NOW()),
(uuid_generate_v4(), 'Glastonbury Tor', ST_SetSRID(ST_MakePoint(-2.6991, 51.1444), 4326)::GEOGRAPHY, 'Glastonbury Tor, Glastonbury BA6 8BG, UK', 'historic_building', 'medieval', 'Glastonbury Tor is a hill near Glastonbury topped by the roofless St. Michael''s Tower.', 4.5, true, NOW());

-- Create a test user profile function (for development/testing only)
-- Note: This function is for testing purposes only and should not be used in production
-- In production, user profiles are created via the handle_new_user() trigger
CREATE OR REPLACE FUNCTION create_test_user_profile(
    p_user_id UUID,
    p_username TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- First create a mock auth user (this will only work in development)
    -- In production, users must be created through Supabase Auth
    BEGIN
        INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at)
        VALUES (
            p_user_id,
            COALESCE(p_email, p_username || '@example.com'),
            NOW(),
            NOW(),
            NOW()
        );
    EXCEPTION
        WHEN others THEN
            -- If we can't create the auth user, we'll skip this test
            RAISE NOTICE 'Could not create test auth user (this is expected in production): %', SQLERRM;
            RETURN NULL;
    END;
    
    -- Then create the profile
    INSERT INTO user_profiles (
        id, username, display_name, total_points, current_level
    ) VALUES (
        p_user_id,
        p_username,
        COALESCE(p_display_name, p_username),
        0,
        1
    );

    RETURN p_user_id;
END;
$$;

-- Create sample test data function
CREATE OR REPLACE FUNCTION create_sample_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_place_id UUID;
    v_created_user_id UUID;
BEGIN
    -- Create a test user
    SELECT create_test_user_profile(
        v_test_user_id,
        'test_explorer',
        'Test Explorer'
    ) INTO v_created_user_id;
    
    -- If user creation failed, exit early
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Test user creation failed - this is expected in production environments';
        RETURN;
    END IF;

    -- Get a place ID for testing
    SELECT id INTO v_place_id FROM places LIMIT 1;

    -- Simulate some user activity
    INSERT INTO place_visits (user_id, place_id, location_verified, notes)
    VALUES (v_test_user_id, v_place_id, true, 'Test visit to verify system functionality');

    INSERT INTO place_favorites (user_id, place_id)
    VALUES (v_test_user_id, v_place_id);

    INSERT INTO place_reviews (user_id, place_id, rating, review)
    VALUES (v_test_user_id, v_place_id, 5, 'Amazing historical site! Well worth the visit.');

    -- Award some test points
    INSERT INTO point_transactions (user_id, action_type, base_points, total_points, place_id)
    VALUES
        (v_test_user_id, 'discover_place', 30, 30, v_place_id),
        (v_test_user_id, 'visit_place', 10, 10, v_place_id),
        (v_test_user_id, 'favorite_place', 2, 2, v_place_id),
        (v_test_user_id, 'write_review', 5, 5, v_place_id);

    -- Update user profile with test data
    UPDATE user_profiles
    SET total_points = 47,
        current_level = 1,
        places_discovered = 1,
        places_visited = 1,
        current_streak = 1,
        last_login_date = CURRENT_DATE
    WHERE id = v_test_user_id;

    -- Add daily streak
    INSERT INTO daily_streaks (user_id, login_date, streak_count)
    VALUES (v_test_user_id, CURRENT_DATE, 1);

    -- Mark some achievements as available for testing
    INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, completed_at)
    SELECT
        v_test_user_id,
        id,
        '{"progress": 1}',
        true,
        NOW()
    FROM achievements
    WHERE name IN ('First Discovery', 'First Steps', 'First Review', 'First Favorite')
    LIMIT 4;

    -- Add some sample place photos
    INSERT INTO place_photos (id, user_id, place_id, photo_url, caption, status)
    SELECT
        uuid_generate_v4(),
        v_test_user_id,
        p.id,
        '/photos/places/' || LOWER(REPLACE(p.name, ' ', '_')) || '_1.jpg',
        'Beautiful view of ' || p.name,
        'approved'
    FROM places p
    LIMIT 5;

    RAISE NOTICE 'Sample test data created successfully with user ID: %', v_test_user_id;
END;
$$;

-- Insert some default historical periods mapping
INSERT INTO achievements (id, name, description, type, points_reward, requirements, icon_url) VALUES
(uuid_generate_v4(), 'Time Period Master', 'Visit sites from 5 different historical periods', 'exploration', 400, '{"unique_periods": 5}', '/icons/achievements/time-master.svg'),
(uuid_generate_v4(), 'Ancient Specialist', 'Visit 10 prehistoric sites', 'exploration', 300, '{"site_types": {"prehistoric": 10}}', '/icons/achievements/ancient.svg'),
(uuid_generate_v4(), 'Castle Conqueror', 'Visit 5 medieval castles', 'exploration', 250, '{"site_types": {"medieval_castle": 5}}', '/icons/achievements/castle.svg'),
(uuid_generate_v4(), 'Circle Walker', 'Visit 3 stone circles', 'exploration', 200, '{"site_types": {"stone_circle": 3}}', '/icons/achievements/circle.svg');

-- Function to reset test data (for development)
CREATE OR REPLACE FUNCTION reset_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete all test data except achievements and places
    DELETE FROM ai_chat_sessions WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM user_achievements WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM daily_streaks WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM place_discoveries WHERE discovered_by IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM place_reviews WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM place_photos WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM place_favorites WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM place_visits WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM point_transactions WHERE user_id IN (SELECT id FROM user_profiles WHERE username LIKE 'test_%');
    DELETE FROM user_profiles WHERE username LIKE 'test_%';

    RAISE NOTICE 'Test data reset completed successfully';
END;
$$;

-- Update places with some AI-enhanced data
UPDATE places
SET ai_description = 'This ancient monument represents one of humanity''s greatest prehistoric achievements, showcasing the sophisticated understanding of astronomy and engineering possessed by our Neolithic ancestors.',
    wikipedia_url = 'https://en.wikipedia.org/wiki/Stonehenge',
    wikipedia_summary = 'Stonehenge is a prehistoric monument in Wiltshire, England, 2 miles (3 km) west of Amesbury. It consists of a ring of standing stones, each around 13 feet (4.0 m) high, 7 feet (2.1 m) wide, and weighing around 25 tons.'
WHERE name = 'Stonehenge';

UPDATE places
SET ai_description = 'This remarkable Roman fortification demonstrates the military engineering prowess of the Roman Empire and their strategic approach to defending the northern frontier of Britannia.',
    wikipedia_url = 'https://en.wikipedia.org/wiki/Hadrian%27s_Wall',
    wikipedia_summary = 'Hadrian''s Wall is a former defensive fortification of the Roman province of Britannia, begun in AD 122 during the rule of Emperor Hadrian.'
WHERE name = 'Hadrian''s Wall';

-- Sample place photos will be created by the create_sample_test_data() function
-- This avoids issues with missing users during initial setup

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 'user_profiles'::TEXT, COUNT(*)::BIGINT FROM user_profiles
    UNION ALL
    SELECT 'places'::TEXT, COUNT(*)::BIGINT FROM places
    UNION ALL
    SELECT 'achievements'::TEXT, COUNT(*)::BIGINT FROM achievements
    UNION ALL
    SELECT 'point_transactions'::TEXT, COUNT(*)::BIGINT FROM point_transactions
    UNION ALL
    SELECT 'place_visits'::TEXT, COUNT(*)::BIGINT FROM place_visits
    UNION ALL
    SELECT 'place_favorites'::TEXT, COUNT(*)::BIGINT FROM place_favorites
    UNION ALL
    SELECT 'place_reviews'::TEXT, COUNT(*)::BIGINT FROM place_reviews
    UNION ALL
    SELECT 'user_achievements'::TEXT, COUNT(*)::BIGINT FROM user_achievements
    UNION ALL
    SELECT 'daily_streaks'::TEXT, COUNT(*)::BIGINT FROM daily_streaks;
END;
$$;