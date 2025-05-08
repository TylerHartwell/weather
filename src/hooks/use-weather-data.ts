"use client"

import { useState, useEffect, useCallback } from "react"
import type { PrecipitationUnit, TemperatureUnit, WeatherData, WindSpeedUnit } from "@/types/weather"
import { fetchWeatherData } from "@/services/weather-api"

interface FetchWeatherParams {
  location: string
  windSpeedUnit: WindSpeedUnit
  temperatureUnit: TemperatureUnit
  precipitationUnit: PrecipitationUnit
}

export function useWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit }: FetchWeatherParams) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const getWeatherData = useCallback(async ({ location, windSpeedUnit, temperatureUnit, precipitationUnit }: FetchWeatherParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchWeatherData(location, windSpeedUnit, temperatureUnit, precipitationUnit)
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      console.error("Error fetching weather data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit })
  }, [getWeatherData, location, windSpeedUnit, temperatureUnit, precipitationUnit])

  return {
    weatherData,
    isLoading,
    error,
    fetchWeatherData: getWeatherData
  }
}
