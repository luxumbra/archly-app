<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// CSRF route for SPA authentication - must be in web routes for proper session handling
Route::get('/sanctum/csrf-cookie', function () {
    return response('', 204);
});
