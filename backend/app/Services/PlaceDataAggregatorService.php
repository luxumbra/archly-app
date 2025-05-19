<?php

namespace App\Services;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use Str;


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
    public function getCombinedPlaceData($placeId, $fields = '*', $noCache = false)
    {
        $cacheKey = "combined_place_data_{$placeId}";
        $combinedData = null;
        $placeDetails = null;
        $aiDetails = null;

        if (Redis::exists($cacheKey) && !$noCache) {
            return json_decode(Redis::get($cacheKey), true);
        }

        try {
            // Fetch Google Place details
            $placeDetails = $this->googlePlacesService->getPlaceDetails($placeId, $fields, $noCache);

        } catch (\Exception $e) {
            $placeDetails = ['error' => 'Failed to fetch place details from Google Places'];
        }
        if ($placeDetails) {
            $placeName = $placeDetails['displayName']['text'];
            $address = $placeDetails['addressComponents'];
            $location = $this->addressService->getPostalTown($address);
            Log::info($placeDetails['displayName']['text'].', '.$location);

            try {
                // Fetch Wikipedia details
                $aiDetails = $this->yoreOracleService->getPlaceDetails($placeName, $location, $noCache);
            } catch (\Exception $e) {
                $aiDetails = ['error' => 'Failed to fetch data from OpenAI'];
            }
            Log::info($aiDetails);
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


