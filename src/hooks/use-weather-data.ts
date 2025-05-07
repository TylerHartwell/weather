"use client"

import { useState, useEffect, useCallback } from "react"
import type { WeatherData } from "@/types/weather"
import { fetchWeatherData } from "@/services/weather-api"

export function useWeatherData(initialLocation = "San Diego") {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const getWeatherData = useCallback(async (location: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("fetch weather data")
      const data = await fetchWeatherData(location)
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      console.error("Error fetching weather data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getWeatherData(initialLocation)
  }, [initialLocation, getWeatherData])

  return {
    weatherData,
    isLoading,
    error,
    fetchWeatherData: getWeatherData
  }
}
