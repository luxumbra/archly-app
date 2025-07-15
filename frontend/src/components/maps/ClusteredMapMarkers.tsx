'use client'

import React, { useMemo, useState, useRef, useEffect } from 'react'
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { Place } from '@/types'
import { useRouter } from 'next/navigation'
import { slugify } from '@/utils/stringUtils'
import MarkerInfoWindow from './MarkerInfoWindow'

interface ClusteredMapMarkersProps {
  places: Place[]
  onMarkerClick?: (place: Place) => void
}

interface ClusterInfo {
  lat: number
  lng: number
  places: Place[]
  isCluster: boolean
}

const ClusteredMapMarkers: React.FC<ClusteredMapMarkersProps> = ({
  places,
  onMarkerClick
}) => {
  console.log('ClusteredMapMarkers: Component render with places:', places?.length || 0)
  
  const router = useRouter()
  const map = useMap()
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState(false)
  const [animateMarkers, setAnimateMarkers] = useState(false)

  // Simple clustering logic based on proximity and zoom level
  const clusteredMarkers = useMemo(() => {
    console.log('ClusteredMapMarkers: Processing places:', places?.length || 0)
    
    if (!places || places.length === 0) {
      console.log('ClusteredMapMarkers: No places to display')
      return []
    }

    // Get current zoom level to adjust clustering radius
    const currentZoom = map?.getZoom() || 10
    console.log('ClusteredMapMarkers: Current zoom level:', currentZoom)
    
    // Adjust clustering radius based on zoom level
    // Higher zoom = smaller radius (less clustering)
    // Lower zoom = larger radius (more clustering)
    let CLUSTER_RADIUS = 0.1 // base radius
    if (currentZoom > 12) {
      CLUSTER_RADIUS = 0.01 // ~1km at high zoom
    } else if (currentZoom > 8) {
      CLUSTER_RADIUS = 0.05 // ~5km at medium zoom
    } else {
      CLUSTER_RADIUS = 0.2 // ~20km at low zoom
    }
    
    console.log('ClusteredMapMarkers: Using cluster radius:', CLUSTER_RADIUS)

    const clusters: ClusterInfo[] = []
    const processed = new Set<string>()

    places.forEach((place) => {
      if (processed.has(place.id)) return

      const nearbyPlaces = places.filter((otherPlace) => {
        if (processed.has(otherPlace.id) || place.id === otherPlace.id) return false
        
        const latDiff = Math.abs(place.location.latitude - otherPlace.location.latitude)
        const lngDiff = Math.abs(place.location.longitude - otherPlace.location.longitude)
        
        return latDiff < CLUSTER_RADIUS && lngDiff < CLUSTER_RADIUS
      })

      if (nearbyPlaces.length > 0) {
        // Create cluster
        const allPlaces = [place, ...nearbyPlaces]
        const centerLat = allPlaces.reduce((sum, p) => sum + p.location.latitude, 0) / allPlaces.length
        const centerLng = allPlaces.reduce((sum, p) => sum + p.location.longitude, 0) / allPlaces.length

        clusters.push({
          lat: centerLat,
          lng: centerLng,
          places: allPlaces,
          isCluster: true
        })

        // Mark all places as processed
        allPlaces.forEach(p => processed.add(p.id))
      } else {
        // Single marker
        clusters.push({
          lat: place.location.latitude,
          lng: place.location.longitude,
          places: [place],
          isCluster: false
        })
        processed.add(place.id)
      }
    })

    console.log('ClusteredMapMarkers: Created clusters:', clusters.length)
    return clusters
  }, [places, map])

  const handleMarkerClick = (cluster: ClusterInfo) => {
    if (cluster.isCluster) {
      // For clusters, zoom in to show individual markers
      console.log(`Cluster clicked with ${cluster.places.length} places - zooming in`)
      if (map) {
        const currentZoom = map.getZoom() || 10
        map.setZoom(Math.min(currentZoom + 3, 18)) // Zoom in but don't exceed max zoom
        map.setCenter({ lat: cluster.lat, lng: cluster.lng })
      }
      return
    }

    const place = cluster.places[0]
    if (onMarkerClick) {
      onMarkerClick(place)
    } else {
      const slug = slugify(place.displayName?.text || 'unknown')
      router.push(`/site/${slug}?id=${place.id}`)
    }
  }

  // Custom pin SVG component
  const PinMarker = ({ cluster }: { cluster: ClusterInfo }) => (
    <div className="relative">
      {cluster.isCluster ? (
        // Cluster marker
        <div className="relative">
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            className="drop-shadow-lg cursor-pointer hover:scale-110 transition-transform"
          >
            <circle cx="25" cy="25" r="20" fill="#606F41" opacity="0.8" />
            <circle cx="25" cy="25" r="15" fill="#606F41" />
            <text
              x="25"
              y="25"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill="white"
              fontWeight="bold"
            >
              {cluster.places.length}
            </text>
          </svg>
        </div>
      ) : (
        // Individual pin marker
        <svg
          width="40"
          height="56"
          viewBox="0 0 93 126"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg cursor-pointer hover:scale-110 transition-transform"
        >
          <path d="M84 58.5C84 79.763 68.33 97 49 97C29.67 97 14 79.763 14 58.5C14 37.237 29.67 20 49 20C68.33 20 84 37.237 84 58.5Z" fill="#606F41"/>
          <path d="M46.7505 2.90247C71.5154 2.90269 90.939 22.3269 90.939 47.0919C90.9388 66.0564 80.9139 84.5618 70.9175 98.3468C60.8803 112.188 50.6392 121.586 49.7642 122.382L49.7612 122.384C48.9317 123.136 47.8507 123.551 46.731 123.546C45.6112 123.541 44.5333 123.117 43.7104 122.358L43.7095 122.356C42.836 121.548 32.6017 111.998 22.5718 98.088C12.5859 84.2394 2.56119 65.7419 2.56104 47.0919C2.56104 22.3268 21.9853 2.90247 46.7505 2.90247ZM46.7505 11.8663C26.6363 11.8663 11.5249 26.9731 11.5249 47.0919C11.525 61.3738 18.7014 76.2517 27.0122 88.6388C34.3808 99.6215 42.4895 108.423 46.7739 112.792C51.0622 108.473 59.1565 99.7798 66.5103 88.8517C74.8059 76.5237 81.9759 61.6234 81.9761 47.0919C81.9761 26.9732 66.8645 11.8665 46.7505 11.8663Z" fill="#606F41" stroke="#606F41" strokeWidth="4"/>
          <path d="M47.0188 23.7656C62.3055 23.7657 74.2952 35.7553 74.2952 51.042C74.2951 62.7483 68.1073 74.1716 61.9368 82.6807C55.7422 91.2229 49.4211 97.0225 48.8792 97.5156L48.8772 97.5176C48.3652 97.9817 47.6981 98.2374 47.0071 98.2344C46.3159 98.2313 45.6507 97.9697 45.1428 97.501L45.1418 97.5C44.6029 97.0015 38.2861 91.1065 32.095 82.5205C25.931 73.9722 19.7425 62.5541 19.7424 51.042C19.7424 35.7553 31.7321 23.7656 47.0188 23.7656ZM47.0188 29.2979C34.603 29.2979 25.2747 38.6233 25.2747 51.042C25.2747 59.8577 29.7052 69.0413 34.8352 76.6875C39.3831 83.466 44.3875 88.8985 47.0325 91.5957C49.6795 88.9299 54.6769 83.5648 59.2161 76.8193C64.3368 69.2096 68.7619 60.0119 68.762 51.042C68.762 38.6233 59.4346 29.2979 47.0188 29.2979Z" fill="#606F41" stroke="#606F41" strokeWidth="2.46907"/>
          <path d="M46.75 15.4473C65.9741 15.4474 81.0518 30.5258 81.0518 49.75C81.0517 64.4714 73.2696 78.8363 65.5098 89.5371C57.7181 100.282 49.7677 107.577 49.0889 108.194L49.0869 108.196C48.443 108.78 47.6036 109.102 46.7344 109.099C45.8654 109.095 45.0292 108.765 44.3906 108.176L44.3896 108.175C43.712 107.548 35.7675 100.134 27.9814 89.3359C20.2298 78.5858 12.4474 64.2272 12.4473 49.75C12.4473 30.5257 27.5257 15.4473 46.75 15.4473ZM46.75 22.4053C31.1361 22.4053 19.4053 34.1325 19.4053 49.75C19.4054 60.8365 24.9764 72.3853 31.4277 82.001C37.1477 90.5264 43.4426 97.3583 46.7686 100.75C50.0975 97.3975 56.3807 90.6496 62.0889 82.167C68.5285 72.5972 74.0937 61.0303 74.0938 49.75C74.0938 34.1326 62.3638 22.4054 46.75 22.4053Z" fill="#606F41" stroke="#606F41" strokeWidth="3.10505"/>
          <path d="M26.1039 70.4418C26.5115 70.4435 26.9795 70.3645 27.5073 70.1862C27.5946 70.1447 34.7271 66.7616 41.9035 63.08C45.5136 61.228 49.1221 59.3058 51.8041 57.7212C53.1453 56.9289 54.2571 56.2178 54.9989 55.6638C55.37 55.3869 55.649 55.1453 55.7995 54.9857C55.8475 54.9348 55.8479 54.9164 55.8598 54.8885C55.7537 53.0948 54.2383 50.4506 52.629 48.3506C52.2301 47.8311 51.8178 47.3221 51.3926 46.8241L49.8334 48.4158L49.7268 48.477C49.7268 48.477 48.9617 48.9202 48.0412 49.2512C47.5807 49.4168 47.0776 49.5625 46.5468 49.5997C46.0163 49.6368 45.3774 49.567 44.8855 49.0866C44.3948 48.607 44.3104 47.9711 44.3352 47.4413C44.3598 46.9113 44.4932 46.4065 44.6475 45.944C44.956 45.0189 45.3798 44.2465 45.3798 44.2465L45.439 44.1375L47.0111 42.5324C46.5043 42.1177 45.9869 41.7161 45.4593 41.328C43.3264 39.7626 40.6514 38.3022 38.856 38.2334C38.8284 38.2458 38.8099 38.2465 38.76 38.2957C38.6036 38.4494 38.3678 38.7335 38.0987 39.1101C37.56 39.8633 36.8721 40.9895 36.1078 42.3468C34.5791 45.0611 32.732 48.7086 30.9552 52.3563C27.4231 59.6074 24.1883 66.8085 24.1488 66.8966C23.6962 68.3343 23.9738 69.3136 24.5342 69.8624C24.8875 70.2086 25.4089 70.4391 26.1039 70.4418ZM46.3331 47.827C46.3599 47.8269 46.3897 47.8258 46.4227 47.8236C46.6861 47.805 47.0695 47.7083 47.4385 47.5756C48.0931 47.3403 48.6184 47.0529 48.7447 46.9829L52.4487 43.2013L50.6113 41.4016L46.896 45.1947C46.6761 45.6172 46.4891 46.056 46.3368 46.5073C46.2131 46.8776 46.126 47.2619 46.1139 47.524C46.1056 47.7004 46.1296 47.7799 46.1368 47.8063C46.1589 47.812 46.2148 47.8277 46.3331 47.827ZM46.1368 47.8063C46.1239 47.803 46.1192 47.8025 46.1299 47.8128C46.1409 47.8236 46.1404 47.8193 46.1368 47.8063ZM53.6944 41.9294L54.6635 40.9398L52.8264 39.1404L51.8572 40.1298L53.6944 41.9294ZM57.1623 40.895L67.4706 31.3296L62.1691 26.1368L52.8193 36.6411L57.1623 40.895ZM68.7773 30.117L69.7243 29.2384C69.843 29.1162 69.892 29.0042 69.9041 28.7874C69.9165 28.5686 69.8617 28.2505 69.7161 27.883C69.4246 27.148 68.7814 26.2439 68.004 25.4825C67.2267 24.7211 66.3094 24.0967 65.5686 23.8205C65.1981 23.6825 64.8791 23.6343 64.6604 23.6512C64.444 23.6679 64.333 23.7191 64.2133 23.8404L63.3544 24.8053L68.7773 30.117Z" fill="#D1D9BD"/>
          <path d="M69.0855 47.0916C69.0855 34.7774 59.0644 24.7562 46.7502 24.7562C34.4359 24.7562 24.4148 34.7774 24.4148 47.0916C24.4148 59.4058 34.4359 69.427 46.7502 69.427C59.0644 69.427 69.0855 59.4058 69.0855 47.0916ZM46.7502 64.4635C37.1708 64.4635 29.3782 56.671 29.3782 47.0916C29.3782 37.5122 37.1708 29.7196 46.7502 29.7196C56.3295 29.7196 64.1221 37.5122 64.1221 47.0916C64.1221 56.671 56.3295 64.4635 46.7502 64.4635Z" fill="#EAB308"/>
          <path d="M26.1034 70.4418C26.511 70.4435 26.9791 70.3644 27.5069 70.1861C27.5941 70.1447 34.7267 66.7615 41.903 63.0799C45.5132 61.2279 49.1217 59.3057 51.8037 57.7211C53.1448 56.9289 54.2566 56.2178 54.9984 55.6637C55.3695 55.3868 55.6486 55.1452 55.7991 54.9857C55.847 54.9347 55.8474 54.9163 55.8594 54.8884C55.7533 53.0948 54.2378 50.4505 52.6285 48.3505C52.2296 47.8311 51.8174 47.3221 51.3921 46.824L49.8329 48.4158L49.7263 48.4769C49.7263 48.4769 48.9613 48.9201 48.0407 49.2511C47.5802 49.4168 47.0771 49.5625 46.5464 49.5996C46.0158 49.6368 45.3769 49.5669 44.885 49.0866C44.3943 48.6069 44.3099 47.971 44.3348 47.4412C44.3594 46.9112 44.4927 46.4065 44.647 45.944C44.9556 45.0188 45.3793 44.2464 45.3793 44.2464L45.4385 44.1374L47.0106 42.5324C46.5038 42.1176 45.9864 41.716 45.4589 41.328C43.3259 39.7625 40.651 38.3022 38.8555 38.2333C38.828 38.2458 38.8095 38.2464 38.7595 38.2956C38.6031 38.4493 38.3674 38.7334 38.0982 39.11C37.5596 39.8632 36.8716 40.9895 36.1073 42.3467C34.5786 45.061 32.7316 48.7085 30.9548 52.3563C27.4226 59.6073 24.1878 66.8085 24.1483 66.8965C23.6958 68.3343 23.9733 69.3135 24.5338 69.8623C24.8871 70.2085 25.4084 70.4391 26.1034 70.4418ZM46.3326 47.8269C46.3594 47.8269 46.3893 47.8257 46.4222 47.8235C46.6857 47.8049 47.069 47.7083 47.438 47.5755C48.0926 47.3402 48.6179 47.0529 48.7442 46.9828L52.4482 43.2013L50.6108 41.4015L46.8956 45.1947C46.6756 45.6171 46.4887 46.056 46.3364 46.5073C46.2126 46.8776 46.1256 47.2618 46.1134 47.524C46.1052 47.7003 46.1292 47.7798 46.1363 47.8063C46.1585 47.812 46.2143 47.8276 46.3326 47.8269ZM46.1363 47.8063C46.1235 47.8029 46.1187 47.8024 46.1294 47.8128C46.1404 47.8235 46.1399 47.8192 46.1363 47.8063ZM53.6939 41.9293L54.663 40.9397L52.8259 39.1403L51.8568 40.1297L53.6939 41.9293Z" fill="#D1D9BD"/>
        </svg>
      )}
    </div>
  )

  console.log('ClusteredMapMarkers: Rendering', clusteredMarkers.length, 'markers')

  // Handle marker hover events
  const handleMarkerHover = (place: Place) => {
    setHoveredPlace(place)
    setInfoWindowOpen(true)
  }

  const handleMarkerLeave = () => {
    // Delay hiding to allow moving to info window
    setTimeout(() => {
      if (!infoWindowOpen) {
        setHoveredPlace(null)
        setInfoWindowOpen(false)
      }
    }, 200)
  }

  const handleInfoWindowClose = () => {
    setHoveredPlace(null)
    setInfoWindowOpen(false)
  }

  // Trigger CSS animations when markers load
  useEffect(() => {
    if (clusteredMarkers.length > 0) {
      // Reset animation state
      setAnimateMarkers(false)
      
      // Small delay to ensure markers are rendered, then trigger animation
      const timer = setTimeout(() => {
        setAnimateMarkers(true)
        console.log(`CSS: Animating ${clusteredMarkers.length} markers with stagger`)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [clusteredMarkers])

  // Fallback: if no clusters created, show individual markers
  if (clusteredMarkers.length === 0 && places && places.length > 0) {
    console.log('ClusteredMapMarkers: Falling back to individual markers')
    return (
      <>
        {places.map((place, index) => (
          <AdvancedMarker
            key={`fallback-${place.id}-${index}`}
            position={{ lat: place.location.latitude, lng: place.location.longitude }}
            title={place.displayName?.text || 'Unknown Place'}
            onClick={() => {
              if (onMarkerClick) {
                onMarkerClick(place)
              } else {
                const slug = slugify(place.displayName?.text || 'unknown')
                router.push(`/site/${slug}?id=${place.id}`)
              }
            }}
          >
            <div 
              className={`marker-animation ${animateMarkers ? 'animate-in' : ''}`}
              style={{ 
                animationDelay: `${index * 100}ms`,
                opacity: animateMarkers ? 1 : 0,
                transform: animateMarkers ? 'scale(1) translateY(0) rotate(0deg)' : 'scale(0) translateY(-30px) rotate(-180deg)',
                transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}
              onMouseEnter={() => handleMarkerHover(place)}
              onMouseLeave={handleMarkerLeave}
            >
              <PinMarker cluster={{ lat: place.location.latitude, lng: place.location.longitude, places: [place], isCluster: false }} />
            </div>
          </AdvancedMarker>
        ))}
        
        {/* Info Window */}
        {hoveredPlace && infoWindowOpen && (
          <MarkerInfoWindow
            place={hoveredPlace}
            isOpen={infoWindowOpen}
            onClose={handleInfoWindowClose}
          />
        )}
      </>
    )
  }

  return (
    <>
      {clusteredMarkers.map((cluster, index) => (
        <AdvancedMarker
          key={`cluster-${index}`}
          position={{ lat: cluster.lat, lng: cluster.lng }}
          title={cluster.isCluster 
            ? `${cluster.places.length} places` 
            : cluster.places[0].displayName?.text || 'Unknown Place'
          }
          onClick={() => handleMarkerClick(cluster)}
        >
          <div 
            className={`marker-animation ${animateMarkers ? 'animate-in' : ''}`}
            style={{ 
              animationDelay: `${index * 120}ms`,
              opacity: animateMarkers ? 1 : 0,
              transform: animateMarkers ? 'scale(1) translateY(0) rotate(0deg)' : 'scale(0) translateY(-30px) rotate(-180deg)',
              transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}
            onMouseEnter={() => {
              // Only show info window for individual markers, not clusters
              if (!cluster.isCluster && cluster.places[0]) {
                handleMarkerHover(cluster.places[0])
              }
            }}
            onMouseLeave={handleMarkerLeave}
          >
            <PinMarker cluster={cluster} />
          </div>
        </AdvancedMarker>
      ))}
      
      {/* Info Window */}
      {hoveredPlace && infoWindowOpen && (
        <MarkerInfoWindow
          place={hoveredPlace}
          isOpen={infoWindowOpen}
          onClose={handleInfoWindowClose}
        />
      )}
    </>
  )
}

export default ClusteredMapMarkers