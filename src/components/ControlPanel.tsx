import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Move,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhiteboardStore } from "@/store/whiteboard";

export const ControlPanel: React.FC = () => {
  const {
    transform,
    setTransform,
    gridVisible,
    components,
    selectedComponents,
    clearSelection,
    duplicateComponents,
  } = useWhiteboardStore();

  const handleZoomIn = () => {
    const newTransform = {
      ...transform,
      k: Math.min(transform.k * 1.2, 5),
    };
    setTransform(newTransform);
  };

  const handleZoomOut = () => {
    const newTransform = {
      ...transform,
      k: Math.max(transform.k / 1.2, 0.1),
    };
    setTransform(newTransform);
  };

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };

  const handleFitToContent = () => {
    if (components.length === 0) return;

    const padding = 50;
    const minX = Math.min(...components.map((c) => c.x)) - padding;
    const minY = Math.min(...components.map((c) => c.y)) - padding;
    const maxX =
      Math.max(...components.map((c) => c.x + (c.width || 200))) + padding;
    const maxY =
      Math.max(...components.map((c) => c.y + (c.height || 100))) + padding;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Assuming canvas size (this could be passed as props)
    const canvasWidth = window.innerWidth - 256; // Sidebar width
    const canvasHeight = window.innerHeight;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 2); // Max zoom of 2x

    const centerX = (canvasWidth - contentWidth * scale) / 2;
    const centerY = (canvasHeight - contentHeight * scale) / 2;

    setTransform({
      x: centerX - minX * scale,
      y: centerY - minY * scale,
      k: scale,
    });
  };

  const handleDuplicate = () => {
    if (selectedComponents.length > 0) {
      duplicateComponents(selectedComponents);
    }
  };

  const zoomPercentage = Math.round(transform.k * 100);

  return (
    <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
      {/* Zoom Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-2 shadow-sm">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={transform.k <= 0.1}
            className="p-2"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="px-2 py-1 text-xs font-mono min-w-[50px] text-center bg-gray-50 rounded">
            {zoomPercentage}%
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={transform.k >= 5}
            className="p-2"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-2 shadow-sm">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetView}
            className="p-2"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFitToContent}
            disabled={components.length === 0}
            className="p-2"
            title="Fit to Content"
          >
            <Move className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant={gridVisible ? "default" : "ghost"}
            onClick={() => {
              // Toggle grid (this would need to be added to store)
              console.log("Toggle grid");
            }}
            className="p-2"
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selection Controls */}
      {selectedComponents.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-2 shadow-sm">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600 px-2">
              {selectedComponents.length} selected
            </span>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDuplicate}
              className="p-2"
              title="Duplicate"
            >
              <MousePointer2 className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              className="p-2"
              title="Clear Selection"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-2 shadow-sm">
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <strong>Shortcuts:</strong>
          </div>
          <div>• Space + Drag: Pan</div>
          <div>• Cmd/Ctrl + Click: Multi-select</div>
          <div>• Mouse wheel: Zoom</div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
