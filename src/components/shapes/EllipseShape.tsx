import React, { useState } from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface EllipseShapeProps extends Omit<BaseShapeProps, "children"> {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // Text properties
  text?: string;
  onTextChange?: (text: string) => void;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
}

export const EllipseShape: React.FC<EllipseShapeProps> = ({
  fillColor = "#f3f4f6",
  strokeColor = "#9ca3af",
  strokeWidth = 2,
  text,
  onTextChange,
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  fontWeight = "normal",
  fontStyle = "normal",
  selected = false,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || "");

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
      <div
        className="w-full h-full rounded-full relative flex items-center justify-center"
        style={{
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full h-full resize-none border-none outline-none bg-transparent text-center rounded-full"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              padding: "8px",
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center cursor-text"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              padding: "8px",
              wordWrap: "break-word",
              overflow: "hidden",
            }}
          >
            {text || (selected ? "Double-click to add text" : "")}
          </div>
        )}
      </div>
    </BaseShape>
  );
};
