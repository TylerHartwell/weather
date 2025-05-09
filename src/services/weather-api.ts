import { fetchWeatherApi } from "openmeteo"
import type { PrecipitationUnit, TemperatureUnit, WeatherData, WindSpeedUnit } from "@/types/weather"

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
        "weather_code",
        "temperature_2m_max",
        "wind_speed_10m_max",
        "wind_direction_10m_dominant",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
        "precipitation_sum",
        "temperature_2m_min"
      ],
      "hourly": ["temperature_2m", "wind_speed_10m", "precipitation_probability"],
      "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "wind_direction_10m", "precipitation", "weather_code"],
      "timezone": locationData.timezone,
      "past_days": 7,
      "wind_speed_unit": windSpeedUnit,
      "temperature_unit": temperatureUnit,
      "precipitation_unit": precipitationUnit
    }
    const url = "https://api.open-meteo.com/v1/forecast"

    const responses = await fetchWeatherApi(url, params)

    const response = responses[0]

    const utcOffsetSeconds = response.utcOffsetSeconds()
    const timezone = response.timezone()
    const timezoneAbbreviation = response.timezoneAbbreviation()
    const latitude = response.latitude()
    const longitude = response.longitude()

    const current = response.current()!
    const hourly = response.hourly()!
    const daily = response.daily()!

    const sunrise = daily.variables(4)!
    const sunset = daily.variables(5)!

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature2m: current.variables(0)!.value(),
        relativeHumidity2m: current.variables(1)!.value(),
        windSpeed10m: current.variables(2)!.value(),
        windDirection10m: current.variables(3)!.value(),
        precipitation: current.variables(4)!.value(),
        weatherCode: current.variables(5)!.value()
      },
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature2m: hourly.variables(0)!.valuesArray()!,
        windSpeed10m: hourly.variables(1)!.valuesArray()!,
        precipitationProbability: hourly.variables(2)!.valuesArray()!
      },
      daily: {
        time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
          (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ),
        weatherCode: daily.variables(0)!.valuesArray()!,
        temperature2mMax: daily.variables(1)!.valuesArray()!,
        windSpeed10mMax: daily.variables(2)!.valuesArray()!,
        windDirection10mDominant: daily.variables(3)!.valuesArray()!,
        sunrise: [...Array(sunrise.valuesInt64Length())].map((_, i) => new Date((Number(sunrise.valuesInt64(i)) + utcOffsetSeconds) * 1000)),
        sunset: [...Array(sunset.valuesInt64Length())].map((_, i) => new Date((Number(sunset.valuesInt64(i)) + utcOffsetSeconds) * 1000)),
        uvIndexMax: daily.variables(6)!.valuesArray()!,
        precipitationProbabilityMax: daily.variables(7)!.valuesArray()!,
        precipitationSum: daily.variables(8)!.valuesArray()!,
        temperature2mMin: daily.variables(9)!.valuesArray()!
      },
      timezone,
      timezoneAbbreviation,
      latitude,
      longitude,
      windSpeedUnit,
      temperatureUnit,
      precipitationUnit
    }
    console.log("Weather Data: ", weatherData)

    return weatherData
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}
