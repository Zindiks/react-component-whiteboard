import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import {
  TextFormattingHeader,
  TextFormattingOptions,
} from "./TextFormattingHeader";

export interface TextShapeProps extends Omit<BaseShapeProps, "children"> {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  backgroundColor?: string;
  padding?: number;
  onTextChange?: (text: string) => void;
  onFormattingChange?: (options: Partial<TextFormattingOptions>) => void;
}

export const TextShape: React.FC<TextShapeProps> = ({
  text = "Double-click to edit",
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  fontWeight = "normal",
  fontStyle = "normal",
  backgroundColor = "transparent",
  padding = 8,
  onTextChange,
  onFormattingChange,
  selected = false,
  x,
  y,
  width,
  height,
  style,
  ...props
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(text);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(text);
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    onTextChange?.(editText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(text);
    }
  };

  const handleFormattingChange = (options: Partial<TextFormattingOptions>) => {
    onFormattingChange?.(options);
  };

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const formattingOptions: TextFormattingOptions = {
    fontFamily,
    fontSize,
    textAlign,
    fontWeight,
    fontStyle,
    textColor,
  };

  return (
    <>
      <BaseShape
        {...props}
        x={x}
        y={y}
        width={width}
        height={height}
        selected={selected}
        style={{
          ...style,
        }}
        onSelect={() => {
          if (!isEditing) {
            props.onSelect?.();
          }
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backgroundColor,
            padding,
          }}
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextSubmit}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none border-none outline-none bg-transparent"
              style={{
                fontSize,
                fontFamily,
                color: textColor,
                textAlign,
                fontWeight,
                fontStyle,
                padding: 0,
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center"
              style={{
                fontSize,
                fontFamily,
                color: textColor,
                textAlign,
                fontWeight,
                fontStyle,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                justifyContent:
                  textAlign === "center"
                    ? "center"
                    : textAlign === "right"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              {text}
            </div>
          )}
        </div>
      </BaseShape>

      {/* Text Formatting Header */}
      <TextFormattingHeader
        options={formattingOptions}
        onOptionsChange={handleFormattingChange}
        position={{ x, y }}
        width={width}
        visible={selected && !isEditing}
      />
    </>
  );
};
