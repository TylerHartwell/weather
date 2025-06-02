import type { SeriesKey, TemperatureUnit, VisibleSeries, WindSpeedUnit } from "@/types/weather"
import SeriesControl from "./seriesControl"

interface ChartControlsProps {
  visibleSeries: VisibleSeries
  onHideToggle: (seriesKey: SeriesKey) => void
  onSoloToggle: (seriesKey: SeriesKey) => void
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

export default function ChartControls({ visibleSeries, temperatureUnit, windSpeedUnit, onHideToggle, onSoloToggle }: ChartControlsProps) {
  return (
    <div className="flex items-center justify-center sm:justify-between gap-4">
      <h3 className="text-lg font-medium hidden sm:inline-block text-nowrap">24-Hour Weather</h3>
      <div className="flex items-center justify-center sm:justify-end gap-4 text-xs w-full">
        <SeriesControl
          seriesKey="wind"
          visibleSeries={visibleSeries}
          temperatureUnit={temperatureUnit}
          windSpeedUnit={windSpeedUnit}
          onHideToggle={onHideToggle}
          onSoloToggle={onSoloToggle}
        />
        <SeriesControl
          seriesKey="temperature"
          visibleSeries={visibleSeries}
          temperatureUnit={temperatureUnit}
          windSpeedUnit={windSpeedUnit}
          onHideToggle={onHideToggle}
          onSoloToggle={onSoloToggle}
        />

        <SeriesControl
          seriesKey="precipitation"
          visibleSeries={visibleSeries}
          temperatureUnit={temperatureUnit}
          windSpeedUnit={windSpeedUnit}
          onHideToggle={onHideToggle}
          onSoloToggle={onSoloToggle}
        />
      </div>
    </div>
  )
}
