"use client"

import { useCallback, useEffect, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useWeatherData } from "@/hooks/use-weather-data"

import CurrentWeather from "@/components/weather/current-weather"

import ChartSection from "@/components/weather/chart-section"
import SearchBar from "@/components/weather/search-bar"
import LoadingState from "@/components/weather/loading-state"
import ErrorState from "@/components/weather/error-state"
import { PrecipitationUnit, TemperatureUnit, WindSpeedUnit } from "@/types/weather"
import WeekdaySection from "@/components/weather/weekday-section"

export default function WeatherDashboard() {
  const [location, setLocation] = useState("San Diego")
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>("mph")
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("fahrenheit")
  const [precipitationUnit, setPrecipitationUnit] = useState<PrecipitationUnit>("inch")
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null)

  const { weatherData, isLoading, error, resetWeatherData } = useWeatherData()

  const handleFetchWeather = useCallback(() => {
    resetWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit })
  }, [location, precipitationUnit, resetWeatherData, temperatureUnit, windSpeedUnit])

  useEffect(() => {
    handleFetchWeather()
  }, [handleFetchWeather])

  const handleDayClick = useCallback((timestamp: number) => {
    setSelectedTimestamp(timestamp)
  }, [])

  const toggleWindUnit = () => {
    setWindSpeedUnit(prev => (prev === "mph" ? "kmh" : "mph"))
    handleFetchWeather()
  }
  const toggleTempUnit = () => {
    setTemperatureUnit(prev => (prev === "fahrenheit" ? "celsius" : "fahrenheit"))
    handleFetchWeather()
  }
  const togglePrecipitationUnit = () => {
    setPrecipitationUnit(prev => (prev === "inch" ? "mm" : "inch"))
    handleFetchWeather()
  }

  const handleSearch = useCallback(
    (query: string) => {
      setLocation(query)
      handleFetchWeather()
    },
    [handleFetchWeather]
  )

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => resetWeatherData} />
  }

  if (!weatherData) {
    return <ErrorState message="No weather data available" onRetry={() => resetWeatherData} />
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Card className="w-full  bg-gray-900 border-gray-800 text-white py-2">
        <CardContent>
          <div className="flex flex-col space-y-2">
            <CurrentWeather
              weatherCurrent={weatherData.current}
              toggleTempUnit={toggleTempUnit}
              togglePrecipitationUnit={togglePrecipitationUnit}
              toggleWindUnit={toggleWindUnit}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              precipitationUnit={precipitationUnit}
              locationName={weatherData.locationName}
            />
            <ChartSection
              weatherHourly={weatherData.hourly}
              selectedTimestamp={selectedTimestamp}
              timezone={weatherData.timezone}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
            />
            <WeekdaySection
              weatherDaily={weatherData.daily}
              onDayClick={handleDayClick}
              selectedTimestamp={selectedTimestamp}
              timezone={weatherData.timezone}
            />
            <SearchBar onSearch={handleSearch} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
