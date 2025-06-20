import React, { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  MapPin,
  RefreshCw,
  CloudSun,
  Loader2,
} from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      <Card className="min-w-[250px]">
        <ComponentHeader
          title="Weather"
          icon={CloudSun}
          iconColor="bg-muted"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-w-[250px] border-destructive">
        <ComponentHeader
          title="Weather"
          icon={CloudSun}
          iconColor="bg-destructive"
          onMouseDown={onHeaderMouseDown}
          onDelete={onDelete}
        />
        <CardContent className="p-4 text-center">
          <Cloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-destructive mb-3">{error}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWeather}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="min-w-[250px]">
      <ComponentHeader
        title="Weather"
        icon={CloudSun}
        iconColor="bg-blue-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeather}
            disabled={loading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Refresh Weather"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        }
      />

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {weather.location}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-foreground">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-muted-foreground">
              {getWeatherDescription(weather.weatherCode)}
            </div>
          </div>
          <div className="flex-shrink-0">
            {getWeatherIcon(weather.weatherCode)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Wind:</span> {weather.windSpeed} km/h
          </div>
          <div>
            <span className="font-medium">Humidity:</span> {weather.humidity}%
          </div>
        </div>

        {lastUpdated && (
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Weather;
