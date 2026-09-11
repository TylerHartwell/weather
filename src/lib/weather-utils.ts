import { DateTime } from "luxon"
import type { PrecipitationUnit, TemperatureUnit, WeatherData, WindSpeedUnit } from "@/types/weather"

export const createPlaceholderWeatherData = ({
  windSpeedUnit,
  temperatureUnit,
  precipitationUnit
}: {
  windSpeedUnit: WindSpeedUnit
  temperatureUnit: TemperatureUnit
  precipitationUnit: PrecipitationUnit
}): WeatherData => {
  const now = DateTime.now()
  const startOfHour = now.startOf("hour")
  const startOfDay = now.startOf("day")

  const placeholderCurrent = {
    time: now,
    temperature2m: 0,
    relativeHumidity2m: 0,
    windSpeed10m: 0,
    windDirection10m: 0,
    precipitation: 0,
    weatherCode: 0
  }

  const hourlyLength = 24
  const dailyLength = 7

  return {
    current: placeholderCurrent,
    minutely15: [placeholderCurrent],
    hourly: {
      time: Array.from({ length: hourlyLength }, (_, i) => startOfHour.plus({ hours: i })),
      temperature2m: new Float32Array(hourlyLength),
      windSpeed10m: new Float32Array(hourlyLength),
      windDirection10m: new Float32Array(hourlyLength),
      precipitationProbability: new Float32Array(hourlyLength),
      relativeHumidity2m: new Float32Array(hourlyLength),
      weatherCode: new Float32Array(hourlyLength)
    },
    daily: {
      time: Array.from({ length: dailyLength }, (_, i) => startOfDay.plus({ days: i })),
      temperature2mMax: new Float32Array(dailyLength),
      temperature2mMin: new Float32Array(dailyLength),
      windSpeed10mMax: new Float32Array(dailyLength),
      windDirection10mDominant: new Float32Array(dailyLength),
      precipitationProbabilityMax: new Float32Array(dailyLength),
      weatherCode: new Float32Array(dailyLength),
      sunrise: Array.from({ length: dailyLength }, (_, i) => startOfDay.plus({ days: i, hours: 6 })),
      sunset: Array.from({ length: dailyLength }, (_, i) => startOfDay.plus({ days: i, hours: 18 }))
    },
    timezone: null,
    timezoneAbbreviation: null,
    latitude: 0,
    longitude: 0,
    windSpeedUnit,
    temperatureUnit,
    precipitationUnit,
    locationName: "",
    countryCode: "",
    admin1: "",
    postcodes: []
  }
}

export const getWeatherDescription = (code: number): string => {
  const weatherMap: { [key: number]: string } = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm + light hail",
    99: "Thunderstorm + heavy hail"
  }

  return weatherMap[code] || "Unknown"
}

export const degreesToCardinal = (degrees: number) => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}
