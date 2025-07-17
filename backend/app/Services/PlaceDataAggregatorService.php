<?php

namespace App\Services;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Str;
use Illuminate\Support\Facades\Http;


class PlaceDataAggregatorService
{
    protected $googlePlacesService, $yoreOracleService, $addressService;

    public function __construct(
        GooglePlacesService $googlePlacesService,
        YoreOracleService $yoreOracleService,
        AddressService $addressService)
    {
        $this->googlePlacesService = $googlePlacesService;
        $this->yoreOracleService = $yoreOracleService;
        $this->addressService = $addressService;
    }

    /**
     * Check if place exists in Supabase by Google Place ID
     */
    private function checkPlaceExists($googlePlaceId)
    {
        $supabaseUrl = config('services.supabase.url') ?? env('SUPABASE_URL');
        $supabaseKey = config('services.supabase.service_role_key') ?? env('SUPABASE_SERVICE_ROLE_KEY');

        if (!$supabaseUrl || !$supabaseKey) {
            Log::warning('Supabase credentials not configured');
            return null;
        }

        $headers = [
            'apikey' => $supabaseKey,
            'Authorization' => 'Bearer ' . $supabaseKey,
            'Content-Type' => 'application/json',
        ];

        try {
            // Only check by Google Place ID (guaranteed unique)
            $response = Http::withHeaders($headers)
                ->get(rtrim($supabaseUrl, '/') . '/rest/v1/places', [
                    'google_place_id' => 'eq.' . $googlePlaceId,
                    'is_deleted' => 'eq.false',
                    'select' => 'id,google_place_id,slug,name,location,address,google_data,metadata'
                ]);

            if ($response->successful() && count($response->json()) > 0) {
                return $response->json()[0];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error checking place existence in Supabase: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Save new place to Supabase
     */
    private function savePlaceToSupabase($placeData, $aiData = null)
    {
        $supabaseUrl = config('services.supabase.url') ?? env('SUPABASE_URL');
        $supabaseKey = config('services.supabase.service_role_key') ?? env('SUPABASE_SERVICE_ROLE_KEY');

        if (!$supabaseUrl || !$supabaseKey) {
            Log::warning('Supabase credentials not configured');
            return null;
        }

        $headers = [
            'apikey' => $supabaseKey,
            'Authorization' => 'Bearer ' . $supabaseKey,
            'Content-Type' => 'application/json',
        ];

        // Generate slug from place name
        $slug = Str::slug($placeData['displayName']['text'] ?? '');

        // Prepare location data
        $location = null;
        if (isset($placeData['location']['latitude']) && isset($placeData['location']['longitude'])) {
            $location = "POINT({$placeData['location']['longitude']} {$placeData['location']['latitude']})";
        }

        $placeRecord = [
            'google_place_id' => $placeData['id'] ?? null,
            'slug' => $slug,
            'name' => $placeData['displayName']['text'] ?? null,
            'location' => $location,
            'address' => $placeData['formattedAddress']['text'] ?? null,
            'google_data' => $placeData,
            'metadata' => [
                'ai_data' => $aiData,
                'created_via_api' => true
            ]
        ];

        try {
            $response = Http::withHeaders($headers)
                ->post(rtrim($supabaseUrl, '/') . '/rest/v1/places', $placeRecord);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Failed to save place to Supabase: ' . $response->body());
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Error saving place to Supabase: ' . $e->getMessage());
            return null;
        }
    }

    public function getCombinedPlaceData($placeId, $fields = '*', $noCache = false, $userId = null)
    {
        $cacheKey = "combined_place_data_{$placeId}";
        $combinedData = null;
        $placeDetails = null;
        $aiDetails = null;

        if (Redis::exists($cacheKey) && !$noCache) {
            return json_decode(Redis::get($cacheKey), true);
        }

        // First, check if place exists in Supabase database
        $existingPlace = $this->checkPlaceExists($placeId);

        if ($existingPlace) {
            Log::info("Place found in database: {$existingPlace['name']}");

            // Return cached data from database
            $combinedData = [
                'placesData' => $existingPlace['google_data'] ?? [],
                'aiData' => $existingPlace['metadata']['ai_data'] ?? null,
                'databaseRecord' => $existingPlace
            ];

            // Cache the combined data
            Redis::set($cacheKey, json_encode($combinedData), 'EX', 86400);

            return $combinedData;
        }

        // Place doesn't exist in database, fetch from APIs
        Log::info("Place not found in database, fetching from APIs: {$placeId}");

        try {
            // Fetch Google Place details
            $placeDetails = $this->googlePlacesService->getPlaceDetails($placeId, $fields, $noCache);
        } catch (\Exception $e) {
            $placeDetails = ['error' => 'Failed to fetch place details from Google Places'];
        }

        // Check if placeDetails has an error or is missing required fields
        if (isset($placeDetails['error']) || !isset($placeDetails['displayName'])) {
            Log::error('Google Places API error or invalid response', $placeDetails);
            return [
                'placesData' => $placeDetails,
                'aiData' => null,
            ];
        }

        // Fetch AI details
        if ($placeDetails) {
            $placeName = $placeDetails['displayName']['text'];
            $address = $placeDetails['addressComponents'] ?? [];
            $location = $this->addressService->getPostalTown($address);
            Log::info($placeDetails['displayName']['text'].', '.$location);

            try {
                // Fetch AI details
                $aiDetails = $this->yoreOracleService->getPlaceDetails($placeName, $location, $noCache);
            } catch (\Exception $e) {
                Log::error('YoreOracle API error: ' . $e->getMessage());
                $aiDetails = ['error' => 'Failed to fetch data from AI service'];
            }
            Log::info($aiDetails);
        }

        // Save new place to Supabase database
        $savedPlace = $this->savePlaceToSupabase($placeDetails, $aiDetails);

        // If place was saved successfully and user is authenticated, award points
        if ($savedPlace && $userId) {
            try {
                $supabaseUrl = config('services.supabase.url') ?? env('SUPABASE_URL');
                $supabaseKey = config('services.supabase.service_role_key') ?? env('SUPABASE_SERVICE_ROLE_KEY');
                $headers = [
                    'apikey' => $supabaseKey,
                    'Authorization' => 'Bearer ' . $supabaseKey,
                    'Content-Type' => 'application/json',
                ];

                // Award points for discovering a place
                Http::withHeaders($headers)
                    ->post(rtrim($supabaseUrl, '/') . '/rest/v1/rpc/award_points', [
                        'user_id' => $userId,
                        'action_type' => 'discover_place',
                        'base_points' => 30,
                        'place_id' => $savedPlace['id'],
                        'metadata' => json_encode(['verified' => true]),
                    ]);

                // Check for achievement unlocks
                Http::withHeaders($headers)
                    ->post(rtrim($supabaseUrl, '/') . '/rest/v1/rpc/check_achievements', [
                        'user_id' => $userId,
                        'action_type' => 'visit_place',
                    ]);
            } catch (\Throwable $e) {
                Log::warning('Supabase points/achievements RPC failed: ' . $e->getMessage());
            }
        }

        // Combine data under respective keys
        $combinedData = [
            'placesData' => $placeDetails,
            'aiData' => $aiDetails,
        ];

        // Cache the combined data
        Redis::set($cacheKey, json_encode($combinedData), 'EX', 86400);  // Cache for 1 day

        return $combinedData;
    }
}


