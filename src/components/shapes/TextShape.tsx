import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface TextShapeProps extends Omit<BaseShapeProps, "children"> {
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
  isEditing?: boolean; // External control of editing state
  onEditingChange?: (isEditing: boolean) => void; // Callback when editing state changes
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
  isEditing: externalIsEditing,
  onEditingChange,
  onResize,
  width,
  height,
  selected = false,
  ...props
}) => {
  const [internalIsEditing, setInternalIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(text);
  const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });
  const lastKnownSizeRef = React.useRef({
    width: width || 150,
    height: height || 50,
  });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);

  // Use external editing state if provided, otherwise use internal state
  const isEditing =
    externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  // Helper function to set editing state
  const setIsEditing = React.useCallback(
    (editing: boolean) => {
      if (externalIsEditing !== undefined) {
        // If externally controlled, notify parent
        onEditingChange?.(editing);
      } else {
        // If internally controlled, update internal state
        setInternalIsEditing(editing);
      }
    },
    [externalIsEditing, onEditingChange]
  );

  // Use simple font size - either from props or default
  const currentFontSize = fontSize;

  // Update last known size for tracking
  React.useEffect(() => {
    if (width && height) {
      const lastSize = lastKnownSizeRef.current;

      // Call onResize if dimensions changed
      if (
        onResize &&
        (width !== lastSize.width || height !== lastSize.height)
      ) {
        onResize(width, height);
      }

      lastKnownSizeRef.current = { width, height };
    }
  }, [width, height, onResize]);

  // Measure text bounds for precise selection area
  React.useEffect(() => {
    if (!text || !measureRef.current) return;

    const measureElement = measureRef.current;
    measureElement.textContent = text;
    measureElement.style.fontSize = `${currentFontSize}px`;
    measureElement.style.fontFamily = fontFamily;
    measureElement.style.fontWeight = fontWeight;
    measureElement.style.fontStyle = fontStyle;
    measureElement.style.whiteSpace = "nowrap"; // Prevent wrapping to get natural text width
    measureElement.style.wordBreak = "normal"; // Allow natural text flow

    // Measure the actual text dimensions
    const textWidth = measureElement.offsetWidth;
    const textHeight = measureElement.offsetHeight;

    setTextBounds({ width: textWidth, height: textHeight });
  }, [text, currentFontSize, fontFamily, fontWeight, fontStyle]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(text);
  };

  const handleTextSubmit = React.useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
      onTextChange?.(editText);
    }
  }, [isEditing, editText, onTextChange, setIsEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(text);
    }
  };

  const handleBlur = () => {
    // Small delay to allow for other interactions to complete
    setTimeout(() => {
      handleTextSubmit();
    }, 10);
  };

  // Handle clicks outside the text area when editing
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleTextSubmit();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isEditing, handleTextSubmit]);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <BaseShape
      {...props}
      width={textBounds.width > 0 ? textBounds.width + 16 : width || 150} // Auto-size to fit text
      height={textBounds.height > 0 ? textBounds.height + 16 : height || 50} // Auto-size to fit text
      selected={selected && !isEditing} // Show BaseShape selection when not editing
      onSelect={() => {
        if (!isEditing) {
          props.onSelect?.();
        }
      }}
    >
      {/* Hidden element for measuring text dimensions */}
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap", // Prevent wrapping for natural measurement
          fontSize: `${currentFontSize}px`,
          fontFamily,
          fontWeight,
          fontStyle,
          padding: 0,
          margin: 0,
          border: "none",
          outline: "none",
          lineHeight: 1.2, // Match the display text line height
          top: "-9999px",
          left: "-9999px",
        }}
      >
        {text}
      </div>

      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center relative"
        style={{
          backgroundColor,
          padding,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <div className="relative flex items-center justify-center">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="resize-none border-2 border-blue-400 outline-none bg-transparent overflow-hidden"
              style={{
                fontSize: currentFontSize,
                fontFamily,
                color: textColor,
                textAlign,
                fontWeight,
                fontStyle,
                padding: "2px 4px",
                width: `${Math.max(textBounds.width + 20, 100)}px`,
                height: `${Math.max(
                  textBounds.height + 8,
                  currentFontSize * 1.5
                )}px`,
                borderRadius: "3px",
                lineHeight: 1.2,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              fontSize: currentFontSize,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              whiteSpace: "nowrap", // Single line like FigJam
              lineHeight: 1.2,
              padding: "8px",
            }}
          >
            {text}
          </div>
        )}
      </div>
    </BaseShape>
  );
};
