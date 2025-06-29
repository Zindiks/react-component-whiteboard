import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { ShapeHeader, ShapeFormattingOptions } from "./ShapeHeader";

export interface EllipseShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  onFormattingChange?: (options: Partial<ShapeFormattingOptions>) => void;
  selectedCount?: number;
}

export const EllipseShape: React.FC<EllipseShapeProps> = ({
  fillColor = "#f3f4f6",
  borderColor = "#9ca3af",
  borderWidth = 2,
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
            borderRadius: "50%",
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
        shapeType="ellipse"
      />
    </>
  );
};
