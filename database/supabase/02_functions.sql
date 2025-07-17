-- Yore Database Functions - Business Logic
-- This file contains all PostgreSQL functions for the Yore app

-- Function to award points with bonuses and multipliers
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_action_type point_action_type,
    p_base_points INTEGER,
    p_place_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bonus_points INTEGER := 0;
    v_multiplier DECIMAL(3,2) := 1.0;
    v_total_points INTEGER;
    v_current_streak INTEGER := 0;
    v_reference_id UUID;
BEGIN
    -- Get current user streak for potential bonuses
    SELECT current_streak INTO v_current_streak
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- Calculate bonuses based on action type and conditions
    CASE p_action_type
        WHEN 'discover_place' THEN
            -- Check if this is a verified GPS location
            IF (p_metadata->>'location_verified')::BOOLEAN = true THEN
                v_multiplier := 1.5;
            END IF;
            
        WHEN 'visit_place' THEN
            -- GPS verification bonus
            IF (p_metadata->>'location_verified')::BOOLEAN = true THEN
                v_bonus_points := 5;
            END IF;
            
        WHEN 'daily_login' THEN
            -- Streak bonuses
            IF v_current_streak >= 7 THEN
                v_bonus_points := 10; -- Weekly bonus
            END IF;
            IF v_current_streak >= 30 THEN
                v_bonus_points := 50; -- Monthly bonus
            END IF;
            
        WHEN 'weekly_streak' THEN
            v_bonus_points := 25;
            
        WHEN 'monthly_streak' THEN
            v_bonus_points := 100;
            
        ELSE
            -- Default case, no bonuses
            NULL;
    END CASE;
    
    -- Calculate total points
    v_total_points := (p_base_points * v_multiplier) + v_bonus_points;
    
    -- Generate reference ID if not provided
    v_reference_id := COALESCE((p_metadata->>'reference_id')::UUID, uuid_generate_v4());
    
    -- Insert transaction record
    INSERT INTO point_transactions (
        user_id, action_type, base_points, bonus_points, total_points, 
        multiplier, place_id, reference_id, metadata
    )
    VALUES (
        p_user_id, p_action_type, p_base_points, v_bonus_points, v_total_points,
        v_multiplier, p_place_id, v_reference_id, p_metadata
    );
    
    -- Update user's total points
    UPDATE user_profiles
    SET total_points = total_points + v_total_points,
        current_level = FLOOR((total_points + v_total_points) / 100) + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update place visit count if applicable
    IF p_place_id IS NOT NULL AND p_action_type = 'visit_place' THEN
        UPDATE places
        SET total_visits = total_visits + 1,
            updated_at = NOW()
        WHERE id = p_place_id;
    END IF;
    
    RETURN v_total_points;
END;
$$;

