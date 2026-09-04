"use client"

import { useCallback, useState } from "react"
import type { PrecipitationUnit, TemperatureUnit, WeatherData, WindSpeedUnit } from "@/types/weather"
import { type Coordinates, fetchWeatherData } from "@/services/weather-api"

interface FetchWeatherParams {
  location: string
  windSpeedUnit: WindSpeedUnit
  temperatureUnit: TemperatureUnit
  precipitationUnit: PrecipitationUnit
  coordinates?: Coordinates
}

export function useWeatherData() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const resetWeatherData = useCallback(async ({ location, windSpeedUnit, temperatureUnit, precipitationUnit, coordinates }: FetchWeatherParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchWeatherData(location, windSpeedUnit, temperatureUnit, precipitationUnit, coordinates)
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    weatherData,
    isLoading,
    error,
    resetWeatherData
  }
}
