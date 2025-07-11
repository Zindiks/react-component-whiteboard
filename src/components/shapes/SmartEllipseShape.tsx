import React, { useState, useRef } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface ConnectionPoint {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  type: "input" | "output" | "bidirectional";
}

interface SmartEllipseShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // Text properties
  text?: string;
  onTextChange?: (text: string) => void;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  // Smart shape properties
  connectionPoints?: ConnectionPoint[];
  onConnectionPointHover?: (pointId: string | null, shapeId: number) => void;
  onConnectionPointClick?: (pointId: string, shapeId: number) => void;
  showConnectionPoints?: boolean;
  canConnect?: boolean;
  shapeId: number;
  nodeType?: "start" | "end" | "process" | "decision" | "default";
  // Connection mode for visual feedback
  connectionMode?: {
    active: boolean;
    selectedArrowId?: number | null;
    connectionStep?: "start" | "end" | null;
  };
}

const DEFAULT_ELLIPSE_CONNECTION_POINTS: ConnectionPoint[] = [
  { id: "top", x: 50, y: 15, type: "bidirectional" },
  { id: "right", x: 85, y: 50, type: "output" },
  { id: "bottom", x: 50, y: 85, type: "bidirectional" },
  { id: "left", x: 15, y: 50, type: "input" },
];

export const SmartEllipseShape: React.FC<SmartEllipseShapeProps> = ({
  fillColor = "#f3f4f6",
  strokeColor = "#9ca3af",
  strokeWidth = 2,
  text,
  onTextChange,
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  fontWeight = "normal",
  fontStyle = "normal",
  selected = false,
  connectionPoints = DEFAULT_ELLIPSE_CONNECTION_POINTS,
  onConnectionPointHover,
  onConnectionPointClick,
  showConnectionPoints = false,
  canConnect = true,
  shapeId,
  nodeType = "default",
  connectionMode,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(text || "");
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (onTextChange) {
      onTextChange(editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(text || "");
    }
  };

  const handleConnectionPointMouseEnter = (pointId: string) => {
    setHoveredPoint(pointId);
    if (onConnectionPointHover) {
      onConnectionPointHover(pointId, shapeId);
    }
  };

  const handleConnectionPointMouseLeave = () => {
    setHoveredPoint(null);
    if (onConnectionPointHover) {
      onConnectionPointHover(null, shapeId);
    }
  };

  const handleConnectionPointClick = (pointId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConnectionPointClick) {
      onConnectionPointClick(pointId, shapeId);
    }
  };

  const getConnectionPointColor = (point: ConnectionPoint) => {
    switch (point.type) {
      case "input":
        return "#10b981"; // green
      case "output":
        return "#3b82f6"; // blue
      case "bidirectional":
        return "#8b5cf6"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

  const getNodeTypeStyle = () => {
    switch (nodeType) {
      case "start":
        return {
          backgroundColor: "#dcfce7", // light green
          borderColor: "#16a34a",
          borderWidth: 3,
        };
      case "end":
        return {
          backgroundColor: "#fef2f2", // light red
          borderColor: "#dc2626",
          borderWidth: 3,
        };
      case "process":
        return {
          backgroundColor: "#dbeafe", // light blue
          borderColor: "#2563eb",
          borderWidth: 2,
        };
      case "decision":
        return {
          backgroundColor: "#fef3c7", // light yellow
          borderColor: "#d97706",
          borderWidth: 2,
        };
      default:
        return {
          backgroundColor: fillColor,
          borderColor: strokeColor,
          borderWidth: strokeWidth,
        };
    }
  };

  const nodeStyle = getNodeTypeStyle();

  // Add visual feedback for connection mode
  const isInConnectionMode = connectionMode?.active;
  const containerStyle = {
    backgroundColor: nodeStyle.backgroundColor,
    borderWidth: `${nodeStyle.borderWidth}px`,
    borderStyle: "solid",
    borderColor: isInConnectionMode ? "#3b82f6" : nodeStyle.borderColor,
    ...(isInConnectionMode && {
      boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)", // Blue glow when in connection mode
    }),
  };

  return (
    <BaseShape {...props} selected={selected}>
      <div
        ref={shapeRef}
        className={`w-full h-full rounded-full relative flex items-center justify-center ${
          isInConnectionMode ? "cursor-pointer" : ""
        }`}
        style={containerStyle}
        onDoubleClick={handleDoubleClick}
      >
        {/* Connection Points */}
        {canConnect &&
          (showConnectionPoints || selected) &&
          connectionPoints.map((point) => (
            <div
              key={point.id}
              className="absolute w-3 h-3 rounded-full border-2 border-white cursor-pointer transition-all duration-200 z-10"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
                backgroundColor: getConnectionPointColor(point),
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                ...(hoveredPoint === point.id && {
                  transform: "translate(-50%, -50%) scale(1.3)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }),
              }}
              onMouseEnter={() => handleConnectionPointMouseEnter(point.id)}
              onMouseLeave={handleConnectionPointMouseLeave}
              onClick={(e) => handleConnectionPointClick(point.id, e)}
              title={`${point.type} connection point`}
            />
          ))}

        {/* Node type indicator */}
        {nodeType !== "default" && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-white px-2 py-1 rounded shadow-md border">
            {nodeType}
          </div>
        )}

        {/* Text content */}
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full h-full resize-none border-none outline-none bg-transparent text-center rounded-full"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              padding: "8px",
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-text"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              padding: "8px",
              wordWrap: "break-word",
              overflow: "hidden",
            }}
          >
            {text || (selected ? "Double-click to add text" : "")}
          </div>
        )}
      </div>
    </BaseShape>
  );
};
