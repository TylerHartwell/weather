import type { PrecipitationUnit, TemperatureUnit, WeatherCurrent, WindSpeedUnit } from "@/types/weather"
import WeatherIcon from "./weather-icon"
import { getDayName, getWeatherDescription } from "@/lib/weather-utils"

interface CurrentWeatherProps {
  data: WeatherCurrent
  toggleTempUnit: () => void
  togglePrecipitationUnit: () => void
  toggleWindUnit: () => void
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
  precipitationUnit: PrecipitationUnit
}

export default function CurrentWeather({
  data,
  toggleTempUnit,
  togglePrecipitationUnit,
  toggleWindUnit,
  temperatureUnit,
  windSpeedUnit,
  precipitationUnit
}: CurrentWeatherProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <WeatherIcon type={"sunny"} size="lg" />
        <div className="text-6xl font-semibold ml-2" onClick={toggleTempUnit}>
          {Math.round(data.temperature2m)}
          <span className="text-2xl">{temperatureUnit === "fahrenheit" ? "F" : "C"}</span>
        </div>
        <div className="flex flex-col ml-2 text-gray-400">
          <span onClick={togglePrecipitationUnit}>
            Precipitation: {data.precipitation} {precipitationUnit}
          </span>
          <span>Humidity: {data.relativeHumidity2m}%</span>
          <span onClick={toggleWindUnit}>
            Wind: {Math.round(data.windSpeed10m)} {windSpeedUnit}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl">Weather</div>
        <div className="text-lg">{getDayName(data.time.getTime())}</div>
        <div className="text-lg">{getWeatherDescription(data.weatherCode)}</div>
      </div>
    </div>
  )
}
