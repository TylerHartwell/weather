// Types for weather data

export interface WeatherData {
  current: {
    time: Date
    temperature2m: number
    relativeHumidity2m: number
    windSpeed10m: number
    windDirection10m: number
    precipitation: number
    weatherCode: number
  }
  hourly: {
    time: Date[]
    temperature2m: Float32Array
    windSpeed10m: Float32Array
    precipitationProbability: Float32Array
  }
  daily: {
    time: Date[]
    weatherCode: Float32Array
    temperature2mMax: Float32Array
    windSpeed10mMax: Float32Array
    windDirection10mDominant: Float32Array
    sunrise: Date[]
    sunset: Date[]
    uvIndexMax: Float32Array
    precipitationProbabilityMax: Float32Array
    precipitationSum: Float32Array
    temperature2mMin: Float32Array
  }
}

export interface VisibleSeries {
  temperature: boolean
  precipitation: boolean
  wind: boolean
}

export interface VisibleTimeRange {
  start: number
  end: number
}
