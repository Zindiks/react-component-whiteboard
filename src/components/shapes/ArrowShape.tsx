import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface ArrowShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  arrowStyle?: "none" | "arrow" | "double-arrow";
  arrowSize?: number;
}

export const ArrowShape: React.FC<ArrowShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  strokeStyle = "solid",
  arrowStyle = "arrow",
  arrowSize = 10,
  selected = false,
  ...props
}) => {
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

  return (
    <BaseShape {...props} selected={selected}>
      <svg className="w-full h-full" style={{ overflow: "visible" }}>
        <defs>
          <marker
            id="arrowhead"
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
        </defs>
        <line
          x1="10%"
          y1="50%"
          x2="90%"
          y2="50%"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDashArray()}
          markerEnd={arrowStyle !== "none" ? "url(#arrowhead)" : undefined}
        />
      </svg>
    </BaseShape>
  );
};
