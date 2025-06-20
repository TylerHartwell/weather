"use client"

import type React from "react"
import { DateTime } from "luxon"
import { useEffect, useRef, useState, useCallback, useMemo, RefObject } from "react"
import type { SeriesKey, VisibleSeries, WeatherHour, WeatherHourly } from "@/types/weather"
import { getWeatherDescription } from "@/lib/weather-utils"

interface WeatherChartProps {
  weatherHourly: WeatherHourly
  selectedTimestamp: number | null
  containerRef?: RefObject<HTMLDivElement | null>
  visibleSeries: VisibleSeries
  timezone: string | null
  jumpTrigger: number
  scrollTrigger: number
}

export default function WeatherChart({
  weatherHourly,
  selectedTimestamp,
  visibleSeries,
  timezone,
  jumpTrigger,
  scrollTrigger,
  ...props
}: WeatherChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialScroll, setIsInitialScroll] = useState(true)
  const [isLongPress, setIsLongPress] = useState(false)
  const [pointerX, setPointerX] = useState<number | null>(null)
  const longPressTimeout = useRef<number | null>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragThreshold = 5 // px before considering it a drag
  const isPointerDown = useRef(false)

  const chartPaddingX = 40
  const chartPaddingBottom = 50
  const chartPaddingTop = 80
  const chartWidthPerHour = 30

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const handleWheel = (e: WheelEvent) => {
      if (isLongPress) {
        e.preventDefault() // block horizontal scroll via wheel
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isLongPress) {
        e.preventDefault() // block touch-driven horizontal scroll
      }
    }

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown.current = true
      pointerDownPos.current = { x: e.clientX, y: e.clientY }

      longPressTimeout.current = window.setTimeout(() => {
        setIsLongPress(true)
        updatePointerX(e)
      }, 200) // 500ms for long press

      dragStartX.current = e.clientX
      scrollStartX.current = container.scrollLeft
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return
      // Cancel long-press if pointer has moved beyond threshold
      const dx = Math.abs(e.clientX - pointerDownPos.current.x)
      const dy = Math.abs(e.clientY - pointerDownPos.current.y)
      if (!isLongPress && (dx > dragThreshold || dy > dragThreshold)) {
        if (longPressTimeout.current !== null) {
          clearTimeout(longPressTimeout.current)
          longPressTimeout.current = null
        }
        if (!isDragging.current) {
          isDragging.current = true
        }
      }
      if (isLongPress) {
        updatePointerX(e)
        return
      }

      if (isDragging.current && !isLongPress) {
        const dragDx = e.clientX - dragStartX.current
        container.scrollLeft = scrollStartX.current - dragDx
      }
    }

    const handlePointerUp = () => {
      isPointerDown.current = false
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current)
        longPressTimeout.current = null
      }
      setIsLongPress(false)
      setPointerX(null)

      isDragging.current = false
    }

    const updatePointerX = (e: PointerEvent) => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const relativeToCanvas = (e.clientX - rect.left) * scaleX

      const clampedX = Math.max(chartPaddingX, Math.min(canvas.width - chartPaddingX, relativeToCanvas))

      setPointerX(clampedX)
    }

    canvas.addEventListener("pointerdown", handlePointerDown)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)
    canvas.addEventListener("pointerleave", handlePointerUp)

    container.addEventListener("wheel", handleWheel, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
      canvas.removeEventListener("pointerleave", handlePointerUp)
      container.removeEventListener("wheel", handleWheel)
      container.removeEventListener("touchmove", handleTouchMove)
    }
  }, [isLongPress])

  const getVisibilityState = useCallback(
    (seriesKey: SeriesKey) => {
      const anySolo = Object.values(visibleSeries).some(state => state.solo)

      if (anySolo) {
        // If any dataDisplay is in solo mode, only the solo dataDisplay is visible
        return visibleSeries[seriesKey].solo
      }

      // Otherwise, all dataDisplays that aren't hidden are visible
      return !visibleSeries[seriesKey].hidden
    },
    [visibleSeries]
  )

  const allHours = useMemo<WeatherHour[]>(() => {
    const numHours = weatherHourly.time.length
    const result: WeatherHour[] = []

    for (let i = 0; i < numHours; i++) {
      result.push({
        time: weatherHourly.time[i],
        temperature2m: Math.round(weatherHourly.temperature2m[i]),
        windSpeed10m: Math.round(weatherHourly.windSpeed10m[i]),
        windDirection10m: Math.round(weatherHourly.windDirection10m[i]),
        precipitationProbability: weatherHourly.precipitationProbability[i],
        relativeHumidity2m: weatherHourly.relativeHumidity2m[i],
        weatherCode: weatherHourly.weatherCode[i]
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

  const currentHourIndex = allHours.findIndex(hour => hour.time.toUTC().hasSame(DateTime.now().toUTC(), "hour"))

  const calculateTimePerPixel = useCallback(() => {
    if (allHours.length < 2 || !canvasRef.current) return 0

    const start = allHours[0].time.toMillis()
    const end = allHours[allHours.length - 1].time.toMillis()
    const totalTimespan = end - start

    if (totalTimespan <= 0) return 0

    const chartWidth = canvasRef.current.width - chartPaddingX * 2
    if (chartWidth <= 0) return 0

    return totalTimespan / chartWidth
  }, [allHours])

  const drawChart = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d", { alpha: false }) // Use non-alpha for better performance

    if (!ctx) return

    // Set dimensions - make it wider for scrolling
    // Each hour gets more space since we're only viewing 24 hours at a time
    const width = Math.max(2000, (allHours.length - 1) * chartWidthPerHour) // Each data point gets 30px width
    const height = canvas.height
    canvas.width = width

    const chartWidth = width - chartPaddingX * 2
    const chartHeight = height - chartPaddingBottom - chartPaddingTop

    // Clear canvas - use fillRect instead of clearRect for better performance
    ctx.fillStyle = "#1F2937" // Dark gray background
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "#374151" // Lighter gray for grid
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = chartPaddingTop + (i / 4) * chartHeight
      ctx.beginPath()
      ctx.moveTo(chartPaddingX, y)
      ctx.lineTo(width - chartPaddingX, y)
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
      const x = chartPaddingX + timeOffset / timePerPixel

      // Draw dashed vertical line at midnight
      ctx.beginPath()
      ctx.strokeStyle = "#6B7280"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 3])
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height - chartPaddingBottom)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw date labels on both sides of the boundary
      ctx.fillStyle = "#9CA3AF"
      ctx.font = "bold 16px Arial"
      ctx.textBaseline = "top"
      ctx.shadowColor = "rgba(0, 0, 0, 1)" // Shadow color
      ctx.shadowBlur = 15 // Blur level
      ctx.shadowOffsetX = 0 // Horizontal offset
      ctx.shadowOffsetY = 0

      // Draw previous date label (left side)
      if (timeOffset !== 0) {
        ctx.textAlign = "right"
        ctx.fillText(dateLabels.prevDate, x - 5, 0)
      }

      // Draw next date label (right side)
      ctx.textAlign = "left"
      ctx.fillText(dateLabels.nextDate, x + 5, 0)

      // Draw next date label at noon
      ctx.textAlign = "center"
      ctx.fillText(dateLabels.nextDate, x + (1000 * 60 * 60 * 12) / timePerPixel, 0)
    })

    // Find min and max values for temperature
    const tempValues = allHours.map(item => item.temperature2m)
    const minTemp = Math.min(...tempValues) - 2
    const maxTemp = Math.max(...tempValues) + 2
    const tempRange = maxTemp - minTemp

    // Find max values for precipitation and wind (min is always 0)
    // const maxPrecip = Math.max(...allHours.map(item => item.precipitationProbability || 0)) + 5
    // const maxWind = Math.max(...allHours.map(item => item.windSpeed10m || 0)) + 5

    // Draw vertical line for current time
    if (currentHourIndex >= 0) {
      const currentMinute = DateTime.now().minute
      const currentX = chartPaddingX + ((currentHourIndex + currentMinute / 60) / (allHours.length - 1)) * chartWidth

      // Draw dashed line
      ctx.beginPath()
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.moveTo(currentX, 0)
      ctx.lineTo(currentX, height - chartPaddingBottom + 7.5)
      ctx.stroke()

      // Reset line dash
      ctx.setLineDash([])

      // Draw "NOW" label
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      const target = DateTime.now().setZone(timezone || "local")
      const targetHour = target.toFormat("h:mm") + target.toFormat("a").toLowerCase()
      const targetOffset = target.toFormat("Z")

      const local = DateTime.now().setZone("local")
      const localHour = local.toFormat("h:mm") + local.toFormat("a").toLowerCase()
      const localOffset = local.toFormat("Z")

      const currentTimeText = `${targetHour} ${targetOffset} ${target.hour === local.hour ? "" : `(${localHour} ${localOffset})`}`

      ctx.fillText(currentTimeText, currentX, height - chartPaddingBottom + 15)

      // Draw circle at the top of the line
      ctx.beginPath()
      ctx.arc(currentX, height - chartPaddingBottom + 7.5, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.fill()
    }

    // Draw precipitation line if visible
    if (getVisibilityState("precipitation")) {
      const previousTextAlign = ctx.textAlign
      const previousTextBaseline = ctx.textBaseline
      const previousStrokeStyle = ctx.strokeStyle
      const previousFillStyle = ctx.fillStyle
      const previousLineWidth = ctx.lineWidth
      const previousShadowBlur = ctx.shadowBlur

      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.strokeStyle = "#60A5FA"
      ctx.lineWidth = 1
      ctx.shadowBlur = 0

      ctx.beginPath()
      //stepwise lines
      allHours.forEach((point, index) => {
        const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
        const y = height - chartPaddingBottom - ((point.precipitationProbability || 0) / 100) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevY = height - chartPaddingBottom - ((allHours[index - 1].precipitationProbability || 0) / 100) * chartHeight

          ctx.lineTo(x, prevY)
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      //filled area
      ctx.beginPath()
      ctx.moveTo(
        chartPaddingX,
        height - chartPaddingBottom // Start at bottom-left
      )

      allHours.forEach((point, index) => {
        const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
        const y = height - chartPaddingBottom - ((point.precipitationProbability || 0) / 100) * chartHeight

        if (index > 0) {
          const prevY = height - chartPaddingBottom - ((allHours[index - 1].precipitationProbability || 0) / 100) * chartHeight
          ctx.lineTo(x, prevY)
          ctx.lineTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      const lastX = chartPaddingX + ((allHours.length - 1) / (allHours.length - 1)) * chartWidth
      ctx.lineTo(lastX, height - chartPaddingBottom)
      ctx.lineTo(chartPaddingX, height - chartPaddingBottom)
      ctx.closePath()

      ctx.fillStyle = "rgba(96, 165, 250, 0.3)"
      ctx.fill()

      ctx.fillStyle = "#60A5FA"
      ctx.shadowBlur = 15
      allHours.forEach((point, index) => {
        if (index % 1 === 0) {
          const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
          const y = height - chartPaddingBottom
          ctx.fillText(`${point.precipitationProbability}`, x, y)
        }
      })

      ctx.textAlign = previousTextAlign
      ctx.textBaseline = previousTextBaseline
      ctx.strokeStyle = previousStrokeStyle
      ctx.fillStyle = previousFillStyle
      ctx.lineWidth = previousLineWidth
      ctx.shadowBlur = previousShadowBlur
    }

    // Draw wind line if visible
    if (getVisibilityState("wind")) {
      const previousTextAlign = ctx.textAlign
      const previousTextBaseline = ctx.textBaseline
      const previousStrokeStyle = ctx.strokeStyle
      const previousFillStyle = ctx.fillStyle
      const previousLineWidth = ctx.lineWidth
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#4ADE80"
      ctx.lineWidth = 2

      ctx.beginPath()

      allHours.forEach((point, index) => {
        if (index % 1 === 0) {
          const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
          const y = 45
          const textOffsetX = 0
          const textOffsetY = -20
          if (index % 1 === 0) {
            ctx.fillText(`${point.windSpeed10m}`, x + textOffsetX, y + textOffsetY)
          }
          ctx.save()
          const arrowOffsetX = 0
          const arrowOffsetY = 0
          const baseX = x + arrowOffsetX
          const baseY = y + arrowOffsetY

          ctx.translate(baseX, baseY) // base of the arrow is now (0, 0)

          // Rotate the canvas
          const angle = (Math.round(point.windDirection10m) * Math.PI) / 180
          ctx.rotate(angle)

          const scale = Math.sqrt(Math.sqrt(point.windSpeed10m))
          ctx.scale(scale * 1.5, scale)

          // Draw the arrow pointing up ("↑"), which will now be rotated
          ctx.fillText("↑", 0, 0)

          // Restore context to avoid affecting other drawings
          ctx.restore()
        }
      })
      ctx.textAlign = previousTextAlign
      ctx.textBaseline = previousTextBaseline
      ctx.strokeStyle = previousStrokeStyle
      ctx.fillStyle = previousFillStyle
      ctx.lineWidth = previousLineWidth
    }

    if (getVisibilityState("temperature")) {
      const previousTextAlign = ctx.textAlign
      const previousTextBaseline = ctx.textBaseline
      const previousStrokeStyle = ctx.strokeStyle
      const previousFillStyle = ctx.fillStyle
      const previousLineWidth = ctx.lineWidth
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.strokeStyle = "#FACC15" // Yellow for temperature
      ctx.fillStyle = "#FACC15"
      ctx.lineWidth = 3

      // Draw temperature points and values
      allHours.forEach((point, index) => {
        if (index % 1 === 0) {
          const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
          const y = height - chartPaddingBottom - 16 - ((point.temperature2m - minTemp) / tempRange) * (chartHeight - 10)

          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillText(`${point.temperature2m}`, x, y - 5)
        }
      })

      ctx.beginPath()

      // Draw temperature line
      allHours.forEach((point, index) => {
        const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
        const y = height - chartPaddingBottom - 16 - ((point.temperature2m - minTemp) / tempRange) * (chartHeight - 10)
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      ctx.textAlign = previousTextAlign
      ctx.textBaseline = previousTextBaseline
      ctx.strokeStyle = previousStrokeStyle
      ctx.fillStyle = previousFillStyle
      ctx.lineWidth = previousLineWidth
    }

    // Draw time labels
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"
    allHours.forEach((point, index) => {
      if (index % 2 === 0) {
        const x = chartPaddingX + (index / (allHours.length - 1)) * chartWidth
        const y = height
        const adjustedHour = point.time.toFormat("h")
        const meridiem = point.time.toFormat("a").toLowerCase()
        // const meridiem = adjustedHour === "12" || adjustedHour === "6" ? point.time.toFormat("a").toLowerCase() : ""
        ctx.fillText(adjustedHour + meridiem, x, y)
      }
    })

    if (isLongPress && pointerX !== null) {
      const hourIndex = Math.floor(((pointerX - chartPaddingX) / chartWidth) * (allHours.length - 1))
      // Vertical line
      ctx.strokeStyle = "white"
      ctx.beginPath()
      ctx.moveTo(pointerX, 0)
      ctx.lineTo(pointerX, canvas.height)
      ctx.stroke()

      // Info bubble box
      ctx.fillStyle = "#111827"
      ctx.fillRect(pointerX - chartPaddingX, canvas.height / 2 - canvas.height / 6, chartPaddingX * 2, canvas.height / 3)

      ctx.fillStyle = "white"
      ctx.font = "12px sans-serif"
      ctx.textBaseline = "middle"
      ctx.fillText(allHours[hourIndex].time.toFormat("h:mm a"), pointerX, canvas.height / 2 - 20)
      ctx.fillText(`H: ${allHours[hourIndex].relativeHumidity2m.toFixed(0)}%`, pointerX, canvas.height / 2)
      ctx.fillText(getWeatherDescription(allHours[hourIndex].weatherCode), pointerX, canvas.height / 2 + 20)
    }
  }, [allHours, currentHourIndex, getVisibilityState, isLongPress, pointerX, timezone, calculateTimePerPixel])

  useEffect(() => {
    drawChart()
  }, [drawChart])

  const scrollToPosition = useCallback(
    ({
      container,
      canvas,
      chartFraction,

      smooth = true,
      containerFractionOffset = 0.5
    }: {
      container: HTMLElement | null
      canvas: HTMLElement | null
      chartFraction: number
      smooth?: boolean
      containerFractionOffset?: number
    }) => {
      if (!container || !canvas) return
      const chartWidth = canvas.scrollWidth - chartPaddingX * 2
      const containerWidth = container.offsetWidth
      const maxScrollLeft = container.scrollWidth - containerWidth
      const chartTargetX = chartFraction * chartWidth
      const targetScrollPosition = Math.min(maxScrollLeft, Math.max(0, chartTargetX + chartPaddingX - containerWidth * containerFractionOffset))

      container.scrollTo({
        left: targetScrollPosition,
        behavior: smooth ? "smooth" : "instant"
      })
    },
    [chartPaddingX]
  )
  const handleScrollToPosition = useCallback(
    (targetTimeStamp: number, smooth?: boolean) => {
      if (!canvasRef.current || !containerRef.current) return
      if (allHours.length <= 1) return

      const canvas = canvasRef.current
      const container = containerRef.current
      const startTimestamp = allHours[0].time.toMillis()
      const endTimestamp = allHours[allHours.length - 1].time.toMillis()

      const totalTimespan = endTimestamp - startTimestamp
      const targetTimeSpan = targetTimeStamp - startTimestamp

      const chartFraction = targetTimeSpan / totalTimespan

      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollToPosition({
            container,
            canvas,
            chartFraction,
            ...(smooth !== undefined ? { smooth } : {})
          })
        }, 0)
      })
    },
    [allHours, scrollToPosition]
  )

  useEffect(() => {
    if (jumpTrigger > 0) {
      const targetTimeStamp = DateTime.now()
        .setZone(timezone || "local")
        .toMillis()
      handleScrollToPosition(targetTimeStamp)
    }
  }, [jumpTrigger, timezone, handleScrollToPosition])

  // Handle scrolling to a specific timestamp with smooth animation
  useEffect(() => {
    if (selectedTimestamp === null || allHours.length <= 1 || isInitialScroll) return

    const selectedDate = DateTime.fromMillis(selectedTimestamp)
      .setZone(timezone || "local")
      .startOf("day")

    const dayStart = selectedDate.toMillis()

    const dayMiddle = dayStart + 12 * 60 * 60 * 1000

    const targetTimeStamp = dayMiddle

    handleScrollToPosition(targetTimeStamp)
  }, [scrollTrigger, selectedTimestamp, allHours, timezone, isInitialScroll, scrollToPosition, handleScrollToPosition])

  // Auto-scroll to current time on initial render
  useEffect(() => {
    if (!isInitialScroll || currentHourIndex < 0 || allHours.length <= 1) return
    if (!canvasRef.current || !containerRef.current) return

    const targetTimeStamp = DateTime.now()
      .setZone(timezone || "local")
      .toMillis()

    handleScrollToPosition(targetTimeStamp, false)

    setIsInitialScroll(false)
  }, [currentHourIndex, allHours, isInitialScroll, scrollToPosition, timezone, handleScrollToPosition])

  return (
    <div className="relative mt-1 mb-1">
      <div
        ref={containerRef}
        className="w-full h-60 bg-green-800 rounded-md overflow-x-auto scrollbar scrollbar-h-2 scrollbar-thumb-[#4b5563] scrollbar-track-[#252b36] scrollbar-hover:scrollbar-thumb-[#6b7280] scrollbar-track-hover:scrollbar-track-[#2f3846] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
      >
        <canvas ref={canvasRef} height={250} className="h-full" />
      </div>
    </div>
  )
}
