// Types for weather data
export interface WeatherDay {
  day: string
  date?: string
  icon: string
  highTemp: number
  lowTemp: number
  timestamp?: number // Start timestamp of the day
}

export interface ChartData {
  time: string
  timestamp: number // Unix timestamp for ordering
  temp: number
  precipitation?: number
  wind?: number
  isCurrent?: boolean
  date?: string // Date in YYYY-MM-DD format for grouping by day
}

export interface CurrentWeather {
  temp: number
  tempUnit: string
  condition: string
  precipitation: string
  humidity: string
  wind: string
  icon: string
  day: string
}

export interface WeatherData {
  location: string
  current: CurrentWeather
  hourlyDetailed: ChartData[]
  forecast: WeatherDay[]
  historical: WeatherDay[]
}

export interface VisibleSeries {
  temperature: boolean
  precipitation: boolean
  wind: boolean
}

export interface VisibleTimeRange {
  start: number
  end: number
}
