import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { LineHeader, LineFormattingOptions } from "./LineHeader";

export interface ArrowShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  arrowSize?: number;
  arrowStyle?: "none" | "arrow" | "double-arrow";
  onFormattingChange?: (options: Partial<LineFormattingOptions>) => void;
  selectedCount?: number;
}

export const ArrowShape: React.FC<ArrowShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  arrowSize = 10,
  arrowStyle = "arrow",
  onFormattingChange,
  selected = false,
  selectedCount = 1,
  x,
  y,
  width,
  height,
  style,
  ...props
}) => {
  const [formattingOptions, setFormattingOptions] =
    useState<LineFormattingOptions>({
      strokeColor,
      strokeWidth,
      strokeStyle: "solid",
      arrowStyle,
    });

  const handleFormattingChange = (options: Partial<LineFormattingOptions>) => {
    const newOptions = { ...formattingOptions, ...options };
    setFormattingOptions(newOptions);
    onFormattingChange?.(options);
  };

  return (
    <>
      <BaseShape
        {...props}
        x={x}
        y={y}
        width={width}
        height={height}
        selected={selected}
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
                fill={formattingOptions.strokeColor}
              />
            </marker>
          </defs>
          <line
            x1={formattingOptions.strokeWidth}
            y1={height / 2}
            x2={width - arrowSize}
            y2={height / 2}
            stroke={formattingOptions.strokeColor}
            strokeWidth={formattingOptions.strokeWidth}
            markerEnd={
              formattingOptions.arrowStyle !== "none"
                ? "url(#arrowhead)"
                : undefined
            }
          />
        </svg>
      </BaseShape>

      {/* Line Formatting Header - only show for single selection */}
      <LineHeader
        options={formattingOptions}
        onOptionsChange={handleFormattingChange}
        position={{ x, y }}
        width={width}
        visible={selected && selectedCount === 1}
        lineType="arrow"
      />
    </>
  );
};
