"use client"

import { useState, useRef } from "react"
import { seriesKeys, type SeriesKey, type TemperatureUnit, type VisibleSeries, type WeatherHourly, type WindSpeedUnit } from "@/types/weather"
import WeatherChart from "./weather-chart"
import ChartControls from "./chart-controls"

interface ChartSectionProps {
  weatherHourly: WeatherHourly
  selectedTimestamp?: number | null
  timezone: string | null
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

export default function ChartSection({ weatherHourly, selectedTimestamp, timezone, temperatureUnit, windSpeedUnit }: ChartSectionProps) {
  const initialVisibleSeries: VisibleSeries = Object.fromEntries(seriesKeys.map(key => [key, { hidden: false, solo: false }])) as VisibleSeries
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>(initialVisibleSeries)
  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  const handleHideToggle = (seriesKey: SeriesKey) => {
    setVisibleSeries(prev => {
      const isCurrentlySolo = prev[seriesKey].solo

      const newState: VisibleSeries = {} as VisibleSeries

      if (isCurrentlySolo) {
        seriesKeys.forEach(key => {
          newState[key] = {
            hidden: key === seriesKey,
            solo: false
          }
        })
      } else {
        seriesKeys.forEach(key => {
          newState[key] = {
            hidden: key === seriesKey ? !prev[key].hidden : prev[key].hidden,
            solo: false
          }
        })
      }
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
        temperatureUnit={temperatureUnit}
        windSpeedUnit={windSpeedUnit}
      />
      <WeatherChart
        weatherHourly={weatherHourly}
        selectedTimestamp={selectedTimestamp}
        containerRef={chartContainerRef}
        visibleSeries={visibleSeries}
        timezone={timezone}
      />
    </div>
  )
}
