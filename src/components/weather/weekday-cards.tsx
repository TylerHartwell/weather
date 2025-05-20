"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect, useRef, useCallback } from "react"
import type { WeatherDaily, VisibleTimeRange, WeatherDay } from "@/types/weather"
import WeatherIcon from "./weather-icon"
import { getWeatherDescription } from "@/lib/weather-utils"
import { DateTime } from "luxon"

interface WeekdayCardsProps {
  weatherDaily: WeatherDaily
  visibleTimeRange?: VisibleTimeRange | null
  onDayClick?: (timestamp: number) => void
  selectedTimestamp?: number | null
  timezone: string | null
}

export default function WeekdayCards({ weatherDaily, visibleTimeRange, onDayClick, selectedTimestamp, timezone }: WeekdayCardsProps) {
  const numDays = weatherDaily.time.length
  const [allDays, setAllDays] = useState<WeatherDay[]>([])
  const [bracketPosition, setBracketPosition] = useState<{ left: number; width: number } | null>(null)
  const [highlightedDayId, setHighlightedDayId] = useState<string | null>(null)
  const lastVisibleRangeRef = useRef<VisibleTimeRange | null>(null)

  const today = DateTime.now().setZone(timezone || "local")

  const resetAllDays = useCallback(() => {
    const newAllDays: WeatherDay[] = []

    for (let i = 0; i < numDays; i++) {
      newAllDays.push({
        time: weatherDaily.time[i],

        temperature2mMax: weatherDaily.temperature2mMax[i],
        temperature2mMin: weatherDaily.temperature2mMin[i],
        windSpeed10mMax: weatherDaily.windSpeed10mMax[i],
        windDirection10mDominant: weatherDaily.windDirection10mDominant[i],
        precipitationProbabilityMax: weatherDaily.precipitationProbabilityMax[i],

        weatherCode: weatherDaily.weatherCode[i]
      })
    }

    setAllDays(newAllDays)
  }, [numDays, weatherDaily])

  useEffect(() => {
    resetAllDays()
  }, [numDays, resetAllDays, weatherDaily])

  // Calculate bracket position based on visible time range
  useEffect(() => {
    if (!visibleTimeRange || allDays.length === 0) {
      setBracketPosition(null)
      return
    }

    const timelineEl = document.getElementById("weather-timeline")
    if (!timelineEl) return

    const timelineWidth = timelineEl.scrollWidth
    const timelineStart = allDays[0].time.toMillis() || 0
    const timelineEnd = allDays[allDays.length - 1].time.toMillis() || 0
    const timelineRange = timelineEnd - timelineStart

    if (timelineRange === 0) return

    // Calculate position as percentage of timeline width
    const leftPercent = Math.max(0, ((visibleTimeRange.start - timelineStart) / timelineRange) * 100)
    const rightPercent = Math.min(100, ((visibleTimeRange.end - timelineStart) / timelineRange) * 100)
    const widthPercent = rightPercent - leftPercent

    // Convert to pixels
    const left = (leftPercent / 100) * timelineWidth
    const width = (widthPercent / 100) * timelineWidth

    // Only update if position has actually changed
    if (!bracketPosition || Math.abs(bracketPosition.left - left) > 1 || Math.abs(bracketPosition.width - width) > 1) {
      setBracketPosition({ left, width })
    }
  }, [visibleTimeRange, allDays, bracketPosition])

  // Handle selected timestamp directly
  useEffect(() => {
    if (selectedTimestamp && allDays.length > 0) {
      // Find the day that contains this timestamp
      const selectedDay = allDays.find(day => {
        if (!day.time) return false
        const dayStart = day.time.startOf("day").toMillis()
        const dayEnd = dayStart + 24 * 60 * 60 * 1000
        return selectedTimestamp >= dayStart && selectedTimestamp < dayEnd
      })

      if (selectedDay && selectedDay.time) {
        const dayId = `day-${selectedDay.time.setZone(timezone || "local").toMillis()}`
        setHighlightedDayId(dayId)
      }
    }
  }, [selectedTimestamp, allDays, timezone])

  // Determine which day has the most visible hours
  useEffect(() => {
    if (!visibleTimeRange || allDays.length === 0 || selectedTimestamp) {
      // Don't update highlighted day if there's a selected timestamp
      return
    }

    // Skip if the visible range hasn't changed significantly
    if (
      lastVisibleRangeRef.current &&
      Math.abs(lastVisibleRangeRef.current.start - visibleTimeRange.start) < 1000 &&
      Math.abs(lastVisibleRangeRef.current.end - visibleTimeRange.end) < 1000
    ) {
      return
    }

    // Update the last visible range reference
    lastVisibleRangeRef.current = visibleTimeRange

    // Find the day that has the most hours in the visible range
    // let maxOverlapDay = null
    let maxOverlapHours = 0
    let maxOverlapDayId = null

    allDays.forEach(day => {
      if (!day.time) return

      // Calculate the start and end of this day
      const dayStart = day.time.startOf("day").toMillis()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      // Calculate overlap with visible range
      const overlapStart = Math.max(dayStart, visibleTimeRange.start)
      const overlapEnd = Math.min(dayEnd, visibleTimeRange.end)
      const overlapHours = Math.max(0, (overlapEnd - overlapStart) / (60 * 60 * 1000))

      // Create a unique ID for this day using timestamp
      const dayId = `day-${dayStart}`

      // Use strictly greater than to ensure only one day gets selected
      if (overlapHours > maxOverlapHours) {
        maxOverlapHours = overlapHours
        // maxOverlapDay = day.day
        maxOverlapDayId = dayId
      }
    })

    // Only update if we have a clear winner with significant overlap
    if (maxOverlapDayId && maxOverlapHours > 0) {
      // setHighlightedDayId(maxOverlapDayId)
    }
  }, [visibleTimeRange, allDays, selectedTimestamp])

  const handleDayClick = (timestamp: number) => {
    if (onDayClick) {
      onDayClick(timestamp)
    }
  }

  return (
    <div className="relative">
      {/* Bracket indicator */}
      {bracketPosition && (
        <div
          className="absolute -top-6 h-6 flex items-center justify-center pointer-events-none"
          style={{
            left: `${bracketPosition.left}px`,
            width: `${bracketPosition.width}px`
          }}
        >
          <div className="h-2 w-full bg-blue-500 rounded-t-md"></div>
          <div className="absolute -left-1 h-6 w-2 border-l-2 border-t-2 border-blue-500 rounded-tl-md"></div>
          <div className="absolute -right-1 h-6 w-2 border-r-2 border-t-2 border-blue-500 rounded-tr-md"></div>
        </div>
      )}

      {/* Timeline */}
      <div id="weather-timeline" className="flex space-x-2 min-w-max">
        {allDays.map((day, index) => {
          // Create a unique ID for this day using timestamp
          const dayId = `day-${day.time.setZone(timezone || "local").toMillis()}`

          return (
            <Card
              key={`timeline-day-${index}`}
              className={`bg-gray-800 border-gray-700 text-white flex flex-col items-center min-w-[90px] cursor-pointer hover:bg-gray-700 transition-colors ${
                day.time.setZone(timezone || "local").hasSame(today, "day") ? "border-accent" : ""
              } ${dayId === highlightedDayId ? "ring-2 ring-blue-500 bg-gray-700" : ""}`}
              onClick={() => handleDayClick(day.time.toMillis() || 0)}
            >
              <div className="text-sm font-medium">{day.time.toLocaleString({ weekday: "short" })}</div>
              <div className="text-xs text-gray-400 mb-1">{day.time.day}</div>
              <div className="grow">
                <WeatherIcon type={getWeatherDescription(day.weatherCode)} size="sm" />
                <div className="text-wrap text-sm w-min capitalize text-gray-400">{getWeatherDescription(day.weatherCode)}</div>
              </div>
              <div className="text-sm text-blue-400">{Math.round(day.precipitationProbabilityMax)}%</div>
              <div className="text-sm flex gap-1 text-green-400">
                {Math.round(day.windSpeed10mMax)}
                <span className="inline-block" style={{ transform: `rotate(${Math.round(day.windDirection10mDominant)}deg)` }}>
                  ↑
                </span>
              </div>
              <div className="text-sm text-yellow-400">
                {Math.round(day.temperature2mMax)}° {Math.round(day.temperature2mMin)}°
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
