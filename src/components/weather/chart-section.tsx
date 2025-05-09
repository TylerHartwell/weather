"use client"

import { useState, useRef } from "react"
import type { VisibleSeries, WeatherHourly } from "@/types/weather"
import WeatherChart from "./weather-chart"
import ChartControls from "./chart-controls"

interface ChartSectionProps {
  weatherHourly: WeatherHourly
  onVisibleRangeChange: (start: number, end: number) => void
  scrollToTimestamp?: number | null
  centerOnCurrent?: boolean
}

export default function ChartSection({ weatherHourly, onVisibleRangeChange, scrollToTimestamp, centerOnCurrent = false }: ChartSectionProps) {
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
    <div className="pt-4">
      <ChartControls visibleSeries={visibleSeries} onToggleSeries={handleSeriesToggle} />
      <WeatherChart
        weatherHourly={weatherHourly}
        onVisibleRangeChange={onVisibleRangeChange}
        scrollToTimestamp={scrollToTimestamp}
        centerOnCurrent={centerOnCurrent}
        containerRef={chartContainerRef}
        visibleSeries={visibleSeries}
      />
    </div>
  )
}
