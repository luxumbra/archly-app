-- Migration: Fix test functions to handle auth constraints
-- This migration updates the test functions to work with Supabase auth constraints

-- Update create_test_user_profile function to handle auth users
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

-- Update create_sample_test_data function to handle auth constraints
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