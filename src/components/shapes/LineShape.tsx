import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

export interface LineShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
}

export const LineShape: React.FC<LineShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  strokeStyle = "solid",
  width,
  height,
  style,
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
    <BaseShape
      {...props}
      width={width}
      height={height}
      style={{
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible" }}
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDashArray()}
        />
      </svg>
    </BaseShape>
  );
};
