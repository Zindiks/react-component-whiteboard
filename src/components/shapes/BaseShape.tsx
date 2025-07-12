import React, { useState, useRef, useEffect } from "react";
import { SHAPE_CONSTANTS } from "../../constants/appConstants";

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

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      if (lockAspectRatio) {
        // For aspect ratio locked resizing, use corner handles for proportional scaling
        switch (resizeHandle) {
          case "se": // bottom-right
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = newWidth / aspectRatio;
            break;
          case "sw": // bottom-left
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = newWidth / aspectRatio;
            break;
          case "ne": // top-right
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = newWidth / aspectRatio;
            break;
          case "nw": // top-left
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = newWidth / aspectRatio;
            break;
          case "n": // top - constrain by height
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height - dy
            );
            newWidth = newHeight * aspectRatio;
            break;
          case "s": // bottom - constrain by height
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height + dy
            );
            newWidth = newHeight * aspectRatio;
            break;
          case "e": // right - constrain by width
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = newWidth / aspectRatio;
            break;
          case "w": // left - constrain by width
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = newWidth / aspectRatio;
            break;
        }
      } else {
        // Original free-form resizing
        switch (resizeHandle) {
          case "se": // bottom-right
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height + dy
            );
            break;
          case "sw": // bottom-left
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height + dy
            );
            break;
          case "ne": // top-right
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height - dy
            );
            break;
          case "nw": // top-left
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height - dy
            );
            break;
          case "n": // top
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height - dy
            );
            break;
          case "s": // bottom
            newHeight = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.height + dy
            );
            break;
          case "e": // right
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width + dx
            );
            break;
          case "w": // left
            newWidth = Math.max(
              SHAPE_CONSTANTS.MIN_SHAPE_SIZE,
              startSize.width - dx
            );
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
    { handle: "nw", style: { top: -4, left: -4, cursor: "nw-resize" } },
    {
      handle: "n",
      style: {
        top: -4,
        left: "50%",
        transform: "translateX(-50%)",
        cursor: "n-resize",
      },
    },
    { handle: "ne", style: { top: -4, right: -4, cursor: "ne-resize" } },
    {
      handle: "e",
      style: {
        top: "50%",
        right: -4,
        transform: "translateY(-50%)",
        cursor: "e-resize",
      },
    },
    { handle: "se", style: { bottom: -4, right: -4, cursor: "se-resize" } },
    {
      handle: "s",
      style: {
        bottom: -4,
        left: "50%",
        transform: "translateX(-50%)",
        cursor: "s-resize",
      },
    },
    { handle: "sw", style: { bottom: -4, left: -4, cursor: "sw-resize" } },
    {
      handle: "w",
      style: {
        top: "50%",
        left: -4,
        transform: "translateY(-50%)",
        cursor: "w-resize",
      },
    },
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
          className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
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
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm z-10"
            style={handleStyle}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        ))}

      {/* Connection points disabled to prevent shapes from sticking together */}
    </div>
  );
};
