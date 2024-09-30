<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlacesController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('places')->group(function () {
    // Route for text search
    Route::get('/search', [PlacesController::class, 'textSearch']);

    Route::get('/details', [PlacesController::class, 'placeDetails']);

    // Route for autocomplete search using Google Places API
    Route::get('/autocomplete', [PlacesController::class, 'autocomplete']);

    // Route for fetching nearby places
    Route::get('/nearby', [PlacesController::class, 'nearbySearch']);
});


