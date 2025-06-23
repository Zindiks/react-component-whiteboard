import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

export interface RectangleShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export const RectangleShape: React.FC<RectangleShapeProps> = ({
  fillColor = "#f3f4f6",
  borderColor = "#9ca3af",
  borderWidth = 2,
  borderRadius = 8,
  style,
  ...props
}) => {
  return (
    <BaseShape
      {...props}
      style={{
        ...style,
      }}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundColor: fillColor,
          border: `${borderWidth}px solid ${borderColor}`,
          borderRadius: borderRadius,
        }}
      />
    </BaseShape>
  );
};
