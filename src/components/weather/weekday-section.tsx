import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WeekdayCards from "./weekday-cards"
import type { WeatherDaily } from "@/types/weather"
import { useEffect, useRef, useState } from "react"

interface TimelineSectionProps {
  weatherDaily: WeatherDaily
  onDayClick: (timestamp: number) => void
  selectedTimestamp: number | null
  timezone: string | null
}

export default function WeekdaySection({ weatherDaily, onDayClick, selectedTimestamp, timezone }: TimelineSectionProps) {
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
      const isAtStart = el.scrollLeft <= 1
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
    <div className="relative mb-2">
      <h3 className="text-lg font-medium hidden 2xs:inline absolute top-0 -translate-y-full">Weekday Summary</h3>
      <div className="relative flex justify-center">
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 scroll-smooth w-min scrollbar scrollbar-h-2 scrollbar-thumb-[#4b5563] scrollbar-track-[#252b36] scrollbar-hover:scrollbar-thumb-[#6b7280] scrollbar-track-hover:scrollbar-track-[#2f3846] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        >
          <WeekdayCards weatherDaily={weatherDaily} onDayClick={onDayClick} selectedTimestamp={selectedTimestamp} timezone={timezone} />
        </div>

        {!atStart && (
          <div className="absolute top-1/2 -translate-y-1/2 -left-2 z-10">
            <Button
              onClick={() => scrollTo(-1)}
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 shadow-md flex gap-0"
            >
              <span className="translate-x-1 -translate-y-0.25">|</span>
              <ChevronLeft className="h-4 w-4 " />
            </Button>
          </div>
        )}
        {!atEnd && (
          <div className="absolute top-1/2 -translate-y-1/2 -right-2 z-10">
            <Button
              onClick={() => scrollTo(1)}
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 shadow-md flex gap-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="-translate-x-1 -translate-y-0.25">|</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
