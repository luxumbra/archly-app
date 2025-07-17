-- Yore Database Test Queries
-- This file contains test queries to verify the database setup

-- Test 1: Check if all tables exist and have data
SELECT 'Database Setup Verification' as test_name;

-- Check table existence and record counts
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = tablename) as in_schema
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 'places', 'point_transactions', 'place_visits', 
    'place_favorites', 'place_photos', 'place_reviews', 'achievements', 
    'user_achievements', 'daily_streaks', 'place_discoveries', 'ai_chat_sessions'
  )
ORDER BY tablename;

-- Test 2: Verify PostGIS extension and geography functions
SELECT 'PostGIS Extension Test' as test_name;

-- Check if PostGIS is installed
SELECT postgis_version() as postgis_version;

-- Test geography functions with sample data
SELECT 
    p.name,
    ST_Y(p.location::geometry) as latitude,
    ST_X(p.location::geometry) as longitude,
    ST_AsText(p.location::geometry) as location_text
FROM places p
LIMIT 3;

-- Test 3: Test user profile creation and points system
SELECT 'User Profile and Points Test' as test_name;

-- Create test user and verify points system
DO $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_place_id UUID;
    v_points_awarded INTEGER;
    v_created_user_id UUID;
BEGIN
    -- Create test user profile using our helper function
    SELECT create_test_user_profile(
        v_test_user_id, 
        'test_user_' || EXTRACT(EPOCH FROM NOW()), 
        'Test User'
    ) INTO v_created_user_id;
    
    -- Skip test if user creation failed
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Points system test SKIPPED: Cannot create test user in production environment';
        RETURN;
    END IF;
    
    -- Get a sample place
    SELECT id INTO v_place_id FROM places LIMIT 1;
    
    -- Test award_points function
    SELECT award_points(v_test_user_id, 'discover_place', 30, v_place_id, '{"test": true}') INTO v_points_awarded;
    
    -- Verify points were awarded
    IF v_points_awarded > 0 THEN
        RAISE NOTICE 'Points system test PASSED: % points awarded', v_points_awarded;
    ELSE
        RAISE NOTICE 'Points system test FAILED: No points awarded';
    END IF;
    
    -- Clean up test data
    DELETE FROM point_transactions WHERE user_id = v_test_user_id;
    DELETE FROM user_profiles WHERE id = v_test_user_id;
    -- Clean up auth user if it was created
    BEGIN
        DELETE FROM auth.users WHERE id = v_test_user_id;
    EXCEPTION
        WHEN others THEN
            NULL; -- Ignore errors if auth table doesn't exist or is protected
    END;
END $$;

-- Test 4: Test place search and nearby functionality
SELECT 'Place Search Test' as test_name;

-- Test get_nearby_places function (using Stonehenge coordinates)
SELECT 
    p.name,
    p.distance_meters,
    p.site_type,
    p.historical_period
FROM get_nearby_places(51.178844, -1.826215, 50000, 10) p;

-- Test 5: Test daily login streak functionality
SELECT 'Daily Login Test' as test_name;

DO $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_login_result JSONB;
    v_created_user_id UUID;
BEGIN
    -- Create test user using our helper function
    SELECT create_test_user_profile(
        v_test_user_id, 
        'login_test_' || EXTRACT(EPOCH FROM NOW()), 
        'Login Test User'
    ) INTO v_created_user_id;
    
    -- Skip test if user creation failed
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Daily login test SKIPPED: Cannot create test user in production environment';
        RETURN;
    END IF;
    
    -- Test daily login function
    SELECT handle_daily_login(v_test_user_id) INTO v_login_result;
    
    -- Verify login result
    IF (v_login_result->>'current_streak')::INTEGER > 0 THEN
        RAISE NOTICE 'Daily login test PASSED: %', v_login_result;
    ELSE
        RAISE NOTICE 'Daily login test FAILED: %', v_login_result;
    END IF;
    
    -- Clean up test data
    DELETE FROM daily_streaks WHERE user_id = v_test_user_id;
    DELETE FROM point_transactions WHERE user_id = v_test_user_id;
    DELETE FROM user_profiles WHERE id = v_test_user_id;
    -- Clean up auth user if it was created
    BEGIN
        DELETE FROM auth.users WHERE id = v_test_user_id;
    EXCEPTION
        WHEN others THEN
            NULL; -- Ignore errors if auth table doesn't exist or is protected
    END;
