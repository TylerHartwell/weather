"use client"

import type React from "react"
import { DateTime } from "luxon"
import { useEffect, useRef, useState, useCallback, useMemo, RefObject } from "react"
import type { VisibleSeries, WeatherHour, WeatherHourly } from "@/types/weather"

interface WeatherChartProps {
  weatherHourly: WeatherHourly
  onVisibleRangeChange?: (start: number, end: number) => void
  scrollToTimestamp?: number | null
  centerOnCurrent?: boolean
  containerRef?: RefObject<HTMLDivElement | null>
  visibleSeries?: VisibleSeries
  timezone: string | null
}

export default function WeatherChart({
  weatherHourly,
  onVisibleRangeChange,
  scrollToTimestamp,
  centerOnCurrent = false,
  visibleSeries = { temperature: true, precipitation: true, wind: true },
  timezone,
  ...props
}: WeatherChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // const [scrollPosition, setScrollPosition] = useState(0)
  const [visibleTimeRange, setVisibleTimeRange] = useState<{ start: number; end: number } | null>(null)
  const [initialScrollDone, setInitialScrollDone] = useState(false)
  // const [isScrolling, setIsScrolling] = useState(false)
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollUpdateRef = useRef<number>(0)
  const requestAnimationFrameRef = useRef<number | null>(null)
  const isAutoScrollingRef = useRef<boolean>(false)
  const lastScrollToTimestampRef = useRef<number | null>(null)

  const allHours = useMemo<WeatherHour[]>(() => {
    const numHours = weatherHourly.time.length
    const result: WeatherHour[] = []

    for (let i = 0; i < numHours; i++) {
      result.push({
        time: weatherHourly.time[i],
        temperature2m: Math.round(weatherHourly.temperature2m[i]),
        windSpeed10m: Math.round(weatherHourly.windSpeed10m[i]),
        precipitationProbability: weatherHourly.precipitationProbability[i]
      })
    }

    return result
  }, [weatherHourly])

  // Forward ref to parent component
  useEffect(() => {
    if (containerRef.current && props.containerRef && "current" in props.containerRef) {
      props.containerRef.current = containerRef.current
    }
  }, [props, props.containerRef])

  // Find the current time index
  const currentHourIndex = allHours.findIndex(hour => hour.time.toUTC().hasSame(DateTime.now().toUTC(), "hour"))

  // Memoize the calculateTimePerPixel function
  const calculateTimePerPixel = useCallback(() => {
    if (allHours.length < 2 || !canvasRef.current) return 0

    const totalTimespan = allHours[allHours.length - 1].time.toMillis() - allHours[0].time.toMillis()
    const chartWidth = canvasRef.current.width - 80 // 80 is padding * 2

    return totalTimespan / chartWidth
  }, [allHours])

  // Memoize the calculateVisibleTimeRange function to prevent recreation on each render
  const calculateVisibleTimeRange = useCallback(() => {
    if (!containerRef.current || !canvasRef.current || allHours.length === 0) return null

    const containerWidth = containerRef.current.clientWidth
    const scrollLeft = containerRef.current.scrollLeft
    const timePerPixel = calculateTimePerPixel()

    if (timePerPixel === 0) return null

    // Calculate the exact start and end times based on scroll position
    const baseTime = allHours[0].time
    const startTimeMillis = baseTime.toMillis() + scrollLeft * timePerPixel
    const endTimeMillis = startTimeMillis + containerWidth * timePerPixel

    // Round to the nearest minute to avoid floating point issues
    const roundToMinute = (millis: number): number => {
      const dt = DateTime.fromMillis(millis)
      return dt.set({ second: 0, millisecond: 0 }).toMillis()
    }

    return {
      start: roundToMinute(startTimeMillis),
      end: roundToMinute(endTimeMillis)
    }
  }, [allHours, calculateTimePerPixel])

  // Draw the chart
  const drawChart = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d", { alpha: false }) // Use non-alpha for better performance
    if (!ctx) return

    // Set dimensions - make it wider for scrolling
    // Each hour gets more space since we're only viewing 24 hours at a time
    const width = Math.max(2000, allHours.length * 30) // Each data point gets 30px width
    const height = canvas.height
    canvas.width = width

    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Clear canvas - use fillRect instead of clearRect for better performance
    ctx.fillStyle = "#1F2937" // Dark gray background
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "#374151" // Lighter gray for grid
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Find all midnight timestamps (day boundaries)
    const dayBoundaries = new Map<number, { prevDate: string; nextDate: string }>()

    if (allHours.length > 0) {
      // Get the start and end timestamps
      const startTime = allHours[0].time.toMillis()
      const endTime = allHours[allHours.length - 1].time.toMillis()

      // Find the first midnight after the start time
      let firstDate = DateTime.fromMillis(startTime)
        .setZone(timezone || "local")
        .startOf("day")

      if (firstDate.toMillis() < startTime) {
        // If start time is after midnight, move to the next day
        firstDate = firstDate.plus({ days: 1 }) // fix: reassign
      }

      // Generate all midnight timestamps between start and end
      let currentMidnight = firstDate.toMillis()
      while (currentMidnight <= endTime) {
        const midnightDate = DateTime.fromMillis(currentMidnight).setZone(timezone || "local")

        // Get the date strings for the day before and after midnight
        const prevDay = midnightDate.minus({ days: 1 })
        const prevDateStr = prevDay.toFormat("MMM d")

        const nextDateStr = midnightDate.toFormat("MMM d")

        // Store the boundary with its date labels
        dayBoundaries.set(currentMidnight, {
          prevDate: prevDateStr,
          nextDate: nextDateStr
        })

        // Move to next midnight
        currentMidnight = midnightDate.plus({ days: 1 }).toMillis()
      }
    }

    // Draw vertical lines at midnight (day boundaries)
    dayBoundaries.forEach((dateLabels, timestamp) => {
      // Calculate x position for this timestamp
      const timeOffset = timestamp - allHours[0].time.toMillis()
      const timePerPixel = calculateTimePerPixel()
      const x = padding + timeOffset / timePerPixel

      // Draw dashed vertical line at midnight
      ctx.beginPath()
      ctx.strokeStyle = "#6B7280"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 3])
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw date labels on both sides of the boundary
      ctx.fillStyle = "#9CA3AF"
      ctx.font = "bold 16px Arial"

      // Draw previous date label (left side)
      ctx.textAlign = "right"
      ctx.fillText(dateLabels.prevDate, x - 5, padding - 25)

      // Draw next date label (right side)
      ctx.textAlign = "left"
      ctx.fillText(dateLabels.nextDate, x + 5, padding - 25)
    })

    // Find min and max values for temperature
    const tempValues = allHours.map(item => item.temperature2m)
    const minTemp = Math.min(...tempValues) - 2
    const maxTemp = Math.max(...tempValues) + 2
    const tempRange = maxTemp - minTemp

    // Find max values for precipitation and wind (min is always 0)
    const maxPrecip = Math.max(...allHours.map(item => item.precipitationProbability || 0)) + 5
    const maxWind = Math.max(...allHours.map(item => item.windSpeed10m || 0)) + 5

    // Draw temperature line if visible
    if (visibleSeries.temperature) {
      ctx.beginPath()
      ctx.strokeStyle = "#FACC15" // Yellow for temperature
      ctx.lineWidth = 3

      allHours.forEach((point, index) => {
        const x = padding + (index / (allHours.length - 1)) * chartWidth
        const y = height - padding - ((point.temperature2m - minTemp) / tempRange) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Draw temperature points - but only every few points to avoid clutter
      allHours.forEach((point, index) => {
        // Only draw points every 6 hours to avoid clutter
        if (index % 2 === 0) {
          const x = padding + (index / (allHours.length - 1)) * chartWidth
          const y = height - padding - ((point.temperature2m - minTemp) / tempRange) * chartHeight

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = "#FACC15" // Yellow for temperature
          ctx.fill()
        }
      })

      // Draw temperature values - but only every few points to avoid clutter
      ctx.fillStyle = "#FACC15" // Yellow for temperature
      allHours.forEach((point, index) => {
        // Only draw temperature values every 6 hours to avoid clutter
        if (index % 2 === 0) {
          const x = padding + (index / (allHours.length - 1)) * chartWidth
          const y = height - padding - ((point.temperature2m - minTemp) / tempRange) * chartHeight - 15
          ctx.fillText(`${point.temperature2m}°`, x, y)
        }
      })
    }

    // Draw precipitation line if visible
    if (visibleSeries.precipitation) {
      ctx.beginPath()
      ctx.strokeStyle = "#60A5FA" // Blue for precipitation
      ctx.lineWidth = 2

      allHours.forEach((point, index) => {
        const x = padding + (index / (allHours.length - 1)) * chartWidth
        const y = height - padding - ((point.precipitationProbability || 0) / maxPrecip) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    // Draw wind line if visible
    if (visibleSeries.wind) {
      ctx.beginPath()
      ctx.strokeStyle = "#4ADE80" // Green for wind
      ctx.lineWidth = 2

      allHours.forEach((point, index) => {
        const x = padding + (index / (allHours.length - 1)) * chartWidth
        const y = height - padding - ((point.windSpeed10m || 0) / maxWind) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      ctx.fillStyle = "#4ADE80"
      allHours.forEach((point, index) => {
        if (index % 2 === 0) {
          const x = padding + (index / (allHours.length - 1)) * chartWidth
          const y = height - padding - ((point.windSpeed10m || 0) / maxWind) * chartHeight - 15
          ctx.fillText(`${point.windSpeed10m}`, x, y)
        }
      })

      allHours.forEach((point, index) => {
        // Only draw points every 6 hours to avoid clutter
        if (index % 2 === 0) {
          const x = padding + (index / (allHours.length - 1)) * chartWidth
          const y = height - padding - ((point.windSpeed10m || 0) / maxWind) * chartHeight

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = "##4ADE80" // Yellow for temperature
          ctx.fill()
        }
      })
    }

    // Draw time labels - but only every few hours to avoid clutter
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "18px Arial"
    ctx.textAlign = "center"

    // Draw time labels every 2 hours for better readability in 24-hour view
    allHours.forEach((point, index) => {
      if (index % 2 === 0) {
        const x = padding + (index / (allHours.length - 1)) * chartWidth
        const y = height - 10
        const adjustedHour = point.time.hour
        ctx.fillText(adjustedHour.toString(), x, y)
      }
    })

    // Draw vertical line for current time
    if (currentHourIndex >= 0) {
      const currentX = padding + (currentHourIndex / (allHours.length - 1)) * chartWidth

      // Draw dashed line
      ctx.beginPath()
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.moveTo(currentX, padding)
      ctx.lineTo(currentX, height - padding)
      ctx.stroke()

      // Reset line dash
      ctx.setLineDash([])

      // Draw "NOW" label
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"

      const target = DateTime.now().setZone(timezone || "local")
      const targetHour = target.hour
      const targetOffset = target.toFormat("ZZ")

      const local = DateTime.now().setZone("local")
      const localHour = local.hour
      const localOffset = local.toFormat("ZZ")

      ctx.fillText(`${targetHour} ${targetOffset} / (${localHour} ${localOffset})`, currentX, padding - 10)

      // Draw circle at the top of the line
      ctx.beginPath()
      ctx.arc(currentX, padding, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.fill()
    }
  }, [allHours, currentHourIndex, calculateTimePerPixel, visibleSeries, timezone])

  // Initial chart drawing
  useEffect(() => {
    drawChart()
  }, [drawChart])

  // Handle scrolling and update visible range with throttling
  useEffect(() => {
    const container = containerRef.current
    const rafId = requestAnimationFrameRef.current

    const handleScrollEvent = () => {
      if (!container) return

      // If this is an auto-scroll, don't process it as a manual scroll
      if (isAutoScrollingRef.current) return

      // Set scrolling state
      // setIsScrolling(true)

      // Clear any existing scroll end timer
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current)
      }

      // Set a timer to detect when scrolling stops
      scrollEndTimerRef.current = setTimeout(() => {
        // setIsScrolling(false)

        // Update the visible range when scrolling stops
        const range = calculateVisibleTimeRange()
        if (range && onVisibleRangeChange) {
          setVisibleTimeRange(range)
          onVisibleRangeChange(range.start, range.end)
        }
      }, 150)

      // Throttle scroll position updates to improve performance
      const now = DateTime.now().toMillis()
      if (now - lastScrollUpdateRef.current > 16) {
        // ~60fps
        lastScrollUpdateRef.current = now
        // setScrollPosition(container.scrollLeft)

        // Update visible range during scrolling for more responsive UI
        if (now - lastScrollUpdateRef.current > 100) {
          // Only update every 100ms during active scrolling
          const range = calculateVisibleTimeRange()
          if (range && onVisibleRangeChange) {
            setVisibleTimeRange(range)
            onVisibleRangeChange(range.start, range.end)
          }
        }
      }
    }

    if (container) {
      // Use passive event listener for better performance
      container.addEventListener("scroll", handleScrollEvent, { passive: true })

      // Initial calculation - but only if we don't already have a range
      if (!visibleTimeRange) {
        const range = calculateVisibleTimeRange()
        if (range && onVisibleRangeChange) {
          setVisibleTimeRange(range)
          onVisibleRangeChange(range.start, range.end)
        }
      }
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScrollEvent)
      }
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current)
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [calculateVisibleTimeRange, onVisibleRangeChange, visibleTimeRange])

  // Handle scrolling to a specific timestamp with smooth animation
  useEffect(() => {
    if (
      scrollToTimestamp &&
      containerRef.current &&
      canvasRef.current &&
      allHours.length > 0 &&
      scrollToTimestamp !== lastScrollToTimestampRef.current
    ) {
      // Update the last scrolled timestamp
      lastScrollToTimestampRef.current = scrollToTimestamp

      // Find the exact day start for the selected timestamp
      const selectedDate = DateTime.fromMillis(scrollToTimestamp).startOf("day")

      const dayStart = selectedDate.toMillis()

      // Calculate the middle of the day (noon) for better centering
      const dayMiddle = dayStart + 12 * 60 * 60 * 1000

      const timePerPixel = calculateTimePerPixel()
      if (timePerPixel === 0) return

      const startTimestamp = allHours[0].time.toMillis()
      const pixelOffset = (dayMiddle - startTimestamp) / timePerPixel

      // Center the view on the selected day
      const containerWidth = containerRef.current.clientWidth
      const targetScrollPosition = Math.max(0, pixelOffset - containerWidth / 2)

      // Set flag to indicate we're auto-scrolling
      isAutoScrollingRef.current = true

      // Use smooth scrolling
      containerRef.current.scrollTo({
        left: targetScrollPosition,
        behavior: "smooth"
      })

      // Update visible range after scrolling
      setTimeout(() => {
        isAutoScrollingRef.current = false
        const range = calculateVisibleTimeRange()
        if (range && onVisibleRangeChange) {
          setVisibleTimeRange(range)
          onVisibleRangeChange(range.start, range.end)
        }
      }, 500) // Wait for smooth scroll to complete
    }
  }, [scrollToTimestamp, allHours, calculateTimePerPixel, calculateVisibleTimeRange, onVisibleRangeChange])

  // Auto-scroll to current time on initial render
  useEffect(() => {
    if (containerRef.current && currentHourIndex >= 0 && canvasRef.current && !initialScrollDone && centerOnCurrent) {
      const padding = 40
      const chartWidth = canvasRef.current.width - padding * 2
      const currentX = padding + (currentHourIndex / (allHours.length - 1)) * chartWidth

      // Center the current time in the viewport
      const containerWidth = containerRef.current.clientWidth
      const scrollTo = Math.max(0, currentX - containerWidth / 2)

      // Set flag to indicate we're auto-scrolling
      isAutoScrollingRef.current = true

      containerRef.current.scrollLeft = scrollTo
      // setScrollPosition(scrollTo)
      setInitialScrollDone(true)

      // Calculate and set the visible time range for 24 hours
      const timePerPixel = calculateTimePerPixel()
      if (timePerPixel > 0) {
        const visibleStartTime = allHours[0].time.toMillis() + scrollTo * timePerPixel
        const visibleEndTime = visibleStartTime + containerWidth * timePerPixel

        if (onVisibleRangeChange) {
          onVisibleRangeChange(visibleStartTime, visibleEndTime)
        }
      }

      // Reset auto-scrolling flag after a short delay
      setTimeout(() => {
        isAutoScrollingRef.current = false
      }, 100)
    }
  }, [currentHourIndex, allHours, initialScrollDone, centerOnCurrent, calculateTimePerPixel, onVisibleRangeChange])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-48 bg-gray-800 rounded-md overflow-x-auto hide-scrollbar"
        style={{
          WebkitOverflowScrolling: "touch" // Smooth scrolling on iOS
        }}
      >
        <canvas ref={canvasRef} height={250} className="h-full" />
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  )
}
