<?php

namespace App\Jobs;


use App\Services\GooglePlacesService;
use GuzzleHttp\Client;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Redis;

class FetchGooglePlacesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $nextPageToken;
    private $cacheKey;
    private $query;
    private $locationBias;
    private $fields;
    private $location;
    private $radius;

    /**
     * Create a new job instance.
     */
    public function __construct($query, $fields, $nextPageToken = null, $location, $radius)
    {
        $this->query = $query;
        $this->fields = $fields;
        $this->location = $location;
        $this->radius = $radius;
    }

    /**
     * Execute the job.
     */
    public function handle(GooglePlacesService $googlePlacesService): void
    {

        try {
            $nextPageToken = null;
            do {
                $result = $googlePlacesService->textSearch($this->query, $this->fields, $this->location);
                $nextPageToken = $result['nextPageToken'] ?? null;
                Redis::setex('places_search_cache_' . md5("{$this->query}{$nextPageToken}"), 86400, json_encode($result)); // Cache each page
            } while ($nextPageToken);
        } catch (\Exception $e) {
            \Log::error('Error fetching page:' . $e->getMessage());
        }
    }
}
