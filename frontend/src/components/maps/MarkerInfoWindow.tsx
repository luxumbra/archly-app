'use client'

import React from 'react'
import { InfoWindow } from '@vis.gl/react-google-maps'
import { Place } from '@/types'
import { unslugify } from '@/utils/stringUtils'
import { Icon } from '@iconify/react'
import TrowelRating from '@/components/TrowelRating'

interface MarkerInfoWindowProps {
  place: Place
  isOpen: boolean
  onClose: () => void
}

const MarkerInfoWindow: React.FC<MarkerInfoWindowProps> = ({
  place,
  isOpen,
  onClose
}) => {
  if (!isOpen || !place.location) return null

  const handleViewDetails = () => {
    const slug = place.displayName?.text?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'site'
    window.location.href = `/site/${slug}?id=${place.id}`
  }

  // Extract category/type information
  const category = place.primaryType ? unslugify(place.primaryType) : 'Archaeological Site'
  const hasRating = place.rating && place.rating > 0

  return (
    <InfoWindow
      position={{
        lat: place.location.latitude,
        lng: place.location.longitude
      }}
          onCloseClick={onClose}

      options={{
        pixelOffset: new google.maps.Size(0, -10),
        disableAutoPan: false,
          maxWidth: 300,
      }}
    >
      <div className="p-0 m-0 bg-yore-dark rounded-lg shadow-lg overflow-hidden min-w-[280px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-yore-explore to-yore-explore/70 p-3 text-white rounded-lg rounded-b-none w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-serif text-lg font-semibold leading-tight mb-1">
                {place.displayName?.text || 'Archaeological Site'}
              </h3>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Icon icon="mdi:map-marker" className="h-4 w-4" />
                <span className="capitalize">{category}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close info window"
            >
              <Icon icon="mdi:close" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Address */}
          {place.formattedAddress && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                {place.formattedAddress}
              </p>
            </div>
          )}

          {/* Coordinates */}
          <div className="mb-3 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-1">
              <Icon icon="mdi:crosshairs-gps" className="h-3 w-3" />
              <span>
                {place.location.latitude.toFixed(4)}, {place.location.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Rating */}
          {hasRating && (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rating:</span>
                <TrowelRating rating={place.rating || 0} size="sm" />
                <span className="text-xs text-gray-500">({place.rating}/5)</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-yore-discover text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yore-discover/80 transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="mdi:information" className="h-4 w-4" />
              View Details
            </button>
            <button
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}`
                window.open(mapsUrl, '_blank')
              }}
              className="bg-yore-explore text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yore-explore/80 transition-colors flex items-center justify-center"
              title="Get Directions"
            >
              <Icon icon="mdi:directions" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </InfoWindow>
  )
}

export default MarkerInfoWindow
