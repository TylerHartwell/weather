"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect, useCallback } from "react"
import type { WeatherDaily, WeatherDay } from "@/types/weather"
import WeatherIcon from "./weather-icon"
import { getWeatherDescription } from "@/lib/weather-utils"
import { DateTime } from "luxon"

interface WeekdayCardsProps {
  weatherDaily: WeatherDaily
  onDayClick?: (timestamp: number) => void
  selectedTimestamp?: number | null
  timezone: string | null
}

export default function WeekdayCards({ weatherDaily, onDayClick, selectedTimestamp, timezone }: WeekdayCardsProps) {
  const numDays = weatherDaily.time.length
  const [allDays, setAllDays] = useState<WeatherDay[]>([])
  const [highlightedDayId, setHighlightedDayId] = useState<string | null>(null)

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

  const handleDayClick = (timestamp: number) => {
    if (onDayClick) {
      onDayClick(timestamp)
    }
  }

  return (
    <div className="relative">
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
              <div className="text-sm flex gap-1 text-green-400">
                {Math.round(day.windSpeed10mMax)}
                <span className="inline-block" style={{ transform: `rotate(${Math.round(day.windDirection10mDominant)}deg)` }}>
                  ↑
                </span>
              </div>
              <div className="text-sm text-yellow-400">
                {Math.round(day.temperature2mMax)}° {Math.round(day.temperature2mMin)}°
              </div>
              <div className="text-sm text-blue-400">{Math.round(day.precipitationProbabilityMax)}%</div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
