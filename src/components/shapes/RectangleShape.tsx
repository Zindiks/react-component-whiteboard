import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { ShapeHeader, ShapeFormattingOptions } from "./ShapeHeader";

export interface RectangleShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  onFormattingChange?: (options: Partial<ShapeFormattingOptions>) => void;
  selectedCount?: number;
}

export const RectangleShape: React.FC<RectangleShapeProps> = ({
  fillColor = "#f3f4f6",
  borderColor = "#9ca3af",
  borderWidth = 2,
  borderRadius = 8,
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
    useState<ShapeFormattingOptions>({
      fillColor,
      borderColor,
      borderWidth,
      borderRadius,
    });

  const handleFormattingChange = (options: Partial<ShapeFormattingOptions>) => {
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
        <div
          className="w-full h-full"
          style={{
            backgroundColor: formattingOptions.fillColor,
            border: `${formattingOptions.borderWidth}px solid ${formattingOptions.borderColor}`,
            borderRadius: formattingOptions.borderRadius,
          }}
        />
      </BaseShape>

      {/* Shape Formatting Header - only show for single selection */}
      <ShapeHeader
        options={formattingOptions}
        onOptionsChange={handleFormattingChange}
        position={{ x, y }}
        width={width}
        visible={selected && selectedCount === 1}
        shapeType="rectangle"
      />
    </>
  );
};
