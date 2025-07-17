<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_id', // Google or external place ID
        'slug', // URL-friendly slug
        'name',
        'address',
        'lat',
        'lng',
        'raw_data', // JSON or text for storing extra API data
    ];

    protected $casts = [
        'raw_data' => 'array',
        'lat' => 'float',
        'lng' => 'float',
    ];

    /**
     * Generate a slug from the place name
     */
    public static function generateSlug($name)
    {
        return Str::slug($name);
    }

    /**
     * Find place by Google Place ID or slug
     */
    public static function findByPlaceIdOrSlug($identifier)
    {
        return static::where('external_id', $identifier)
            ->orWhere('slug', $identifier)
            ->first();
    }
}
