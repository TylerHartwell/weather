"use client"

import { useState, useRef } from "react"
import type { TemperatureUnit, VisibleSeries, WeatherHourly, WindSpeedUnit } from "@/types/weather"
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
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>({
    temperature: true,
    precipitation: true,
    wind: true
  })
  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  const handleSeriesToggle = (series: keyof VisibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }))
  }

  return (
    <div>
      <ChartControls
        visibleSeries={visibleSeries}
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
