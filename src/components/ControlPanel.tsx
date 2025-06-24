/**
 * ControlPanel Component
 *
 * This component provides zoom controls and displays the current selection state.
 * It shows zoom in/out buttons and information about selected components.
 */

import React from "react";
import { Plus, Minus, Grid3x3, Magnet } from "lucide-react";
import { Button } from "./ui/button";

export interface ControlPanelProps {
  onZoom: (factor: number) => void;
  selectedComponents: number[];
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onZoom,
  selectedComponents,
  showGrid,
  onToggleGrid,
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
        <Button
          onClick={onToggleSnap}
          variant={snapToGrid ? "default" : "ghost"}
          size="sm"
          title={snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
        >
          <Magnet className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm mt-2">
        Mode: Selection{snapToGrid && " (Snap)"}
        {selectedComponents.length > 0 && (
          <span className="text-blue-600 ml-2">
            ({selectedComponents.length} selected)
          </span>
        )}
      </p>
    </div>
  );
};
