/**
 * ControlPanel Component
 *
 * This component provides zoom controls and displays the current selection state.
 * It shows zoom in/out buttons and information about selected components.
 */

import React from "react";
import {
  Plus,
  Minus,
  Grid3x3,
  Magnet,
  Circle,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { GRID_CONSTANTS } from "../constants/appConstants";

export interface ControlPanelProps {
  onZoom: (factor: number) => void;
  selectedComponents: number[];
  showGrid: boolean;
  onToggleGrid: () => void;
  gridStyle: "line" | "dotted";
  onToggleGridStyle: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  dynamicGridSizing: boolean;
  onToggleDynamicGridSizing: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoom,
  selectedComponents,
  showGrid,
  onToggleGrid,
  gridStyle,
  onToggleGridStyle,
  gridSize,
  onGridSizeChange,
  dynamicGridSizing,
  onToggleDynamicGridSizing,
  snapToGrid,
  onToggleSnap,
}) => {
  return (
    <div
      data-control-panel
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        maxWidth: "250px",
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-2">
        <Button onClick={() => onZoom(1.4)} variant={"ghost"} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
        <Button onClick={() => onZoom(0.7)} variant={"ghost"} size="sm">
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          onClick={onToggleGrid}
          variant={showGrid ? "default" : "ghost"}
          size="sm"
          title={showGrid ? "Hide Grid" : "Show Grid"}
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
        {showGrid && (
          <Button
            onClick={onToggleGridStyle}
            variant="ghost"
            size="sm"
            title={
              gridStyle === "line"
                ? "Current: Line Grid - Click for Dotted Grid"
                : "Current: Dotted Grid - Click for Line Grid"
            }
          >
            {gridStyle === "line" ? (
              <Grid3x3 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button
          onClick={onToggleSnap}
          variant={snapToGrid ? "default" : "ghost"}
          size="sm"
          title={snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
        >
          <Magnet className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced Grid Controls */}
      {showGrid && (
        <div className="flex gap-2 items-center">
          <Button
            onClick={onToggleDynamicGridSizing}
            variant={dynamicGridSizing ? "default" : "ghost"}
            size="sm"
            title={
              dynamicGridSizing
                ? "Disable Dynamic Grid Sizing"
                : "Enable Dynamic Grid Sizing"
            }
          >
            <Zap className="w-4 h-4" />
          </Button>

          <Select
            value={gridSize.toString()}
            onValueChange={(value) => onGridSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRID_CONSTANTS.SIZES.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <p className="text-sm mt-2">
        Mode: Selection{snapToGrid && " (Snap)"}
        {showGrid && (
          <span className="text-gray-600 ml-2">
            | Grid: {gridSize}px {gridStyle} {dynamicGridSizing && "(Dynamic)"}
          </span>
        )}
        {selectedComponents.length > 0 && (
          <span className="text-blue-600 ml-2">
            ({selectedComponents.length} selected)
          </span>
        )}
      </p>
    </div>
  );
};
