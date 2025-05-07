import type { CurrentWeather } from "@/types/weather"

interface WeatherDetailsProps {
  data: Pick<CurrentWeather, "precipitation" | "humidity" | "wind">
}

export default function WeatherDetails({ data }: WeatherDetailsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div>
        <div className="text-gray-400">Precipitation:</div>
        <div>{data.precipitation}</div>
      </div>
      <div>
        <div className="text-gray-400">Humidity:</div>
        <div>{data.humidity}</div>
      </div>
      <div>
        <div className="text-gray-400">Wind:</div>
        <div>{data.wind}</div>
      </div>
    </div>
  )
}
