import type { PrecipitationUnit, TemperatureUnit, WeatherCurrent, WindSpeedUnit } from "@/types/weather"
import WeatherIcon from "./weather-icon"
import { getWeatherDescription } from "@/lib/weather-utils"
import { CardTitle } from "../ui/card"

interface CurrentWeatherProps {
  weatherCurrent: WeatherCurrent
  toggleTempUnit: () => void
  togglePrecipitationUnit: () => void
  toggleWindUnit: () => void
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
  precipitationUnit: PrecipitationUnit
  locationName: string
}

export default function CurrentWeather({
  weatherCurrent,
  toggleTempUnit,
  togglePrecipitationUnit,
  toggleWindUnit,
  temperatureUnit,
  windSpeedUnit,
  precipitationUnit,
  locationName
}: CurrentWeatherProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-lg font-medium">
        Current Weather
        <div className="flex items-center">
          <span className="text-sm text-gray-400 font-normal">Results for</span>
          <CardTitle className="ml-2 text-base font-medium">{locationName}</CardTitle>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <WeatherIcon type={"sunny"} size="lg" />
          <div className="text-6xl font-semibold ml-2" onClick={toggleTempUnit}>
            {Math.round(weatherCurrent.temperature2m)}
            <span className="text-2xl">{temperatureUnit === "fahrenheit" ? "°F" : "°C"}</span>
          </div>
          <div className="flex flex-col ml-2 text-gray-400">
            <span onClick={togglePrecipitationUnit}>
              Precipitation: {Math.round(weatherCurrent.precipitation).toFixed(1)} {precipitationUnit}
            </span>
            <span>Humidity: {weatherCurrent.relativeHumidity2m}%</span>
            <span onClick={toggleWindUnit}>
              Wind: {Math.round(weatherCurrent.windSpeed10m)} {windSpeedUnit}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold capitalize">{getWeatherDescription(weatherCurrent.weatherCode)}</div>
          <div className="text-lg">{weatherCurrent.time.weekdayLong}</div>
          <div className="text-md">{weatherCurrent.time.toFormat("yyyy-MM-dd")}</div>
        </div>
      </div>
    </div>
  )
}
