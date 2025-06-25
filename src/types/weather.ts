import { DateTime } from "luxon"

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
  locationName: string
  countryCode: string
  admin1: string
  postcodes: string[]
}

export interface WeatherCurrent {
  time: DateTime
  temperature2m: number
  relativeHumidity2m: number
  windSpeed10m: number
  windDirection10m: number
  precipitation: number
  weatherCode: number
}

export interface WeatherHourly {
  time: DateTime[]
  temperature2m: Float32Array
  windSpeed10m: Float32Array
  windDirection10m: Float32Array
  precipitationProbability: Float32Array
  relativeHumidity2m: Float32Array
  weatherCode: Float32Array
}

export type WeatherHour = {
  [K in keyof WeatherHourly]: WeatherHourly[K] extends Array<infer U> ? U : WeatherHourly[K] extends Float32Array ? number : never
}

export interface WeatherDaily {
  time: DateTime[]
  temperature2mMax: Float32Array
  temperature2mMin: Float32Array
  windSpeed10mMax: Float32Array
  windDirection10mDominant: Float32Array
  precipitationProbabilityMax: Float32Array
  weatherCode: Float32Array
  sunrise: DateTime[]
  sunset: DateTime[]
}

export type WeatherDay = {
  [K in keyof WeatherDaily]: WeatherDaily[K] extends Array<infer U> ? U : WeatherDaily[K] extends Float32Array ? number : never
}

export const seriesKeys = ["temperature", "precipitation", "wind"] as const
export type SeriesKey = (typeof seriesKeys)[number]

export type VisibleSeries = Record<SeriesKey, { hidden: boolean; solo: boolean }>

export type WindSpeedUnit = "mph" | "kmh"
export type TemperatureUnit = "fahrenheit" | "celsius"
export type PrecipitationUnit = "inch" | "mm"
