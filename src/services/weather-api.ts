// import { fetchWeatherApi } from 'openmeteo';
import type { WeatherData } from "@/types/weather"
import { getDateString, getDayName } from "@/lib/weather-utils"

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

export async function fetchWeatherData(location: string): Promise<WeatherData> {
  try {
    // Step 1: Convert location name to coordinates
    const locationData = await getCoordinates(location)
    const { latitude, longitude, name, country, timezone } = locationData

    //     const params = {
    //       "latitude": 52.52,
    //       "longitude": 13.41,
    //       "daily": ["weather_code", "temperature_2m_max", "wind_speed_10m_max", "wind_direction_10m_dominant", "sunrise", "sunset", "uv_index_max", "precipitation_probability_max", "precipitation_sum", "temperature_2m_min"],
    //       "hourly": ["temperature_2m", "wind_speed_10m", "precipitation_probability"],
    //       "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "wind_direction_10m", "precipitation", "weather_code"],
    //       "timezone": "America/Los_Angeles",
    //       "past_days": 7,
    //       "wind_speed_unit": "mph",
    //       "temperature_unit": "fahrenheit",
    //       "precipitation_unit": "inch"
    //     };

    //     const url = "https://api.open-meteo.com/v1/forecast";
    // const responses = await fetchWeatherApi(url, params);

    // Step 2: Fetch current weather and forecast data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
        `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=${timezone}` +
        `&forecast_days=7`
    )

    if (!weatherResponse.ok) {
      throw new Error(`Weather API failed: ${weatherResponse.statusText}`)
    }

    const weatherData = await weatherResponse.json()
    console.log("weather data: ", weatherData)

    // Step 3: Fetch historical data (last 7 days)
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const startDate = sevenDaysAgo.toISOString().split("T")[0]
    const endDate = today.toISOString().split("T")[0]

    const historicalResponse = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?` +
        `latitude=${latitude}&longitude=${longitude}` +
        `&start_date=${startDate}&end_date=${endDate}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=${timezone}`
    )

    if (!historicalResponse.ok) {
      throw new Error(`Historical API failed: ${historicalResponse.statusText}`)
    }

    const historicalData = await historicalResponse.json()
    console.log("historical data: ", historicalData)

    // Transform the data to match our app's format
    const transformedWeatherData = transformWeatherData(weatherData, historicalData, `${name}, ${country}`)
    console.log("transformed: ", transformedWeatherData)
    return transformedWeatherData
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

function transformWeatherData(weatherData: any, historicalData: any, location: string): WeatherData {
  const now = new Date()

  // Transform current weather
  const current = {
    temp: Math.round(weatherData.current.temperature_2m),
    tempUnit: weatherData.current_units.temperature_2m,
    condition: getWeatherCondition(weatherData.current.weather_code),
    precipitation: `${weatherData.current.precipitation}${weatherData.current_units.precipitation}`,
    humidity: `${weatherData.current.relative_humidity_2m}${weatherData.current_units.relative_humidity_2m}`,
    wind: `${Math.round(weatherData.current.wind_speed_10m)} ${weatherData.current_units.wind_speed_10m}`,
    icon: mapWeatherCodeToIcon(weatherData.current.weather_code),
    day: getDayName(now.getTime(), false)
  }

  // Process hourly data
  const hourlyDetailed = weatherData.hourly.time.map((time: string, index: number) => {
    const timestamp = new Date(time).getTime()
    const date = new Date(timestamp)
    const isCurrentHour = date.getDate() === now.getDate() && date.getHours() === now.getHours()

    return {
      time: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      timestamp,
      temp: Math.round(weatherData.hourly.temperature_2m[index]),
      precipitation: weatherData.hourly.precipitation_probability[index],
      wind: Math.round(weatherData.hourly.wind_speed_10m[index]),
      isCurrent: isCurrentHour,
      date: getDateString(date)
    }
  })

  // Process forecast days
  const forecast = weatherData.daily.time.map((time: string, index: number) => {
    const timestamp = new Date(time).getTime()
    const date = new Date(timestamp)

    return {
      day: index === 0 ? "Today" : getDayName(timestamp),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      icon: mapWeatherCodeToIcon(weatherData.daily.weather_code[index]),
      highTemp: Math.round(weatherData.daily.temperature_2m_max[index]),
      lowTemp: Math.round(weatherData.daily.temperature_2m_min[index]),
      timestamp
    }
  })

  // Process historical days
  const historical = historicalData.daily.time.map((time: string, index: number) => {
    const timestamp = new Date(time).getTime()
    const date = new Date(timestamp)

    return {
      day: getDayName(timestamp),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      icon: mapWeatherCodeToIcon(historicalData.daily.weather_code[index]),
      highTemp: Math.round(historicalData.daily.temperature_2m_max[index]),
      lowTemp: Math.round(historicalData.daily.temperature_2m_min[index]),
      timestamp
    }
  })

  return {
    location,
    current,
    hourlyDetailed,
    forecast,
    historical
  }
}

// Map Open Meteo weather codes to condition descriptions
function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  }

  return conditions[code] || "Unknown"
}

// Map Open Meteo weather codes to our icon types
function mapWeatherCodeToIcon(code: number): string {
  // Clear
  if (code === 0 || code === 1) {
    return "sunny"
  }

  // Partly cloudy
  if (code === 2) {
    return "partly-cloudy"
  }

  // Cloudy
  if (code === 3) {
    return "cloudy"
  }

  // Rain, drizzle, showers
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "rainy"
  }

  // Default to partly cloudy for other conditions
  return "partly-cloudy"
}
