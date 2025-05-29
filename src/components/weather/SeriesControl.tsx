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

const seriesConfig: Record<
  SeriesKey,
  { label: string; labelUnits: (unit: TemperatureUnit | WindSpeedUnit) => string; bgColor: string; textColor: string }
> = {
  temperature: {
    label: "Temperature",
    labelUnits: unit => `(${unit === "fahrenheit" ? "°F" : "°C"})`,
    bgColor: "bg-yellow-400",
    textColor: "text-yellow-400"
  },
  precipitation: {
    label: "Precipitation",
    labelUnits: () => "(%)",
    bgColor: "bg-blue-400",
    textColor: "text-blue-400"
  },
  wind: {
    label: "Wind",
    labelUnits: unit => `(${unit === "mph" ? "mph" : "kmh"})`,
    bgColor: "bg-green-400",
    textColor: "text-green-400"
  }
}

export default function SeriesControl({ seriesKey, visibleSeries, temperatureUnit, windSpeedUnit, onHideToggle, onSoloToggle }: SeriesControlProps) {
  const series = visibleSeries[seriesKey]
  const { label, labelUnits, bgColor, textColor } = seriesConfig[seriesKey]
  const unit = seriesKey === "temperature" ? temperatureUnit : seriesKey === "wind" ? windSpeedUnit : undefined

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex flex-col gap-1">
        <Button variant={!series.hidden ? "secondary" : "destructive"} size="sm" onClick={() => onHideToggle(seriesKey)} className="h-4 text-xs">
          <EyeOff className="h-2 w-2" />
        </Button>

        <Button variant={!series.solo ? "secondary" : "destructive"} size="sm" onClick={() => onSoloToggle(seriesKey)} className="h-4 text-xs">
          <Target className="h-2 w-2" />
        </Button>
      </div>

      <div className="flex items-center">
        <div className={`w-3 h-3 ${bgColor} rounded-full mr-1 hidden sm:inline-block`}></div>
        <span className={`${textColor}`}>
          <span className="hidden 2xs:inline-block">{label} </span>
          <span>{labelUnits(unit!)}</span>
        </span>
      </div>
    </div>
  )
}
