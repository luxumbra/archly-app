<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GooglePlacesService;

class PlacesController extends Controller
{
    protected $googlePlacesService;

    public function __construct(GooglePlacesService $googlePlacesService)
    {
        $this->googlePlacesService = $googlePlacesService;
    }

    // Get results based on users text search
    public function textSearch(Request $request)
    {
        $query = $request->input('query');  // Get search query from request
        $locationBias = $request->input('locationBias', null); // Optional
        $fields = $request->input('fields', 'places.displayName,places.formattedAddress'); // Default fields

        $response = $this->googlePlacesService->textSearch($query, $fields, $locationBias);

        return response()->json($response);
    }

    // Get details of a place using the place_id
    public function placeDetails(Request $request)
    {
        $placeId = $request->input('place_id');
        $fields = $request->input('fields', 'displayName,formattedAddress, id'); // Default fields

        $response = $this->googlePlacesService->placeDetails($placeId, $fields);

        return response()->json($response);
    }

    // Handle autocomplete requests
    public function autocomplete(Request $request)
    {
        $query = $request->input('query');
        $results = $this->googlePlacesService->autocomplete($query);

        return response()->json($results);
    }

    // Handle nearby places requests
    public function nearbySearch(Request $request)
    {
        $lat = $request->input('location');
        $radius = $request->input('radius', 50000); // Default radius is 50km
        $fields = $request->input('fields', 'places.displayName,places.formattedAddress');

        $response = $this->googlePlacesService->nearbySearch($location, $radius, $fields);

        return response()->json($response);
    }
}
