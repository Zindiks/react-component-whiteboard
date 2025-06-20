import React, { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  MapPin,
  RefreshCw,
  CloudSun,
} from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  location: string;
}

interface WeatherProps {
  latitude?: number;
  longitude?: number;
  location?: string;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const Weather: React.FC<WeatherProps> = ({
  latitude = 40.7128,
  longitude = -74.006,
  location = "New York",
  onHeaderMouseDown,
  onDelete,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Using open-meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      const current = data.current_weather;

      setWeather({
        temperature: Math.round(current.temperature),
        weatherCode: current.weathercode,
        windSpeed: current.windspeed,
        humidity: data.hourly.relative_humidity_2m[0] || 0,
        location: location,
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, location]);

  useEffect(() => {
    fetchWeather();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather]);

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (code <= 77) return <Snowflake className="w-8 h-8 text-blue-200" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    return descriptions[code] || "Unknown";
  };

  if (loading && !weather) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 min-w-[250px]">
        <ComponentHeader
          title="Weather"
          icon={CloudSun}
          iconColor="bg-gray-500"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
        <div className="p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-red-200 min-w-[250px]">
        <ComponentHeader
          title="Weather"
          icon={CloudSun}
          iconColor="bg-red-500"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
        <div className="p-4 text-center">
          <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchWeather}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1 inline" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 min-w-[250px]">
      <ComponentHeader
        title="Weather"
        icon={CloudSun}
        iconColor="bg-blue-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
            title="Refresh Weather"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {weather.location}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-gray-800">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-gray-600">
              {getWeatherDescription(weather.weatherCode)}
            </div>
          </div>
          <div className="flex-shrink-0">
            {getWeatherIcon(weather.weatherCode)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Wind:</span> {weather.windSpeed} km/h
          </div>
          <div>
            <span className="font-medium">Humidity:</span> {weather.humidity}%
          </div>
        </div>

        {lastUpdated && (
          <div className="text-xs text-gray-400 mt-2 text-center">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
