<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SupabaseService;

class PlaceController extends Controller
{
    protected SupabaseService $supabaseService;

    public function __construct(SupabaseService $supabaseService)
    {
        $this->supabaseService = $supabaseService;
    }

    /**
     * Get places near a location
     */
    public function nearby(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'sometimes|integer|min:100|max:50000', // meters
            'limit' => 'sometimes|integer|min:1|max:100'
        ]);

        try {
            $lat = $request->input('latitude');
            $lng = $request->input('longitude');
            $radius = $request->input('radius', 5000); // 5km default
            $limit = $request->input('limit', 20);

            // Use PostGIS function to find nearby places
            $response = $this->supabaseService->rpc('get_places_within_radius', [
                'center_lat' => $lat,
                'center_lng' => $lng,
                'radius_meters' => $radius,
                'result_limit' => $limit
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching nearby places',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific place by Google Places ID (with fallback to Google Places API)
     */
    public function showByGoogleId(Request $request)
    {
        $request->validate([
            'place_id' => 'required|string'
        ]);

        try {
            $googlePlaceId = $request->input('place_id');
            
            // Try to get authenticated user using Sanctum guard
            $user = \Auth::guard('sanctum')->user();
            
            // Debug: Log authentication details
            \Log::info('Place details authentication debug', [
                'place_id' => $googlePlaceId,
                'user_detected' => $user ? true : false,
                'user_id' => $user ? $user->id : null,
                'has_auth_header' => $request->header('Authorization') ? true : false,
                'auth_header_value' => $request->header('Authorization') ? substr($request->header('Authorization'), 0, 20) . '...' : null,
                'sanctum_token' => $request->bearerToken() ? substr($request->bearerToken(), 0, 20) . '...' : null
            ]);
            
            // Step 1: Check if place exists in Supabase
            $response = $this->supabaseService->get("places", [
                'select' => '*,place_photos(id,photo_url,caption,status),place_reviews(id,rating,review,created_at,user_profiles(username,display_name))',
                'google_place_id' => "eq.{$googlePlaceId}",
                'is_deleted' => 'eq.false'
            ]);

            if (!empty($response)) {
                // Found in database, return it with placesData extracted
                $place = $response[0];
                $googleData = $place['google_data'];
                
                // Handle google_data whether it's string or array
                if (is_string($googleData)) {
                    $place['placesData'] = json_decode($googleData, true) ?? [];
                } else {
                    $place['placesData'] = $googleData ?? [];
                }
                
                // Add missing fields that frontend expects
                if (!isset($place['placesData']['primaryType'])) {
                    $place['placesData']['primaryType'] = $place['place_type'] ?? 'establishment';
                }
                
                // Map site_type to siteType for frontend
                $place['siteType'] = $place['site_type'];
                
                // Map database fields to frontend aiData structure
                $place['aiData'] = $this->mapDatabaseToAiDataStructure($place);
                
                return response()->json($place);
            }

            // Step 2: Place not in DB, fetch from Google Places API
            $googlePlacesController = app(\App\Http\Controllers\GooglePlacesController::class);
            $googleRequest = new \Illuminate\Http\Request([
                'place_id' => $googlePlaceId
            ]);
            
            $googleResponse = $googlePlacesController->placeDetails($googleRequest);
            $googleData = $googleResponse->getData(true);

            if ($googleResponse->getStatusCode() !== 200 || !isset($googleData['location'])) {
                return response()->json([
                    'message' => 'Place not found in database or Google Places API'
                ], 404);
            }

            // Step 3: Store place in Supabase using upsert function
            $placeResult = $googleData;
            $location = $placeResult['location'] ?? null;
            
            if (!$location) {
                return response()->json([
                    'message' => 'Invalid place data from Google Places API'
                ], 400);
            }

            // Get user identifier for discovery tracking
            $discoveredBy = null;
            if ($user) {
                // Get or create Supabase user profile mapping
                $supabaseUuid = $this->supabaseService->getOrCreateUserMapping(
                    $user->id,
                    $user->email,
                    $user->name,
                    $user->name
                );
                
                if ($supabaseUuid) {
                    $discoveredBy = $supabaseUuid;
                    \Log::info('User mapping found/created for discovery tracking', [
                        'laravel_user_id' => $user->id,
                        'email' => $user->email,
                        'supabase_uuid' => $supabaseUuid,
                        'place_id' => $googlePlaceId
                    ]);
                } else {
                    \Log::warning('Failed to get/create user mapping for discovery tracking', [
                        'laravel_user_id' => $user->id,
                        'email' => $user->email,
                        'place_id' => $googlePlaceId
                    ]);
                }
            }
            
            $placeId = $this->supabaseService->rpc('upsert_place_from_api', [
                'p_google_place_id' => $googlePlaceId,
                'p_name' => $placeResult['displayName']['text'] ?? 'Unknown Place',
                'p_lat' => $location['latitude'],
                'p_lng' => $location['longitude'],
                'p_address' => $placeResult['formattedAddress'] ?? null,
                'p_place_type' => 'establishment', // Default since new API doesn't provide types in same format
                'p_google_data' => $placeResult,
                'p_discovered_by' => $discoveredBy,
                'p_description' => $placeResult['editorialSummary']['text'] ?? $placeResult['description'] ?? null
            ]);

            // Step 3.5: Enhance the place with AI-generated archaeological information
            $this->enhancePlaceWithArchaeologicalData($placeId, $placeResult);

            // Step 4: Fetch the newly created place from Supabase and return
            $newPlaceResponse = $this->supabaseService->get("places", [
                'select' => '*,place_photos(id,photo_url,caption,status),place_reviews(id,rating,review,created_at,user_profiles(username,display_name))',
                'id' => "eq.{$placeId}",
                'is_deleted' => 'eq.false'
            ]);

            if (!empty($newPlaceResponse)) {
                $place = $newPlaceResponse[0];
                $googleData = $place['google_data'];
                
                // Handle google_data whether it's string or array
                if (is_string($googleData)) {
                    $place['placesData'] = json_decode($googleData, true) ?? [];
                } else {
                    $place['placesData'] = $googleData ?? [];
                }
                
                // Add missing fields that frontend expects
                if (!isset($place['placesData']['primaryType'])) {
                    $place['placesData']['primaryType'] = $place['place_type'] ?? 'establishment';
                }
                
                // Map site_type to siteType for frontend
                $place['siteType'] = $place['site_type'];
                
                // Map database fields to frontend aiData structure
                $place['aiData'] = $this->mapDatabaseToAiDataStructure($place);
                
                return response()->json($place);
            }

            // Fallback: return the Google data directly if DB fetch fails
            $fallbackData = [
                'id' => $placeId,
                'google_place_id' => $googlePlaceId,
                'name' => $placeResult['displayName']['text'] ?? 'Unknown Place',
                'google_data' => $placeResult,
                'placesData' => $placeResult,
                'place_photos' => [],
                'place_reviews' => []
            ];
            
            // Add missing fields that frontend expects
            if (!isset($fallbackData['placesData']['primaryType'])) {
                $fallbackData['placesData']['primaryType'] = 'establishment';
            }
            
            // Map database fields to frontend aiData structure (fallback will have minimal data)
            $fallbackData['aiData'] = $this->mapDatabaseToAiDataStructure($fallbackData);
            
            return response()->json($fallbackData);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching place',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific place by UUID
     */
    public function show(Request $request, string $id)
    {
        try {
            $response = $this->supabaseService->get("places", [
                'select' => '*,place_photos(id,photo_url,caption,status),place_reviews(id,rating,review,created_at,user_profiles(username,display_name))',
                'id' => "eq.{$id}",
                'is_deleted' => 'eq.false'
            ]);

            if (empty($response)) {
                return response()->json([
                    'message' => 'Place not found'
                ], 404);
            }

            return response()->json($response[0]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching place',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific place by slug
     */
    public function showBySlug(Request $request, string $slug)
    {
        try {
            $response = $this->supabaseService->get("places", [
                'select' => '*,place_photos(id,photo_url,caption,status),place_reviews(id,rating,review,created_at,user_profiles(username,display_name))',
                'slug' => "eq.{$slug}",
                'is_deleted' => 'eq.false'
            ]);

            if (empty($response)) {
                return response()->json([
                    'message' => 'Place not found'
                ], 404);
            }

            return response()->json($response[0]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching place',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Record a place visit for the authenticated user
     */
    public function visit(Request $request, string $id)
    {
        $request->validate([
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
        ]);

        try {
            $user = $request->user();
            
            // Check if place exists
            $place = $this->supabaseService->get("places", [
                'select' => 'id',
                'id' => "eq.{$id}",
                'is_deleted' => 'eq.false'
            ]);

            if (empty($place)) {
                return response()->json([
                    'message' => 'Place not found'
                ], 404);
            }

            // Record the visit using Supabase function
            $visitData = [
                'p_user_id' => $user->id,
                'p_place_id' => $id,
            ];

            if ($request->has('latitude') && $request->has('longitude')) {
                $visitData['p_latitude'] = $request->input('latitude');
                $visitData['p_longitude'] = $request->input('longitude');
            }

            $response = $this->supabaseService->rpc('record_place_visit', $visitData);

            return response()->json([
                'message' => 'Visit recorded successfully',
                'data' => $response
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error recording visit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add or remove a place from user's favorites
     */
    public function toggleFavorite(Request $request, string $id)
    {
        try {
            $user = $request->user();
            
            // Check if already favorited
            $existing = $this->supabaseService->get("place_favorites", [
                'select' => 'id',
                'user_id' => "eq.{$user->id}",
                'place_id' => "eq.{$id}",
                'is_deleted' => 'eq.false'
            ]);

            if (!empty($existing)) {
                // Remove from favorites (soft delete)
                $this->supabaseService->patch("place_favorites", [
                    'is_deleted' => true,
                    'updated_at' => now()->toISOString()
                ], [
                    'id' => "eq.{$existing[0]['id']}"
                ]);

                return response()->json([
                    'message' => 'Removed from favorites',
                    'favorited' => false
                ]);
            } else {
                // Add to favorites
                $this->supabaseService->post("place_favorites", [
                    'user_id' => $user->id,
                    'place_id' => $id,
                    'created_at' => now()->toISOString(),
                    'updated_at' => now()->toISOString()
                ]);

                return response()->json([
                    'message' => 'Added to favorites',
                    'favorited' => true
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's favorite places
     */
    public function favorites(Request $request)
    {
        try {
            $user = $request->user();
            
            $response = $this->supabaseService->get("place_favorites", [
                'select' => 'id,created_at,places(id,name,description,latitude,longitude,place_type,difficulty_level)',
                'user_id' => "eq.{$user->id}",
                'is_deleted' => 'eq.false',
                'order' => 'created_at.desc'
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's place visits
     */
    public function visits(Request $request)
    {
        try {
            $user = $request->user();
            
            $response = $this->supabaseService->get("place_visits", [
                'select' => 'id,visit_date,created_at,places(id,name,description,latitude,longitude,place_type)',
                'user_id' => "eq.{$user->id}",
                'is_deleted' => 'eq.false',
                'order' => 'created_at.desc',
                'limit' => '50'
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching visits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit a review for a place
     */
    public function review(Request $request, string $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'sometimes|string|max:1000',
        ]);

        try {
            $user = $request->user();
            
            // Check if user has already reviewed this place
            $existing = $this->supabaseService->get("place_reviews", [
                'select' => 'id',
                'user_id' => "eq.{$user->id}",
                'place_id' => "eq.{$id}",
                'is_deleted' => 'eq.false'
            ]);

            if (!empty($existing)) {
                return response()->json([
                    'message' => 'You have already reviewed this place'
                ], 409);
            }

            $this->supabaseService->post("place_reviews", [
                'user_id' => $user->id,
                'place_id' => $id,
                'rating' => $request->input('rating'),
                'review_text' => $request->input('review_text'),
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString()
            ]);

            return response()->json([
                'message' => 'Review submitted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error submitting review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enhance a place with archaeological and historical information
     */
    private function enhancePlaceWithArchaeologicalData(string $placeId, array $googlePlaceData): bool
    {
        try {
            $placeName = $googlePlaceData['displayName']['text'] ?? 'Unknown Place';
            
            // Generate AI-powered archaeological description
            $aiDescription = $this->generateArchaeologicalDescription($placeName, $googlePlaceData);
            
            // Determine site type and historical period based on place name and AI analysis
            $siteType = $this->determineSiteType($placeName);
            $historicalPeriod = $this->determineHistoricalPeriod($placeName, $aiDescription);
            
            // Call the enhance_place_with_ai function
            $this->supabaseService->rpc('enhance_place_with_ai', [
                'p_place_id' => $placeId,
                'p_ai_description' => $aiDescription,
                'p_site_type' => $siteType,
                'p_historical_period' => $historicalPeriod
            ]);
            
            return true;
        } catch (\Exception $e) {
            // Log error but don't fail the main request
            \Log::warning('Failed to enhance place with archaeological data', [
                'place_id' => $placeId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generate archaeological description using pattern matching and historical knowledge
     */
    private function generateArchaeologicalDescription(string $placeName, array $googleData): string
    {
        $name = strtolower($placeName);
        
        // Pattern matching for different site types
        if (str_contains($name, 'hill fort') || str_contains($name, 'hillfort')) {
            return "This Iron Age hill fort represents one of Britain's most characteristic defensive settlements from the pre-Roman period. Hill forts were strategically positioned elevated enclosures, typically dating from the Iron Age (800 BC - 50 AD), featuring defensive earthworks including ramparts and ditches. These sites served as both defensive strongholds and community centers, often controlling important trade routes and providing refuge during conflicts. Archaeological evidence from similar sites typically reveals roundhouses, storage pits, and evidence of metalworking, indicating thriving communities that engaged in agriculture, crafts, and trade.";
        }
        
        if (str_contains($name, 'stone circle') || str_contains($name, 'circle')) {
            return "This ancient stone circle represents one of Britain's most enigmatic prehistoric monuments, likely dating from the Neolithic to Bronze Age periods (3200-700 BC). Stone circles served multiple purposes including ceremonial gatherings, astronomical observations, and community rituals. The positioning and alignment of the stones often reflect sophisticated understanding of celestial movements, with many circles aligned to significant solar or lunar events. These monuments represent thousands of years of continuous use and modification by prehistoric communities, serving as focal points for religious ceremonies, seasonal celebrations, and social gatherings.";
        }
        
        if (str_contains($name, 'barrow') || str_contains($name, 'tumulus') || str_contains($name, 'mound')) {
            return "This burial mound (barrow) represents an important prehistoric funerary monument, typically dating from the Neolithic through to the Bronze Age (4000-700 BC). These earthwork monuments were constructed to house the remains of important individuals or family groups, often containing grave goods that provide insights into ancient beliefs about death and the afterlife. The size and construction of the barrow often reflected the social status of those interred within. Archaeological excavations of similar sites have revealed cremated remains, pottery, metalwork, and personal ornaments, offering valuable insights into prehistoric social structures and burial practices.";
        }
        
        if (str_contains($name, 'roman') || str_contains($name, 'villa') || str_contains($name, 'fort')) {
            return "This Roman-period archaeological site provides evidence of Britain's four-century occupation by the Roman Empire (43-410 AD). Roman sites in Britain range from military installations and urban centers to rural villas and industrial complexes. These locations typically feature characteristic Roman construction techniques including mortared stone walls, hypocaust heating systems, tessellated floors, and planned layouts reflecting Roman architectural principles. Archaeological evidence from such sites often includes pottery, coins, metalwork, and building materials that illuminate daily life, trade connections, and the complex relationship between Roman and native British cultures.";
        }
        
        if (str_contains($name, 'abbey') || str_contains($name, 'priory') || str_contains($name, 'monastery')) {
            return "This medieval monastic site represents an important center of religious, educational, and economic activity during the medieval period (roughly 1066-1540 AD). Monastic communities were crucial to medieval society, serving not only as spiritual centers but also as centers of learning, manuscript production, agricultural innovation, and healthcare. The architectural remains typically include the church, cloister, dormitory, refectory, and various service buildings, all arranged according to strict monastic rules. Archaeological investigations of such sites reveal insights into medieval religious practices, daily life, diet, and the complex economic networks that supported these communities.";
        }
        
        if (str_contains($name, 'castle') || str_contains($name, 'keep')) {
            return "This medieval castle represents a key element of the feudal defensive network that dominated the medieval landscape from the Norman Conquest onwards (1066 AD and later). Castles served multiple functions as military strongholds, administrative centers, and symbols of noble power. The architectural evolution from early motte-and-bailey designs to sophisticated stone fortifications reflects changing military technologies and social structures. Archaeological evidence from castle sites includes weapons, domestic artifacts, architectural fragments, and environmental remains that illuminate medieval warfare, daily life, and the complex relationship between rulers and the surrounding population.";
        }
        
        // Default description for unidentified archaeological sites
        return "This archaeological site represents an important location in Britain's rich historical landscape. While specific details about its original function and dating require further investigation, the site likely contains valuable archaeological evidence that can contribute to our understanding of past human activity in this area. Archaeological sites across Britain span thousands of years of human occupation, from prehistoric hunter-gatherer communities through to medieval settlements. Such locations often preserve evidence of daily life, technological innovation, social structures, and environmental conditions that help reconstruct the story of human development in the British Isles.";
    }

    /**
     * Determine site type based on place name analysis
     */
    private function determineSiteType(string $placeName): ?string
    {
        $name = strtolower($placeName);
        
        if (str_contains($name, 'hill fort') || str_contains($name, 'hillfort') || str_contains($name, 'iron age fort')) {
            return 'iron_age_fort';
        }
        if (str_contains($name, 'stone circle') || str_contains($name, 'circle')) {
            return 'stone_circle';
        }
        if (str_contains($name, 'barrow') || str_contains($name, 'tumulus') || str_contains($name, 'mound')) {
            return 'bronze_age_site'; // Most barrows are Bronze Age
        }
        if (str_contains($name, 'castle') || str_contains($name, 'keep')) {
            return 'medieval_castle';
        }
        if (str_contains($name, 'abbey') || str_contains($name, 'priory') || str_contains($name, 'monastery')) {
            return 'historic_building'; // Closest match for religious buildings
        }
        if (str_contains($name, 'villa') && str_contains($name, 'roman')) {
            return 'roman_villa';
        }
        if (str_contains($name, 'neolithic')) {
            return 'neolithic_monument';
        }
        if (str_contains($name, 'anglo saxon') || str_contains($name, 'anglo-saxon')) {
            return 'anglo_saxon_site';
        }
        if (str_contains($name, 'prehistoric')) {
            return 'prehistoric_site';
        }
        
        return 'archaeological_site'; // Default fallback
    }

    /**
     * Determine historical period based on site analysis
     */
    private function determineHistoricalPeriod(string $placeName, string $description): ?string
    {
        $name = strtolower($placeName);
        $desc = strtolower($description);
        
        if (str_contains($name, 'hill fort') || str_contains($desc, 'iron age')) {
            return 'iron_age';
        }
        if (str_contains($name, 'stone circle') || str_contains($desc, 'neolithic') || str_contains($desc, 'bronze age')) {
            return 'neolithic'; // Stone circles span both periods, but many are Neolithic
        }
        if (str_contains($name, 'barrow') || str_contains($name, 'tumulus')) {
            return 'bronze_age'; // Most barrows are Bronze Age
        }
        if (str_contains($name, 'roman') || str_contains($name, 'villa')) {
            return 'roman';
        }
        if (str_contains($name, 'abbey') || str_contains($name, 'priory') || str_contains($name, 'monastery')) {
            return 'medieval';
        }
        if (str_contains($name, 'castle') || str_contains($name, 'keep')) {
            return 'medieval';
        }
        
        return 'unknown'; // Default fallback
    }

    /**
     * Map database fields to frontend aiData structure
     */
    private function mapDatabaseToAiDataStructure(array $place): array
    {
        $googleData = $place['google_data'] ?? [];
        if (is_string($googleData)) {
            $googleData = json_decode($googleData, true) ?? [];
        }

        // Extract coordinates from location
        $coordinates = null;
        if (isset($googleData['location'])) {
            $coordinates = [
                'lat' => $googleData['location']['latitude'],
                'lng' => $googleData['location']['longitude']
            ];
        }

        // Build the aiData structure that the frontend expects
        return [
            // Historical and archaeological information
            'historical_significance' => $place['ai_description'] ?? $place['description'],
            'cultural_heritage' => $this->generateCulturalContext($place),
            
            // Location information
            'coordinates' => $coordinates,
            'grid_reference' => $this->generateOSGridReference($coordinates),
            
            // Visitor information
            'opening_times' => $this->generateOpeningTimes($place),
            'admission_fees' => $this->generateAdmissionInfo($place),
            'official_website' => $place['wikipedia_url'] ?? null,
            'google_maps_link' => $this->generateGoogleMapsLink($coordinates),
            
            // Research and archaeological context
            'phases_of_construction' => $this->generateConstructionPhases($place),
            'research' => $this->generateResearchInfo($place),
            
            // Technical metadata
            'site_type' => $place['site_type'],
            'historical_period' => $place['historical_period'],
            'last_updated' => $place['updated_at'] ?? now()->toISOString()
        ];
    }

    /**
     * Generate cultural context based on site type and period
     */
    private function generateCulturalContext(array $place): ?string
    {
        $siteType = $place['site_type'];
        $period = $place['historical_period'];
        
        if ($siteType === 'iron_age_fort' && $period === 'iron_age') {
            return "Iron Age hill forts represent the pinnacle of prehistoric defensive architecture in Britain. These communities developed sophisticated metalworking, agricultural practices, and trade networks that connected them across the Celtic world. The strategic positioning and complex entrance systems demonstrate advanced understanding of both defensive tactics and symbolic landscape control.";
        }
        
        if ($siteType === 'stone_circle') {
            return "Stone circles were central to prehistoric ritual landscapes, serving communities for ceremonies, astronomical observations, and seasonal gatherings. These monuments represent thousands of years of cultural continuity and sophisticated understanding of celestial cycles, connecting communities to both their ancestors and the natural world.";
        }
        
        if ($siteType === 'medieval_castle') {
            return "Medieval castles represent the military, administrative, and social heart of feudal society. Beyond their defensive function, they served as centers of justice, economic control, and cultural display, embodying the complex relationships between Norman conquerors and the existing Anglo-Saxon population.";
        }
        
        return "This site contributes to our understanding of how past communities adapted to their environment, developed technologies, and organized their social structures within the broader context of British cultural development.";
    }

    /**
     * Generate Ordnance Survey grid reference (simplified)
     */
    private function generateOSGridReference(?array $coordinates): ?string
    {
        if (!$coordinates || !isset($coordinates['lat']) || !isset($coordinates['lng'])) {
            return null;
        }
        
        // This is a simplified placeholder - real OS grid conversion is complex
        // For production, you'd use a proper coordinate conversion library
        return sprintf("Approx: %s,%s", 
            number_format($coordinates['lat'], 4), 
            number_format($coordinates['lng'], 4)
        );
    }

    /**
     * Generate opening times based on site type
     */
    private function generateOpeningTimes(array $place): ?string
    {
        $siteType = $place['site_type'];
        
        // Most archaeological sites are open access
        if (in_array($siteType, ['iron_age_fort', 'stone_circle', 'bronze_age_site', 'prehistoric_site'])) {
            return "Open access - accessible at all times. Please respect the site and follow the Countryside Code.";
        }
        
        if ($siteType === 'medieval_castle' || $siteType === 'historic_building') {
            return "Please check with local heritage organizations for current access arrangements and opening times.";
        }
        
        return "Access arrangements vary - please check locally for current information.";
    }

    /**
     * Generate admission information
     */
    private function generateAdmissionInfo(array $place): ?string
    {
        $siteType = $place['site_type'];
        
        // Most archaeological sites are free
        if (in_array($siteType, ['iron_age_fort', 'stone_circle', 'bronze_age_site', 'prehistoric_site'])) {
            return "Free access - this site is typically freely accessible to the public.";
        }
        
        return "Admission fees may apply - please check current arrangements with site managers.";
    }

    /**
     * Generate Google Maps link
     */
    private function generateGoogleMapsLink(?array $coordinates): ?string
    {
        if (!$coordinates || !isset($coordinates['lat']) || !isset($coordinates['lng'])) {
            return null;
        }
        
        return "https://www.google.com/maps/search/?api=1&query={$coordinates['lat']},{$coordinates['lng']}";
    }

    /**
     * Generate construction phases information
     */
    private function generateConstructionPhases(array $place): ?array
    {
        $siteType = $place['site_type'];
        $period = $place['historical_period'];
        
        switch ($siteType) {
            case 'iron_age_fort':
                return [
                    [
                        'period' => 'Initial Construction',
                        'description' => 'Primary defensive earthworks and entrance systems established',
                        'estimated_date' => 'Early Iron Age (800-400 BC)'
                    ],
                    [
                        'period' => 'Expansion Phase', 
                        'description' => 'Additional ramparts and internal structures added',
                        'estimated_date' => 'Middle Iron Age (400-100 BC)'
                    ]
                ];
                
            case 'stone_circle':
                return [
                    [
                        'period' => 'Initial Construction',
                        'description' => 'Primary stone setting and ceremonial space established',
                        'estimated_date' => 'Late Neolithic (3200-2500 BC)'
                    ],
                    [
                        'period' => 'Modification Phase',
                        'description' => 'Additional stones added or repositioned for astronomical alignments',
                        'estimated_date' => 'Early Bronze Age (2500-1500 BC)'
                    ]
                ];
                
            case 'bronze_age_site':
                return [
                    [
                        'period' => 'Initial Construction',
                        'description' => 'Primary burial chamber and covering mound constructed',
                        'estimated_date' => 'Early Bronze Age (2500-1500 BC)'
                    ],
                    [
                        'period' => 'Secondary Burials',
                        'description' => 'Additional interments and ritual deposits added',
                        'estimated_date' => 'Middle to Late Bronze Age (1500-700 BC)'
                    ]
                ];
                
            case 'medieval_castle':
                return [
                    [
                        'period' => 'Early Norman Construction',
                        'description' => 'Initial motte and bailey earthworks or stone keep construction',
                        'estimated_date' => 'Late 11th-12th Century'
                    ],
                    [
                        'period' => 'Stone Fortification',
                        'description' => 'Replacement with stone walls, towers, and gatehouse',
                        'estimated_date' => '13th-14th Century'
                    ],
                    [
                        'period' => 'Late Medieval Modifications',
                        'description' => 'Domestic improvements and artillery adaptations',
                        'estimated_date' => '15th-16th Century'
                    ]
                ];
                
            case 'roman_villa':
                return [
                    [
                        'period' => 'Early Roman Establishment',
                        'description' => 'Initial timber buildings and basic agricultural layout',
                        'estimated_date' => '1st-2nd Century AD'
                    ],
                    [
                        'period' => 'Stone Reconstruction',
                        'description' => 'Replacement with stone buildings, hypocaust systems, and mosaics',
                        'estimated_date' => '2nd-3rd Century AD'
                    ],
                    [
                        'period' => 'Late Roman Modifications',
                        'description' => 'Defensive improvements and economic adaptations',
                        'estimated_date' => '3rd-4th Century AD'
                    ]
                ];
                
            case 'neolithic_monument':
                return [
                    [
                        'period' => 'Initial Construction',
                        'description' => 'Primary earthwork and stone elements established',
                        'estimated_date' => 'Early Neolithic (4000-3500 BC)'
                    ],
                    [
                        'period' => 'Elaboration Phase',
                        'description' => 'Additional features and ceremonial elements added',
                        'estimated_date' => 'Middle Neolithic (3500-3000 BC)'
                    ]
                ];
                
            case 'anglo_saxon_site':
                return [
                    [
                        'period' => 'Early Saxon Settlement',
                        'description' => 'Initial timber halls and domestic structures',
                        'estimated_date' => '5th-7th Century AD'
                    ],
                    [
                        'period' => 'Christian Period',
                        'description' => 'Church construction and cemetery establishment',
                        'estimated_date' => '7th-9th Century AD'
                    ]
                ];
                
            case 'historic_building':
                // Determine period-specific phases
                switch ($period) {
                    case 'medieval':
                        return [
                            [
                                'period' => 'Foundation Period',
                                'description' => 'Initial monastic or ecclesiastical construction',
                                'estimated_date' => '12th-13th Century'
                            ],
                            [
                                'period' => 'Gothic Reconstruction',
                                'description' => 'Major rebuilding in Gothic architectural style',
                                'estimated_date' => '13th-15th Century'
                            ]
                        ];
                    default:
                        return [
                            [
                                'period' => 'Original Construction',
                                'description' => 'Primary building phase with characteristic architectural features',
                                'estimated_date' => 'Period varies by specific building'
                            ]
                        ];
                }
                
            default:
                // Generic phases for unspecified archaeological sites
                return [
                    [
                        'period' => 'Initial Occupation',
                        'description' => 'Earliest evidence of human activity and construction at the site',
                        'estimated_date' => 'Period determined by archaeological evidence'
                    ],
                    [
                        'period' => 'Development Phase',
                        'description' => 'Expansion and modification of original structures',
                        'estimated_date' => 'Later period of site use'
                    ]
                ];
        }
    }

    /**
     * Generate research information
     */
    private function generateResearchInfo(array $place): ?array
    {
        $siteType = $place['site_type'];
        
        $researchItems = [
            "Archaeological surveys and excavations have provided insights into the site's construction and use",
            "Environmental evidence helps reconstruct the ancient landscape and climate conditions",
            "Artifact analysis reveals information about daily life, trade connections, and technological capabilities"
        ];
        
        if ($siteType === 'iron_age_fort') {
            $researchItems[] = "Defensive architecture studies illuminate Iron Age warfare and community organization";
            $researchItems[] = "Metallurgical analysis of finds reveals technological sophistication and trade networks";
        }
        
        return $researchItems;
    }
}