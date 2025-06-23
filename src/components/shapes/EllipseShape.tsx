import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

export interface EllipseShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export const EllipseShape: React.FC<EllipseShapeProps> = ({
  fillColor = "#f3f4f6",
  borderColor = "#9ca3af",
  borderWidth = 2,
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
          borderRadius: "50%",
        }}
      />
    </BaseShape>
  );
};
