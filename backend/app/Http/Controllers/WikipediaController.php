<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\WikipediaService;

class WikipediaController extends Controller
{
    protected $wikipediaService;

    public function __construct(WikipediaService $wikipediaService)
    {
        $this->wikipediaService = $wikipediaService;
    }

    // Get wikipedia's content for the given place
    public function placeWikiPageHtml(Request $request)
    {
        $query = $request->input('query');  // Get search query from request
        $noCache = $request->query('noCache');
        $response = $this->wikipediaService->getWikiPageDetails($query);

        return response()->json($response);
    }

    // Get wikipedia's media for the given place
    public function placeWikiPageMedia(Request $request)
    {
        $query = $request->input('query');  // Get search query from request
        $noCache = $request->query('noCache');
        $response = $this->wikipediaService->getWikiPageMedia($query);

        return response()->json($response);
    }
}
