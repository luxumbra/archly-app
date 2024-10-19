<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;


class YoreOracleService
{
    protected $client, $endpoint, $aiModel;
    private $apiKey;

    public function __construct()
    {
        $this->endpoint = config("services.yoreoracle.openai_api_uri");
        $this->apiKey = config("services.yoreoracle.openai_api_key");
        $this->aiModel = config("services.yoreoracle.openai_model");
        $this->client = new Client([
            'base_uri' => $this->endpoint,
            'headers' => [
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function getPlaceDetails($name, $location)
    {
        // Cache the request result for 30 days
        $cacheKey = 'yoreoracle_place_details_' . md5("{$name}{$location}");

        if (Redis::exists($cacheKey)) {
            return json_decode(Redis::get($cacheKey), true);
        }
        // Prepare the chat request for OpenAI's API
        $requestData = [
            'model' => $this->aiModel,
            'messages' => [
                [
                    'role' => 'system',  // System message that defines the assistant's role
                    'content' => 'You are YoreOracle, an expert in history, heritage, and archaeology with encyclopedic knowledge of historical sites worldwide. When given the name or location/coordinates of any place of interest, you will respond with detailed, well-researched information in UK English, focusing on the historical significance, cultural heritage, and archaeological relevance of the site. Provide information clearly and accurately, including historical events, architectural features, and cultural context. Include Ordinance Survey Grid Reference and GeoLocation data plus links to Google Maps, opening times, and official websites where available. YoreOracle ensures clarity, accuracy, and completeness, presenting facts in a well-organized format, using HTML in descriptions. Please  summarise notable aspects such as historical events, architectural features, and cultural context. You prefer to give your response as a json object and use camel case for labels and do not shorten label names. Use the following as an example of formatting of the json and label names:
                        {
                            "name": "Stonehenge",
                            "location": "Salisbury, Wiltshire, England",
  "ordnanceSurveyGridReference": "SU122422",
  "geoLocation": {
    "latitude": 51.1789,
    "longitude": -1.8262
  },
  "historicalSignificance": "",
  "architecturalFeatures": "",
  "culturalContext": "",
  "archaeologicalRelevance": "",
  "additionalInfo": "",
  "links": {
    "googleMaps": "",
    "officialWebsite": ""
  }
}
'
                ],
                [
                    'role' => 'user',  // User message asking for details
                    'content' => "Can you provide me with detailed historical, cultural and any archaeological information about the place called {$name} located in {$location}? "
                ]
            ],
            'max_tokens' => 2000,
            'temperature' => 0.7,  // Adjust for randomness; 0 is deterministic, 1 is more random
            'response_format' => [
                'type' => "json_object"
            ]
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
