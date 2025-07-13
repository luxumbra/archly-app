<?php

namespace App\Http\Controllers;

use App\Services\StringUtils;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\GooglePlacesService;

class GooglePlacesController extends Controller
{
    protected $googlePlacesService;

    public function __construct(GooglePlacesService $googlePlacesService)
    {
        $this->googlePlacesService = $googlePlacesService;
    }

    // Get results based on users text search
    public function textSearch(Request $request)
    {
        $query = $request->query('query');  // Get search query from request
        $locationString = $request->query('location', '55.9533,-3.1883');
        $location = explode(',', $locationString); // Optional
        $fields = $request->input('fields', 'places.displayName,places.formattedAddress'); // Default fields
        $radius = $request->query('radius', 10000);
        $nextPageToken = $request->query('nextPageToken', null);
        $noCache = $request->input('noCache', false);

        // Validate location array has exactly 2 numeric values
        if (count($location) !== 2 || !is_numeric($location[0]) || !is_numeric($location[1])) {
            return response()->json(['error' => 'Invalid location format. Expected: latitude,longitude'], 400);
        }

        // Convert to floats to ensure proper type
        $location = [(float)$location[0], (float)$location[1]];

        // Validate latitude and longitude ranges
        if ($location[0] < -90 || $location[0] > 90 || $location[1] < -180 || $location[1] > 180) {
            return response()->json(['error' => 'Invalid latitude/longitude values'], 400);
        }

        $response = $this->googlePlacesService->textSearch($query, $fields, $location, $noCache, $radius, $nextPageToken);

        return response()->json($response);
    }

    // Get details of a place using the place_id
    public function placeDetails(Request $request)
    {
        $placeId = $request->query('place_id');
        $fields = $request->query('fields');
        $noCache = $request->query('noCache');

        $response = $this->googlePlacesService->getPlaceDetails($placeId, $fields, $noCache);

        return response()->json($response);
    }

    // Handle autocomplete requests
    // public function autocomplete(Request $request)
    // {
    //     $query = $request->input('query');
    //     $results = $this->googlePlacesService->autocomplete($query);

    //     return response()->json($results);
    // }

    // Handle nearby places requests
    // public function nearbySearch(Request $request)
    // {
    //     $lat = $request->input('location');
    //     $radius = $request->input('radius', 50000); // Default radius is 50km
    //     $fields = $request->input('fields', 'places.displayName,places.formattedAddress');

    //     $response = $this->googlePlacesService->nearbySearch($location, $radius, $fields);

    //     return response()->json($response);
    // }
}
