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
        return (
          <div className={`${sizeClasses[size]} text-yellow-300`}>
            <div className="rounded-full bg-yellow-300 w-full h-full"></div>
          </div>
        )
      case "Partly cloudy":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute left-0 top-0 rounded-full bg-yellow-300 w-3/4 h-3/4"></div>
            <div className="absolute right-0 bottom-0 rounded-full bg-gray-300 w-2/3 h-2/3"></div>
          </div>
        )
      case "Overcast":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute left-0 top-0 rounded-full bg-gray-300 w-2/3 h-2/3"></div>
            <div className="absolute right-0 bottom-0 rounded-full bg-gray-300 w-2/3 h-2/3"></div>
          </div>
        )
      case "rainy":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute left-0 top-0 rounded-full bg-gray-300 w-full h-2/3"></div>
            <div className="absolute left-1/4 bottom-0 w-1 h-2 bg-blue-400 transform rotate-15"></div>
            <div className="absolute left-1/2 bottom-0 w-1 h-2 bg-blue-400 transform rotate-15"></div>
            <div className="absolute left-3/4 bottom-0 w-1 h-2 bg-blue-400 transform rotate-15"></div>
          </div>
        )
      default:
        return (
          <div className={`${sizeClasses[size]} text-gray-400`}>
            <div className="rounded-full bg-gray-400 w-full h-full"></div>
          </div>
        )
    }
  }

  return <div className="flex items-center justify-center">{getIcon()}</div>
}
