import React from "react";
import { BaseShape, ShapeProps } from "../base/BaseShape";

export interface EllipseShapeProps extends ShapeProps {}
export interface EllipseShapeState {
  isHovered: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export class EllipseShape extends BaseShape<
  EllipseShapeProps,
  EllipseShapeState
> {
  constructor(props: EllipseShapeProps) {
    super(props);
  }

  getComponentType(): string {
    return "ellipse";
  }

  renderShape(): React.ReactNode {
    const {
      fillColor = "#f3f4f6",
      strokeColor = "#9ca3af",
      strokeWidth = 2,
    } = this.props;
    return (
      <svg width="100%" height="100%">
        <ellipse
          cx="50%"
          cy="50%"
          rx="48%"
          ry="48%"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  renderContent(): React.ReactNode {
    return this.renderShape();
  }
}

export default EllipseShape;
