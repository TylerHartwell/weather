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
      countryCode: data.results[0].country_code,
      timezone: data.results[0].timezone || "auto",
      admin1: data.results[0].admin1,
      postcodes: data.results[0].postcodes ?? []
    }
  } catch (error) {
    throw error
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
        "weather_code",
        "sunrise",
        "sunset"
      ],
      "hourly": ["temperature_2m", "wind_speed_10m", "wind_direction_10m", "precipitation_probability", "relative_humidity_2m", "weather_code"],
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

    const response = responses[0]

    const timezone = response.timezone()
    const timezoneAbbreviation = response.timezoneAbbreviation()
    const latitude = response.latitude()
    const longitude = response.longitude()

    const current = response.current()!
    const hourly = response.hourly()!
    const daily = response.daily()!
    const sunrises = daily.variables(6)!
    const sunsets = daily.variables(7)!

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
        precipitationProbability: hourly.variables(3)!.valuesArray()!,
        relativeHumidity2m: hourly.variables(4)!.valuesArray()!,
        weatherCode: hourly.variables(5)!.valuesArray()!
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
        weatherCode: daily.variables(5)!.valuesArray()!,
        sunrise: [...Array(sunrises.valuesInt64Length())].map((_, i) =>
          DateTime.fromSeconds(Number(sunrises.valuesInt64(i))).setZone(timezone || "local")
        ),
        sunset: [...Array(sunsets.valuesInt64Length())].map((_, i) =>
          DateTime.fromSeconds(Number(sunsets.valuesInt64(i))).setZone(timezone || "local")
        )
      },
      timezone,
      timezoneAbbreviation,
      latitude,
      longitude,
      windSpeedUnit,
      temperatureUnit,
      precipitationUnit,
      locationName: locationData.name,
      countryCode: locationData.countryCode,
      admin1: locationData.admin1,
      postcodes: locationData.postcodes
    }

    return weatherData
  } catch (error) {
    throw error
  }
}
