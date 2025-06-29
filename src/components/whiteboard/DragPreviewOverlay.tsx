import React, { useMemo } from "react";
import * as d3 from "d3";
import { DRAG_PREVIEW_CONSTANTS } from "../../constants/appConstants";

interface DragPreviewOverlayProps {
  transform: d3.ZoomTransform;
  mousePosition: { x: number; y: number };
  componentType: string | null;
  gridSize: number;
  snapToGrid: boolean;
  isVisible: boolean;
}

export const DragPreviewOverlay: React.FC<DragPreviewOverlayProps> = ({
  transform,
  mousePosition,
  componentType,
  gridSize,
  snapToGrid,
  isVisible,
}) => {
  // Get preview dimensions for the component type
  const previewDimensions = useMemo(() => {
    if (!componentType) return null;

    const sizes = DRAG_PREVIEW_CONSTANTS.PREVIEW_SIZES;
    const dimensions = sizes[componentType as keyof typeof sizes];

    return dimensions || sizes.timer; // Default to timer size
  }, [componentType]);

  // Calculate preview position and grid alignment
  const previewData = useMemo(() => {
    if (!previewDimensions || !isVisible) {
      return null;
    }

    // Convert mouse position to whiteboard coordinates
    const whiteboardX = (mousePosition.x - transform.x) / transform.k;
    const whiteboardY = (mousePosition.y - transform.y) / transform.k;

    // Calculate preview position (center the preview on mouse)
    let previewX = whiteboardX - previewDimensions.width / 2;
    let previewY = whiteboardY - previewDimensions.height / 2;

    // Apply snap-to-grid if enabled
    if (snapToGrid) {
      previewX = Math.round(previewX / gridSize) * gridSize;
      previewY = Math.round(previewY / gridSize) * gridSize;
    }

    // Calculate grid cells occupied
    const gridCellsX = Math.ceil(previewDimensions.width / gridSize);
    const gridCellsY = Math.ceil(previewDimensions.height / gridSize);

    // Calculate grid cell boundaries
    const startGridX = Math.floor(previewX / gridSize);
    const startGridY = Math.floor(previewY / gridSize);
    const endGridX = startGridX + gridCellsX - 1;
    const endGridY = startGridY + gridCellsY - 1;

    return {
      x: previewX,
      y: previewY,
      width: previewDimensions.width,
      height: previewDimensions.height,
      gridCellsX,
      gridCellsY,
      startGridX,
      startGridY,
      endGridX,
      endGridY,
      totalGridCells: gridCellsX * gridCellsY,
    };
  }, [
    mousePosition,
    transform,
    previewDimensions,
    gridSize,
    snapToGrid,
    isVisible,
  ]);

  if (!isVisible || !previewData || !componentType) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: DRAG_PREVIEW_CONSTANTS.Z_INDEX,
      }}
    >
      {/* Main preview overlay */}
      <div
        style={{
          position: "absolute",
          left: previewData.x * transform.k + transform.x,
          top: previewData.y * transform.k + transform.y,
          width: previewData.width * transform.k,
          height: previewData.height * transform.k,
          backgroundColor: DRAG_PREVIEW_CONSTANTS.OVERLAY_COLOR,
          border: `${DRAG_PREVIEW_CONSTANTS.OVERLAY_BORDER_WIDTH}px ${DRAG_PREVIEW_CONSTANTS.OVERLAY_BORDER_STYLE} ${DRAG_PREVIEW_CONSTANTS.OVERLAY_BORDER_COLOR}`,
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(255, 165, 0, 0.3)",
          // GPU acceleration
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* Grid cell indicators */}
      {snapToGrid && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Draw grid cell boundaries */}
          {Array.from({ length: previewData.gridCellsX + 1 }, (_, i) => (
            <line
              key={`vertical-${i}`}
              x1={
                (previewData.startGridX + i) * gridSize * transform.k +
                transform.x
              }
              y1={previewData.startGridY * gridSize * transform.k + transform.y}
              x2={
                (previewData.startGridX + i) * gridSize * transform.k +
                transform.x
              }
              y2={
                (previewData.endGridY + 1) * gridSize * transform.k +
                transform.y
              }
              stroke={DRAG_PREVIEW_CONSTANTS.OVERLAY_BORDER_COLOR}
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.8}
            />
          ))}
          {Array.from({ length: previewData.gridCellsY + 1 }, (_, i) => (
            <line
              key={`horizontal-${i}`}
              x1={previewData.startGridX * gridSize * transform.k + transform.x}
              y1={
                (previewData.startGridY + i) * gridSize * transform.k +
                transform.y
              }
              x2={
                (previewData.endGridX + 1) * gridSize * transform.k +
                transform.x
              }
              y2={
                (previewData.startGridY + i) * gridSize * transform.k +
                transform.y
              }
              stroke={DRAG_PREVIEW_CONSTANTS.OVERLAY_BORDER_COLOR}
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.8}
            />
          ))}
        </svg>
      )}

      {/* Component info tooltip */}
      <div
        style={{
          position: "absolute",
          left:
            (previewData.x + previewData.width) * transform.k +
            transform.x +
            10,
          top: previewData.y * transform.k + transform.y - 40,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: DRAG_PREVIEW_CONSTANTS.Z_INDEX + 1,
        }}
      >
        {componentType} ({previewData.width}×{previewData.height})
        {snapToGrid && (
          <div style={{ fontSize: "10px", opacity: 0.8 }}>
            Grid: {previewData.gridCellsX}×{previewData.gridCellsY} cells
          </div>
        )}
      </div>
    </div>
  );
};
