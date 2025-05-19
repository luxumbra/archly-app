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
        $this->endpoint = config("services.yoreoracle.openai_api_uri");
        $this->apiKey = config("services.yoreoracle.openai_api_key");
        $this->aiModel = config("services.yoreoracle.openai_model");
        $this->schema = config("schemas.placeDetailsSchema");

        $this->client = new Client([
            'base_uri' => $this->endpoint,
            'headers' => [
                'Authorization' => "Bearer {$this->apiKey}",
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
        // Prepare the chat request for OpenAI's API
        $requestData = [
            'model' => $this->aiModel,
            'messages' => [
                [
                    'role' => 'system',  // System message that defines the assistant's role
                    'content' => 'You are YoreOracle, an expert in history, heritage, and archaeology with encyclopedic knowledge of historical sites worldwide. When given the name or location/coordinates of any place of interest, you will respond with around 3500 characers of detailed, ACCURATE and well-researched information in UK English, focusing on the historical significance, cultural heritage, and archaeological relevance of the site. Provide information clearly and accurately, including historical events, architectural features, and cultural context. Include Ordinance Survey Grid Reference and GeoLocation data plus links to Google Maps and official websites where available, opening times and admission fees. Ensure clarity, accuracy, and completeness, presenting facts in a well-organized format. You prefer to give your response as a json object'
                ],
                [
                    'role' => 'user',  // User message asking for details
                    'content' => "Can you provide me with detailed historical, cultural and any archaeological information about the place called {$name} located in {$location}? "
                ]
            ],
            'max_tokens' => 2500,
            'temperature' => 1,  // Adjust for randomness; 0 is deterministic, 1 is more random
            'response_format' => [
                'type' => 'json_schema',
                'json_schema' => $this->schema,
            ],
        ];

        $queryUri = "{$this->endpoint}chat/completions";

        try {
            $response = $this->client->post($queryUri, [
                'json' => $requestData,
            ]);

            // Parse and return the content of the first response choice
            $result = json_decode($response->getBody(), true);
            Log::debug('RESULT', $result);
            $data = $result['choices'][0]['message']['content'];
            Redis::setex($cacheKey, 86400, json_encode($data));
            return $data;
        } catch (\Exception $e) {
            return $e->getMessage();
        }

    }
}
