import { Sun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, Snowflake, Zap } from "lucide-react"

interface WeatherIconProps {
  type: string
  size?: "sm" | "md" | "lg"
}

export default function WeatherIcon({ type, size = "md" }: WeatherIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }

  const getIcon = () => {
    switch (type) {
      case "Clear":
        return <Sun className={`${sizeClasses[size]} text-yellow-400`} />

      case "Mainly clear":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Sun className="absolute top-0 left-0 w-3/4 h-3/4 text-yellow-400" />
            <Cloud className="absolute bottom-0 right-0 w-2/3 h-2/3 text-gray-400" />
          </div>
        )
      case "Partly cloudy":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Sun className="absolute top-0 left-0 w-2/3 h-2/3 text-yellow-400" />
            <Cloud className="absolute bottom-0 right-0 w-3/4 h-3/4 text-gray-500" />
          </div>
        )

      // Overcast conditions
      case "Overcast":
        return <Cloud className={`${sizeClasses[size]} text-gray-500`} />

      // Fog conditions
      case "Fog":
        return <CloudFog className={`${sizeClasses[size]} text-gray-400`} />
      case "Rime fog":
        return <CloudFog className={`${sizeClasses[size]} text-blue-200`} />

      // Drizzle conditions
      case "Light drizzle":
        return <CloudDrizzle className={`${sizeClasses[size]} text-blue-300`} />
      case "Moderate drizzle":
        return <CloudDrizzle className={`${sizeClasses[size]} text-blue-400`} />
      case "Dense drizzle":
        return <CloudDrizzle className={`${sizeClasses[size]} text-blue-500`} />
      case "Light freezing drizzle":
        return (
          <div className="relative">
            <CloudDrizzle className={`${sizeClasses[size]} text-blue-300`} />
            <Snowflake className="absolute bottom-0 right-0 w-1/3 h-1/3 text-blue-200" />
          </div>
        )
      case "Dense freezing drizzle":
        return (
          <div className="relative">
            <CloudDrizzle className={`${sizeClasses[size]} text-blue-500`} />
            <Snowflake className="absolute bottom-0 right-0 w-1/3 h-1/3 text-blue-200" />
          </div>
        )

      // Rain conditions
      case "Light rain":
      case "Light rain showers":
        return <CloudRain className={`${sizeClasses[size]} text-blue-400`} />
      case "Moderate rain":
      case "Moderate rain showers":
        return <CloudRain className={`${sizeClasses[size]} text-blue-500`} />
      case "Heavy rain":
      case "Violent rain showers":
        return <CloudRain className={`${sizeClasses[size]} text-blue-600`} />
      case "Light freezing rain":
        return (
          <div className="relative">
            <CloudRain className={`${sizeClasses[size]} text-blue-400`} />
            <Snowflake className="absolute bottom-0 right-0 w-1/3 h-1/3 text-blue-200" />
          </div>
        )
      case "Heavy freezing rain":
        return (
          <div className="relative">
            <CloudRain className={`${sizeClasses[size]} text-blue-600`} />
            <Snowflake className="absolute bottom-0 right-0 w-1/3 h-1/3 text-blue-200" />
          </div>
        )

      // Snow conditions
      case "Light snow":
      case "Light snow showers":
        return <CloudSnow className={`${sizeClasses[size]} text-blue-100`} />
      case "Moderate snow":
        return <CloudSnow className={`${sizeClasses[size]} text-blue-200`} />
      case "Heavy snow":
      case "Heavy snow showers":
        return <CloudSnow className={`${sizeClasses[size]} text-blue-300`} />
      case "Snow grains":
        return <Snowflake className={`${sizeClasses[size]} text-blue-200`} />

      // Thunderstorm conditions
      case "Thunderstorm":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Cloud className="w-full h-full text-gray-500" />
            <Zap className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 text-yellow-400" />
          </div>
        )
      case "Thunderstorm + light hail":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Cloud className="w-full h-full text-gray-500" />
            <Zap className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 text-yellow-400" />
            <Snowflake className="absolute bottom-0 right-0 w-1/3 h-1/3 text-gray-300" />
          </div>
        )
      case "Thunderstorm + heavy hail":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <Cloud className="w-full h-full text-gray-500" />
            <Zap className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 text-yellow-400" />
            <Snowflake className="absolute bottom-0 right-0 w-1/3 h-1/3 text-gray-300" />
            <Snowflake className="absolute bottom-0 left-0 transform translate-y-1/2 w-1/3 h-1/3 text-gray-300" />
          </div>
        )

      // Default case
      default:
        return <Cloud className={`${sizeClasses[size]} text-gray-400`} />
    }
  }

  return <div className="flex items-center justify-center">{getIcon()}</div>
}
