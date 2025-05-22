import { SeriesKey, TemperatureUnit, VisibleSeries, WindSpeedUnit } from "@/types/weather"
import { Button } from "../ui/button"
import { EyeOff, Target } from "lucide-react"

interface SeriesControlProps {
  seriesKey: SeriesKey
  visibleSeries: VisibleSeries
  onHideToggle: (seriesKey: SeriesKey) => void
  onSoloToggle: (seriesKey: SeriesKey) => void
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

const seriesConfig: Record<SeriesKey, { label: (unit: TemperatureUnit | WindSpeedUnit) => string; color: string }> = {
  temperature: {
    label: unit => `Temperature (${unit === "fahrenheit" ? "°F" : "°C"})`,
    color: "bg-yellow-400"
  },
  precipitation: {
    label: () => "Precipitation (%)",
    color: "bg-blue-400"
  },
  wind: {
    label: unit => `Wind (${unit === "mph" ? "mph" : "kmh"})`,
    color: "bg-green-400"
  }
}

export default function SeriesControl({ seriesKey, visibleSeries, temperatureUnit, windSpeedUnit, onHideToggle, onSoloToggle }: SeriesControlProps) {
  const series = visibleSeries[seriesKey]
  const { label, color } = seriesConfig[seriesKey]
  const unit = seriesKey === "temperature" ? temperatureUnit : seriesKey === "wind" ? windSpeedUnit : undefined

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        <Button variant={!series.hidden ? "secondary" : "destructive"} size="sm" onClick={() => onHideToggle(seriesKey)} className="h-5 text-xs">
          <EyeOff className="h-4 w-4" />
        </Button>

        <Button variant={!series.solo ? "secondary" : "destructive"} size="sm" onClick={() => onSoloToggle(seriesKey)} className="h-5 text-xs">
          <Target className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center">
        <div className={`w-3 h-3 ${color} rounded-full mr-1`}></div>
        <span>{label(unit!)}</span>
      </div>
    </div>
  )
}
