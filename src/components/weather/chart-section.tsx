"use client"

import { useState, useRef } from "react"
import { seriesKeys, type SeriesKey, type TemperatureUnit, type VisibleSeries, type WeatherHourly, type WindSpeedUnit } from "@/types/weather"
import WeatherChart from "./weather-chart"
import ChartControls from "./chart-controls"

interface ChartSectionProps {
  weatherHourly: WeatherHourly
  onVisibleRangeChange: (start: number, end: number) => void
  scrollToTimestamp?: number | null
  centerOnCurrent?: boolean
  timezone: string | null
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

export default function ChartSection({
  weatherHourly,
  onVisibleRangeChange,
  scrollToTimestamp,
  centerOnCurrent = false,
  timezone,
  temperatureUnit,
  windSpeedUnit
}: ChartSectionProps) {
  const initialVisibleSeries: VisibleSeries = Object.fromEntries(seriesKeys.map(key => [key, { hidden: false, solo: false }])) as VisibleSeries
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>(initialVisibleSeries)
  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  const handleSeriesToggle = (series: keyof VisibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }))
  }

  const handleHideToggle = (seriesKey: SeriesKey) => {
    setVisibleSeries(prev => {
      const newState = { ...prev }
      const currentVisibleSeries = { ...newState[seriesKey] }

      if (currentVisibleSeries.hidden) {
        currentVisibleSeries.hidden = false
      } else {
        currentVisibleSeries.hidden = true
        seriesKeys.forEach(key => {
          newState[key] = { ...newState[key], solo: false }
        })
      }

      newState[seriesKey] = currentVisibleSeries
      return newState
    })
  }

  const handleSoloToggle = (seriesKey: SeriesKey) => {
    setVisibleSeries(prev => {
      const isCurrentlySolo = prev[seriesKey].solo

      const newState: VisibleSeries = {} as VisibleSeries

      if (isCurrentlySolo) {
        seriesKeys.forEach(key => {
          newState[key] = {
            ...prev[key],
            solo: false
          }
        })
      } else {
        seriesKeys.forEach(key => {
          newState[key] = {
            hidden: false,
            solo: key === seriesKey
          }
        })
      }

      return newState
    })
  }

  return (
    <div>
      <ChartControls
        visibleSeries={visibleSeries}
        onHideToggle={handleHideToggle}
        onSoloToggle={handleSoloToggle}
        onToggleSeries={handleSeriesToggle}
        temperatureUnit={temperatureUnit}
        windSpeedUnit={windSpeedUnit}
      />
      <WeatherChart
        weatherHourly={weatherHourly}
        onVisibleRangeChange={onVisibleRangeChange}
        scrollToTimestamp={scrollToTimestamp}
        centerOnCurrent={centerOnCurrent}
        containerRef={chartContainerRef}
        visibleSeries={visibleSeries}
        timezone={timezone}
      />
    </div>
  )
}
