<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class GooglePlacesService
{
    protected $client, $apiKey, $endpoint;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.google.places_api_key');
        $this->endpoint = 'https://places.googleapis.com/v1/';
    }

    public function textSearch($query, $fields = 'places.displayName,places.formattedAddress,places.id', $locationBias = null)
    {
        try {
            $requestBody = [
                'textQuery' => $query,
            ];

            // Add location bias if provided
            if ($locationBias) {
                $requestBody['locationBias'] = $locationBias;
            }

            $response = $this->client->post("{$this->endpoint}places:searchText", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-Goog-Api-Key' => $this->apiKey,
                    'X-Goog-FieldMask' => $fields,  // Define what fields to return
                ],
                'json' => $requestBody, // The JSON body with parameters
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function placeDetails($placeId, $fields = 'places.displayName,places.formattedAddress, places.id')
    {
        try {
            $requestBody = [
                'place_id' => $placeId,
            ];

            $response = $this->client->get("{$this->endpoint}places/{$placeId}", [
                'query' => [
                    'fields' => $fields
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-Goog-Api-Key' => $this->apiKey,
                    'X-Goog-FieldMask' => $fields,
                ],
                'json' => $requestBody,
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getNearbyPlaces($location, $radius = 5000, $fields = 'places.displayName,places.formattedAddress')
    {
        try {
            $requestBody = [
                'location' => $location,
                'radius' => $radius,
            ];

            $response = $this->client->post("{$this->endpoint}places:searchNearby", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-Goog-Api-Key' => $this->apiKey,
                    'X-Goog-FieldMask' => $fields,
                ],
                'json' => $requestBody,
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
