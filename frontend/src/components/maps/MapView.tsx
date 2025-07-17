"use client";
import { Map } from "@vis.gl/react-google-maps";
import { useState, useEffect, useCallback, useRef } from "react";
import ClusteredMapMarkers from "@/components/maps/ClusteredMapMarkers";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import SearchRadiusCircle from "@/components/maps/SearchRadiusCircle";
import MapProvider from "@/providers/MapProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Place, PlacesSearchResponse, Location } from "@/types";
import { useYoreAssetProgress } from "@/hooks/useYoreAssetProgress";
import { YoreLoader } from "../Loading";
import { Icon } from "@iconify/react";
import TextSearch from "@/components/TextSearch";
import useSearchCache from "@/hooks/useSearchCache";
import { geocodeWithFallback } from "@/utils/geocoding";

interface MapViewProps {
  initialQuery?: string;
  initialLocation?: Location;
}

const MapView = ({
  initialQuery = "ancient monuments historical archaeological sites",
  initialLocation = { latitude: 51.64586565016349, longitude: -2.32646578269444953 },
}: MapViewProps) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] =
    useState<Location>(initialLocation);
  const [mapCenter, setMapCenter] = useState<Location>(initialLocation);
  const [mapZoom, setMapZoom] = useState<number>(10);
  const [useUserLocation, setUseUserLocation] = useState(false); // Track if user wants to use their location
  const [currentMapCenter, setCurrentMapCenter] =
    useState<Location>(initialLocation);
  const [mapHasMoved, setMapHasMoved] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>(initialQuery);
  const API_URI = process.env.NEXT_PUBLIC_API_URL;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { progress, isComplete } = useYoreAssetProgress();
  const {
    location: userLocation,
    loading: locationLoading,
    permission,
    requestLocation,
  } = useGeolocation();
  const { getCachedResults, setCachedResults, clearExpiredEntries } = useSearchCache();

  // Debug user location state
  console.log("MapView: Current location state:", {
    userLocation,
    permission,
    locationLoading,
  });

  // Set the container style for a full-screen map
  const containerStyle = {
    width: "100vw",
    height: "100vh",
    zIndex: 0,
  };

  // Maximum allowed radius is 50km (50,000 meters) - approximately 31 miles
  const SEARCH_RADIUS = 50000; // 50,000 meters = ~31 miles (Google Places API limit)

  // Save map state to localStorage
  const saveMapState = useCallback(
    (center: Location, zoom: number, places: Place[]) => {
      const mapState = {
        center,
        zoom,
        places,
        timestamp: Date.now(),
      };
      console.log("Saving map state to localStorage:", mapState);
      localStorage.setItem("yore-map-state", JSON.stringify(mapState));
    },
    [],
  );

  // Restore map state from localStorage
  const restoreMapState = useCallback(() => {
    console.log("restoreMapState function called");
    try {
      const savedState = localStorage.getItem("yore-map-state");
      console.log("Raw saved state from localStorage:", savedState);

      if (savedState) {
        const mapState = JSON.parse(savedState);
        console.log("Parsed map state:", mapState);

        // Only restore if saved within last 30 minutes
        const ageInMinutes = (Date.now() - mapState.timestamp) / (1000 * 60);
        console.log("Map state age in minutes:", ageInMinutes);

        if (Date.now() - mapState.timestamp < 30 * 60 * 1000) {
          console.log("Restoring map state:", mapState);
          setMapCenter(mapState.center);
          setSearchLocation(mapState.center);
          setMapZoom(mapState.zoom);
          if (mapState.places && mapState.places.length > 0) {
            setPlaces(mapState.places);
          }
          return true;
        } else {
          console.log("Map state too old, not restoring");
        }
      } else {
        console.log("No saved state found in localStorage");
      }
    } catch (error) {
      console.error("Error restoring map state:", error);
    }
    return false;
  }, []);

  const center = {
    lat: mapCenter.latitude,
    lng: mapCenter.longitude,
  };

  // Fetch places based on location and radius with caching
  const fetchPlaces = useCallback(
    async (location: Location, searchQuery: string = initialQuery) => {
      if (!location) return;

      console.log("Fetching places for location:", location, "query:", searchQuery);

      // Check cache first
      const cachedResults = getCachedResults(searchQuery, location, SEARCH_RADIUS);
      if (cachedResults) {
        console.log("Using cached results:", cachedResults.length, "places");
        console.log(`${API_URI}/places/search?query=${searchQuery}&location=${location.latitude},${location.longitude}&radius=${SEARCH_RADIUS}&fields=places.displayName,places.formattedAddress,places.id,places.location`);
        setPlaces(cachedResults);
        saveMapState(location, mapZoom, cachedResults);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URI}/places/search?query=${searchQuery}&location=${location.latitude},${location.longitude}&radius=${SEARCH_RADIUS}&fields=places.displayName,places.formattedAddress,places.id,places.location`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch places");
        }

        const data: PlacesSearchResponse = await response.json();
        console.log("Places API response:", data);

        // Handle both success and error responses
        if (data.places && Array.isArray(data.places)) {
          console.log("Setting places:", data.places.length, "places found");
          setPlaces(data.places);
          // Cache the results
          setCachedResults(searchQuery, location, SEARCH_RADIUS, data.places);
          // Save map state after successful search
          saveMapState(location, mapZoom, data.places);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          console.log("No places found");
          setPlaces([]);
          setCachedResults(searchQuery, location, SEARCH_RADIUS, []);
          saveMapState(location, mapZoom, []);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [API_URI, initialQuery, SEARCH_RADIUS, mapZoom, saveMapState, getCachedResults, setCachedResults],
  );

  // Update search location when user location changes (only if toggle is enabled)
  useEffect(() => {
    if (userLocation && permission === "granted" && useUserLocation) {
      console.log("MapView: User location obtained:", userLocation);
      setSearchLocation(userLocation);
      setMapCenter(userLocation);
      setCurrentMapCenter(userLocation);

      // Center the map on user location
      if (mapRef.current) {
        console.log("MapView: Centering map on user location");
        mapRef.current.setCenter({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
        mapRef.current.setZoom(12); // Good zoom level for local exploration
        setMapZoom(12);
        setMapHasMoved(false); // Reset moved flag since we're programmatically moving
      }
    }
  }, [userLocation, permission, useUserLocation]);

  // Fetch places when search location changes
  useEffect(() => {
    fetchPlaces(searchLocation, currentQuery);
  }, [searchLocation, fetchPlaces, currentQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Restore map state on component mount
  useEffect(() => {
    console.log("MapView: Component mounted");
    console.log("MapView: Initial search location:", searchLocation);
    console.log("MapView: Initial map center:", mapCenter);

    // Try to restore previous map state
    const restored = restoreMapState();
    if (restored) {
      console.log("Map state was successfully restored from localStorage");
    } else {
      // No saved state - user must manually search using "Search this area" button
      console.log("No saved state found - waiting for user to search");
    }
  }, [restoreMapState]);

  // Search this area functionality (uses default archaeological query)
  const searchThisArea = useCallback(() => {
    // Get the current map center from the map instance
    const map = mapRef.current;
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (center) {
        const currentLocation = {
          latitude: center.lat(),
          longitude: center.lng(),
        };
        console.log(
          "Manual area search triggered for:",
          currentLocation,
          "zoom:",
          zoom,
        );

        // Reset to default archaeological query for area searches
        console.log("Resetting to default query for area search");
        setCurrentQuery(initialQuery);
        setSearchLocation(currentLocation);
        setMapCenter(currentLocation); // Update state only when user explicitly searches
        setMapHasMoved(false); // Reset the moved flag after search
        if (zoom !== undefined) {
          setMapZoom(zoom);
        }

        // Directly call fetchPlaces with default query to avoid text search conflict
        fetchPlaces(currentLocation, initialQuery);
      }
    } else {
      console.log("No map instance available for search");
    }
  }, [initialQuery, fetchPlaces]);

  // Handle map initialization via center change event
  const handleMapInitialization = useCallback(
    (map: google.maps.Map) => {
      if (mapRef.current !== map) {
        console.log("Map initialized successfully");
        mapRef.current = map;

        // If we have user location and want to use it, center the map immediately
        if (userLocation && permission === "granted" && useUserLocation) {
          console.log(
            "MapView: Map initialized, centering on user location immediately",
          );
          map.setCenter({
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          });
          map.setZoom(12);
          setMapZoom(12);
          setMapHasMoved(false);
        }
      }
    },
    [userLocation, permission, useUserLocation],
  );

  // Toggle location usage
  const toggleLocationUsage = useCallback(() => {
    console.log("toggleLocationUsage called, current state:", {
      permission,
      useUserLocation,
    });

    if (permission === "granted") {
      if (useUserLocation) {
        // Disable location usage (keep permission but don't use it)
        console.log("MapView: Disabling location usage");
        setUseUserLocation(false);
        // Switch to using current map center
        setSearchLocation(mapCenter);
      } else {
        // Re-enable location usage
        console.log("MapView: Re-enabling location usage");
        setUseUserLocation(true);
        if (userLocation) {
          console.log("MapView: Using existing user location:", userLocation);
          setSearchLocation(userLocation);
          setMapCenter(userLocation);
          setCurrentMapCenter(userLocation);

          // Center map immediately if available
          if (mapRef.current) {
            console.log("MapView: Centering map on user location");
            mapRef.current.setCenter({
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            });
            mapRef.current.setZoom(12);
            setMapZoom(12);
            setMapHasMoved(false);
          } else {
            console.log("MapView: Map ref not available yet");
          }
        } else {
          console.log(
            "MapView: No user location available yet, requesting it now",
          );
          requestLocation();
        }
      }
    } else {
      // Request location permission
      console.log(
        "MapView: Requesting location permission, calling requestLocation()",
      );
      requestLocation();
      setUseUserLocation(true);
    }
  }, [permission, useUserLocation, userLocation, mapCenter, requestLocation]);

  // Center on user location (for target button)
  const centerOnUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      console.log("Centering on user location via target button and searching");
      mapRef.current.setCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      mapRef.current.setZoom(12);
      setMapZoom(12);
      setMapHasMoved(false);
      setCurrentMapCenter(userLocation);

      // Also update search location to trigger place search
      setSearchLocation(userLocation);
      setMapCenter(userLocation);
    } else if (!userLocation && permission === "granted") {
      console.log("No location cached, requesting fresh location");
      requestLocation();
    }
  }, [userLocation, permission, requestLocation]);

  // Handle map center changes - track for circle display but don't update search state
  const handleMapCenterChange = useCallback(
    (event: google.maps.MapMouseEvent) => {
      console.log("MapView: onCenterChanged event fired");

      // Try to get the map instance from the event
      const map = event?.target || event?.map || mapRef.current;
      if (!map) {
        console.log("MapView: No map instance in event");
        return;
      }

      // Initialize map reference if not set
      handleMapInitialization(map);

      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center) {
        const newLocation = { latitude: center.lat(), longitude: center.lng() };

        console.log("MapView: Map center updated to:", newLocation);

        // Update current map center for circle display
        setCurrentMapCenter(newLocation);
        setMapHasMoved(true);

        // Only update zoom for circle calculation
        if (zoom !== undefined && Math.abs(zoom - mapZoom) > 0.1) {
          console.log("MapView: Zoom level changed to:", zoom);
          setMapZoom(zoom);
        }
      }
    },
    [mapZoom, handleMapInitialization],
  );

  // Handle text search with geocoding
  const handleTextSearch = useCallback(async (query: string) => {
    console.log("Text search triggered:", query);

    // Clear expired cache entries
    clearExpiredEntries();

    // Update current query
    setCurrentQuery(query);

    // Reset map moved state since we're doing a new search
    setMapHasMoved(false);

    try {
      setLoading(true);
      setError(null);

      // First geocode the search query to get coordinates
      console.log("Geocoding search query:", query);
      const geocodeResult = await geocodeWithFallback(query);

      if ('error' in geocodeResult) {
        console.error("Geocoding failed:", geocodeResult.error);
        setError(`Could not find location: ${geocodeResult.error}`);
        return;
      }

      console.log("Geocoded location:", geocodeResult.location);
      console.log("Formatted address:", geocodeResult.formattedAddress);

      // Update map center to the geocoded location
      setMapCenter(geocodeResult.location);
      setSearchLocation(geocodeResult.location);
      setCurrentMapCenter(geocodeResult.location);

      // Center the map on the geocoded location
      if (mapRef.current) {
        console.log("Centering map on geocoded location:", geocodeResult.location);
        mapRef.current.setCenter({
          lat: geocodeResult.location.latitude,
          lng: geocodeResult.location.longitude,
        });
        mapRef.current.setZoom(12); // Good zoom level for exploring the area
        setMapZoom(12);
        console.log("Map centered and zoomed to level 12");
      } else {
        console.warn("Map ref not available for centering");
      }

      // Perform search at the geocoded location
      console.log("Starting place search at geocoded location");
      await fetchPlaces(geocodeResult.location, query);

    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [clearExpiredEntries, fetchPlaces, mapRef]);

  // Handle clearing text search (reset to default query)
  const handleClearSearch = useCallback(() => {
    console.log("Clearing text search, reverting to default query");
    setCurrentQuery(initialQuery);

    // Use current map center for search with default query
    const searchLocation = userLocation && useUserLocation ? userLocation : currentMapCenter;
    fetchPlaces(searchLocation, initialQuery);
  }, [initialQuery, userLocation, useUserLocation, currentMapCenter, fetchPlaces]);

  // Show "search this area" button and circle when no places loaded or when map has been moved
  const shouldShowSearchButton = places.length === 0 || mapHasMoved;

  return (
    <MapProvider>
      <div className="group relative text-black w-screen h-screen flex items-center justify-center z-0">
        <div className="absolute top-0 bottom-auto translate-y-16 left-0 w-full z-10 bg-transparent pointer-events-none group-hover:translate-y-16 transition-transform duration-300 ease-in-out">
          <div className="flex justify-center pt-4 px-4 ">
            <div className="pointer-events-auto">
              <TextSearch
                onSearch={handleTextSearch}
                loading={loading}
                placeholder="Search the Yore-acle..."
                onClear={handleClearSearch}
                initialValue={currentQuery === initialQuery ? "" : currentQuery}
              />
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-56 h-full z-10 bg-transparent">
          <div className="flex flex-col py-32 px-4 gap-6 items-end justify-start">
            {/* Debug info */}
            {/* <div className="mb-2 text-xs text-gray-500">
                Debug: permission={permission}, useUserLocation={useUserLocation.toString()}, locationLoading={locationLoading.toString()}
              </div> */}

            {(permission === "prompt" || permission === "denied") &&
              !useUserLocation && (
                <div
                  className="bg-white p-4 rounded-lg shadow-lg border"
                  role="dialog"
                  aria-labelledby="location-prompt-title"
                  aria-describedby="location-prompt-desc"
                >
                  <h3
                    id="location-prompt-title"
                    className="text-sm font-medium mb-2"
                  >
                    Find places near you
                  </h3>
                  <p
                    id="location-prompt-desc"
                    className="text-sm mb-3 text-gray-600"
                  >
                    {permission === "denied"
                      ? "Location access is currently disabled. Click to enable location services and discover historical sites within 31 miles of your position."
                      : "Enable location to discover historical sites within 31 miles of your current position"}
                  </p>
                  <button
                    onClick={toggleLocationUsage}
                    disabled={locationLoading}
                    className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={
                      locationLoading
                        ? "Getting your location"
                        : "Request location access"
                    }
                  >
                    {locationLoading
                      ? "Getting location..."
                      : "Enable Location"}
                  </button>
                </div>
              )}

            {permission === "granted" && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={toggleLocationUsage}
                  className={`p-2 rounded-lg shadow-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    useUserLocation
                      ? "bg-green-500 text-blue-200 hover:bg-green-600 focus:ring-green-500"
                      : "bg-yore-social text-blue-200 hover:bg-yore-social/70 focus:ring-yore-social"
                  }`}
                  aria-label={
                    useUserLocation
                      ? "Switch to map center mode"
                      : "Use your current location"
                  }
                >
                  <span>
                    {useUserLocation ? (
                      <Icon icon="mdi:pin-outline" className="w-8 h-auto" />
                    ) : (
                      <Icon icon="mdi:pin-off-outline" className="w-8 h-auto" />
                    )}{" "}
                    <span className="sr-only" aria-hidden>
                      {useUserLocation ? "Sharing Location" : "Use my Location"}
                    </span>
                  </span>
                </button>

                {/* Target button for quick return to user location */}
                <button
                  onClick={centerOnUserLocation}
                  disabled={!userLocation && permission !== "granted"}
                  className="p-2 rounded-lg shadow-lg text-sm font-medium bg-blue-500 text-blue-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Center map on your location"
                  title="Return to your location"
                >
                  <span>
                    <Icon icon="mdi:crosshairs-gps" className="w-8 h-auto" />
                    <span className="sr-only" aria-hidden>
                      My Location
                    </span>
                  </span>
                </button>
              </div>
            )}

            {permission === "denied" && !useUserLocation && (
              <div
                className="bg-amber-50 border border-amber-200 p-4 rounded-lg shadow-lg"
                role="alert"
                aria-live="polite"
              >
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Location Access Needed</p>
                  <p className="mb-2">To enable location services:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Check your browser's location settings</li>
                    <li>Ensure location services are enabled on your device</li>
                    <li>
                      Look for a location icon in your browser's address bar
                    </li>
                    <li>Try refreshing the page after enabling location</li>
                  </ul>
                  <button
                    onClick={() => {
                      setUseUserLocation(false);
                      // Clear any error state
                    }}
                    className="mt-2 text-xs bg-amber-700 text-white px-2 py-1 rounded hover:bg-amber-800"
                  >
                    Use Map Instead
                  </button>
                </div>
              </div>
            )}

            {/* Search this area button */}
            {shouldShowSearchButton && (
              <div>
                <div className="bg-white p-3 rounded-lg shadow-lg border border-green-200 flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-600 mb-2 text-left">
                    Drag the map to explore, then click to search within ~30
                    miles
                  </p>
                  <button
                    onClick={searchThisArea}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    aria-label="Search for places in the current map area"
                  >
                    {loading ? "Searching..." : "🔍 Search This Area"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {loading ||
          (!isComplete && (
            <div
              className="absolute inset-0 text-white flex items-center justify-center h-screen w-full z-20"
              role="status"
              aria-live="polite"
            >
              <YoreLoader progress={progress} showProgress={true} size={120} />
            </div>
          ))}

        {/* Search radius circle overlay */}
        {shouldShowSearchButton && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <SearchRadiusCircle
              center={currentMapCenter}
              radius={SEARCH_RADIUS}
              visible={true}
              zoomLevel={mapZoom}
            />
          </div>
        )}

        <Map
          style={containerStyle}
          defaultCenter={center}
          defaultZoom={mapZoom}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          mapId="6899f89edbf4a393d05523a5"
          onCenterChanged={handleMapCenterChange}
        >
          {places && places.length > 0 && (
            <ClusteredMapMarkers places={places} />
          )}

          {/* You are here marker */}
          {userLocation && permission === "granted" && (
            <AdvancedMarker
              position={{
                lat: userLocation.latitude,
                lng: userLocation.longitude,
              }}
              title="You are here"
            >
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                {/* Pulsing ring animation */}
                <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-25"></div>
              </div>
            </AdvancedMarker>
          )}
        </Map>

        {/* Error display */}
        {error && (
          <div
            className="absolute bottom-4 left-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-sm"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium">Error loading places</h4>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MapProvider>
  );
};

export default MapView;
