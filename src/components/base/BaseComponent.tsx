import React from "react";

export interface ComponentProps {
  id: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onDrag?: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
  transform?: { k: number; x: number; y: number };
  zIndex?: number;
}

export interface ComponentState {
  isHovered: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export abstract class BaseComponent<
  P extends ComponentProps = ComponentProps,
  S extends ComponentState = ComponentState
> extends React.Component<P, S> {
  protected static defaultProps = {
    width: 200,
    height: 150,
    selected: false,
    zIndex: 0,
  };

  constructor(props: P) {
    super(props);
    this.state = {
      isHovered: false,
      isDragging: false,
      isResizing: false,
    } as S;
  }

  // Common event handlers
  protected handleMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  protected handleMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  protected handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    this.props.onSelect?.();
  };

  protected handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Override in subclasses for specific behavior
  };

  protected handleDelete = () => {
    this.props.onDelete?.();
  };

  // Common utility methods
  protected getTransformStyle(): React.CSSProperties {
    const { transform } = this.props;
    if (!transform) return {};

    return {
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
      transformOrigin: "0 0",
    };
  }

  protected getSelectionStyle(): React.CSSProperties {
    const { selected } = this.props;
    const { isHovered } = this.state;

    return {
      outline: selected
        ? "2px solid #3b82f6"
        : isHovered
        ? "1px solid #9ca3af"
        : "none",
      outlineOffset: "2px",
    };
  }

  protected getContainerStyle(): React.CSSProperties {
    return {
      position: "absolute",
      left: this.props.x,
      top: this.props.y,
      width: this.props.width,
      height: this.props.height,
      zIndex: this.props.zIndex,
      cursor: this.state.isDragging ? "grabbing" : "grab",
      ...this.getTransformStyle(),
      ...this.getSelectionStyle(),
    };
  }

  // Abstract methods that must be implemented by subclasses
  abstract renderContent(): React.ReactNode;
  abstract getComponentType(): string;

  // Default render method
  render(): React.ReactNode {
    return (
      <div
        className="component-container"
        style={this.getContainerStyle()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleClick}
        onDoubleClick={this.handleDoubleClick}
      >
        {this.renderContent()}
        {this.renderSelectionControls()}
      </div>
    );
  }

  protected renderSelectionControls(): React.ReactNode {
    const { selected } = this.props;

    if (!selected) return null;

    return (
      <div className="selection-controls">
        <button
          className="delete-button"
          onClick={this.handleDelete}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>
    );
  }
}
