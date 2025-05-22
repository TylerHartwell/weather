import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WeekdayCards from "./weekday-cards"
import type { VisibleTimeRange, WeatherDaily } from "@/types/weather"
import { useEffect, useRef, useState } from "react"
// import throttle from "lodash/throttle"

interface TimelineSectionProps {
  weatherDaily: WeatherDaily
  visibleTimeRange: VisibleTimeRange | null
  onDayClick: (timestamp: number) => void
  selectedTimestamp: number | null
  timezone: string | null
}

export default function WeekdaySection({ weatherDaily, visibleTimeRange, onDayClick, selectedTimestamp, timezone }: TimelineSectionProps) {
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastEdgeState = useRef({ atStart: null as null | boolean, atEnd: null as null | boolean })

  const scrollTo = (targetPositionRatio: number, isInstant: boolean = false) => {
    const el = scrollRef.current
    if (!el) return

    const clampedTargetPositionRatio = Math.max(0, Math.min(1, targetPositionRatio))
    const maxScrollLeft = el.scrollWidth - el.clientWidth

    const targetScroll = clampedTargetPositionRatio * maxScrollLeft

    el.scrollTo({
      left: targetScroll,
      behavior: isInstant ? "instant" : "smooth"
    })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScrollEdgeCheck = () => {
      const isAtStart = el.scrollLeft <= 0
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1

      const stateChanged = lastEdgeState.current.atStart !== isAtStart || lastEdgeState.current.atEnd !== isAtEnd

      if (stateChanged) {
        lastEdgeState.current = { atStart: isAtStart, atEnd: isAtEnd }

        setAtStart(isAtStart)
        setAtEnd(isAtEnd)
      }
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        console.log("anim", el.scrollWidth)
        el.scrollTo({
          left: (el.scrollWidth / 15) * 6,
          behavior: "instant"
        })
        handleScrollEdgeCheck()
      }, 0)
    })

    handleScrollEdgeCheck()

    el.addEventListener("scroll", handleScrollEdgeCheck)
    window.addEventListener("resize", handleScrollEdgeCheck)
    const observer = new ResizeObserver(handleScrollEdgeCheck)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", handleScrollEdgeCheck)
      window.removeEventListener("resize", handleScrollEdgeCheck)
      observer.disconnect()
    }
  }, [])

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Weekday Summary</h3>
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto pb-2 scroll-smooth">
          <WeekdayCards
            weatherDaily={weatherDaily}
            visibleTimeRange={visibleTimeRange}
            onDayClick={onDayClick}
            selectedTimestamp={selectedTimestamp}
            timezone={timezone}
          />
        </div>
        {!atStart && (
          <div className="absolute top-1/2 -translate-y-1/2 -left-2 z-10">
            <Button onClick={() => scrollTo(-1)} variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 shadow-md">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!atEnd && (
          <div className="absolute top-1/2 -translate-y-1/2 -right-2 z-10">
            <Button onClick={() => scrollTo(1)} variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 shadow-md">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
