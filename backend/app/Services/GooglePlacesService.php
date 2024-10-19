<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use App\Jobs\FetchNextPageJob;
use App\Services\StringUtils;

class GooglePlacesService
{
    protected $client, $endpoint, $fields;
    private $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.google.places_api_key');
        $this->endpoint = config('services.google.places_api_uri');
        $this->fields = 'places.displayName,places.formattedAddress,places.location,places.id,places.rating,nextPageToken';
    }

    public function textSearch($query, $fields, $location = null, $noCache = false, $radius = 10000, $nextPageToken = null)
    {
        $cacheKey = 'places_search_' . md5("{$query}{$fields}{$location[0]}{$location[1]}{$radius}{$nextPageToken}");

        if (Redis::exists($cacheKey) && !$noCache) {
            return json_decode(Redis::get($cacheKey), true);
        }

        $url = "{$this->endpoint}/places:searchText";

        $params = [
            'textQuery' => $query,
            'locationBias' => [
                'circle' => [
                    'center' => ['latitude' => $location[0], 'longitude' => $location[1]],
                    'radius' => $radius
                ]
            ],
        ];

        if ($nextPageToken) {
            $params['pageToken'] = $nextPageToken;
        }
        try {
            $response = $this->client->post($url, [
                'json' => $params,
                'headers' => [
                    'X-Goog-Api-Key' => $this->apiKey,
                    'X-Goog-FieldMask' => $fields,
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            Redis::setex($cacheKey, 86400, json_encode($result)); // Cache for 24 hours

            return $result;


        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getPlaceDetails($placeId, $fields = '*', $noCache = false)
    {
        $cacheKey = "place_details_{$placeId}";
        if (Redis::exists($cacheKey) && !$noCache) {
            return json_decode(Redis::get($cacheKey), true);
        }

        try {
            $response = $this->client->get("{$this->endpoint}/places/{$placeId}", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-Goog-Api-Key' => $this->apiKey,
                    'X-Goog-FieldMask' => $fields,
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            Redis::setex($cacheKey, 43200, json_encode($result));

            return $result;

        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getNearbyPlaces($location, $radius = 5000, $fields = 'displayName,formattedAddress,id')
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
