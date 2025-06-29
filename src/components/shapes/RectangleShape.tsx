import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface RectangleShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export const RectangleShape: React.FC<RectangleShapeProps> = ({
  fillColor = "#f3f4f6",
  strokeColor = "#9ca3af",
  strokeWidth = 2,
  borderRadius = 8,
  selected = false,
  ...props
}) => {
  return (
    <BaseShape {...props} selected={selected}>
      <div
        className="w-full h-full"
        style={{
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: `${borderRadius}px`,
        }}
      />
    </BaseShape>
  );
};