-- Function to handle daily login streaks
CREATE OR REPLACE FUNCTION handle_daily_login(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_last_login DATE;
    v_current_streak INTEGER := 0;
    v_new_streak INTEGER := 0;
    v_is_weekly_bonus BOOLEAN := false;
    v_is_monthly_bonus BOOLEAN := false;
    v_points_awarded INTEGER := 0;
    v_result JSONB;
BEGIN
    -- Get user's last login date and current streak
    SELECT last_login_date, current_streak, longest_streak
    INTO v_last_login, v_current_streak, v_new_streak
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- Check if user already logged in today
    IF v_last_login = v_today THEN
        RETURN jsonb_build_object(
            'already_logged_in', true,
            'current_streak', v_current_streak,
            'points_awarded', 0
        );
    END IF;
    
    -- Calculate new streak
    IF v_last_login = v_yesterday THEN
        -- Continue streak
        v_new_streak := v_current_streak + 1;
    ELSE
        -- Start new streak
        v_new_streak := 1;
    END IF;
    
    -- Check for weekly bonus (every 7 days)
    IF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN
        v_is_weekly_bonus := true;
    END IF;
    
    -- Check for monthly bonus (every 30 days)
    IF v_new_streak > 0 AND v_new_streak % 30 = 0 THEN
        v_is_monthly_bonus := true;
    END IF;
    
    -- Insert streak record
    INSERT INTO daily_streaks (user_id, login_date, streak_count, is_weekly_bonus, is_monthly_bonus)
    VALUES (p_user_id, v_today, v_new_streak, v_is_weekly_bonus, v_is_monthly_bonus);
    
    -- Award points for daily login
    v_points_awarded := award_points(
        p_user_id, 
        'daily_login', 
        5, 
        NULL, 
        jsonb_build_object('streak_count', v_new_streak)
    );
    
    -- Award additional points for weekly/monthly bonuses
    IF v_is_weekly_bonus THEN
        v_points_awarded := v_points_awarded + award_points(
            p_user_id, 
            'weekly_streak', 
            25, 
            NULL, 
            jsonb_build_object('streak_count', v_new_streak)
        );
    END IF;
    
    IF v_is_monthly_bonus THEN
        v_points_awarded := v_points_awarded + award_points(
            p_user_id, 
            'monthly_streak', 
            100, 
            NULL, 
            jsonb_build_object('streak_count', v_new_streak)
        );
    END IF;
    
    -- Update user profile
    UPDATE user_profiles
    SET last_login_date = v_today,
        current_streak = v_new_streak,
        longest_streak = GREATEST(longest_streak, v_new_streak),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return result
    v_result := jsonb_build_object(
        'already_logged_in', false,
        'current_streak', v_new_streak,
        'points_awarded', v_points_awarded,
        'is_weekly_bonus', v_is_weekly_bonus,
        'is_monthly_bonus', v_is_monthly_bonus
    );
    
    RETURN v_result;
END;
$$;

-- Function to upsert place from Google Places API
CREATE OR REPLACE FUNCTION upsert_place_from_api(
    p_google_place_id TEXT,
    p_name TEXT,
    p_lat DECIMAL,
    p_lng DECIMAL,
    p_address TEXT,
    p_place_type TEXT,
    p_google_data JSONB DEFAULT '{}',
    p_discovered_by UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_place_id UUID;
    v_location GEOGRAPHY;
    v_existing_place UUID;
BEGIN
    -- Create geography point
    v_location := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY;
    
    -- Check if place already exists
    SELECT id INTO v_existing_place
    FROM places
    WHERE google_place_id = p_google_place_id;
    
    IF v_existing_place IS NOT NULL THEN
        -- Update existing place
        UPDATE places
        SET name = p_name,
            location = v_location,
            address = p_address,
            place_type = p_place_type,
            description = COALESCE(p_description, description),
            google_data = p_google_data,
            updated_at = NOW()
        WHERE id = v_existing_place;
        
        RETURN v_existing_place;
    ELSE
        -- Insert new place
        INSERT INTO places (
            google_place_id, name, location, address, place_type, 
            description, google_data, first_discovered_by
        )
        VALUES (
            p_google_place_id, p_name, v_location, p_address, p_place_type,
            p_description, p_google_data, p_discovered_by
        )
        RETURNING id INTO v_place_id;
        
        -- Record discovery if user provided
        IF p_discovered_by IS NOT NULL THEN
            INSERT INTO place_discoveries (place_id, discovered_by, discovery_method, points_awarded)
            VALUES (v_place_id, p_discovered_by, 'api_search', 30);
            
            -- Award discovery points
            PERFORM award_points(
                p_discovered_by, 
                'discover_place', 
                30, 
                v_place_id,
                jsonb_build_object('discovery_method', 'api_search')
            );
            
            -- Update user discovery count
            UPDATE user_profiles
            SET places_discovered = places_discovered + 1,
                updated_at = NOW()
            WHERE id = p_discovered_by;
        END IF;
        
        RETURN v_place_id;
    END IF;
END;
$$;

-- Function to record place visit
CREATE OR REPLACE FUNCTION record_place_visit(
    p_user_id UUID,
    p_place_id UUID,
    p_location_verified BOOLEAN DEFAULT false,
    p_gps_accuracy DECIMAL DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_visit_id UUID;
    v_existing_visit UUID;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Check if user already visited this place today
    SELECT id INTO v_existing_visit
    FROM place_visits
    WHERE user_id = p_user_id 
      AND place_id = p_place_id 
      AND created_at::DATE = v_today;
    
    IF v_existing_visit IS NOT NULL THEN
        -- Update existing visit
        UPDATE place_visits
        SET location_verified = p_location_verified,
            gps_accuracy = p_gps_accuracy,
            notes = p_notes,
            created_at = NOW()
        WHERE id = v_existing_visit;
        
        RETURN v_existing_visit;
    ELSE
        -- Insert new visit
        INSERT INTO place_visits (
            user_id, place_id, location_verified, gps_accuracy, notes
        )
        VALUES (
            p_user_id, p_place_id, p_location_verified, p_gps_accuracy, p_notes
        )
        RETURNING id INTO v_visit_id;
        
        -- Award visit points
        PERFORM award_points(
            p_user_id, 
            'visit_place', 
            10, 
            p_place_id,
            jsonb_build_object(
                'location_verified', p_location_verified,
                'gps_accuracy', p_gps_accuracy
            )
        );
        
        -- Update user visit count
        UPDATE user_profiles
        SET places_visited = places_visited + 1,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        RETURN v_visit_id;
    END IF;
END;
$$;

-- Function to add place to favorites
CREATE OR REPLACE FUNCTION add_place_favorite(
    p_user_id UUID,
    p_place_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_favorite_id UUID;
    v_existing_favorite UUID;
BEGIN
    -- Check if already favorited
    SELECT id INTO v_existing_favorite
    FROM place_favorites
    WHERE user_id = p_user_id AND place_id = p_place_id;
    
    IF v_existing_favorite IS NOT NULL THEN
        RETURN v_existing_favorite;
    END IF;
    
    -- Insert new favorite
    INSERT INTO place_favorites (user_id, place_id)
    VALUES (p_user_id, p_place_id)
    RETURNING id INTO v_favorite_id;
    
    -- Award favorite points
    PERFORM award_points(
        p_user_id, 
        'favorite_place', 
        2, 
        p_place_id,
        jsonb_build_object('action', 'add_favorite')
    );
    
    RETURN v_favorite_id;
END;
$$;

-- Function to get place with user-specific data
CREATE OR REPLACE FUNCTION get_place_with_user_data(
    p_place_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    place_data JSONB,
    user_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_place_data JSONB;
    v_user_data JSONB := '{}'::JSONB;
BEGIN
    -- Get place data
    SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'latitude', ST_Y(p.location::GEOMETRY),
        'longitude', ST_X(p.location::GEOMETRY),
        'address', p.address,
        'place_type', p.place_type,
        'site_type', p.site_type,
        'historical_period', p.historical_period,
        'description', p.description,
        'ai_description', p.ai_description,
        'wikipedia_url', p.wikipedia_url,
        'wikipedia_summary', p.wikipedia_summary,
        'google_rating', p.google_rating,
        'avg_rating', p.avg_rating,
        'total_visits', p.total_visits,
        'total_reviews', p.total_reviews,
        'is_verified', p.is_verified,
        'created_at', p.created_at,
        'first_discovered_by', jsonb_build_object(
            'id', up.id,
            'username', up.username,
            'display_name', up.display_name
        )
    ) INTO v_place_data
    FROM places p
    LEFT JOIN user_profiles up ON p.first_discovered_by = up.id
    WHERE p.id = p_place_id;
    
    -- Get user-specific data if user provided
    IF p_user_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'has_visited', EXISTS(
                SELECT 1 FROM place_visits 
                WHERE user_id = p_user_id AND place_id = p_place_id
            ),
            'is_favorited', EXISTS(
                SELECT 1 FROM place_favorites 
                WHERE user_id = p_user_id AND place_id = p_place_id
            ),
            'user_rating', (
                SELECT rating FROM place_reviews 
                WHERE user_id = p_user_id AND place_id = p_place_id
            ),
            'visit_count', (
                SELECT COUNT(*) FROM place_visits 
                WHERE user_id = p_user_id AND place_id = p_place_id
            )
        ) INTO v_user_data;
    END IF;
    
    RETURN QUERY SELECT v_place_data, v_user_data;
END;
$$;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(
    p_user_id UUID,
    p_action_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_achievement RECORD;
    v_user_progress JSONB;
    v_requirement_met BOOLEAN;
    v_unlocked_achievements JSONB := '[]'::JSONB;
    v_current_count INTEGER;
BEGIN
    -- Loop through relevant achievements
    FOR v_achievement IN 
        SELECT * FROM achievements 
        WHERE is_active = true 
          AND id NOT IN (
              SELECT achievement_id FROM user_achievements 
              WHERE user_id = p_user_id AND is_completed = true
          )
    LOOP
        v_requirement_met := false;
        
        -- Check different achievement types
        CASE v_achievement.type
            WHEN 'discovery' THEN
                SELECT places_discovered INTO v_current_count
                FROM user_profiles WHERE id = p_user_id;
                
                IF v_current_count >= (v_achievement.requirements->>'places_discovered')::INTEGER THEN
                    v_requirement_met := true;
                END IF;
                
            WHEN 'visitation' THEN
                SELECT places_visited INTO v_current_count
                FROM user_profiles WHERE id = p_user_id;
                
                IF v_current_count >= (v_achievement.requirements->>'places_visited')::INTEGER THEN
                    v_requirement_met := true;
                END IF;
                
            WHEN 'streak' THEN
                SELECT current_streak INTO v_current_count
                FROM user_profiles WHERE id = p_user_id;
                
                IF v_current_count >= (v_achievement.requirements->>'streak_days')::INTEGER THEN
                    v_requirement_met := true;
                END IF;
                
            WHEN 'social' THEN
                SELECT COUNT(*) INTO v_current_count
                FROM place_reviews WHERE user_id = p_user_id;
                
                IF v_current_count >= (v_achievement.requirements->>'reviews_count')::INTEGER THEN
                    v_requirement_met := true;
                END IF;
        END CASE;
        
        -- Unlock achievement if requirement met
        IF v_requirement_met THEN
            INSERT INTO user_achievements (user_id, achievement_id, is_completed, completed_at)
            VALUES (p_user_id, v_achievement.id, true, NOW())
            ON CONFLICT (user_id, achievement_id) DO UPDATE
            SET is_completed = true, completed_at = NOW();
            
            -- Award achievement points
            PERFORM award_points(
                p_user_id, 
                'achievement_unlock', 
                v_achievement.points_reward, 
                NULL,
                jsonb_build_object('achievement_id', v_achievement.id)
            );
            
            -- Add to unlocked achievements
            v_unlocked_achievements := v_unlocked_achievements || jsonb_build_object(
                'id', v_achievement.id,
                'name', v_achievement.name,
                'description', v_achievement.description,
                'points_reward', v_achievement.points_reward
            );
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object('unlocked_achievements', v_unlocked_achievements);
END;
$$;

-- Function to enhance place with AI data
CREATE OR REPLACE FUNCTION enhance_place_with_ai(
    p_place_id UUID,
    p_ai_description TEXT DEFAULT NULL,
    p_wikipedia_url TEXT DEFAULT NULL,
    p_wikipedia_summary TEXT DEFAULT NULL,
    p_site_type place_site_type DEFAULT NULL,
    p_historical_period historical_period DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE places
    SET ai_description = COALESCE(p_ai_description, ai_description),
        wikipedia_url = COALESCE(p_wikipedia_url, wikipedia_url),
        wikipedia_summary = COALESCE(p_wikipedia_summary, wikipedia_summary),
        site_type = COALESCE(p_site_type, site_type),
        historical_period = COALESCE(p_historical_period, historical_period),
        updated_at = NOW()
    WHERE id = p_place_id;
    
    RETURN FOUND;
END;
$$;

-- Function to get nearby places
CREATE OR REPLACE FUNCTION get_nearby_places(
    p_lat DECIMAL,
    p_lng DECIMAL,
    p_radius_meters INTEGER DEFAULT 5000,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_meters INTEGER,
    site_type place_site_type,
    historical_period historical_period,
    avg_rating DECIMAL,
    total_visits INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_center GEOGRAPHY;
BEGIN
    v_center := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        ST_Y(p.location::GEOMETRY)::DECIMAL as latitude,
        ST_X(p.location::GEOMETRY)::DECIMAL as longitude,
        ST_Distance(p.location, v_center)::INTEGER as distance_meters,
        p.site_type,
        p.historical_period,
        p.avg_rating,
        p.total_visits
    FROM places p
    WHERE ST_DWithin(p.location, v_center, p_radius_meters)
    ORDER BY ST_Distance(p.location, v_center)
    LIMIT p_limit;
END;
$$;