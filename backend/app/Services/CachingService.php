<?php

use Illuminate\Support\Facades\Redis;

class CachingService {
    public function get($cacheKey, $callback, $ttl = 3600) {
        $cachedData = Redis::get($cacheKey);
        if (!$cachedData) {
            $data = $callback();
            Redis::setex($cacheKey, $ttl, json_encode($data));
            return $data;
        }
        return json_decode($cachedData, true);
    }
}