END $$;

-- Test 6: Test place visit recording and generated column
SELECT 'Place Visit Test' as test_name;

DO $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_place_id UUID;
    v_visit_id UUID;
    v_visit_date DATE;
    v_expected_date DATE := CURRENT_DATE;
    v_created_user_id UUID;
BEGIN
    -- Create test user using our helper function
    SELECT create_test_user_profile(
        v_test_user_id, 
        'visit_test_' || EXTRACT(EPOCH FROM NOW()), 
        'Visit Test User'
    ) INTO v_created_user_id;
    
    -- Skip test if user creation failed
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Place visit test SKIPPED: Cannot create test user in production environment';
        RETURN;
    END IF;
    
    -- Get a sample place
    SELECT id INTO v_place_id FROM places LIMIT 1;
    
    -- Test place visit function
    SELECT record_place_visit(v_test_user_id, v_place_id, true, 5.0, 'Test visit') INTO v_visit_id;
    
    -- Verify visit was recorded and generated column works
    IF v_visit_id IS NOT NULL THEN
        -- Check generated column
        SELECT visit_date INTO v_visit_date FROM place_visits WHERE id = v_visit_id;
        
        IF v_visit_date = v_expected_date THEN
            RAISE NOTICE 'Place visit test PASSED: Visit ID % with generated date %', v_visit_id, v_visit_date;
        ELSE
            RAISE NOTICE 'Place visit test FAILED: Generated date mismatch. Expected %, got %', v_expected_date, v_visit_date;
        END IF;
    ELSE
        RAISE NOTICE 'Place visit test FAILED: No visit ID returned';
    END IF;
    
    -- Clean up test data
    DELETE FROM place_visits WHERE user_id = v_test_user_id;
    DELETE FROM point_transactions WHERE user_id = v_test_user_id;
    DELETE FROM user_profiles WHERE id = v_test_user_id;
    -- Clean up auth user if it was created
    BEGIN
        DELETE FROM auth.users WHERE id = v_test_user_id;
    EXCEPTION
        WHEN others THEN
            NULL; -- Ignore errors if auth table doesn't exist or is protected
    END;
END $$;

-- Test 7: Test place favorites functionality
SELECT 'Place Favorites Test' as test_name;

DO $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_place_id UUID;
    v_favorite_id UUID;
    v_created_user_id UUID;
BEGIN
    -- Create test user using our helper function
    SELECT create_test_user_profile(
        v_test_user_id, 
        'favorite_test_' || EXTRACT(EPOCH FROM NOW()), 
        'Favorite Test User'
    ) INTO v_created_user_id;
    
    -- Skip test if user creation failed
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Place favorite test SKIPPED: Cannot create test user in production environment';
        RETURN;
    END IF;
    
    -- Get a sample place
    SELECT id INTO v_place_id FROM places LIMIT 1;
    
    -- Test add favorite function
    SELECT add_place_favorite(v_test_user_id, v_place_id) INTO v_favorite_id;
    
    -- Verify favorite was added
    IF v_favorite_id IS NOT NULL THEN
        RAISE NOTICE 'Place favorite test PASSED: Favorite ID %', v_favorite_id;
    ELSE
        RAISE NOTICE 'Place favorite test FAILED: No favorite ID returned';
    END IF;
    
    -- Clean up test data
    DELETE FROM place_favorites WHERE user_id = v_test_user_id;
    DELETE FROM point_transactions WHERE user_id = v_test_user_id;
    DELETE FROM user_profiles WHERE id = v_test_user_id;
    -- Clean up auth user if it was created
    BEGIN
        DELETE FROM auth.users WHERE id = v_test_user_id;
    EXCEPTION
        WHEN others THEN
            NULL; -- Ignore errors if auth table doesn't exist or is protected
    END;
END $$;

-- Test 8: Test achievements system
SELECT 'Achievement System Test' as test_name;

DO $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_achievement_result JSONB;
    v_created_user_id UUID;
