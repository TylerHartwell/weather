import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WeekdayCards from "./weekday-cards"
import type { VisibleTimeRange, WeatherDaily } from "@/types/weather"

interface TimelineSectionProps {
  weatherDaily: WeatherDaily
  visibleTimeRange: VisibleTimeRange | null
  onDayClick: (timestamp: number) => void
  selectedTimestamp: number | null
  timezone: string | null
}

export default function WeekdaySection({ weatherDaily, visibleTimeRange, onDayClick, selectedTimestamp, timezone }: TimelineSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium">Weekday Summary</h3>
      <div className="relative">
        <div className="overflow-x-auto pb-4">
          <WeekdayCards
            weatherDaily={weatherDaily}
            visibleTimeRange={visibleTimeRange}
            onDayClick={onDayClick}
            selectedTimestamp={selectedTimestamp}
            timezone={timezone}
          />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 z-10">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 shadow-md">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -right-2 z-10">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 shadow-md">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
