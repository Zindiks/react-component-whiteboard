import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

export interface TextShapeProps extends Omit<BaseShapeProps, "children"> {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
  padding?: number;
  onTextChange?: (text: string) => void;
}

export const TextShape: React.FC<TextShapeProps> = ({
  text = "Double-click to edit",
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  backgroundColor = "transparent",
  padding = 8,
  onTextChange,
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

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <BaseShape
      {...props}
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
  );
};
