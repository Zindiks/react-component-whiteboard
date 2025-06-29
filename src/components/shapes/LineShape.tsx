import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface LineShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
}

export const LineShape: React.FC<LineShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  strokeStyle = "solid",
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
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={getStrokeDashArray()}
        />
      </svg>
    </BaseShape>
  );
};
