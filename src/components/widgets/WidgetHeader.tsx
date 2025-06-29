import React from "react";
import { RefreshCw, Settings, X, Eye, EyeOff } from "lucide-react";
import { ComponentHeader } from "../ui/ComponentHeader";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { WidgetFormattingOptions } from "../../types/formatting";

interface WidgetHeaderProps {
  options: WidgetFormattingOptions;
  onOptionsChange: (options: Partial<WidgetFormattingOptions>) => void;
  position: { x: number; y: number };
  visible: boolean;
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
  visible,
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
    <ComponentHeader
      position={position}
      visible={visible}
      headerWidth="auto"
      offsetY={-40}
    >
      {/* Title Input */}
      <div className="flex items-center gap-1">
        <Input
          type="text"
          value={options.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Widget Title"
          className="w-32 h-8 text-sm"
        />
      </div>

      {/* Refresh Interval */}
      <div className="flex items-center gap-1">
        <Select
          value={String(options.refreshInterval || 0)}
          onValueChange={(value) => handleRefreshIntervalChange(Number(value))}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REFRESH_INTERVALS.map((interval) => (
              <SelectItem key={interval.value} value={String(interval.value)}>
                {interval.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibility Toggle */}
      <Button
        variant={options.isVisible ? "default" : "secondary"}
        size="sm"
        onClick={handleVisibilityToggle}
        className="h-8 px-3"
      >
        {options.isVisible ? (
          <>
            <Eye className="h-3 w-3 mr-1" />
            Visible
          </>
        ) : (
          <>
            <EyeOff className="h-3 w-3 mr-1" />
            Hidden
          </>
        )}
      </Button>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {onSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {onClose && (
          <Button
            variant="destructive"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </ComponentHeader>
  );
};
