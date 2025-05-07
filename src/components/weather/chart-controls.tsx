import { Checkbox } from "@/components/ui/checkbox"
import type { VisibleSeries } from "@/types/weather"

interface ChartControlsProps {
  visibleSeries: VisibleSeries
  onToggleSeries: (series: keyof VisibleSeries) => void
}

export default function ChartControls({ visibleSeries, onToggleSeries }: ChartControlsProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium">24-Hour Weather</h3>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="temperature"
            checked={visibleSeries.temperature}
            onCheckedChange={() => onToggleSeries("temperature")}
            className="data-[state=checked]:bg-yellow-400 data-[state=checked]:text-yellow-950"
          />
          <label htmlFor="temperature" className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
            <span>Temperature (°F)</span>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="precipitation"
            checked={visibleSeries.precipitation}
            onCheckedChange={() => onToggleSeries("precipitation")}
            className="data-[state=checked]:bg-blue-400 data-[state=checked]:text-blue-950"
          />
          <label htmlFor="precipitation" className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
            <span>Precipitation (%)</span>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="wind"
            checked={visibleSeries.wind}
            onCheckedChange={() => onToggleSeries("wind")}
            className="data-[state=checked]:bg-green-400 data-[state=checked]:text-green-950"
          />
          <label htmlFor="wind" className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
            <span>Wind (mph)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
