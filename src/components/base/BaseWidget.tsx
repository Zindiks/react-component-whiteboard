import React from "react";
import { BaseComponent, ComponentProps } from "./BaseComponent";

export interface WidgetProps extends ComponentProps {
  title?: string;
  showHeader?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
}

export interface WidgetState {
  isHovered: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export abstract class BaseWidget<
  P extends WidgetProps = WidgetProps,
  S extends WidgetState = WidgetState
> extends BaseComponent<P, S> {
  protected static defaultWidgetProps = {
    title: "Widget",
    showHeader: true,
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
  };

  constructor(props: P) {
    super(props);
    this.state = {
      isHovered: false,
      isDragging: false,
      isResizing: false,
      isExpanded: false,
      isLoading: false,
      error: null,
    } as S;
  }

  // Widget-specific utility methods
  protected getWidgetStyle(): React.CSSProperties {
    const {
      backgroundColor = "#ffffff",
      borderColor = "#e5e7eb",
      borderRadius = 8,
      padding = 16,
    } = this.props;

    return {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      padding: `${padding}px`,
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    };
  }

  protected getHeaderStyle(): React.CSSProperties {
    return {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
    };
  }

  protected getContentStyle(): React.CSSProperties {
    return {
      flex: 1,
      overflow: "hidden",
    };
  }

  // Widget-specific event handlers
  protected handleExpand = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  };

  protected handleRefresh = () => {
    this.setState({ isLoading: true, error: null });
    this.refreshData();
  };

  // Abstract methods for widget-specific functionality
  protected abstract refreshData(): void;
  protected abstract renderWidgetContent(): React.ReactNode;

  // Override getComponentType to return 'widget'
  getComponentType(): string {
    return "widget";
  }

  // Override renderContent to include widget-specific structure
  renderContent(): React.ReactNode {
    const { title, showHeader = true } = this.props;
    const { isLoading, error } = this.state;

    return (
      <div style={this.getWidgetStyle()}>
        {showHeader && title && (
          <div style={this.getHeaderStyle()}>
            <span>{title}</span>
            <div className="widget-controls">{this.renderWidgetControls()}</div>
          </div>
        )}

        <div style={this.getContentStyle()}>
          {isLoading && this.renderLoadingState()}
          {error && this.renderErrorState()}
          {!isLoading && !error && this.renderWidgetContent()}
        </div>
      </div>
    );
  }

  protected renderWidgetControls(): React.ReactNode {
    return (
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          onClick={this.handleRefresh}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            fontSize: "12px",
          }}
          title="Refresh"
        >
          ↻
        </button>
        <button
          onClick={this.handleExpand}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            fontSize: "12px",
          }}
          title="Expand"
        >
          {this.state.isExpanded ? "−" : "+"}
        </button>
      </div>
    );
  }

  protected renderLoadingState(): React.ReactNode {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#6b7280",
        }}
      >
        Loading...
      </div>
    );
  }

  protected renderErrorState(): React.ReactNode {
    const { error } = this.state;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#ef4444",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        {error}
      </div>
    );
  }
}
