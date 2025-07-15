<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;


class YoreOracleService
{
    protected $client, $endpoint, $aiModel, $schema;
    private $apiKey;

    public function __construct()
    {
        $this->endpoint = config("services.yoreoracle.anthropic_api_uri");
        $this->apiKey = config("services.yoreoracle.anthropic_api_key");
        $this->aiModel = config("services.yoreoracle.anthropic_model");

        $this->client = new Client([
            'base_uri' => $this->endpoint,
            'headers' => [
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function getPlaceDetails($name, $location, $noCache = false)
    {
        // Cache the request result for 30 days
        $cacheKey = 'yoreoracle_place_details_' . md5("{$name}{$location}");

        if (Redis::exists($cacheKey) && !$noCache) {
            return json_decode(Redis::get($cacheKey), true);
        }
        // Prepare the chat request for Anthropic's API
        $requestData = [
            'model' => $this->aiModel,
            'max_tokens' => 2500,
            'temperature' => 1,
            'system' => 'You are "Yore-acle", a world renowned expert in archaeology, history, and heritage with encyclopedic knowledge of historical sites worldwide. When given the name and /  or location/coordinates of any place of interest, you will respond with around 3500 characers of detailed, ACCURATE and well-researched information in UK English, focusing on the historical significance, cultural heritage, and archaeological relevance of the site. Provide information clearly and accurately, including historical events, architectural features, and cultural context. Include Ordinance Survey Grid Reference and GeoLocation data plus links to Google Maps and official websites (if available), opening times and admission fees. Ensure clarity, accuracy, and completeness, presenting facts in a well-organized format. You prefer to give your response as a json object with the following structure: {"name": "site name", "location": "location details", "historical_significance": "historical information", "cultural_heritage": "cultural context", "archaeological_relevance": "archaeological details", "construction_phases": "construction phases", "grid_reference": "OS grid reference", "coordinates": {"lat": 0.0, "lng": 0.0}, "google_maps_link": "url", "official_website": "url", "opening_times": "opening hours", "admission_fees": "fee information"}',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => "Can you provide me with very informative and detailed historical, cultural and archaeological information about the place called {$name} located in {$location}? Please respond with a JSON object."
                ]
            ]
        ];

        $queryUri = "{$this->endpoint}v1/messages";

        try {
            $response = $this->client->post($queryUri, [
                'json' => $requestData,
            ]);

            // Parse and return the content from Anthropic's response
            $result = json_decode($response->getBody(), true);
            Log::debug('RESULT', $result);
            $data = $result['content'][0]['text'];
            Redis::setex($cacheKey, 86400, json_encode($data));
            return $data;
        } catch (\Exception $e) {
            return $e->getMessage();
        }

    }
}
