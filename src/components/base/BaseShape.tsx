import React from "react";
import { BaseComponent, ComponentProps } from "./BaseComponent";

export interface ShapeProps extends ComponentProps {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
}

export interface ShapeState {
  isHovered: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export abstract class BaseShape<
  P extends ShapeProps = ShapeProps,
  S extends ShapeState = ShapeState
> extends BaseComponent<P, S> {
  protected static defaultShapeProps = {
    fillColor: "#f3f4f6",
    strokeColor: "#9ca3af",
    strokeWidth: 2,
    borderRadius: 0,
    strokeStyle: "solid" as const,
  };

  constructor(props: P) {
    super(props);
    this.state = {
      isHovered: false,
      isDragging: false,
      isResizing: false,
    } as S;
  }

  // Shape-specific utility methods
  protected getShapeStyle(): React.CSSProperties {
    const {
      fillColor = "#f3f4f6",
      strokeColor = "#9ca3af",
      strokeWidth = 2,
      borderRadius = 0,
      strokeStyle = "solid",
    } = this.props;

    return {
      backgroundColor: fillColor,
      border: `${strokeWidth}px ${strokeStyle} ${strokeColor}`,
      borderRadius: `${borderRadius}px`,
      width: "100%",
      height: "100%",
    };
  }

  protected getStrokeDasharray(): string {
    const { strokeStyle } = this.props;

    switch (strokeStyle) {
      case "dashed":
        return "5,5";
      case "dotted":
        return "2,2";
      default:
        return "none";
    }
  }

  // Override getComponentType to return 'shape'
  getComponentType(): string {
    return "shape";
  }

  // Abstract method for shape-specific rendering
  abstract renderShape(): React.ReactNode;

  // Override renderContent to include shape-specific styling
  renderContent(): React.ReactNode {
    return <div style={this.getShapeStyle()}>{this.renderShape()}</div>;
  }
}
