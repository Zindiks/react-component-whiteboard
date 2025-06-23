import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

export interface ArrowShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  arrowSize?: number;
}

export const ArrowShape: React.FC<ArrowShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  arrowSize = 10,
  width,
  height,
  style,
  ...props
}) => {
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
          x1={strokeWidth}
          y1={height / 2}
          x2={width - arrowSize}
          y2={height / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          markerEnd="url(#arrowhead)"
        />
      </svg>
    </BaseShape>
  );
};
