import React from "react";
import { RefreshCw, Settings, X } from "lucide-react";
import { ComponentHeader } from "../ui/ComponentHeader";

export interface WidgetFormattingOptions {
  title: string;
  refreshInterval?: number;
  isVisible: boolean;
  settings?: Record<string, string | number | boolean>;
}

interface WidgetHeaderProps {
  options: WidgetFormattingOptions;
  onOptionsChange: (options: Partial<WidgetFormattingOptions>) => void;
  position: { x: number; y: number };
  width: number;
  visible: boolean;
  widgetType: string;
  onRefresh?: () => void;
  onSettings?: () => void;
  onClose?: () => void;
}

const REFRESH_INTERVALS = [
  { value: 0, label: "Manual" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
  { value: 600, label: "10m" },
  { value: 3600, label: "1h" },
];

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  options,
  onOptionsChange,
  position,
  width,
  visible,
  widgetType,
  onRefresh,
  onSettings,
  onClose,
}) => {
  const handleTitleChange = (title: string) => {
    onOptionsChange({ title });
  };

  const handleRefreshIntervalChange = (refreshInterval: number) => {
    onOptionsChange({ refreshInterval });
  };

  const handleVisibilityToggle = () => {
    onOptionsChange({ isVisible: !options.isVisible });
  };

  return (
    <ComponentHeader position={position} width={width} visible={visible}>
      {/* Widget Type Label */}
      <div
        style={{
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          minWidth: "80px",
        }}
      >
        {widgetType}
      </div>

      {/* Title Input */}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={options.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Widget Title"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px 8px",
            fontSize: "12px",
            width: "120px",
          }}
        />
      </div>

      {/* Refresh Interval */}
      <div className="flex items-center gap-1">
        <select
          value={options.refreshInterval || 0}
          onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px 8px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {REFRESH_INTERVALS.map((interval) => (
            <option key={interval.value} value={interval.value}>
              {interval.label}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility Toggle */}
      <button
        onClick={handleVisibilityToggle}
        style={{
          background: options.isVisible
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "4px",
          color: "white",
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        {options.isVisible ? "Visible" : "Hidden"}
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              color: "white",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw size={14} />
          </button>
        )}

        {onSettings && (
          <button
            onClick={onSettings}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              color: "white",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={14} />
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 0, 0, 0.2)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: "4px",
              color: "white",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </ComponentHeader>
  );
};