BEGIN
    -- Create test user using our helper function
    SELECT create_test_user_profile(
        v_test_user_id, 
        'achievement_test_' || EXTRACT(EPOCH FROM NOW()), 
        'Achievement Test User'
    ) INTO v_created_user_id;
    
    -- Skip test if user creation failed
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Achievement test SKIPPED: Cannot create test user in production environment';
        RETURN;
    END IF;
    
    -- Update user with some activity for testing
    UPDATE user_profiles SET places_discovered = 1 WHERE id = v_test_user_id;
    
    -- Test achievement checking
    SELECT check_achievements(v_test_user_id, 'discover_place') INTO v_achievement_result;
    
    -- Verify achievement result
    IF v_achievement_result IS NOT NULL THEN
        RAISE NOTICE 'Achievement test PASSED: %', v_achievement_result;
    ELSE
        RAISE NOTICE 'Achievement test FAILED: No result returned';
    END IF;
    
    -- Clean up test data
    DELETE FROM user_achievements WHERE user_id = v_test_user_id;
    DELETE FROM point_transactions WHERE user_id = v_test_user_id;
    DELETE FROM user_profiles WHERE id = v_test_user_id;
    -- Clean up auth user if it was created
    BEGIN
        DELETE FROM auth.users WHERE id = v_test_user_id;
    EXCEPTION
        WHEN others THEN
            NULL; -- Ignore errors if auth table doesn't exist or is protected
    END;
END $$;

-- Test 9: Test RLS policies
SELECT 'RLS Policy Test' as test_name;

-- Check if RLS is enabled on all tables
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 'places', 'point_transactions', 'place_visits', 
    'place_favorites', 'place_photos', 'place_reviews', 'achievements', 
    'user_achievements', 'daily_streaks', 'place_discoveries', 'ai_chat_sessions'
  )
ORDER BY tablename;

-- Test 10: Test unique constraint on generated column
SELECT 'Generated Column Unique Constraint Test' as test_name;

DO $$
DECLARE
    v_test_user_id UUID := uuid_generate_v4();
    v_place_id UUID;
    v_visit_id_1 UUID;
    v_visit_id_2 UUID;
    v_constraint_violated BOOLEAN := false;
    v_created_user_id UUID;
BEGIN
    -- Create test user using our helper function
    SELECT create_test_user_profile(
        v_test_user_id, 
        'unique_test_' || EXTRACT(EPOCH FROM NOW()), 
        'Unique Test User'
    ) INTO v_created_user_id;
    
    -- Skip test if user creation failed
    IF v_created_user_id IS NULL THEN
        RAISE NOTICE 'Generated column unique constraint test SKIPPED: Cannot create test user in production environment';
        RETURN;
    END IF;
    
    -- Get a sample place
    SELECT id INTO v_place_id FROM places LIMIT 1;
    
    -- Insert first visit
    INSERT INTO place_visits (user_id, place_id, location_verified, notes)
    VALUES (v_test_user_id, v_place_id, true, 'First visit today')
    RETURNING id INTO v_visit_id_1;
    
    -- Try to insert second visit on same day (should fail)
    BEGIN
        INSERT INTO place_visits (user_id, place_id, location_verified, notes)
        VALUES (v_test_user_id, v_place_id, true, 'Second visit today')
        RETURNING id INTO v_visit_id_2;
    EXCEPTION
        WHEN unique_violation THEN
            v_constraint_violated := true;
    END;
    
    -- Verify constraint worked
    IF v_constraint_violated THEN
        RAISE NOTICE 'Generated column unique constraint test PASSED: Prevented duplicate visit on same day';
    ELSE
        RAISE NOTICE 'Generated column unique constraint test FAILED: Allowed duplicate visit on same day';
    END IF;
    
    -- Clean up test data
    DELETE FROM place_visits WHERE user_id = v_test_user_id;
    DELETE FROM point_transactions WHERE user_id = v_test_user_id;
    DELETE FROM user_profiles WHERE id = v_test_user_id;
    -- Clean up auth user if it was created
    BEGIN
        DELETE FROM auth.users WHERE id = v_test_user_id;
    EXCEPTION
        WHEN others THEN
            NULL; -- Ignore errors if auth table doesn't exist or is protected
    END;
END $$;

-- Test 11: Test indexes for performance
SELECT 'Index Performance Test' as test_name;

-- Check if key indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('places', 'user_profiles', 'point_transactions', 'place_visits')
ORDER BY tablename, indexname;

-- Final summary
SELECT 'Test Summary' as test_name;
SELECT 'All tests completed. Check the output above for any failures.' as message;

-- Show database statistics
SELECT * FROM get_database_stats() ORDER BY table_name;