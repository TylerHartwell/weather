export interface WeatherData {
  current: WeatherCurrent
  hourly: WeatherHourly
  daily: WeatherDaily
  timezone: string | null
  timezoneAbbreviation: string | null
  latitude: number
  longitude: number
  windSpeedUnit: WindSpeedUnit
  temperatureUnit: TemperatureUnit
  precipitationUnit: PrecipitationUnit
  hourDiffFromLocal: number
}

export interface WeatherCurrent {
  time: Date
  temperature2m: number
  relativeHumidity2m: number
  windSpeed10m: number
  windDirection10m: number
  precipitation: number
  weatherCode: number
}

export interface WeatherHourly {
  time: Date[]
  temperature2m: Float32Array
  windSpeed10m: Float32Array
  precipitationProbability: Float32Array
}

export type WeatherHour = {
  [K in keyof WeatherHourly]: WeatherHourly[K] extends Array<infer U> ? U : WeatherHourly[K] extends Float32Array ? number : never
}

export interface WeatherDaily {
  time: Date[]
  temperature2mMax: Float32Array
  temperature2mMin: Float32Array
  windSpeed10mMax: Float32Array
  windDirection10mDominant: Float32Array
  precipitationProbabilityMax: Float32Array
  weatherCode: Float32Array
}

export type WeatherDay = {
  [K in keyof WeatherDaily]: WeatherDaily[K] extends Array<infer U> ? U : WeatherDaily[K] extends Float32Array ? number : never
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

export type WindSpeedUnit = "mph" | "kmh"
export type TemperatureUnit = "fahrenheit" | "celsius"
export type PrecipitationUnit = "inch" | "mm"
