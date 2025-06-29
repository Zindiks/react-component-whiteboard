import React from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus,
} from "lucide-react";

export interface TextFormattingOptions {
  fontFamily: string;
  fontSize: number;
  textAlign: "left" | "center" | "right";
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textColor: string;
}

interface TextFormattingHeaderProps {
  options: TextFormattingOptions;
  onOptionsChange: (options: Partial<TextFormattingOptions>) => void;
  position: { x: number; y: number };
  width: number; // Component width to calculate center
  visible: boolean;
}

const FONT_FAMILIES = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Times New Roman, serif", label: "Times" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans" },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export const TextFormattingHeader: React.FC<TextFormattingHeaderProps> = ({
  options,
  onOptionsChange,
  position,
  width,
  visible,
}) => {
  if (!visible) return null;

  const handleFontFamilyChange = (fontFamily: string) => {
    onOptionsChange({ fontFamily });
  };

  const handleFontSizeChange = (fontSize: number) => {
    onOptionsChange({ fontSize });
  };

  const handleTextAlignChange = (textAlign: "left" | "center" | "right") => {
    onOptionsChange({ textAlign });
  };

  const handleBoldToggle = () => {
    onOptionsChange({
      fontWeight: options.fontWeight === "bold" ? "normal" : "bold",
    });
  };

  const handleItalicToggle = () => {
    onOptionsChange({
      fontStyle: options.fontStyle === "italic" ? "normal" : "italic",
    });
  };

  const handleColorChange = (textColor: string) => {
    onOptionsChange({ textColor });
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(options.fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      handleFontSizeChange(FONT_SIZES[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(options.fontSize);
    if (currentIndex > 0) {
      handleFontSizeChange(FONT_SIZES[currentIndex - 1]);
    }
  };

  const HEADER_WIDTH = 400; // Fixed header width

  return (
    <div
      style={{
        position: "absolute",
        left: position.x + width / 2 - HEADER_WIDTH / 2, // Center the header on the component
        top: position.y - 60, // Position above the text shape
        width: `${HEADER_WIDTH}px`,
        height: "50px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px",
        zIndex: 10000,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Font Family Dropdown */}
      <div className="relative">
        <select
          value={options.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
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
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={decreaseFontSize}
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
            minWidth: "30px",
            textAlign: "center",
          }}
        >
          {options.fontSize}
        </span>
        <button
          onClick={increaseFontSize}
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

      {/* Text Alignment */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleTextAlignChange("left")}
          style={{
            background:
              options.textAlign === "left"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(255, 255, 255, 0.1)",
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
          <AlignLeft size={14} />
        </button>
        <button
          onClick={() => handleTextAlignChange("center")}
          style={{
            background:
              options.textAlign === "center"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(255, 255, 255, 0.1)",
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
          <AlignCenter size={14} />
        </button>
        <button
          onClick={() => handleTextAlignChange("right")}
          style={{
            background:
              options.textAlign === "right"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(255, 255, 255, 0.1)",
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
          <AlignRight size={14} />
        </button>
      </div>

      {/* Bold and Italic */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleBoldToggle}
          style={{
            background:
              options.fontWeight === "bold"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          <Bold size={14} />
        </button>
        <button
          onClick={handleItalicToggle}
          style={{
            background:
              options.fontStyle === "italic"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            color: "white",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontStyle: "italic",
          }}
        >
          <Italic size={14} />
        </button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-1">
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: options.textColor,
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "color";
            input.value = options.textColor;
            input.onchange = (e) =>
              handleColorChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
      </div>
    </div>
  );
};
