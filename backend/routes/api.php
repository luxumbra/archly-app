<?php

use App\Http\Controllers\CacheController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\UserProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GooglePlacesController;
use App\Http\Controllers\WikipediaController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Auth routes
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest')
    ->name('register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('guest')
    ->name('password.email');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.store');

Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->name('logout');

Route::prefix('places')->group(function () {
    // Route for text search
    Route::get('/search', [GooglePlacesController::class, 'textSearch']);

    Route::get('/details', [GooglePlacesController::class, 'placeDetails']);

    // Route for autocomplete search using Google Places API
    Route::get('/autocomplete', [GooglePlacesController::class, 'autocomplete']);

    // Route for fetching nearby places
    Route::get('/nearby', [GooglePlacesController::class, 'nearbySearch']);
});

Route::prefix('place')->group(function () {
    Route::get('details', [PlaceController::class, 'showByGoogleId']);
    Route::get('{slug}', [PlaceController::class, 'showBySlug']);
});

Route::prefix('redis-cache')->group(function () {
    Route::delete('/clear', [CacheController::class,'clearRedisCache']);
});

// Protected routes that require authentication
Route::middleware(['auth:sanctum'])->group(function () {
    // User profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserProfileController::class, 'show']);
        Route::patch('/', [UserProfileController::class, 'update']);
        Route::get('/achievements', [UserProfileController::class, 'achievements']);
        Route::get('/points', [UserProfileController::class, 'points']);
        Route::get('/streak', [UserProfileController::class, 'streak']);
    });

    // Place interaction routes
    Route::prefix('places')->group(function () {
        Route::get('/nearby', [PlaceController::class, 'nearby']);
        Route::get('/favorites', [PlaceController::class, 'favorites']);
        Route::get('/visits', [PlaceController::class, 'visits']);
        Route::get('/{id}', [PlaceController::class, 'show']);
        Route::post('/{id}/visit', [PlaceController::class, 'visit']);
        Route::post('/{id}/favorite', [PlaceController::class, 'toggleFavorite']);
        Route::post('/{id}/review', [PlaceController::class, 'review']);
    });
});
