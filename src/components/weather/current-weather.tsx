import type { CurrentWeather as CurrentWeatherType } from "@/types/weather"
import WeatherIcon from "./weather-icon"

interface CurrentWeatherProps {
  data: CurrentWeatherType
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <WeatherIcon type={data.icon} size="lg" />
        <div className="text-6xl font-semibold ml-2">
          {data.temp}
          <span className="text-2xl">{data.tempUnit}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl">Weather</div>
        <div className="text-lg">{data.day}</div>
        <div className="text-lg">{data.condition}</div>
      </div>
    </div>
  )
}
