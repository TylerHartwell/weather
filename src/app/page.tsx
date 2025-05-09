"use client"

import { useCallback, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { useWeatherData } from "@/hooks/use-weather-data"
// import type { VisibleTimeRange } from "@/types/weather"

import CurrentWeather from "@/components/weather/current-weather"

// import ChartSection from "@/components/weather/chart-section"
// import TimelineSection from "@/components/weather/timeline-section"
import SearchBar from "@/components/weather/search-bar"
import LoadingState from "@/components/weather/loading-state"
import ErrorState from "@/components/weather/error-state"
import { PrecipitationUnit, TemperatureUnit, WindSpeedUnit } from "@/types/weather"

export default function WeatherDashboard() {
  const [location, setLocation] = useState("San Diego")
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>("mph")
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("fahrenheit")
  const [precipitationUnit, setPrecipitationUnit] = useState<PrecipitationUnit>("inch")
  const { weatherData, isLoading, error, resetWeatherData } = useWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit })
  // const [visibleTimeRange, setVisibleTimeRange] = useState<VisibleTimeRange | null>(null)
  // const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null)

  // const handleVisibleRangeChange = useCallback((start: number, end: number) => {
  //   setVisibleTimeRange(prev => {
  //     // Only update if the range has actually changed
  //     if (!prev || Math.abs(prev.start - start) > 100 || Math.abs(prev.end - end) > 100) {
  //       return { start, end }
  //     }
  //     return prev
  //   })
  // }, [])

  // const handleDayClick = useCallback((timestamp: number) => {
  //   setSelectedTimestamp(timestamp)
  // }, [])

  const toggleWindUnit = () => {
    setWindSpeedUnit(prev => (prev === "mph" ? "kmh" : "mph"))
  }
  const toggleTempUnit = () => {
    setTemperatureUnit(prev => (prev === "fahrenheit" ? "celsius" : "fahrenheit"))
  }
  const togglePrecipitationUnit = () => {
    setPrecipitationUnit(prev => (prev === "inch" ? "mm" : "inch"))
  }

  const handleRetry = useCallback(() => {
    resetWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit })
  }, [resetWeatherData, location, precipitationUnit, temperatureUnit, windSpeedUnit])

  const handleSearch = useCallback(
    (query: string) => {
      setLocation(query)
      handleRetry()
    },
    [handleRetry]
  )

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={handleRetry} />
  }

  if (!weatherData) {
    return <ErrorState message="No weather data available" onRetry={handleRetry} />
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <Card className="w-full max-w-3xl bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-400">Results for</span>
            <CardTitle className="ml-2 text-base font-medium">{location}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0">
              Choose area
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            Current Weather
            <CurrentWeather
              data={weatherData.current}
              toggleTempUnit={toggleTempUnit}
              togglePrecipitationUnit={togglePrecipitationUnit}
              toggleWindUnit={toggleWindUnit}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              precipitationUnit={precipitationUnit}
            />
            {/* Chart Section */}
            {/* <ChartSection
              data={weatherData.hourlyDetailed}
              onVisibleRangeChange={handleVisibleRangeChange}
              scrollToTimestamp={selectedTimestamp}
              centerOnCurrent={!selectedTimestamp}
            /> */}
            {/* Timeline Section */}
            {/* <TimelineSection
              // historicalData={weatherData.historical}
              forecastData={weatherData.forecast}
              visibleTimeRange={visibleTimeRange}
              onDayClick={handleDayClick}
              selectedTimestamp={selectedTimestamp}
            /> */}
            Search
            <SearchBar onSearch={handleSearch} initialQuery={location} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
