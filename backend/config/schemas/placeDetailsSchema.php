<?php

return [
    'name' => 'yore_place_schema',
    'schema' => [
        "type" => "object",
        "properties" => [
            "title" => ["type" => 'string', "description" => "Title/name of the place"],
            "address" => [
                "type" => "string",
                "description" => "The geographic location of the landmark."
            ],
            'geoLocation' => [
                'type' => 'object',
                'description'=> 'The true latitude & longitude of the place, sourced from Google maps.',
                'properties' => [
                    'latitude' => ['type' => 'number'],
                    'longitude' => ['type' => 'number'],
                ],
            ],
            'ordnanceSurveyGridReference' => ['type' => 'string', "description" => "Accurate long form OS grid reference for those using traditional maps. Sourced from https://gridreferencefinder.com/"],
            "historicalSignificance" => [
                "type" => "string",
                "description" => "A detailed explanation of the landmark's historical and archaeological significance."
            ],
            "phasesOfConstruction" => [
                "type" => "array",
                "items" => [
                    "type" => "object",
                    "properties" => [
                        "phase" => [
                            "type" => "string",
                            "description" => "The phase of construction."
                        ],
                        "yearRange" => [
                            "type" => "string",
                            "description" => "The time period during which the phase occurred."
                        ],
                        "description" => [
                            "type" => "string",
                            "description" => "A detailed description of what was constructed during this phase."
                        ]
                    ]
                ]
            ],
            "architecturalFeatures" => [
                "type" => "string",
                "description" => "Detailed information on the architectural features of the landmark."
            ],
            "culturalContext" => [
                "type" => "string",
                "description" => "In depth analysis of the the cultural and historical context of the landmark."
            ],
            "modernRelevance" => [
                "type" => "string",
                "description" => "In depth information on the modern significance of the landmark."
            ],
            "research" => [
                "type" => "array",
                "description" => "Links to further reading, research papers, blog posts, websites. List 6 items if possible, but only if the URI is accessible, accurate and does not give a 404 error.",
                "items" => [
                    "type" => "object",
                    "properties" => [
                        "title" => ["type" => "string"],
                        "summary" => ["type" => "string", "description" => "A brief summary of the item"],
                        "url" => ["type" => "string", "format" => "uri"]
                    ]
                    ],
                    "required" => ["title", "summary", "url"]
            ],
            "visitorInformation" => [
                "type" => "object",
                "description" => "Information taken from the Google Places page for the place or the official website, for those wishing to visit the place",
                "properties" => [
                    "location" => [
                        "type" => "string",
                        "description" => "Address or location of the landmark."
                    ],
                    "openingTimes" => [
                        "type" => "object",
                        "properties" => [
                            "winter" => [
                                "type" => "string",
                                "description" => "Winter opening hours."
                            ],
                            "summer" => [
                                "type" => "string",
                                "description" => "Summer opening hours."
                            ]
                        ]
                    ],
                    "admission" => [
                        "type" => "object",
                        "properties" => [
                            "adults" => [
                                "type" => "string",
                                "description" => "Admission price for adults."
                            ],
                            "children" => [
                                "type" => "string",
                                "description" => "Admission price for children."
                            ],
                            "concessions" => [
                                "type" => "string",
                                "description" => "Concession prices."
                            ]
                        ]
                    ],
                    "googleRating" => [
                        "type" => "string",
                        "description" => "The rating taken from Google Places, including an accurate count of how many ratings the landmark has had."
                    ],
                ]
            ],
            'relatedLinks' => [
                'type' => 'array',
                "description" => "related links to the place - Official website, wikipedia page, local guides, etc. Always includes officialwebsite, wikipedia",
                'items' => [
                    'type' => 'object',
                    'properties' => [
                        'title' => ['type' => 'string'],
                        'url' => ['type' => 'string', 'format' => 'uri'],
                    ],
                ],
                'required' => ['title', 'url'],
                'additionalProperties' => false,
            ],
        ],
        "required" => [
            'title',
            "address",
            "geoLocation",
            "ordnanceSurveyGridReference",
            "historicalSignificance",
            "phasesOfConstruction",
            "architecturalFeatures",
            "culturalContext",
            "modernRelevance",
            "visitorInformation",
            "relatedLinks"
        ],
    ]
];

