import React, { useState, useRef } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface ConnectionPoint {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  type: "input" | "output" | "bidirectional";
}

interface SmartRectangleShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
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
  isContainer?: boolean;
  connectionPoints?: ConnectionPoint[];
  onConnectionPointHover?: (pointId: string | null, shapeId: number) => void;
  onConnectionPointClick?: (pointId: string, shapeId: number) => void;
  showConnectionPoints?: boolean;
  canConnect?: boolean;
  shapeId: number;
}

const DEFAULT_CONNECTION_POINTS: ConnectionPoint[] = [
  { id: "top", x: 50, y: 0, type: "bidirectional" },
  { id: "right", x: 100, y: 50, type: "output" },
  { id: "bottom", x: 50, y: 100, type: "bidirectional" },
  { id: "left", x: 0, y: 50, type: "input" },
];

export const SmartRectangleShape: React.FC<SmartRectangleShapeProps> = ({
  fillColor = "#f3f4f6",
  strokeColor = "#9ca3af",
  strokeWidth = 2,
  borderRadius = 8,
  text,
  onTextChange,
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  fontWeight = "normal",
  fontStyle = "normal",
  selected = false,
  isContainer = false,
  connectionPoints = DEFAULT_CONNECTION_POINTS,
  onConnectionPointHover,
  onConnectionPointClick,
  showConnectionPoints = false,
  canConnect = true,
  shapeId,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(text || "");
  };

  const handleTextBlur = React.useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
      if (onTextChange) {
        onTextChange(editText);
      }
    }
  }, [isEditing, editText, onTextChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(text || "");
    }
  };

  // Handle clicks outside the text area when editing
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleTextBlur();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isEditing, handleTextBlur]);

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

  return (
    <BaseShape {...props} selected={selected}>
      <div
        ref={containerRef}
        className="w-full h-full relative flex items-center justify-center"
        style={{
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: `${borderRadius}px`,
          ...(isContainer && {
            borderStyle: "dashed",
            backgroundColor: `${fillColor}20`, // Semi-transparent for containers
          }),
        }}
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

        {/* Container indicator */}
        {isContainer && (
          <div className="absolute top-1 left-1 text-xs text-gray-500 font-mono">
            Container
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
            className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              padding: isContainer ? "20px 8px 8px 8px" : "8px",
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
              padding: isContainer ? "20px 8px 8px 8px" : "8px",
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
