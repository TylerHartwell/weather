"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

export default function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-800 border-gray-700"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
