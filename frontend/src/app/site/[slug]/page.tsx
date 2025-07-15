"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import SiteDetailMap from "@/components/maps/SiteDetailMap";
import TrowelRating from "@/components/TrowelRating";
import { camelToSentence, unslugify } from "@/utils/stringUtils";
import { Button, Tooltip } from "flowbite-react";
import type { SiteDetailPlace } from "@/types";
import { YoreLoader } from "@/components/Loading";
import { useYoreAssetProgress } from "@/hooks/useYoreAssetProgress";
import { Icon } from "@iconify/react";


const SiteDetailPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { slug } = params;
  const id = searchParams.get("id");
  const { progress, isComplete } = useYoreAssetProgress();
  const [place, setPlace] = useState<SiteDetailPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchPlaceDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/place/details`, {
        params: {
          place_id: id,
          fields: "*",
        },
      });

      const { data } = response;
      let parsedAiData;

      try {
        if (data.aiData && typeof data.aiData === "string") {
          parsedAiData = JSON.parse(data.aiData);
        } else {
          parsedAiData = data.aiData || {};
        }
      } catch (parseError) {
        console.error("Error parsing aiData", parseError);
        parsedAiData = {};
      }

      // Map AI response fields to expected frontend fields
      const mappedAiData = {
        historicalSignificance: parsedAiData.historical_significance,
        culturalContext: parsedAiData.cultural_heritage,
        geoLocation: parsedAiData.coordinates
          ? {
              latitude: parsedAiData.coordinates.lat,
              longitude: parsedAiData.coordinates.lng,
            }
          : undefined,
        coordinates: parsedAiData.coordinates,
        ordnanceSurveyGridReference: parsedAiData.grid_reference,
        visitorInformation: {
          openingTimes: parsedAiData.opening_times,
          admissionFees: parsedAiData.admission_fees,
          officialWebsite: parsedAiData.official_website,
          googleMapsLink: parsedAiData.google_maps_link,
        },
        relatedLinks: parsedAiData.google_maps_link
          ? [
              {
                title: "Google Maps",
                url: parsedAiData.google_maps_link,
              },
            ]
          : [],
      };

      setPlace({
        ...data,
        parsedAiData: mappedAiData,
      });
    } catch (fetchError) {
      console.error("Failed to fetch place details:", fetchError);
      setError("Failed to fetch place details");
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);

  useEffect(() => {
    fetchPlaceDetails();
  }, [fetchPlaceDetails]);

  // Debug logging for map data
  useEffect(() => {
    if (place) {
      console.log("SiteDetailPage: Place data loaded:", {
        placesDataLocation: place.placesData.location,
        parsedAiDataGeoLocation: place.parsedAiData.geoLocation,
        finalLocation:
          place.placesData.location || place.parsedAiData.geoLocation,
      });
    }
  }, [place]);

  if (loading || !isComplete)
    return (
      <div className="text-white flex items-center justify-center h-screen w-full">
        <YoreLoader size={120} progress={progress} showProgress={true} />
      </div>
    );
  if (error)
    return (
      <div className="text-white flex items-center justify-center h-screen w-full">
        <p>{error}</p>
      </div>
    );
  if (!place)
    return (
      <div className="text-white flex items-center justify-center h-screen w-full">
        <p>No place found.</p>
      </div>
    );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start">
      <div className="w-full h-[75vh] z-0">
        <SiteDetailMap
          location={place.placesData.location || place.parsedAiData.geoLocation}
          title={place.placesData.displayName.text}
          id={id || undefined}
        />
      </div>
      <div className="bg-gradient-to-b from-yore-dark/10 to-yore-primary/20 from-0% to-30% backdrop-blur-2xl z-10 text-white shadow-2xl shadow-black rounded-xl flex flex-col gap-3 items-start p-5 lg:p-16 max-w-5xl lg:-mt-32 relative overflow-hidden">
        <div className="heading">
          <h1 className="text-5xl font-serif text-yore-social">
            {place.placesData.displayName.text}
          </h1>
          <p>{unslugify(place.placesData.primaryType)}</p>
        </div>
        <div className="flex flex-row flex-wrap items-start justify-between w-full gap-3">
          <div className="text-gray-400 font-light">
            <p className="text-gray-400 font-light">
              Address: {place.placesData.formattedAddress}
            </p>
            {place.placesData.location ? (
              <p>
                Location: lat: {place.placesData.location.latitude} lng:{" "}
                {place.placesData.location.longitude}
              </p>
            ) : place.parsedAiData.coordinates ? (
              <p>
                Location: lat: {place.parsedAiData.coordinates.lat} lng:{" "}
                {place.parsedAiData.coordinates.lng}
              </p>
            ) : null}
            {place.parsedAiData.ordnanceSurveyGridReference ? (
              <p>OS Grid: {place.parsedAiData.ordnanceSurveyGridReference}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <span>Rating:</span>
              {place.placesData.rating ? (
                <TrowelRating rating={place.placesData.rating} size="md" />
              ) : (
                <span className="text-gray-400 italic">
                  Not yet rated. Get out there and check it out.
                </span>
              )}
            </div>
                  </div>
                  <div className="place-tools absolute top-0 left-0">
                      <Button.Group className="flex flex-row items-stretch justify-start gap-0">
                          <Tooltip content="LiDAR Overlay (Coming Soon)" placement="top" className="font-light font-sans text-xs">
                          <Button
                                color="blue"
                                href={`#li-overlay`}
                                  className="text-white bg-yore-discover/0 hover:bg-yore-discover/60 rounded-none rounded-tl-xl border-0"
                                  disabled
                                  aria-disabled="true"
                                  aria-description="LiDAR Overlay is not yet available"

                              ><Icon icon="mdi:layers" className="h-8 w-auto" /> <span className="sr-only">LiDAR Overlay</span></Button>
                            </Tooltip>
                          <Tooltip content="AR Overlay (Coming Soon)" placement="top" className="font-light font-sans text-xs">
                            <Button
                                    color="blue"
                                    href={`#ar-overlay`}
                                  className="text-white bg-yore-social/0 hover:bg-yore-social/60 rounded-none rounded-br-xl border-0"
                                  disabled
                                  aria-disabled="true"
                                    aria-description="Augmented Reality Overlay is not yet available"
                              ><Icon icon="mdi:augmented-reality" className="h-8 w-auto" /> <span className="sr-only">Augmented Reality Overlay</span></Button>
                            </Tooltip>
                          </Button.Group>
                  </div>
          <div className="place-buttons absolute top-0 right-0">
            <Button.Group className="flex flex-row-reverse justify-start items-stretch">
              <Button
                color="gray"
                href="/"
                className="text-white bg-yore-explore/50 hover:bg-yore-explore rounded-none  grow rounded-tr-xl border-0"
              >
                Back to map
              </Button>
              <Button
                color="green"
                href={`/site/${slug}/edit?id=${id}`}
                className="text-white bg-yore-social/50 hover:bg-yore-social grow rounded-none border-0 hover:bg-yore-social/80"
              >
                Edit Site
              </Button>
              <Button
                color="blue"
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.placesData.location?.latitude},${place.placesData.location?.longitude}`}
                className="text-white grow hover:bg-yore-discover rounded-none rounded-bl-xl border-0 bg-yore-discover/50"
              >
                Directions
              </Button>
            </Button.Group>
          </div>
        </div>

        {!place.aiData ? (
          <p>
            No description, yet.{" "}
            <a href="" className="">
              Let us know
            </a>
          </p>
        ) : (
          <div className="prose prose-lg prose-a:text-green-700 prose-invert prose-h2:text-3xl prose-h2:font-light">
            {place.parsedAiData.historicalSignificance ? (
              <div>
                <h2>Historical & Archaeological Significance</h2>
                <p>{place.parsedAiData.historicalSignificance}</p>
              </div>
            ) : null}
            {place.parsedAiData.phasesOfConstruction ? (
              <div>
                <h2>Phases of Construction</h2>
                {place.parsedAiData.phasesOfConstruction.map((phase, index) => {
                  const { phase: phaseLabel, yearRange, description } = phase;
                  return (
                    <div key={index}>
                      <h4>
                        {phaseLabel} ({yearRange})
                      </h4>
                      <p>{description}</p>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {place.parsedAiData.culturalContext ? (
              <div>
                <h2>Cultural Context</h2>
                <p>{place.parsedAiData.culturalContext}</p>
              </div>
            ) : null}
            {place.parsedAiData.research ? (
              <div>
                <h3>Further reading</h3>
                <ul className="flex flex-wrap ml-0 pl-0 gap-5 justify-between">
                  {place.parsedAiData.research.map((item, index) => (
                    <li key={index} className="mb-0 pl-0 max-w-[45%] w-full">
                      <h4 className="font-bold">{item.title}</h4>
                      <p>{item.summary}</p>
                      <a href={item.url}>Visit resource</a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {place.parsedAiData.visitorInformation ? (
              <div>
                <h3>Visitor Information</h3>
                <ul className="pl-0">
                  {Object.entries(place.parsedAiData.visitorInformation).map(
                    ([key, value]) => (
                      <li
                        key={key}
                        className="pl-0 mt-0 mb-8 flex items-start justify-start"
                      >
                        <strong className="capitalize w-1/5">
                          {camelToSentence(key)}:
                        </strong>{" "}
                        {typeof value === "object" && value !== null ? (
                          <ul className="my-0 pl-0">
                            {Object.entries(value).map(
                              ([nestedKey, nestedValue]) => (
                                <li
                                  key={nestedKey}
                                  className="capitalize mt-0 pl-0 last-of-type:mb-0"
                                >
                                  {camelToSentence(nestedKey)}:{" "}
                                  {String(nestedValue)}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : (
                          <span className="pl-0">{String(value)}</span>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}
            {place.parsedAiData.relatedLinks ? (
              <div>
                <h3>Links</h3>
                <ul>
                  {place.parsedAiData.relatedLinks.map((link, index) => {
                    const { title, url } = link;
                    return (
                      <li key={index}>
                        <a href={url}>{title}</a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteDetailPage;
