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
  const [internalFontSize, setInternalFontSize] = React.useState(fontSize);
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

  // Calculate dynamic font size based on container dimensions
  const dynamicFontSize = React.useMemo(() => {
    if (!width || !height || !text) return internalFontSize;

    // Calculate font size based on container area and text length
    const area = width * height;
    const textLength = text.length;

    // Base font size calculation: scale with square root of area
    let scaledSize = Math.sqrt(area) / 12; // Adjust divisor to control scaling sensitivity

    // Adjust for text length - longer text should be smaller to fit
    if (textLength > 1) {
      const lengthFactor = Math.max(0.3, 1 - (textLength - 5) * 0.02); // Gradual decrease
      scaledSize = scaledSize * lengthFactor;
    }

    // Ensure text fits within container width (rough estimation)
    const maxWidthBasedSize = (width - padding * 2) / (textLength * 0.6);
    const maxHeightBasedSize = (height - padding * 2) * 0.8;

    // Use the most restrictive constraint
    scaledSize = Math.min(scaledSize, maxWidthBasedSize, maxHeightBasedSize);

    // Clamp to reasonable bounds
    return Math.max(Math.min(scaledSize, 200), 8);
  }, [width, height, text, padding, internalFontSize]);

  // Use dynamic font size for rendering, but keep manual font size changes from header
  const currentFontSize = fontSize !== 14 ? internalFontSize : dynamicFontSize;

  // Use fontSize prop when it changes (from header controls)
  React.useEffect(() => {
    setInternalFontSize(fontSize);
  }, [fontSize]);

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
    measureElement.style.whiteSpace = "pre-wrap"; // Preserve newlines and wrapping
    measureElement.style.wordBreak = "break-word"; // Handle long words
    measureElement.style.maxWidth = `${(width || 150) - padding * 2}px`; // Constrain to container width

    // Measure the actual text dimensions
    const textWidth = measureElement.offsetWidth;
    const textHeight = measureElement.offsetHeight;

    setTextBounds({ width: textWidth, height: textHeight });
  }, [
    text,
    currentFontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    width,
    padding,
  ]);

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
      width={width || 150}
      height={height || 50}
      selected={false} // Hide default BaseShape selection border
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
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: `${currentFontSize}px`,
          fontFamily,
          fontWeight,
          fontStyle,
          maxWidth: `${(width || 150) - padding * 2}px`,
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
        {/* Text-aligned selection indicator */}
        {selected && !isEditing && textBounds.width > 0 && (
          <div
            className="absolute border-2 border-blue-500 pointer-events-none"
            style={{
              width: `${textBounds.width + 8}px`, // Add small padding
              height: `${textBounds.height + 4}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "2px",
            }}
          />
        )}

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
            className="w-full h-full flex items-center"
            style={{
              fontSize: currentFontSize,
              fontFamily,
              color: textColor,
              textAlign,
              fontWeight,
              fontStyle,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.2,
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
