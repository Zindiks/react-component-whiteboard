import React from "react";
import { BaseShape, ShapeProps } from "../base/BaseShape";

export interface RectangleShapeProps extends ShapeProps {
  // Rectangle-specific props can be added here
}

export interface RectangleShapeState {
  isHovered: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export class RectangleShape extends BaseShape<
  RectangleShapeProps,
  RectangleShapeState
> {
  constructor(props: RectangleShapeProps) {
    super(props);
  }

  // Override getComponentType to return specific shape type
  getComponentType(): string {
    return "rectangle";
  }

  // Implement the abstract renderShape method
  renderShape(): React.ReactNode {
    const {
      fillColor = "#f3f4f6",
      strokeColor = "#9ca3af",
      strokeWidth = 2,
      borderRadius = 0,
    } = this.props;

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          borderRadius: `${borderRadius}px`,
          boxSizing: "border-box",
        }}
      />
    );
  }

  // Override renderContent to provide custom rectangle rendering
  renderContent(): React.ReactNode {
    return this.renderShape();
  }
}

export default RectangleShape;
