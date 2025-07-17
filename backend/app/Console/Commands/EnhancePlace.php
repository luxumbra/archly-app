<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SupabaseService;

class EnhancePlace extends Command
{
    protected $signature = 'test:enhance-place {place_id}';
    protected $description = 'Enhance an existing place with archaeological data';

    public function handle(SupabaseService $supabaseService)
    {
        $placeId = $this->argument('place_id');
        
        try {
            // Get the place data
            $place = $supabaseService->get('places', [
                'select' => '*',
                'id' => "eq.{$placeId}",
                'is_deleted' => 'eq.false'
            ]);
            
            if (empty($place)) {
                $this->error('Place not found');
                return;
            }
            
            $placeData = $place[0];
            $placeName = $placeData['name'];
            
            $this->info("Enhancing place: {$placeName}");
            
            // Generate AI description
            $aiDescription = $this->generateArchaeologicalDescription($placeName);
            $siteType = $this->determineSiteType($placeName);
            $historicalPeriod = $this->determineHistoricalPeriod($placeName);
            
            $this->info("Site Type: {$siteType}");
            $this->info("Historical Period: {$historicalPeriod}");
            $this->info("AI Description length: " . strlen($aiDescription));
            
            // Enhance the place
            $result = $supabaseService->rpc('enhance_place_with_ai', [
                'p_place_id' => $placeId,
                'p_ai_description' => $aiDescription,
                'p_site_type' => $siteType,
                'p_historical_period' => $historicalPeriod
            ]);
            
            $this->info('Enhancement result: ' . ($result ? 'true' : 'false'));
            $this->info('Place enhanced successfully!');
            
        } catch (\Exception $e) {
            $this->error('Error enhancing place: ' . $e->getMessage());
        }
    }
    
    private function generateArchaeologicalDescription(string $placeName): string
    {
        $name = strtolower($placeName);
        
        if (str_contains($name, 'hill fort') || str_contains($name, 'hillfort')) {
            return "This Iron Age hill fort represents one of Britain's most characteristic defensive settlements from the pre-Roman period. Hill forts were strategically positioned elevated enclosures, typically dating from the Iron Age (800 BC - 50 AD), featuring defensive earthworks including ramparts and ditches. These sites served as both defensive strongholds and community centers, often controlling important trade routes and providing refuge during conflicts. Archaeological evidence from similar sites typically reveals roundhouses, storage pits, and evidence of metalworking, indicating thriving communities that engaged in agriculture, crafts, and trade.";
        }
        
        return "This archaeological site represents an important location in Britain's rich historical landscape. Archaeological evidence suggests significant human activity at this location.";
    }
    
    private function determineSiteType(string $placeName): string
    {
        $name = strtolower($placeName);
        
        if (str_contains($name, 'hill fort') || str_contains($name, 'hillfort')) {
            return 'iron_age_fort';
        }
        
        return 'archaeological_site';
    }
    
    private function determineHistoricalPeriod(string $placeName): string
    {
        $name = strtolower($placeName);
        
        if (str_contains($name, 'hill fort') || str_contains($name, 'iron age')) {
            return 'iron_age';
        }
        
        return 'unknown';
    }
}