<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PlaceDataAggregatorService;

class PlaceController extends Controller
{
    protected $placeDataAggregatorService;

    public function __construct(PlaceDataAggregatorService $placeDataAggregatorService)
    {
        $this->placeDataAggregatorService = $placeDataAggregatorService;
    }

    /**
     * Show combined data for a specific place by slug.
     *
     * @param Request $request
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        // Retrieve place ID from query parameters, if available
        $placeId = $request->query('place_id');
        $fields = $request->query('fields');
        $noCache = $request->query('noCache');
        // Fetch the combined data using PlaceDataAggregatorService
        try {
            $combinedData = $this->placeDataAggregatorService->getCombinedPlaceData($placeId, $fields, $noCache);

            // Return the combined data as JSON
            return response()->json($combinedData);
        } catch (\Exception $e) {
            // Handle potential errors (e.g., failed API calls) gracefully
            return response()->json([
                'error' => 'Failed to fetch place data',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
