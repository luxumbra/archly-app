<?php

use App\Http\Controllers\PlaceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GooglePlacesController;
use App\Http\Controllers\WikipediaController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('places')->group(function () {
    // Route for text search
    Route::get('/search', [GooglePlacesController::class, 'textSearch']);

    Route::get('/details', [GooglePlacesController::class, 'placeDetails']);

    // Route for autocomplete search using Google Places API
    Route::get('/autocomplete', [GooglePlacesController::class, 'autocomplete']);

    // Route for fetching nearby places
    Route::get('/nearby', [GooglePlacesController::class, 'nearbySearch']);
});

Route::prefix('wikipedia')->group(function () {
    Route::prefix('page')->group(function () {
        // Route for getting wikipedia entry for a given place
        Route::get('/html', [WikipediaController::class, 'placeWikiPageHtml']);

        Route::get('/media', [WikipediaController::class, 'placeWikiPageMedia']);

    });
});

Route::prefix('place')->group(function () {
    Route::get('details', [PlaceController::class, 'show']);
});
