import React from "react";
import { Minus, Plus, ArrowRight } from "lucide-react";
import { ComponentHeader } from "../ui/ComponentHeader";

export interface LineFormattingOptions {
  strokeColor: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  arrowStyle?: "none" | "arrow" | "double-arrow";
}

interface LineHeaderProps {
  options: LineFormattingOptions;
  onOptionsChange: (options: Partial<LineFormattingOptions>) => void;
  position: { x: number; y: number };
  width: number;
  visible: boolean;
  lineType: "line" | "arrow";
}

const STROKE_WIDTHS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];

const STROKE_STYLES = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const ARROW_STYLES = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Arrow" },
  { value: "double-arrow", label: "Double" },
];

export const LineHeader: React.FC<LineHeaderProps> = ({
  options,
  onOptionsChange,
  position,
  width,
  visible,
  lineType,
}) => {
  const handleStrokeColorChange = (strokeColor: string) => {
    onOptionsChange({ strokeColor });
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    onOptionsChange({ strokeWidth });
  };

  const handleStrokeStyleChange = (
    strokeStyle: "solid" | "dashed" | "dotted"
  ) => {
    onOptionsChange({ strokeStyle });
  };

  const handleArrowStyleChange = (
    arrowStyle: "none" | "arrow" | "double-arrow"
  ) => {
    onOptionsChange({ arrowStyle });
  };

  const increaseStrokeWidth = () => {
    const currentIndex = STROKE_WIDTHS.indexOf(options.strokeWidth);
    if (currentIndex < STROKE_WIDTHS.length - 1) {
      handleStrokeWidthChange(STROKE_WIDTHS[currentIndex + 1]);
    }
  };

  const decreaseStrokeWidth = () => {
    const currentIndex = STROKE_WIDTHS.indexOf(options.strokeWidth);
    if (currentIndex > 0) {
      handleStrokeWidthChange(STROKE_WIDTHS[currentIndex - 1]);
    }
  };

  return (
    <ComponentHeader position={position} width={width} visible={visible}>
      {/* Line Type Label */}
      <div
        style={{
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          minWidth: "60px",
        }}
      >
        {lineType === "line" ? "Line" : "Arrow"}
      </div>

      {/* Stroke Color Picker */}
      <div className="flex items-center gap-1">
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: options.strokeColor,
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "color";
            input.value = options.strokeColor;
            input.onchange = (e) =>
              handleStrokeColorChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
      </div>

      {/* Stroke Width Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={decreaseStrokeWidth}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Minus size={12} />
        </button>
        <span
          style={{
            color: "white",
            fontSize: "12px",
            minWidth: "20px",
            textAlign: "center",
          }}
        >
          {options.strokeWidth}
        </span>
        <button
          onClick={increaseStrokeWidth}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Stroke Style */}
      <div className="flex items-center gap-1">
        <select
          value={options.strokeStyle}
          onChange={(e) =>
            handleStrokeStyleChange(
              e.target.value as "solid" | "dashed" | "dotted"
            )
          }
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px 8px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {STROKE_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>

      {/* Arrow Style (only for arrows) */}
      {lineType === "arrow" && (
        <div className="flex items-center gap-1">
          <ArrowRight size={14} style={{ color: "white" }} />
          <select
            value={options.arrowStyle || "arrow"}
            onChange={(e) =>
              handleArrowStyleChange(
                e.target.value as "none" | "arrow" | "double-arrow"
              )
            }
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              color: "white",
              padding: "4px 8px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {ARROW_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </ComponentHeader>
  );
};
