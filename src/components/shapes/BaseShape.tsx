import React, { useState, useRef, useEffect } from "react";
import { SHAPE_CONSTANTS } from "../../constants/appConstants";
import { snapSizeToGrid } from "../../utils/gridUtils";

export interface BaseShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
  onResize?: (width: number, height: number) => void;
  onSelect?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  lockAspectRatio?: boolean; // New prop for aspect ratio locking
}

export const BaseShape: React.FC<BaseShapeProps> = ({
  x,
  y,
  width,
  height,
  selected = false,
  onResize,
  onSelect,
  children,
  style,
  className = "",
  lockAspectRatio = false,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState(width / height);
  const shapeRef = useRef<HTMLDivElement>(null);

  // Update aspect ratio when dimensions change
  useEffect(() => {
    if (width > 0 && height > 0) {
      setAspectRatio(width / height);
    }
  }, [width, height]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeHandle(handle);
    setStartSize({ width, height });
    setStartMouse({ x: e.clientX, y: e.clientY });
  };

  const handleShapeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;

      // Check if mouse has moved significantly (at least 2px to avoid tiny movements)
      const mouseMoved = Math.abs(dx) > 2 || Math.abs(dy) > 2;

      // Only proceed with resize calculations if mouse has moved significantly
      if (!mouseMoved) return;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      if (lockAspectRatio) {
        // For aspect ratio locked resizing, use corner handles for proportional scaling
        switch (resizeHandle) {
          case "se": {
            // bottom-right
            const scaleSE = Math.max(dx, dy); // Use the larger movement for more responsive feel
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + scaleSE
            );
            newHeight = newWidth / aspectRatio;
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          }
          case "sw": {
            // bottom-left
            const scaleSW = Math.max(-dx, dy); // Invert dx for left movement
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + scaleSW
            );
            newHeight = newWidth / aspectRatio;
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          }
          case "ne": {
            // top-right
            const scaleNE = Math.max(dx, -dy); // Invert dy for upward movement
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + scaleNE
            );
            newHeight = newWidth / aspectRatio;
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          }
          case "nw": {
            // top-left
            const scaleNW = Math.max(-dx, -dy); // Invert both for top-left
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + scaleNW
            );
            newHeight = newWidth / aspectRatio;
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          }
        }
      } else {
        // Improved free-form resizing with better mouse tracking
        switch (resizeHandle) {
          case "se": // bottom-right - both directions positive
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height + dy
            );
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          case "sw": // bottom-left - width decreases, height increases
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height + dy
            );
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          case "ne": // top-right - width increases, height decreases
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height - dy
            );
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
          case "nw": // top-left - both directions negative
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height - dy
            );
            // Snap to grid
            newWidth = snapSizeToGrid(newWidth);
            newHeight = snapSizeToGrid(newHeight);
            break;
        }
      }

      onResize?.(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle("");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    resizeHandle,
    startSize,
    startMouse,
    onResize,
    aspectRatio,
    lockAspectRatio,
  ]);

  const resizeHandles = [
    { handle: "nw", style: { top: -5, left: -5, cursor: "nw-resize" } },
    { handle: "ne", style: { top: -5, right: -5, cursor: "ne-resize" } },
    { handle: "se", style: { bottom: -5, right: -5, cursor: "se-resize" } },
    { handle: "sw", style: { bottom: -5, left: -5, cursor: "sw-resize" } },
  ];

  return (
    <div
      ref={shapeRef}
      className={`absolute ${className}`}
      style={{
        left: x,
        top: y,
        width,
        height,
        pointerEvents: "auto",
        ...style,
      }}
      onClick={handleShapeClick}
    >
      {children}

      {/* Selection outline */}
      {selected && (
        <div
          className="absolute inset-0 border-2 border-green-500 pointer-events-none"
          style={{
            borderRadius: "inherit",
          }}
        />
      )}

      {/* Resize handles */}
      {selected &&
        resizeHandles.map(({ handle, style: handleStyle }) => (
          <div
            key={handle}
            className="absolute w-3 h-3 bg-green-500 border border-white z-10 hover:bg-green-600 transition-colors"
            style={handleStyle}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        ))}

      {/* Connection points disabled to prevent shapes from sticking together */}
    </div>
  );
};
