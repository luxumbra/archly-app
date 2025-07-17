-- Create functions to manage user profile mappings between Laravel and Supabase

-- Function to get or create a user profile mapping
CREATE OR REPLACE FUNCTION get_or_create_user_mapping(
    p_laravel_user_id INTEGER,
    p_laravel_email TEXT,
    p_username TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mapping_record user_profile_mappings%ROWTYPE;
    v_profile_id UUID;
    v_username TEXT;
BEGIN
    -- First, try to find existing mapping
    SELECT * INTO v_mapping_record 
    FROM user_profile_mappings 
    WHERE laravel_user_id = p_laravel_user_id 
    OR laravel_email = p_laravel_email;
    
    -- If mapping exists, return the Supabase profile ID
    IF FOUND THEN
        RETURN v_mapping_record.supabase_profile_id;
    END IF;
    
    -- Generate a unique username if not provided
    v_username := COALESCE(p_username, 'user_' || p_laravel_user_id::TEXT);
    
    -- Ensure username is unique by appending numbers if needed
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = v_username) LOOP
        v_username := COALESCE(p_username, 'user_' || p_laravel_user_id::TEXT) || '_' || (RANDOM() * 1000)::INTEGER::TEXT;
    END LOOP;
    
    -- Create new user profile in Supabase
    INSERT INTO user_profiles (
        id,
        username,
        display_name,
        total_points,
        current_level,
        places_discovered,
        places_visited,
        current_streak,
        longest_streak,
        created_at,
        updated_at
    ) VALUES (
        uuid_generate_v4(),
        v_username,
        COALESCE(p_display_name, p_username, v_username),
        0,
        1,
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_profile_id;
    
    -- Create the mapping
    INSERT INTO user_profile_mappings (
        laravel_user_id,
        laravel_email,
        supabase_profile_id,
        created_at,
        updated_at
    ) VALUES (
        p_laravel_user_id,
        p_laravel_email,
        v_profile_id,
        NOW(),
        NOW()
    );
    
    -- Return the new profile ID
    RETURN v_profile_id;
END;
$$;

-- Function to get user mapping by Laravel user ID
CREATE OR REPLACE FUNCTION get_user_mapping_by_laravel_id(p_laravel_user_id INTEGER)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    SELECT supabase_profile_id INTO v_profile_id
    FROM user_profile_mappings 
    WHERE laravel_user_id = p_laravel_user_id;
    
    RETURN v_profile_id;
END;
$$;

-- Function to get user mapping by email
CREATE OR REPLACE FUNCTION get_user_mapping_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    SELECT supabase_profile_id INTO v_profile_id
    FROM user_profile_mappings 
    WHERE laravel_email = p_email;
    
    RETURN v_profile_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_user_mapping(INTEGER, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_mapping_by_laravel_id(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_mapping_by_email(TEXT) TO service_role;