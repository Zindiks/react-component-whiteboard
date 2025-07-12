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
  onFontSizeChange?: (fontSize: number) => void; // New callback for font size changes
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
  onFontSizeChange,
  isEditing: externalIsEditing,
  onEditingChange,
  width,
  height,
  selected = false,
  ...props
}) => {
  const [internalIsEditing, setInternalIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(text);
  const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });
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

  // Predefined font sizes
  const FONT_SIZES = React.useMemo(
    () => [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96],
    []
  );

  // Calculate font size based on container width
  const calculateFontSizeFromWidth = React.useCallback(
    (containerWidth: number) => {
      if (!text || text.length === 0) return currentFontSize;

      // Split text into lines and find the longest line
      const lines = text.split("\n");
      const longestLine = lines.reduce(
        (longest, current) =>
          current.length > longest.length ? current : longest,
        ""
      );

      if (longestLine.length === 0) return currentFontSize;

      // Calculate based on the longest line length
      const targetCharWidth = containerWidth / longestLine.length;

      // Find the largest font size that would fit
      let bestFontSize = FONT_SIZES[0];
      for (const size of FONT_SIZES) {
        // More accurate character width estimation (roughly 0.6 * font size for most fonts)
        const estimatedCharWidth = size * 0.55;
        if (estimatedCharWidth <= targetCharWidth) {
          bestFontSize = size;
        } else {
          break;
        }
      }

      // Don't allow font size to go below minimum
      if (bestFontSize < 8) bestFontSize = 8; // Minimum readable size

      return bestFontSize;
    },
    [text, FONT_SIZES, currentFontSize]
  );

  // Removed complex font size effect - now handled directly in onResize

  // Removed size tracking effect - component auto-sizes to text bounds

  // Measure text bounds for precise selection area
  React.useEffect(() => {
    if (!text || !measureRef.current) return;

    const measureElement = measureRef.current;
    measureElement.textContent = text;
    measureElement.style.fontSize = `${currentFontSize}px`;
    measureElement.style.fontFamily = fontFamily;
    measureElement.style.fontWeight = fontWeight;
    measureElement.style.fontStyle = fontStyle;
    measureElement.style.whiteSpace = "pre"; // Allow line breaks in measurement
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
      onResize={(newWidth) => {
        // Calculate new font size based on the resize
        if (onFontSizeChange) {
          const newFontSize = calculateFontSizeFromWidth(newWidth - 16);
          if (newFontSize !== currentFontSize) {
            onFontSizeChange(newFontSize);
          }
        }
        // Component auto-sizes to text bounds, no need to call parent onResize
      }}
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
          whiteSpace: "pre", // Allow line breaks in measurement
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
              whiteSpace: "pre-wrap", // Allow line breaks and preserve formatting
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
