<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;

class WikipediaService
{
    protected $client, $apiKey, $endpoint;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.google.places_api_key');
        $this->endpoint = 'https://en.wikipedia.org/api/rest_v1/page';
        $this->apiUA = 'Please contact dave@foresite.rocks';
    }

    public function getPlaceWikiPageHtml($query)
    {
        try {

            $response = $this->client->get("{$this->endpoint}/html/{$query}", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Api-User-Agent' => $this->apiUA,
                ],
                'query' => [
                    'redirect' => false
                ],
            ]);
            $htmlContent = $response->getBody()->getContents();

            // Load HTML into DOMDocument so we can manipulate it
            $dom = new \DOMDocument();
            @$dom->loadHTML($htmlContent);

            // Create a DOMXPath object
            $xpath = new \DOMXPath($dom);

            // Extract desired elements
            $title = $dom->getElementsByTagName('title')->item(0)->nodeValue;

            // Find all <p> elements with an id that starts with "mw"
            $paragraphs = $xpath->query('//p[starts-with(@id, "mw")]');
            $paragraphsHTML = [];
            $paragraphTexts = [];

            // Function to get the inner HTML of a node
            function getInnerHtml($node) {
                $innerHTML = '';
                foreach ($node->childNodes as $child) {
                    $innerHTML .= $node->ownerDocument->saveHTML($child);
                }
                return $innerHTML;
            }

            foreach ($paragraphs as $paragraph) {
                $paragraphTexts[] = trim($paragraph->textContent); // Collect the text
                $paragraphsHTML[] = getInnerHtml($paragraph);
            }

            return response()->json([
                'title' => $title,
                'contentHTML' => $paragraphsHTML,
                'contentText' => $paragraphTexts
            ]);

        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getPlaceWikiPageMedia($query)
    {
        try {

            $response = $this->client->get("{$this->endpoint}/media-list/{$query}", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Api-User-Agent' => $this->apiUA,
                ],
                'query' => [
                    'redirect' => false
                ],
            ]);

            return json_decode($response->getBody()->getContents(), true);

        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
