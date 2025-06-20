import React, { useState, useEffect } from "react";
import { Clock, Settings, Globe } from "lucide-react";

interface WatchProps {
  width?: number;
  height?: number;
}

const timeZones = [
  { label: "Local Time", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "New York", value: "America/New_York" },
  { label: "London", value: "Europe/London" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "Los Angeles", value: "America/Los_Angeles" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Berlin", value: "Europe/Berlin" },
];

const formats = [
  { label: "12-hour", value: "12" },
  { label: "24-hour", value: "24" },
];

export const Watch: React.FC<WatchProps> = ({ width = 280, height = 200 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState("local");
  const [format, setFormat] = useState("12");
  const [showSettings, setShowSettings] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds && { second: "2-digit" }),
      hour12: format === "12",
    };

    if (timeZone === "local") {
      return time.toLocaleTimeString([], options);
    } else {
      return time.toLocaleTimeString([], { ...options, timeZone });
    }
  };

  const formatDate = (time: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (timeZone === "local") {
      return time.toLocaleDateString([], options);
    } else {
      return time.toLocaleDateString([], { ...options, timeZone });
    }
  };

  const getTimeZoneOffset = () => {
    if (timeZone === "local") {
      const offset = -currentTime.getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? "+" : "-";
      return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }

    try {
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone,
        timeZoneName: "short",
      });
      const parts = formatter.formatToParts(currentTime);
      const timeZoneName = parts.find(
        (part) => part.type === "timeZoneName"
      )?.value;
      return timeZoneName || "";
    } catch {
      return "";
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative"
      style={{ width, height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            {timeZones.find((tz) => tz.value === timeZone)?.label || "Watch"}
          </h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-48">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Settings</h4>

          {/* Time Zone */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Globe className="w-3 h-3 inline mr-1" />
              Time Zone
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {formats.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Display Options */}
          <div className="space-y-2">
            <label className="flex items-center text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
                className="mr-2"
              />
              Show seconds
            </label>
            <label className="flex items-center text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                className="mr-2"
              />
              Show date
            </label>
          </div>
        </div>
      )}

      {/* Time Display */}
      <div className="text-center">
        <div className="text-2xl font-mono font-bold text-gray-900 mb-1">
          {formatTime(currentTime)}
        </div>

        {showDate && (
          <div className="text-sm text-gray-600 mb-2">
            {formatDate(currentTime)}
          </div>
        )}

        <div className="text-xs text-gray-500">{getTimeZoneOffset()}</div>
      </div>

      {/* Digital Clock Style Indicator */}
      <div className="absolute bottom-2 right-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
