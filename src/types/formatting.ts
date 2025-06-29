export interface TextFormattingOptions {
  fontFamily: string;
  fontSize: number;
  textAlign: "left" | "center" | "right";
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textColor: string;
}

export interface ShapeFormattingOptions {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number;
}

export interface LineFormattingOptions {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
}

export interface ArrowFormattingOptions extends LineFormattingOptions {
  arrowStyle: "none" | "arrow" | "double-arrow";
  arrowSize: number;
}

export interface ImageFormattingOptions {
  borderRadius?: number;
}

export interface WidgetFormattingOptions {
  title: string;
  refreshInterval?: number;
  isVisible: boolean;
  settings?: Record<string, string | number | boolean>;
}
