"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { searchLocations } from "@/services/weather-api"
import type { LocationSuggestion } from "@/types/weather"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isSearchingLocations, setIsSearchingLocations] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingLocations(true)
      try {
        setSuggestions(await searchLocations(query, controller.signal))
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setSuggestions([])
      } finally {
        if (!controller.signal.aborted) setIsSearchingLocations(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchQuery])

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    onSearch([suggestion.name, suggestion.admin1, suggestion.country].filter(Boolean).join(", "))
    setSearchQuery("")
    setSuggestions([])
    setActiveSuggestionIndex(-1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      selectSuggestion(suggestions[activeSuggestionIndex])
      return
    }
    if (searchQuery.trim()) {
      onSearch(searchQuery)
      setSearchQuery("")
      setSuggestions([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-4 w-full items-end gap-2 pb-2">
      <div>Location:</div>
      <div ref={searchContainerRef} className="relative flex gap-2 grow">
        <Input
          id="search-location"
          type="text"
          placeholder="Enter city or postal code..."
          value={searchQuery}
          onFocus={e => e.target.select()}
          onChange={e => {
            setSearchQuery(e.target.value)
            setActiveSuggestionIndex(-1)
          }}
          onBlur={() => window.setTimeout(() => setSuggestions([]), 150)}
          onKeyDown={e => {
            if (e.key === "ArrowDown" && suggestions.length) {
              e.preventDefault()
              setActiveSuggestionIndex(index => (index + 1) % suggestions.length)
            }
            if (e.key === "ArrowUp" && suggestions.length) {
              e.preventDefault()
              setActiveSuggestionIndex(index => (index - 1 + suggestions.length) % suggestions.length)
            }
            if (e.key === "Escape") setSuggestions([])
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls="location-suggestions"
          className="bg-gray-800 border-gray-700"
        />
        {(suggestions.length > 0 || isSearchingLocations) && (
          <ul
            id="location-suggestions"
            role="listbox"
            className="absolute bottom-full left-0 z-10 mb-1 w-full overflow-hidden rounded-md border border-gray-700 bg-gray-800 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id} role="option" aria-selected={activeSuggestionIndex === index}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 ${activeSuggestionIndex === index ? "bg-gray-700" : ""}`}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.name}
                  {suggestion.admin1 ? `, ${suggestion.admin1}` : ""}, {suggestion.country}
                </button>
              </li>
            ))}
            {isSearchingLocations && <li className="px-3 py-2 text-sm text-gray-400">Searching locations...</li>}
          </ul>
        )}
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Search className={`h-4 w-4 rounded-full ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </form>
  )
}
