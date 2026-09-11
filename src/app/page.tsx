"use client"

import { useCallback, useEffect, useState } from "react"
import { DateTime } from "luxon"

import { Card } from "@/components/ui/card"
import { useWeatherData } from "@/hooks/use-weather-data"

import CurrentWeather from "@/components/weather/current-weather"

import ChartSection from "@/components/weather/chart-section"
import SearchBar from "@/components/weather/search-bar"
import LoadingOverlay from "@/components/weather/loading-overlay"
import ErrorState from "@/components/weather/error-state"
import { PrecipitationUnit, TemperatureUnit, WeatherCurrent, WindSpeedUnit } from "@/types/weather"
import WeekdaySection from "@/components/weather/weekday-section"
import { Watch } from "lucide-react"
import { LocationNotFoundError, type Coordinates } from "@/services/weather-api"
import { createPlaceholderWeatherData } from "@/lib/weather-utils"

export default function WeatherDashboard() {
  const [location, setLocation] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>("mph")
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("fahrenheit")
  const [precipitationUnit, setPrecipitationUnit] = useState<PrecipitationUnit>("inch")
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null)
  const [scrollTargetTimestamp, setScrollTargetTimestamp] = useState<number | null>(null)
  const [jumpTrigger, setJumpTrigger] = useState(0)
  const [scrollTrigger, setScrollTrigger] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => DateTime.now())

  const { weatherData, isLoading, error, resetWeatherData } = useWeatherData()

  const handleFetchWeather = useCallback(() => {
    if (location) resetWeatherData({ location, windSpeedUnit, temperatureUnit, precipitationUnit, coordinates: coordinates ?? undefined })
  }, [coordinates, location, precipitationUnit, resetWeatherData, temperatureUnit, windSpeedUnit])

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setCoordinates(null)
      setLocation("San Diego")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setLocation("Current location")
        setIsLocating(false)
      },
      () => {
        setCoordinates(null)
        setLocation(previousLocation => (previousLocation && previousLocation !== "Current location" ? previousLocation : "San Diego"))
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    )
  }, [])

  useEffect(() => {
    const savedLocation = localStorage.getItem("location")
    if (savedLocation && savedLocation !== "Current location") {
      setLocation(savedLocation)
      return
    }

    requestCurrentLocation()
  }, [requestCurrentLocation])

  useEffect(() => {
    handleFetchWeather()
  }, [handleFetchWeather])

  useEffect(() => {
    if (location) localStorage.setItem("location", location)
  }, [location])

  useEffect(() => {
    if (error instanceof LocationNotFoundError && location !== "San Diego") {
      localStorage.removeItem("location")
      setCoordinates(null)
      setLocation("San Diego")
    }
  }, [error, location])

  useEffect(() => {
    const millisecondsUntilNextQuarterHour = 15 * 60_000 - (Date.now() % (15 * 60_000))
    let intervalId: number | undefined

    const timeoutId = window.setTimeout(() => {
      setCurrentTime(DateTime.now())
      intervalId = window.setInterval(() => setCurrentTime(DateTime.now()), 15 * 60_000)
    }, millisecondsUntilNextQuarterHour)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  const handleDayClick = useCallback((timestamp: number) => {
    setSelectedTimestamp(timestamp)
    setScrollTargetTimestamp(timestamp)
    setScrollTrigger(prev => prev + 1)
  }, [])

  const handleChartCenterDayChange = useCallback((timestamp: number) => {
    setSelectedTimestamp(previousTimestamp => (previousTimestamp === timestamp ? previousTimestamp : timestamp))
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
        setCoordinates(null)
        setLocation(query)
      }
    },
    [location]
  )
  const jumpToNow = useCallback(() => {
    setJumpTrigger(prev => prev + 1)
    // Highlight today's card immediately instead of waiting for the chart's scroll-settle callback,
    // which may never fire (or get stuck) if the scroll animation doesn't land exactly on target.
    setSelectedTimestamp(
      DateTime.now()
        .setZone(weatherData?.timezone || "local")
        .toMillis()
    )
    setScrollTargetTimestamp(null)
  }, [weatherData?.timezone])

  const displayWeatherData = weatherData ?? createPlaceholderWeatherData({ windSpeedUnit, temperatureUnit, precipitationUnit })

  const currentWeather = weatherData
    ? weatherData.minutely15.reduceRight<WeatherCurrent | null>(
        (latestInterval, interval) => (latestInterval || interval.time.toMillis() <= currentTime.toMillis() ? latestInterval || interval : null),
        null
      ) || weatherData.current
    : displayWeatherData.current

  if (!isLoading && !weatherData) {
    return <ErrorState message="No weather data available" onRetry={handleFetchWeather} />
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Card className="relative w-full flex-1 bg-gray-900 border-gray-800 text-white py-2 px-4">
        {isLoading && <LoadingOverlay />}
        <CurrentWeather
          weatherCurrent={currentWeather}
          toggleTempUnit={toggleTempUnit}
          togglePrecipitationUnit={togglePrecipitationUnit}
          toggleWindUnit={toggleWindUnit}
          temperatureUnit={temperatureUnit}
          windSpeedUnit={windSpeedUnit}
          precipitationUnit={precipitationUnit}
          locationName={displayWeatherData.locationName}
          countryCode={displayWeatherData.countryCode}
          latitude={displayWeatherData.latitude}
          longitude={displayWeatherData.longitude}
          admin1={displayWeatherData.admin1}
          postcodes={displayWeatherData.postcodes}
        />
        <ChartSection
          weatherHourly={displayWeatherData.hourly}
          scrollTargetTimestamp={scrollTargetTimestamp}
          onCenterDayChange={handleChartCenterDayChange}
          timezone={displayWeatherData.timezone}
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
          weatherDaily={displayWeatherData.daily}
          onDayClick={handleDayClick}
          selectedTimestamp={selectedTimestamp}
          timezone={displayWeatherData.timezone}
          jumpTrigger={jumpTrigger}
        />
        <SearchBar onSearch={handleSearch} onUseCurrentLocation={requestCurrentLocation} isLoading={isLoading} isLocating={isLocating} />
      </Card>
    </div>
  )
}
