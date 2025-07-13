import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";
import { snapSizeToGrid } from "../../utils/gridUtils";

interface TextShapeProps extends Omit<BaseShapeProps, "children"> {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  backgroundColor?: string;
  onTextChange?: (text: string) => void;
  onFontSizeChange?: (fontSize: number) => void; // New callback for font size changes
  isEditing?: boolean; // External control of editing state
  onEditingChange?: (isEditing: boolean) => void; // Callback when editing state changes
}

export const TextShape: React.FC<TextShapeProps> = ({
  text = "",
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  fontWeight = "normal",
  fontStyle = "normal",
  backgroundColor = "transparent",
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
  const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });
  const editableRef = React.useRef<HTMLDivElement>(null);
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

  // Calculate font size based on container width with unlimited scaling
  const calculateFontSizeFromWidth = React.useCallback(
    (containerWidth: number) => {
      if (!text || text.length === 0) return currentFontSize;

      const lines = text.split("\n");
      const longestLine = lines.reduce(
        (longest, current) =>
          current.length > longest.length ? current : longest,
        ""
      );

      if (longestLine.length === 0) return currentFontSize;

      // Calculate font size based on target character width
      // Using 0.6 as the character width ratio (adjustable for different fonts)
      const targetCharWidth = containerWidth / longestLine.length;
      const calculatedFontSize = targetCharWidth / 0.6;

      // Round to nearest multiple of 8, with minimum of 8px
      const roundedFontSize = Math.max(
        8,
        Math.round(calculatedFontSize / 8) * 8
      );

      return roundedFontSize;
    },
    [text, currentFontSize]
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
    measureElement.style.whiteSpace = "pre"; // No automatic wrapping for measurement
    measureElement.style.wordBreak = "normal"; // No automatic breaking for measurement

    // Measure the actual text dimensions
    const textWidth = measureElement.offsetWidth;
    const textHeight = measureElement.offsetHeight;

    setTextBounds({ width: textWidth, height: textHeight });
  }, [text, currentFontSize, fontFamily, fontWeight, fontStyle]);

  // Real-time text measurement while editing
  React.useEffect(() => {
    if (!isEditing || !editableRef.current || !measureRef.current) return;

    const handleInput = () => {
      const currentText = editableRef.current?.textContent || "";
      if (measureRef.current) {
        const measureElement = measureRef.current;
        measureElement.textContent = currentText || "Type here...";
        measureElement.style.fontSize = `${currentFontSize}px`;
        measureElement.style.fontFamily = fontFamily;
        measureElement.style.fontWeight = fontWeight;
        measureElement.style.fontStyle = fontStyle;
        measureElement.style.whiteSpace = "pre"; // No automatic wrapping for measurement
        measureElement.style.wordBreak = "normal"; // No automatic breaking for measurement

        // Measure the actual text dimensions
        const textWidth = measureElement.offsetWidth;
        const textHeight = measureElement.offsetHeight;

        setTextBounds({ width: textWidth, height: textHeight });
      }
    };

    const editableElement = editableRef.current;
    editableElement.addEventListener("input", handleInput);

    // Also measure on keyup for better responsiveness
    editableElement.addEventListener("keyup", handleInput);

    return () => {
      editableElement.removeEventListener("input", handleInput);
      editableElement.removeEventListener("keyup", handleInput);
    };
  }, [isEditing, currentFontSize, fontFamily, fontWeight, fontStyle]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTextSubmit = React.useCallback(() => {
    if (isEditing && editableRef.current) {
      setIsEditing(false);
      const newText = editableRef.current.textContent || "";
      onTextChange?.(newText);
    }
  }, [isEditing, onTextChange, setIsEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      if (editableRef.current) {
        editableRef.current.textContent = text;
      }
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
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const containerWidth = width || 150;
  const containerHeight = height || 50;

  // Calculate minimum dimensions needed to contain the text with no padding
  const calculatedWidth = Math.max(containerWidth, textBounds.width);
  const calculatedHeight = Math.max(containerHeight, textBounds.height);

  // Snap dimensions to grid (8, 16, or 24)
  const minWidth = snapSizeToGrid(calculatedWidth);
  const minHeight = snapSizeToGrid(calculatedHeight);

  // Don't render anything if there's no text and not editing
  if (!text && !isEditing) {
    return null;
  }

  // When editing, use text bounds to size the editor dynamically
  let adjustedWidth, adjustedHeight;

  if (isEditing) {
    if (!text) {
      // Minimum size for empty text when editing
      adjustedWidth = Math.max(minWidth, 120);
      adjustedHeight = Math.max(minHeight, 40);
    } else {
      // Dynamic sizing based on text content when editing
      const textWidth = textBounds.width + 16; // Add padding for editing border
      const textHeight = textBounds.height + 16; // Add padding for editing border
      adjustedWidth = snapSizeToGrid(Math.max(textWidth, containerWidth));
      adjustedHeight = snapSizeToGrid(Math.max(textHeight, containerHeight));
    }
  } else {
    // When not editing, use calculated dimensions
    adjustedWidth = minWidth;
    adjustedHeight = minHeight;
  }

  return (
    <BaseShape
      {...props}
      width={adjustedWidth}
      height={adjustedHeight}
      selected={selected && !isEditing} // Show BaseShape selection when not editing
      onResize={(newWidth, newHeight) => {
        // Snap the resized dimensions to grid
        const snappedWidth = snapSizeToGrid(newWidth);
        const snappedHeight = snapSizeToGrid(newHeight);

        // Update the base dimensions (this will be used as minimum size)
        if (props.onResize) {
          props.onResize(snappedWidth, snappedHeight);
        }

        if (onFontSizeChange) {
          // Calculate new font size based on the resized dimensions
          const contentWidth = snappedWidth;
          const contentHeight = snappedHeight;

          // For text shape, primarily use width-based sizing
          const fontSizeFromWidth = calculateFontSizeFromWidth(contentWidth);
          // Also consider height to prevent oversized text, round to nearest multiple of 8
          const fontSizeFromHeight = Math.max(
            8,
            Math.round(contentHeight / 2 / 8) * 8
          );
          const newFontSize = Math.min(fontSizeFromWidth, fontSizeFromHeight);

          // Only enforce minimum font size of 8px
          if (newFontSize !== currentFontSize && newFontSize >= 8) {
            onFontSizeChange(newFontSize);
          }
        }
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
        className="w-full h-full relative"
        style={{
          backgroundColor,
          // Allow pointer events for double-click but prevent text selection when not editing
          userSelect: isEditing ? "text" : "none",
          WebkitUserSelect: isEditing ? "text" : "none",
          MozUserSelect: isEditing ? "text" : "none",
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          ref={editableRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: currentFontSize,
            fontFamily,
            color: textColor,
            textAlign,
            fontWeight,
            fontStyle,
            whiteSpace: "pre", // No automatic wrapping, only manual line breaks
            lineHeight: 1.2,
            // Make the editable area exactly match the BaseShape dimensions
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "4px", // Minimal padding to prevent text from touching border
            margin: 0, // Ensure no margin
            border: isEditing ? "2px solid #10b981" : "none", // Use green color like BaseShape
            borderRadius: "inherit", // Match BaseShape border radius
            outline: "none",
            minWidth: isEditing ? "100px" : text ? "20px" : "0",
            minHeight: isEditing ? "1.5em" : text ? "1em" : "0",
            background: "transparent", // Always transparent background
            display: !isEditing && !text ? "none" : "flex",
            alignItems: "center",
            justifyContent:
              textAlign === "center"
                ? "center"
                : textAlign === "right"
                ? "flex-end"
                : "flex-start",
            boxSizing: "border-box", // Include border and padding in dimensions
            wordWrap: "normal", // Prevent automatic word wrapping
            overflowWrap: "normal", // Prevent automatic overflow wrapping
            // Critical: Control pointer events and text selection
            pointerEvents: isEditing ? "auto" : "none", // Disable pointer events when not editing
            userSelect: isEditing ? "text" : "none", // Disable text selection when not editing
            WebkitUserSelect: isEditing ? "text" : "none", // Safari support
            MozUserSelect: isEditing ? "text" : "none", // Firefox support
          }}
        >
          {text || (isEditing ? "Type here..." : "")}
        </div>
      </div>
    </BaseShape>
  );
};
