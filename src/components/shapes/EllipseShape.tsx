import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface EllipseShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const EllipseShape: React.FC<EllipseShapeProps> = ({
  fillColor = "#f3f4f6",
  strokeColor = "#9ca3af",
  strokeWidth = 2,
  selected = false,
  ...props
}) => {
  return (
    <BaseShape {...props} selected={selected}>
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
        }}
      />
    </BaseShape>
  );
};
