'use client'

import { useState, useCallback, useMemo } from 'react'

interface CacheEntry {
  query: string
  location: {
    latitude: number
    longitude: number
  }
  results: any[]
  timestamp: number
  radius: number
}

interface SearchCacheOptions {
  maxEntries?: number
  maxAge?: number // in milliseconds
  locationThreshold?: number // distance threshold for considering locations same (in meters)
}

const useSearchCache = (options: SearchCacheOptions = {}) => {
  const {
    maxEntries = 50,
    maxAge = 15 * 60 * 1000, // 15 minutes
    locationThreshold = 1000 // 1km threshold
  } = options

  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map())

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }, [])

  // Generate cache key based on query, location, and radius
  const generateCacheKey = useCallback((
    query: string,
    location: { latitude: number; longitude: number },
    radius: number
  ): string => {
    const normalizedQuery = query.toLowerCase().trim()
    const roundedLat = Math.round(location.latitude * 1000) / 1000
    const roundedLng = Math.round(location.longitude * 1000) / 1000
    return `${normalizedQuery}:${roundedLat},${roundedLng}:${radius}`
  }, [])

  // Check if a cache entry is still valid
  const isEntryValid = useCallback((entry: CacheEntry): boolean => {
    return Date.now() - entry.timestamp < maxAge
  }, [maxAge])

  // Find cached entry that matches query and is within location threshold
  const findCachedEntry = useCallback((
    query: string,
    location: { latitude: number; longitude: number },
    radius: number
  ): CacheEntry | null => {
    const normalizedQuery = query.toLowerCase().trim()
    
    for (const [key, entry] of cache.entries()) {
      if (!isEntryValid(entry)) {
        continue
      }

      // Check if query matches
      if (entry.query.toLowerCase() !== normalizedQuery) {
        continue
      }

      // Check if radius matches (allow small variance)
      if (Math.abs(entry.radius - radius) > radius * 0.1) {
        continue
      }

      // Check if location is within threshold
      const distance = calculateDistance(
        location.latitude, location.longitude,
        entry.location.latitude, entry.location.longitude
      )

      if (distance <= locationThreshold) {
        return entry
      }
    }

    return null
  }, [cache, isEntryValid, calculateDistance, locationThreshold])

  // Get cached results
  const getCachedResults = useCallback((
    query: string,
    location: { latitude: number; longitude: number },
    radius: number
  ): any[] | null => {
    const entry = findCachedEntry(query, location, radius)
    return entry ? entry.results : null
  }, [findCachedEntry])

  // Store results in cache
  const setCachedResults = useCallback((
    query: string,
    location: { latitude: number; longitude: number },
    radius: number,
    results: any[]
  ) => {
    const key = generateCacheKey(query, location, radius)
    const entry: CacheEntry = {
      query: query.toLowerCase().trim(),
      location,
      results,
      timestamp: Date.now(),
      radius
    }

    setCache(prevCache => {
      const newCache = new Map(prevCache)
      
      // Add new entry
      newCache.set(key, entry)

      // Clean up old entries if we exceed max entries
      if (newCache.size > maxEntries) {
        // Remove oldest entries
        const sortedEntries = Array.from(newCache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        
        const entriesToRemove = sortedEntries.slice(0, newCache.size - maxEntries)
        entriesToRemove.forEach(([keyToRemove]) => {
          newCache.delete(keyToRemove)
        })
      }

      return newCache
    })
  }, [generateCacheKey, maxEntries])

  // Clear expired entries
  const clearExpiredEntries = useCallback(() => {
    setCache(prevCache => {
      const newCache = new Map()
      
      for (const [key, entry] of prevCache.entries()) {
        if (isEntryValid(entry)) {
          newCache.set(key, entry)
        }
      }

      return newCache
    })
  }, [isEntryValid])

  // Clear all cache entries
  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  // Get cache statistics
  const cacheStats = useMemo(() => {
    const totalEntries = cache.size
    const validEntries = Array.from(cache.values()).filter(isEntryValid).length
    const expiredEntries = totalEntries - validEntries

    return {
      totalEntries,
      validEntries,
      expiredEntries,
      hitRate: 0 // Could be tracked with additional state if needed
    }
  }, [cache, isEntryValid])

  return {
    getCachedResults,
    setCachedResults,
    clearExpiredEntries,
    clearCache,
    cacheStats
  }
}

export default useSearchCache