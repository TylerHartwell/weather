// Helper to get date string in YYYY-MM-DD format
export const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

// Map weather icon type to component
export const mapWeatherIconToComponent = (iconCode: string): string => {
  return iconCode
}

// Format temperature based on unit
export const formatTemp = (temp: number, unit = "°C"): string => {
  return `${Math.round(temp)}${unit}`
}

// Format date for display
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

// Get day name from timestamp
export const getDayName = (timestamp: number, short = true): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", { weekday: short ? "short" : "long" })
}
