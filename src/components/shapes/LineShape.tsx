import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { LineHeader, LineFormattingOptions } from "./LineHeader";

export interface LineShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  onFormattingChange?: (options: Partial<LineFormattingOptions>) => void;
  selectedCount?: number;
}

export const LineShape: React.FC<LineShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  strokeStyle = "solid",
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
      strokeStyle,
    });

  const handleFormattingChange = (options: Partial<LineFormattingOptions>) => {
    const newOptions = { ...formattingOptions, ...options };
    setFormattingOptions(newOptions);
    onFormattingChange?.(options);
  };

  const getStrokeDashArray = () => {
    switch (formattingOptions.strokeStyle) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,2";
      default:
        return "none";
    }
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
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={formattingOptions.strokeColor}
            strokeWidth={formattingOptions.strokeWidth}
            strokeDasharray={getStrokeDashArray()}
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
        lineType="line"
      />
    </>
  );
};
