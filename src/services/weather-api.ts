import { fetchWeatherApi } from "openmeteo"
import type { PrecipitationUnit, TemperatureUnit, WeatherData, WindSpeedUnit } from "@/types/weather"
import { DateTime } from "luxon"

// Geocoding API to convert location name to coordinates
async function getCoordinates(location: string) {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`)

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      throw new Error(`Location not found: ${location}`)
    }

    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
      name: data.results[0].name,
      country: data.results[0].country,
      timezone: data.results[0].timezone || "auto"
    }
  } catch (error) {
    console.error("Error getting coordinates:", error)
    return {
      country: "United States",
      latitude: 40.71427,
      longitude: -74.00597,
      name: "New York",
      timezone: "America/New_York"
    }
  }
}

export async function fetchWeatherData(
  location: string,
  windSpeedUnit: WindSpeedUnit,
  temperatureUnit: TemperatureUnit,
  precipitationUnit: PrecipitationUnit
): Promise<WeatherData> {
  try {
    const locationData = await getCoordinates(location)

    const params = {
      "latitude": locationData.latitude,
      "longitude": locationData.longitude,
      "daily": [
        "temperature_2m_max",
        "temperature_2m_min",
        "wind_speed_10m_max",
        "wind_direction_10m_dominant",
        "precipitation_probability_max",
        "weather_code"
      ],
      "hourly": ["temperature_2m", "wind_speed_10m", "wind_direction_10m", "precipitation_probability"],
      "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "wind_direction_10m", "precipitation", "weather_code"],
      "timezone": locationData.timezone,
      "past_days": 7,
      "forecast_days": 8,
      "wind_speed_unit": windSpeedUnit,
      "temperature_unit": temperatureUnit,
      "precipitation_unit": precipitationUnit
    }
    const url = "https://api.open-meteo.com/v1/forecast"

    const responses = await fetchWeatherApi(url, params)
    console.log("API CALLED")

    const response = responses[0]

    // const utcOffsetSeconds = response.utcOffsetSeconds()
    const timezone = response.timezone()
    const timezoneAbbreviation = response.timezoneAbbreviation()
    const latitude = response.latitude()
    const longitude = response.longitude()

    const current = response.current()!
    const hourly = response.hourly()!
    const daily = response.daily()!

    const weatherData = {
      current: {
        time: DateTime.fromSeconds(Number(current.time())).setZone(timezone || "local"),
        temperature2m: current.variables(0)!.value(),
        relativeHumidity2m: current.variables(1)!.value(),
        windSpeed10m: current.variables(2)!.value(),
        windDirection10m: current.variables(3)!.value(),
        precipitation: current.variables(4)!.value(),
        weatherCode: current.variables(5)!.value()
      },
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map((_, i) =>
          DateTime.fromSeconds(Number(hourly.time()) + i * hourly.interval()).setZone(timezone || "local")
        ),
        temperature2m: hourly.variables(0)!.valuesArray()!,
        windSpeed10m: hourly.variables(1)!.valuesArray()!,
        windDirection10m: hourly.variables(2)!.valuesArray()!,
        precipitationProbability: hourly.variables(3)!.valuesArray()!
      },
      daily: {
        time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map((_, i) =>
          DateTime.fromSeconds(Number(daily.time()) + i * daily.interval()).setZone(timezone || "local")
        ),
        temperature2mMax: daily.variables(0)!.valuesArray()!,
        temperature2mMin: daily.variables(1)!.valuesArray()!,
        windSpeed10mMax: daily.variables(2)!.valuesArray()!,
        windDirection10mDominant: daily.variables(3)!.valuesArray()!,
        precipitationProbabilityMax: daily.variables(4)!.valuesArray()!,
        weatherCode: daily.variables(5)!.valuesArray()!
      },
      timezone,
      timezoneAbbreviation,
      latitude,
      longitude,
      windSpeedUnit,
      temperatureUnit,
      precipitationUnit,
      locationName: locationData.name
    }

    return weatherData
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}
