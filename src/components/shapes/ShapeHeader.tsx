import React from "react";
import { Palette, Square, Minus, Plus } from "lucide-react";
import { ComponentHeader } from "../ui/ComponentHeader";

export interface ShapeFormattingOptions {
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius?: number;
}

interface ShapeHeaderProps {
  options: ShapeFormattingOptions;
  onOptionsChange: (options: Partial<ShapeFormattingOptions>) => void;
  position: { x: number; y: number };
  width: number;
  visible: boolean;
  shapeType: "rectangle" | "ellipse";
}

const BORDER_WIDTHS = [0, 1, 2, 3, 4, 5, 6, 8, 10];

export const ShapeHeader: React.FC<ShapeHeaderProps> = ({
  options,
  onOptionsChange,
  position,
  width,
  visible,
  shapeType,
}) => {
  const handleFillColorChange = (fillColor: string) => {
    onOptionsChange({ fillColor });
  };

  const handleBorderColorChange = (borderColor: string) => {
    onOptionsChange({ borderColor });
  };

  const handleBorderWidthChange = (borderWidth: number) => {
    onOptionsChange({ borderWidth });
  };

  const handleBorderRadiusChange = (borderRadius: number) => {
    onOptionsChange({ borderRadius });
  };

  const increaseBorderWidth = () => {
    const currentIndex = BORDER_WIDTHS.indexOf(options.borderWidth);
    if (currentIndex < BORDER_WIDTHS.length - 1) {
      handleBorderWidthChange(BORDER_WIDTHS[currentIndex + 1]);
    }
  };

  const decreaseBorderWidth = () => {
    const currentIndex = BORDER_WIDTHS.indexOf(options.borderWidth);
    if (currentIndex > 0) {
      handleBorderWidthChange(BORDER_WIDTHS[currentIndex - 1]);
    }
  };

  return (
    <ComponentHeader position={position} width={width} visible={visible}>
      {/* Shape Type Label */}
      <div
        style={{
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          minWidth: "60px",
        }}
      >
        {shapeType === "rectangle" ? "Rectangle" : "Ellipse"}
      </div>

      {/* Fill Color Picker */}
      <div className="flex items-center gap-1">
        <Palette size={14} style={{ color: "white" }} />
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: options.fillColor,
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "color";
            input.value = options.fillColor;
            input.onchange = (e) =>
              handleFillColorChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
      </div>

      {/* Border Color Picker */}
      <div className="flex items-center gap-1">
        <Square size={14} style={{ color: "white" }} />
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: options.borderColor,
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "color";
            input.value = options.borderColor;
            input.onchange = (e) =>
              handleBorderColorChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
      </div>

      {/* Border Width Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={decreaseBorderWidth}
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
          {options.borderWidth}
        </span>
        <button
          onClick={increaseBorderWidth}
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

      {/* Border Radius (only for rectangles) */}
      {shapeType === "rectangle" && (
        <div className="flex items-center gap-2">
          <span style={{ color: "white", fontSize: "12px" }}>Radius:</span>
          <input
            type="range"
            min="0"
            max="20"
            value={options.borderRadius || 0}
            onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
            style={{
              width: "60px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
            }}
          />
          <span style={{ color: "white", fontSize: "12px", minWidth: "20px" }}>
            {options.borderRadius || 0}
          </span>
        </div>
      )}
    </ComponentHeader>
  );
};
