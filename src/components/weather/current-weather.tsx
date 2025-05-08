import type { TemperatureUnit, WeatherCurrent } from "@/types/weather"
import WeatherIcon from "./weather-icon"
import { getDayName, getWeatherDescription } from "@/lib/weather-utils"

interface CurrentWeatherProps {
  data: WeatherCurrent
  toggleTempUnit: () => void
  temperatureUnit: TemperatureUnit
}

export default function CurrentWeather({ data, toggleTempUnit, temperatureUnit }: CurrentWeatherProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <WeatherIcon type={"sunny"} size="lg" />
        <div className="text-6xl font-semibold ml-2" onClick={toggleTempUnit}>
          {Math.round(data.temperature2m)}
          <span className="text-2xl">{temperatureUnit === "fahrenheit" ? "F" : "C"}</span>
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
