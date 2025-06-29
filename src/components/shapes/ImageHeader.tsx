import React from "react";
import { Link, Minus, Plus, RotateCw } from "lucide-react";
import { ComponentHeader } from "../ui/ComponentHeader";

export interface ImageFormattingOptions {
  imageUrl: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  rotation: number;
  opacity: number;
}

interface ImageHeaderProps {
  options: ImageFormattingOptions;
  onOptionsChange: (options: Partial<ImageFormattingOptions>) => void;
  position: { x: number; y: number };
  width: number;
  visible: boolean;
}

const BORDER_WIDTHS = [0, 1, 2, 3, 4, 5, 6, 8, 10];

export const ImageHeader: React.FC<ImageHeaderProps> = ({
  options,
  onOptionsChange,
  position,
  width,
  visible,
}) => {
  const handleImageUrlChange = (imageUrl: string) => {
    onOptionsChange({ imageUrl });
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

  const handleRotationChange = (rotation: number) => {
    onOptionsChange({ rotation });
  };

  const handleOpacityChange = (opacity: number) => {
    onOptionsChange({ opacity });
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
    <ComponentHeader
      position={position}
      width={width}
      visible={visible}
      headerWidth={500}
    >
      {/* Image Type Label */}
      <div
        style={{
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          minWidth: "60px",
        }}
      >
        Image
      </div>

      {/* Image URL Input */}
      <div className="flex items-center gap-1">
        <Link size={14} style={{ color: "white" }} />
        <input
          type="text"
          value={options.imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          placeholder="Image URL"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px 8px",
            fontSize: "12px",
            width: "150px",
          }}
        />
      </div>

      {/* Border Color Picker */}
      <div className="flex items-center gap-1">
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

      {/* Border Radius */}
      <div className="flex items-center gap-2">
        <span style={{ color: "white", fontSize: "12px" }}>Radius:</span>
        <input
          type="range"
          min="0"
          max="20"
          value={options.borderRadius}
          onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
          style={{
            width: "60px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
          }}
        />
        <span style={{ color: "white", fontSize: "12px", minWidth: "20px" }}>
          {options.borderRadius}
        </span>
      </div>

      {/* Rotation */}
      <div className="flex items-center gap-2">
        <RotateCw size={14} style={{ color: "white" }} />
        <input
          type="range"
          min="0"
          max="360"
          value={options.rotation}
          onChange={(e) => handleRotationChange(Number(e.target.value))}
          style={{
            width: "60px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
          }}
        />
        <span style={{ color: "white", fontSize: "12px", minWidth: "30px" }}>
          {options.rotation}°
        </span>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <span style={{ color: "white", fontSize: "12px" }}>Opacity:</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={options.opacity}
          onChange={(e) => handleOpacityChange(Number(e.target.value))}
          style={{
            width: "60px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
          }}
        />
        <span style={{ color: "white", fontSize: "12px", minWidth: "30px" }}>
          {Math.round(options.opacity * 100)}%
        </span>
      </div>
    </ComponentHeader>
  );
};
