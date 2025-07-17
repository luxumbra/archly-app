-- Update upsert_place_from_api function to accept description parameter
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