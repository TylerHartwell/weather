"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery)
      setSearchQuery("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <div>Location:</div>
      <div className="flex gap-2 grow">
        <Input
          id="search-location"
          type="text"
          placeholder="Search for a city or postal code..."
          value={searchQuery}
          onFocus={e => e.target.select()}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-gray-800 border-gray-700"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Search className={`h-4 w-4 rounded-full ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </form>
  )
}
