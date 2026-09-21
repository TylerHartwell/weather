"use client"

import { useState, useRef } from "react"
import { seriesKeys, type SeriesKey, type TemperatureUnit, type VisibleSeries, type WeatherHourly, type WindSpeedUnit } from "@/types/weather"
import WeatherChart from "./weather-chart"
import ChartControls from "./chart-controls"

interface ChartSectionProps {
  weatherHourly: WeatherHourly
  scrollTargetTimestamp: number | null
  onCenterDayChange: (timestamp: number) => void
  timezone: string | null
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
  jumpTrigger: number
  scrollTrigger: number
  dataLoadTrigger: number
}

export default function ChartSection({
  weatherHourly,
  scrollTargetTimestamp,
  onCenterDayChange,
  timezone,
  temperatureUnit,
  windSpeedUnit,
  jumpTrigger,
  scrollTrigger,
  dataLoadTrigger
}: ChartSectionProps) {
  const initialVisibleSeries: VisibleSeries = Object.fromEntries(seriesKeys.map(key => [key, { hidden: false, solo: false }])) as VisibleSeries
  const [visibleSeries, setVisibleSeries] = useState<VisibleSeries>(initialVisibleSeries)
  const chartContainerRef = useRef<HTMLDivElement | null>(null)

  const handleHideToggle = (seriesKey: SeriesKey) => {
    setVisibleSeries(prev => {
      const newState: VisibleSeries = {} as VisibleSeries

      seriesKeys.forEach(key => {
        newState[key] = {
          ...prev[key],
          hidden: key === seriesKey ? !prev[key].hidden : prev[key].hidden
        }
      })

      return newState
    })
  }

  return (
    <div>
      <ChartControls visibleSeries={visibleSeries} onHideToggle={handleHideToggle} temperatureUnit={temperatureUnit} windSpeedUnit={windSpeedUnit} />
      <WeatherChart
        weatherHourly={weatherHourly}
        scrollTargetTimestamp={scrollTargetTimestamp}
        onCenterDayChange={onCenterDayChange}
        containerRef={chartContainerRef}
        visibleSeries={visibleSeries}
        timezone={timezone}
        jumpTrigger={jumpTrigger}
        scrollTrigger={scrollTrigger}
        dataLoadTrigger={dataLoadTrigger}
      />
    </div>
  )
}
