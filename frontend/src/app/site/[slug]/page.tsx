import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteDetailClient from './SiteDetailClient';
import { siteTypeToReadable } from '@/utils/stringUtils';

// Types for the server-side data fetching
interface PlaceData {
  placesData: {
    displayName: { text: string };
    formattedAddress: string;
    location?: { latitude: number; longitude: number };
    rating?: number;
  };
  siteType?: string;
  aiData?: string;
  parsedAiData?: {
    historicalSignificance?: string;
    culturalContext?: string;
    geoLocation?: { latitude: number; longitude: number };
    coordinates?: { lat: number; lng: number };
    ordnanceSurveyGridReference?: string;
    visitorInformation?: any;
    relatedLinks?: any[];
    phasesOfConstruction?: any[];
    research?: any;
  };
}

interface PageProps {
  params: { slug: string };
  searchParams: { id?: string };
}

// Server-side data fetching function
async function getPlaceData(id: string): Promise<PlaceData | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/place/details?place_id=${id}&fields=*`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
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
      phasesOfConstruction: parsedAiData.phases_of_construction
        ? parsedAiData.phases_of_construction.map((phase: any) => ({
            phase: phase.period,
            yearRange: phase.estimated_date,
            description: phase.description,
          }))
        : undefined,
      research: parsedAiData.research,
    };

    return {
      ...data,
      parsedAiData: mappedAiData,
    };
  } catch (error) {
    console.error('Failed to fetch place data:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const id = searchParams.id;

  if (!id) {
    return {
      title: 'Place Not Found | Yore',
      description: 'The requested place could not be found.',
    };
  }

  const place = await getPlaceData(id);

  if (!place) {
    return {
      title: 'Place Not Found | Yore',
      description: 'The requested place could not be found.',
    };
  }

  const title = place.placesData.displayName.text;
  const placeType = place.siteType ? siteTypeToReadable(place.siteType) : 'Historical Site';

  // Create description from AI data or fallback
  let description = '';
  if (place.parsedAiData?.historicalSignificance) {
    // Take first 160 characters of historical significance
    description = place.parsedAiData.historicalSignificance.substring(0, 160);
    if (description.length === 160) {
      description += '...';
    }
  } else {
    description = `Discover ${title}, a ${placeType.toLowerCase()} in ${place.placesData.formattedAddress}. Explore its historical significance and archaeological importance.`;
  }

  return {
    title: `${title} - ${placeType} | Yore`,
    description: description,
    openGraph: {
      title: `${title} - ${placeType}`,
      description: description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${placeType}`,
      description: description,
    },
  };
}

// Server Component
export default async function SiteDetailPage({ params, searchParams }: PageProps) {
  const id = searchParams.id;

  if (!id) {
    notFound();
  }

  const place = await getPlaceData(id);

  if (!place) {
    notFound();
  }

  // Pass the server-fetched data to the client component
  return <SiteDetailClient initialPlace={place} slug={params.slug} id={id} />;
}
