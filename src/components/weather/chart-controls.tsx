// import { Checkbox } from "@/components/ui/checkbox"
import type { SeriesKey, TemperatureUnit, VisibleSeries, WindSpeedUnit } from "@/types/weather"
import { Button } from "../ui/button"
import { EyeOff, Target } from "lucide-react"

interface ChartControlsProps {
  visibleSeries: VisibleSeries
  onHideToggle: (seriesKey: SeriesKey) => void
  onSoloToggle: (seriesKey: SeriesKey) => void
  onToggleSeries: (series: keyof VisibleSeries) => void
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

export default function ChartControls({
  visibleSeries,
  // onToggleSeries,
  temperatureUnit,
  windSpeedUnit,
  onHideToggle,
  onSoloToggle
}: ChartControlsProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-medium">24-Hour Weather</h3>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <Button
              variant={!visibleSeries.temperature.hidden ? "secondary" : "destructive"}
              size="sm"
              onClick={() => onHideToggle("temperature")}
              className="h-5 text-xs"
            >
              <EyeOff className="h-4 w-4" />
              Hide
            </Button>

            <Button
              variant={!visibleSeries.temperature.solo ? "secondary" : "destructive"}
              size="sm"
              onClick={() => onSoloToggle("temperature")}
              className="h-5 text-xs"
            >
              <Target className="h-4 w-4" />
              Solo
            </Button>
          </div>

          <label htmlFor="temperature" className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
            <span>Temperature ({temperatureUnit === "fahrenheit" ? "°F" : "°C"})</span>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <Button
              variant={!visibleSeries.precipitation.hidden ? "secondary" : "destructive"}
              size="sm"
              onClick={() => onHideToggle("precipitation")}
              className="h-5 text-xs"
            >
              <EyeOff className="h-4 w-4" />
              Hide
            </Button>

            <Button
              variant={!visibleSeries.precipitation.solo ? "secondary" : "destructive"}
              size="sm"
              onClick={() => onSoloToggle("precipitation")}
              className="h-5 text-xs"
            >
              <Target className="h-4 w-4" />
              Solo
            </Button>
          </div>
          <label htmlFor="precipitation" className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
            <span>Precipitation (%)</span>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <Button
              variant={!visibleSeries.wind.hidden ? "secondary" : "destructive"}
              size="sm"
              onClick={() => onHideToggle("wind")}
              className="h-5 text-xs"
            >
              <EyeOff className="h-4 w-4" />
              Hide
            </Button>

            <Button
              variant={!visibleSeries.wind.solo ? "secondary" : "destructive"}
              size="sm"
              onClick={() => onSoloToggle("wind")}
              className="h-5 text-xs"
            >
              <Target className="h-4 w-4" />
              Solo
            </Button>
          </div>
          <label htmlFor="wind" className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
            <span>Wind ({windSpeedUnit === "mph" ? "mph" : "kmh"})</span>
          </label>
        </div>
      </div>
    </div>
  )
}
