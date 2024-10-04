<?php

namespace App\Console;

use App\Jobs\FetchGooglePlacesJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Schedule Google Places job every 12 hours
        $schedule->job(new FetchGooglePlacesJob('ancient monuments in the UK', 'places.displayName,places.formattedAddress,places.location,places.id,places.rating,nextPageToken', location: ['55.9533', '-3.1883'], radius: 10000))->everyMinute();
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
    }
}

