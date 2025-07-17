<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SupabaseService;

class AddTestPlace extends Command
{
    protected $signature = 'test:add-place';
    protected $description = 'Add a test place with Google Place ID for debugging';

    public function handle(SupabaseService $supabaseService)
    {
        try {
            $testPlaces = [
                [
                    'p_google_place_id' => 'ChIJ8bsl-txbcUgRnDN8xkhiflE',
                    'p_name' => 'Test Archaeological Site',
                    'p_lat' => 51.5074,
                    'p_lng' => -0.1278,
                    'p_address' => 'London, UK',
                    'p_place_type' => 'archaeological_site',
                    'p_google_data' => json_encode([
                        'description' => 'A test archaeological site for debugging purposes',
                        'site_type' => 'ruins',
                        'historical_period' => 'roman'
                    ])
                ],
                [
                    'p_google_place_id' => 'ChIJ5-53K7KJcUgRpiJ-H1C3vKY',
                    'p_name' => 'Another Test Archaeological Site',
                    'p_lat' => 51.5085,
                    'p_lng' => -0.1289,
                    'p_address' => 'London, UK',
                    'p_place_type' => 'archaeological_site',
                    'p_google_data' => json_encode([
                        'description' => 'Another test archaeological site for debugging purposes',
                        'site_type' => 'castle',
                        'historical_period' => 'medieval'
                    ])
                ]
            ];

            foreach ($testPlaces as $placeData) {
                $this->info("Creating place: {$placeData['p_google_place_id']}");
                $response = $supabaseService->rpc('upsert_place_from_api', $placeData);
                $this->info("Created place ID: {$response}");
            }
            
            $this->info('Test place created successfully:');
            $this->info(json_encode($response, JSON_PRETTY_PRINT));
            
        } catch (\Exception $e) {
            $this->error('Failed to create test place: ' . $e->getMessage());
        }
    }
}