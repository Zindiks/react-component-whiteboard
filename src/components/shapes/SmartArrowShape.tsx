import React, { useState, useRef } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface SmartArrowShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  arrowStyle?: "none" | "arrow" | "double-arrow";
  arrowSize?: number;
  // Text properties
  text?: string;
  onTextChange?: (text: string) => void;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  // Smart connection properties
  startShapeId?: number;
  endShapeId?: number;
  startConnectionPoint?: string;
  endConnectionPoint?: string;
  autoConnect?: boolean;
  // Bend style properties
  bendStyle?: "straight" | "elbowed" | "curved";
  bendRadius?: number; // For curved arrows
  elbowOffset?: number; // For elbowed arrows (percentage 0-100)
  shapeId: number;
  // Component data for connection calculations
  allComponents?: Array<{
    id: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    type: string;
  }>;
}

export const SmartArrowShape: React.FC<SmartArrowShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  strokeStyle = "solid",
  arrowStyle = "arrow",
  arrowSize = 10,
  text,
  onTextChange,
  fontSize = 12,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  fontWeight = "normal",
  fontStyle = "normal",
  selected = false,
  startShapeId,
  endShapeId,
  startConnectionPoint,
  endConnectionPoint,
  autoConnect = true,
  bendStyle = "straight",
  bendRadius = 20,
  elbowOffset = 50,
  shapeId,
  allComponents = [],
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");
  const arrowRef = useRef<HTMLDivElement>(null);

  const getStrokeDashArray = () => {
    switch (strokeStyle) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,2";
      default:
        return "none";
    }
  };

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

  // Calculate connection points based on shape geometry
  const getShapeConnectionPoint = (
    shape: {
      x: number;
      y: number;
      width?: number;
      height?: number;
      type: string;
    },
    pointId: string
  ) => {
    const width = shape.width || 150;
    const height = shape.height || 100;
    const centerX = shape.x + width / 2;
    const centerY = shape.y + height / 2;

    // For ellipses, calculate points on the ellipse perimeter
    if (shape.type === "smartEllipse" || shape.type === "ellipse") {
      const a = width / 2; // horizontal radius
      const b = height / 2; // vertical radius

      switch (pointId) {
        case "top":
          return { x: centerX, y: shape.y };
        case "right":
          return { x: shape.x + width, y: centerY };
        case "bottom":
          return { x: centerX, y: shape.y + height };
        case "left":
          return { x: shape.x, y: centerY };
        default:
          return { x: centerX, y: centerY };
      }
    }

    // For rectangles and other shapes
    switch (pointId) {
      case "top":
        return { x: centerX, y: shape.y };
      case "right":
        return { x: shape.x + width, y: centerY };
      case "bottom":
        return { x: centerX, y: shape.y + height };
      case "left":
        return { x: shape.x, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  };

  // Find the best connection point on a shape edge
  const findBestConnectionPoint = (
    shape: {
      x: number;
      y: number;
      width?: number;
      height?: number;
      type: string;
    },
    targetPoint: { x: number; y: number }
  ) => {
    const width = shape.width || 150;
    const height = shape.height || 100;
    const centerX = shape.x + width / 2;
    const centerY = shape.y + height / 2;

    // Calculate angle from shape center to target point
    const dx = targetPoint.x - centerX;
    const dy = targetPoint.y - centerY;
    const angle = Math.atan2(dy, dx);

    // For ellipses, calculate the intersection point on the ellipse
    if (shape.type === "smartEllipse" || shape.type === "ellipse") {
      const a = width / 2;
      const b = height / 2;

      // Parametric ellipse equations
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x =
        centerX +
        (a * b * cos) / Math.sqrt(b * b * cos * cos + a * a * sin * sin);
      const y =
        centerY +
        (a * b * sin) / Math.sqrt(b * b * cos * cos + a * a * sin * sin);

      return { x, y };
    }

    // For rectangles, find intersection with rectangle edge
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Determine which edge the line intersects
    if (Math.abs(dx / halfWidth) > Math.abs(dy / halfHeight)) {
      // Intersects left or right edge
      const x = dx > 0 ? shape.x + width : shape.x;
      const y = centerY + (dy / dx) * (x - centerX);
      return { x, y: Math.max(shape.y, Math.min(shape.y + height, y)) };
    } else {
      // Intersects top or bottom edge
      const y = dy > 0 ? shape.y + height : shape.y;
      const x = centerX + (dx / dy) * (y - centerY);
      return { x: Math.max(shape.x, Math.min(shape.x + width, x)), y };
    }
  };

  // Get arrow path and endpoints
  const getArrowGeometry = () => {
    let startPoint = { x: 20, y: 50 }; // Default start (relative %)
    let endPoint = { x: 80, y: 50 }; // Default end (relative %)
    let useAbsoluteCoords = false;

    if (startShapeId && endShapeId) {
      const startShape = allComponents.find((c) => c.id === startShapeId);
      const endShape = allComponents.find((c) => c.id === endShapeId);

      console.log("Looking for shapes:", {
        startShapeId,
        endShapeId,
        startShape,
        endShape,
        allComponents,
      });

      if (startShape && endShape) {
        // Calculate optimal connection points
        const startShapeCenter = {
          x: startShape.x + (startShape.width || 150) / 2,
          y: startShape.y + (startShape.height || 100) / 2,
        };
        const endShapeCenter = {
          x: endShape.x + (endShape.width || 150) / 2,
          y: endShape.y + (endShape.height || 100) / 2,
        };

        const actualStartPoint = findBestConnectionPoint(
          startShape,
          endShapeCenter
        );
        const actualEndPoint = findBestConnectionPoint(
          endShape,
          startShapeCenter
        );

        console.log("Calculated connection points:", {
          actualStartPoint,
          actualEndPoint,
        });

        startPoint = actualStartPoint;
        endPoint = actualEndPoint;
        useAbsoluteCoords = true;
      }
    }

    return { startPoint, endPoint, useAbsoluteCoords };
  };

  // Generate path based on bend style
  const generatePath = (
    startPt: { x: number; y: number },
    endPt: { x: number; y: number },
    isAbsolute = false
  ) => {
    const { x: startX, y: startY } = startPt;
    const { x: endX, y: endY } = endPt;

    switch (bendStyle) {
      case "curved":
        if (isAbsolute) {
          // For connected arrows, calculate curve control points
          const deltaX = endX - startX;
          const deltaY = endY - startY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const curvature = Math.min(bendRadius, distance / 3);

          // Calculate control points for smooth curve
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          // Perpendicular offset for curve
          const offsetX = (-deltaY / distance) * curvature;
          const offsetY = (deltaX / distance) * curvature;

          const controlX = midX + offsetX;
          const controlY = midY + offsetY;

          return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
        } else {
          // For unconnected arrows, use percentage-based curve
          return `M ${startX}% ${startY}% Q 50% ${
            Math.min(startY, endY) - 10
          }% ${endX}% ${endY}%`;
        }

      case "elbowed":
        if (isAbsolute) {
          // Calculate elbow point
          const deltaX = endX - startX;
          const deltaY = endY - startY;

          // Determine elbow direction based on relative positions
          let elbowX, elbowY;

          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal first, then vertical
            elbowX = startX + deltaX * (elbowOffset / 100);
            elbowY = endY;
          } else {
            // Vertical first, then horizontal
            elbowX = endX;
            elbowY = startY + deltaY * (elbowOffset / 100);
          }

          return `M ${startX} ${startY} L ${elbowX} ${elbowY} L ${endX} ${endY}`;
        } else {
          // For unconnected arrows, create simple L-shape
          const midX = startX + (endX - startX) * (elbowOffset / 100);
          return `M ${startX}% ${startY}% L ${midX}% ${startY}% L ${endX}% ${endY}%`;
        }

      case "straight":
      default:
        if (isAbsolute) {
          return `M ${startX} ${startY} L ${endX} ${endY}`;
        } else {
          return `M ${startX}% ${startY}% L ${endX}% ${endY}%`;
        }
    }
  };

  // Generate the path string
  const getArrowPath = () => {
    const { startPoint, endPoint, useAbsoluteCoords } = getArrowGeometry();

    if (useAbsoluteCoords) {
      // For connected arrows, calculate relative to SVG container
      const minX = Math.min(startPoint.x, endPoint.x) - 50;
      const minY = Math.min(startPoint.y, endPoint.y) - 50;

      const relativeStartX = startPoint.x - minX;
      const relativeStartY = startPoint.y - minY;
      const relativeEndX = endPoint.x - minX;
      const relativeEndY = endPoint.y - minY;

      return generatePath(
        { x: relativeStartX, y: relativeStartY },
        { x: relativeEndX, y: relativeEndY },
        true
      );
    }

    // Default path for unconnected arrows
    return generatePath(startPoint, endPoint, false);
  };

  const isConnected = startShapeId && endShapeId;
  const { startPoint, endPoint, useAbsoluteCoords } = getArrowGeometry();

  // For connected arrows, we need to render outside the normal component bounds
  if (isConnected && useAbsoluteCoords) {
    console.log("Rendering connected arrow:", {
      startShapeId,
      endShapeId,
      startPoint,
      endPoint,
    });

    // Calculate the bounding box for the arrow
    const minX = Math.min(startPoint.x, endPoint.x) - 50;
    const minY = Math.min(startPoint.y, endPoint.y) - 50;
    const width = Math.max(startPoint.x, endPoint.x) - minX + 100;
    const height = Math.max(startPoint.y, endPoint.y) - minY + 100;

    // Relative coordinates within the SVG
    const relativeStartX = startPoint.x - minX;
    const relativeStartY = startPoint.y - minY;
    const relativeEndX = endPoint.x - minX;
    const relativeEndY = endPoint.y - minY;

    // Path for the arrow
    const pathData = generatePath(
      { x: relativeStartX, y: relativeStartY },
      { x: relativeEndX, y: relativeEndY },
      true
    );

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: minX,
          top: minY,
          width: width,
          height: height,
          zIndex: 1000,
        }}
      >
        <svg width={width} height={height} className="pointer-events-auto">
          <defs>
            <marker
              id={`arrowhead-${shapeId}`}
              markerWidth={arrowSize}
              markerHeight={arrowSize}
              refX={arrowSize - 2}
              refY={arrowSize / 2}
              orient="auto"
            >
              <polygon
                points={`0 0, ${arrowSize} ${arrowSize / 2}, 0 ${arrowSize}`}
                fill={strokeColor}
              />
            </marker>
            {arrowStyle === "double-arrow" && (
              <marker
                id={`arrowhead-start-${shapeId}`}
                markerWidth={arrowSize}
                markerHeight={arrowSize}
                refX={2}
                refY={arrowSize / 2}
                orient="auto"
              >
                <polygon
                  points={`${arrowSize} 0, 0 ${
                    arrowSize / 2
                  }, ${arrowSize} ${arrowSize}`}
                  fill={strokeColor}
                />
              </marker>
            )}
          </defs>

          <path
            d={pathData}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDashArray()}
            fill="none"
            markerEnd={
              arrowStyle !== "none" ? `url(#arrowhead-${shapeId})` : undefined
            }
            markerStart={
              arrowStyle === "double-arrow"
                ? `url(#arrowhead-start-${shapeId})`
                : undefined
            }
          />
        </svg>

        {/* Connection indicators */}
        <div className="absolute top-2 left-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded pointer-events-auto">
          Connected
        </div>

        {/* Text label positioned in the center */}
        {text && (
          <div
            className="absolute bg-white px-2 py-1 rounded shadow-sm pointer-events-auto"
            style={{
              left: (relativeStartX + relativeEndX) / 2 - 30,
              top: (relativeStartY + relativeEndY) / 2 - 10,
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              fontWeight,
              fontStyle,
            }}
          >
            {text}
          </div>
        )}
      </div>
    );
  }

  // Regular unconnected arrow rendering
  return (
    <BaseShape {...props} selected={selected}>
      <div
        ref={arrowRef}
        className="w-full h-full relative"
        onDoubleClick={handleDoubleClick}
      >
        <svg className="w-full h-full" style={{ overflow: "visible" }}>
          <defs>
            <marker
              id={`arrowhead-${shapeId}`}
              markerWidth={arrowSize}
              markerHeight={arrowSize}
              refX={arrowSize - 2}
              refY={arrowSize / 2}
              orient="auto"
            >
              <polygon
                points={`0 0, ${arrowSize} ${arrowSize / 2}, 0 ${arrowSize}`}
                fill={strokeColor}
              />
            </marker>
            {arrowStyle === "double-arrow" && (
              <marker
                id={`arrowhead-start-${shapeId}`}
                markerWidth={arrowSize}
                markerHeight={arrowSize}
                refX={2}
                refY={arrowSize / 2}
                orient="auto"
              >
                <polygon
                  points={`${arrowSize} 0, 0 ${
                    arrowSize / 2
                  }, ${arrowSize} ${arrowSize}`}
                  fill={strokeColor}
                />
              </marker>
            )}
          </defs>

          {/* Always use path for different bend styles */}
          <path
            d={getArrowPath() || ""}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDashArray()}
            fill="none"
            markerEnd={
              arrowStyle !== "none" ? `url(#arrowhead-${shapeId})` : undefined
            }
            markerStart={
              arrowStyle === "double-arrow"
                ? `url(#arrowhead-start-${shapeId})`
                : undefined
            }
          />
        </svg>

        {/* Help text for unconnected arrows */}
        {!isConnected && selected && (
          <div className="absolute -top-8 left-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Click "Connect" to link shapes
          </div>
        )}

        {/* Text label positioned in the center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-none outline-none bg-white px-2 py-1 rounded text-center pointer-events-auto"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                color: textColor,
                fontWeight,
                fontStyle,
                minWidth: "60px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            text && (
              <div
                className="bg-white px-2 py-1 rounded cursor-text pointer-events-auto"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  color: textColor,
                  fontWeight,
                  fontStyle,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {text}
              </div>
            )
          )}
          {!text && !isEditing && selected && (
            <div
              className="bg-white px-2 py-1 rounded cursor-text opacity-50 pointer-events-auto"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                color: textColor,
              }}
            >
              Double-click to add label
            </div>
          )}
        </div>
      </div>
    </BaseShape>
  );
};
