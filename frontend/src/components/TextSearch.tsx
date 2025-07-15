'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'

interface TextSearchProps {
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
  initialValue?: string
  onClear?: () => void
}

const TextSearch: React.FC<TextSearchProps> = ({
  onSearch,
  loading = false,
  placeholder = "Search archaeological sites...",
  initialValue = "",
  onClear
}) => {
  const [query, setQuery] = useState(initialValue)
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Predefined search suggestions
  const suggestions = [
    "Roman ruins",
    "Medieval castles",
    "Ancient temples",
    "Stone circles",
    "Burial mounds",
    "Iron Age forts",
    "Bronze Age sites",
    "Neolithic monuments",
    "Viking settlements",
    "Prehistoric caves"
  ]

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }, [onSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Debounce search to avoid too many API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim().length >= 3) {
        handleSearch(value)
      }
    }, 800) // Wait 800ms after user stops typing
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    handleSearch(query)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
    setIsExpanded(false)
  }

  const handleClear = () => {
    setQuery('')
    setIsExpanded(false)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (onClear) {
      onClear()
    }
  }

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setIsExpanded(false), 200)
  }

  // Sync query with initialValue changes (for external clearing)
  useEffect(() => {
    if (initialValue !== query) {
      setQuery(initialValue)
    }
  }, [initialValue])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg shadow-lg shadow-black/60 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          />

          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              icon="mdi:magnify"
              className="h-5 w-5 text-gray-400"
            />
          </div>

          {/* Clear button and loading spinner or search button */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
            {/* Clear button */}
            {query.trim() && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Clear search"
                title="Clear search"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            )}
            
            {/* Loading spinner or search button */}
            {loading ? (
              <Icon
                icon="mdi:loading"
                className="h-5 w-5 text-blue-500 animate-spin"
              />
            ) : (
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:arrow-right" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Search suggestions dropdown */}
      {isExpanded && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 mb-2 px-2">Popular searches:</p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <Icon icon="mdi:history" className="h-4 w-4 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TextSearch
