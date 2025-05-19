<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redis;

class CacheController extends Controller
{
    public function clearRedisCache()
    {
        // Clear the Redis cache using Redis facade
        Redis::flushall();  // This will clear the entire Redis cache

        return response()->json(['message' => 'Redis cache cleared successfully.'], 200);
    }
}
