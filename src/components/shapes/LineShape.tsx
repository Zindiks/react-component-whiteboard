import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface LineShapeProps extends Omit<BaseShapeProps, "children"> {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  // Text properties
  text?: string;
  onTextChange?: (text: string) => void;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
}

export const LineShape: React.FC<LineShapeProps> = ({
  strokeColor = "#374151",
  strokeWidth = 2,
  strokeStyle = "solid",
  text,
  onTextChange,
  fontSize = 12,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  fontWeight = "normal",
  fontStyle = "normal",
  selected = false,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");

  const getStrokeDashArray = () => {
    switch (strokeStyle) {
      case "dashed":
        return "8,4";
      case "dotted":
        return "2,2";
      default:
        return "none";
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(text || "");
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (onTextChange) {
      onTextChange(editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(text || "");
    }
  };

  return (
    <BaseShape {...props} selected={selected}>
      <div className="w-full h-full relative" onDoubleClick={handleDoubleClick}>
        <svg className="w-full h-full" style={{ overflow: "visible" }}>
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={getStrokeDashArray()}
          />
        </svg>
        
        {/* Text label positioned in the center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-none outline-none bg-white px-2 py-1 rounded text-center pointer-events-auto"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                color: textColor,
                fontWeight,
                fontStyle,
                minWidth: "60px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            text && (
              <div
                className="bg-white px-2 py-1 rounded cursor-text pointer-events-auto"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  color: textColor,
                  fontWeight,
                  fontStyle,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {text}
              </div>
            )
          )}
          {!text && !isEditing && selected && (
            <div
              className="bg-white px-2 py-1 rounded cursor-text opacity-50 pointer-events-auto"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                color: textColor,
              }}
            >
              Double-click to add label
            </div>
          )}
        </div>
      </div>
    </BaseShape>
  );
};
