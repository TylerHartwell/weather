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
  countryCode: string

  admin1: string
  postcodes: string[]
}

export default function CurrentWeather({
  weatherCurrent,
  toggleTempUnit,
  togglePrecipitationUnit,
  toggleWindUnit,
  temperatureUnit,
  windSpeedUnit,
  precipitationUnit,
  locationName,
  admin1,
  // postcodes,
  countryCode
}: CurrentWeatherProps) {
  return (
    <div className="mb-0">
      <div className="flex items-center justify-between text-sm font-medium">
        Current Weather
        <div className="flex items-center">
          <span className="text-sm text-gray-400 font-normal">Results for</span>
          <CardTitle className="ml-2 text-base font-medium">
            <span>{locationName}, </span>
            <span>{countryCode === "US" ? admin1 : countryCode} </span>
            {/* <span>{countryCode === "US" ? admin1 + " " + postcodes[0] : countryCode} </span> */}
          </CardTitle>
        </div>
      </div>
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center">
          <WeatherIcon type={"sunny"} size="lg" className="hidden 3xs:inline-block" />
          <div className="text-6xl font-semibold ml-2" onClick={toggleTempUnit}>
            {Math.round(weatherCurrent.temperature2m)}
            <span className="text-2xl">{temperatureUnit === "fahrenheit" ? "°F" : "°C"}</span>
          </div>
          <div className="flex flex-col ml-2 text-gray-400 text-sm text-nowrap">
            <span onClick={togglePrecipitationUnit}>
              <span className="hidden 2xs:inline">Precipitation: </span>
              <span className="inline 2xs:hidden">P: </span>
              <span>
                {Math.round(weatherCurrent.precipitation).toFixed(1)} {precipitationUnit}
              </span>
            </span>
            <span>
              <span className="hidden 2xs:inline">Humidity: </span>
              <span className="inline 2xs:hidden">H: </span>
              <span>{weatherCurrent.relativeHumidity2m}%</span>
            </span>
            <span onClick={toggleWindUnit}>
              <span className="hidden 2xs:inline">Wind: </span>
              <span className="inline 2xs:hidden">W: </span>
              <span>
                {Math.round(weatherCurrent.windSpeed10m)} {windSpeedUnit}
              </span>
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end leading-tight">
          <div className="text-md xs:text-lg font-semibold capitalize leading-tight">{getWeatherDescription(weatherCurrent.weatherCode)}</div>
          <div className="text-md xs:text-lg w-min xs:w-auto leading-tight flex flex-col">
            <span className="flex gap-1">
              <span>{weatherCurrent.time.weekdayLong} </span>
              <span className="">{weatherCurrent.time.toFormat("M/dd")}</span>
            </span>

            <span className="text-nowrap">{weatherCurrent.time.toFormat("h:mm a")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
