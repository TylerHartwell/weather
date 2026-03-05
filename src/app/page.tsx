"use client"

import { useCallback, useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import { useWeatherData } from "@/hooks/use-weather-data"

import CurrentWeather from "@/components/weather/current-weather"

import ChartSection from "@/components/weather/chart-section"
import SearchBar from "@/components/weather/search-bar"
import LoadingState from "@/components/weather/loading-state"
import ErrorState from "@/components/weather/error-state"
import { PrecipitationUnit, TemperatureUnit, WindSpeedUnit } from "@/types/weather"
import WeekdaySection from "@/components/weather/weekday-section"
import { Watch } from "lucide-react"

export default function WeatherDashboard() {
  const [location, setLocation] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("location") || "San Diego"
    }
    return "San Diego"
  })
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>("mph")
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("fahrenheit")
  const [precipitationUnit, setPrecipitationUnit] = useState<PrecipitationUnit>("inch")
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null)
  const [jumpTrigger, setJumpTrigger] = useState(0)
  const [scrollTrigger, setScrollTrigger] = useState(0)

  const { weatherData, isLoading, error, resetWeatherData } = useWeatherData()

  const handleFetchWeather = useCallback(() => {
    resetWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit })
  }, [location, precipitationUnit, resetWeatherData, temperatureUnit, windSpeedUnit])

  useEffect(() => {
    handleFetchWeather()
  }, [handleFetchWeather])

  useEffect(() => {
    localStorage.setItem("location", location)
  }, [location])

  useEffect(() => {
    if (error) {
      console.log(error.message)
    }
  }, [error])

  const handleDayClick = useCallback((timestamp: number) => {
    setSelectedTimestamp(timestamp)
    setScrollTrigger(prev => prev + 1)
  }, [])

  const toggleWindUnit = () => {
    setWindSpeedUnit(prev => (prev === "mph" ? "kmh" : "mph"))
  }
  const toggleTempUnit = () => {
    setTemperatureUnit(prev => (prev === "fahrenheit" ? "celsius" : "fahrenheit"))
  }
  const togglePrecipitationUnit = () => {
    setPrecipitationUnit(prev => (prev === "inch" ? "mm" : "inch"))
  }

  const handleSearch = useCallback(
    (query: string) => {
      if (query !== location) {
        setLocation(query)
      }
    },
    [location]
  )
  const jumpToNow = useCallback(() => {
    setJumpTrigger(prev => prev + 1)
    setSelectedTimestamp(null)
  }, [])

  if (isLoading && !weatherData) {
    return <LoadingState />
  }

  if (!weatherData) {
    return (
      <ErrorState
        message="No weather data available"
        onRetry={() => resetWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit })}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Card className="w-full  bg-gray-900 border-gray-800 text-white py-2">
        <div className="px-4">
          <div className="flex flex-col">
            <CurrentWeather
              weatherCurrent={weatherData.current}
              toggleTempUnit={toggleTempUnit}
              togglePrecipitationUnit={togglePrecipitationUnit}
              toggleWindUnit={toggleWindUnit}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              precipitationUnit={precipitationUnit}
              locationName={weatherData.locationName}
              countryCode={weatherData.countryCode}
              admin1={weatherData.admin1}
              postcodes={weatherData.postcodes}
            />
            <ChartSection
              weatherHourly={weatherData.hourly}
              selectedTimestamp={selectedTimestamp}
              timezone={weatherData.timezone}
              temperatureUnit={temperatureUnit}
              windSpeedUnit={windSpeedUnit}
              jumpTrigger={jumpTrigger}
              scrollTrigger={scrollTrigger}
            />
            <div className="flex justify-center">
              <button
                onClick={e => {
                  jumpToNow()
                  e.currentTarget.blur()
                }}
                className="bg-blue-800 hover:bg-blue-900 active:bg-blue-900 text-gray-100 px-0 py-0 rounded-md w-12 h-8 my-0 overflow-hidden cursor-pointer"
              >
                <Watch className="h-full w-full stroke-1" />
              </button>
            </div>

            <WeekdaySection
              weatherDaily={weatherData.daily}
              onDayClick={handleDayClick}
              selectedTimestamp={selectedTimestamp}
              timezone={weatherData.timezone}
              jumpTrigger={jumpTrigger}
            />
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </Card>
    </div>
  )
}
