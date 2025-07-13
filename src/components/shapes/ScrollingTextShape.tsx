import React from "react";
import { BaseShape, BaseShapeProps } from "./BaseShape";

interface ScrollingTextShapeProps extends Omit<BaseShapeProps, "children"> {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  backgroundColor?: string;
  onTextChange?: (text: string) => void;
  onFontSizeChange?: (fontSize: number) => void;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  // Scrolling-specific properties
  scrollDirection?: "horizontal" | "vertical";
  scrollSpeed?: number; // pixels per second
  pauseOnHover?: boolean;
  bounceOnEnd?: boolean;
}

export const ScrollingTextShape: React.FC<ScrollingTextShapeProps> = ({
  text = "Scrolling text - double-click to edit",
  fontSize = 14,
  fontFamily = "Arial, sans-serif",
  textColor = "#374151",
  textAlign = "center",
  fontWeight = "normal",
  fontStyle = "normal",
  backgroundColor = "transparent",
  scrollDirection = "horizontal",
  scrollSpeed = 50,
  pauseOnHover = true,
  bounceOnEnd = false,
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
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [animationDirection, setAnimationDirection] = React.useState(1); // 1 for forward, -1 for backward

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<number>();

  // Use external editing state if provided, otherwise use internal state
  const isEditing =
    externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  // Helper function to set editing state
  const setIsEditing = React.useCallback(
    (editing: boolean) => {
      if (externalIsEditing !== undefined) {
        onEditingChange?.(editing);
      } else {
        setInternalIsEditing(editing);
      }
    },
    [externalIsEditing, onEditingChange]
  );

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

  // Measure text bounds for precise selection area
  React.useEffect(() => {
    if (!text || !measureRef.current) return;

    const measureElement = measureRef.current;
    measureElement.textContent = text;
    measureElement.style.fontSize = `${currentFontSize}px`;
    measureElement.style.fontFamily = fontFamily;
    measureElement.style.fontWeight = fontWeight;
    measureElement.style.fontStyle = fontStyle;
    measureElement.style.whiteSpace =
      scrollDirection === "horizontal" ? "nowrap" : "pre";
    measureElement.style.wordBreak = "normal";

    const textWidth = measureElement.offsetWidth;
    const textHeight = measureElement.offsetHeight;

    setTextBounds({ width: textWidth, height: textHeight });
  }, [
    text,
    currentFontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    scrollDirection,
  ]);

  // Scrolling animation with proper continuous animation
  React.useEffect(() => {
    if (isEditing || (pauseOnHover && isHovered)) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let lastTime = Date.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Convert pixels per second to pixels per frame
      const frameDistance = (scrollSpeed * deltaTime) / 1000;

      setScrollOffset((prevOffset) => {
        if (scrollDirection === "horizontal") {
          const currentContainerWidth = width || 150;
          const maxOffset = Math.max(
            0,
            textBounds.width - currentContainerWidth + minPadding * 2
          );

          if (bounceOnEnd) {
            let newOffset = prevOffset + frameDistance * animationDirection;
            if (newOffset <= 0) {
              newOffset = 0;
              setAnimationDirection(1);
            } else if (newOffset >= maxOffset) {
              newOffset = maxOffset;
              setAnimationDirection(-1);
            }
            return newOffset;
          } else {
            // Loop animation
            const newOffset = prevOffset + frameDistance;
            if (newOffset > maxOffset + currentContainerWidth) {
              return -currentContainerWidth; // Reset to start from left edge
            }
            return newOffset;
          }
        } else {
          const currentContainerHeight = height || 50;
          const maxOffset = Math.max(
            0,
            textBounds.height - currentContainerHeight + minPadding * 2
          );

          if (bounceOnEnd) {
            let newOffset = prevOffset + frameDistance * animationDirection;
            if (newOffset <= 0) {
              newOffset = 0;
              setAnimationDirection(1);
            } else if (newOffset >= maxOffset) {
              newOffset = maxOffset;
              setAnimationDirection(-1);
            }
            return newOffset;
          } else {
            // Loop animation
            const newOffset = prevOffset + frameDistance;
            if (newOffset > maxOffset + currentContainerHeight) {
              return -currentContainerHeight; // Reset to start from top edge
            }
            return newOffset;
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    scrollSpeed,
    scrollDirection,
    bounceOnEnd,
    pauseOnHover,
    isHovered,
    isEditing,
    textBounds,
    width,
    height,
    animationDirection,
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

  const containerWidth = width || 150;
  const containerHeight = height || 50;

  // Calculate minimum dimensions needed to contain the text with minimal padding
  const minPadding = 4; // Minimal padding for tight border
  const minWidth = Math.max(containerWidth, textBounds.width + minPadding * 2);
  const minHeight = Math.max(
    containerHeight,
    textBounds.height + minPadding * 2
  );

  return (
    <BaseShape
      {...props}
      width={minWidth}
      height={minHeight}
      selected={selected && !isEditing}
      onResize={(newWidth, newHeight) => {
        // Update the base dimensions (this will be used as minimum size)
        if (props.onResize) {
          props.onResize(newWidth, newHeight);
        }

        if (onFontSizeChange) {
          // Calculate new font size based on the resized dimensions
          const contentWidth = newWidth - minPadding * 2;
          const contentHeight = newHeight - minPadding * 2;

          let newFontSize: number;

          if (scrollDirection === "horizontal") {
            // For horizontal scrolling, base font size on width
            newFontSize = calculateFontSizeFromWidth(contentWidth);
          } else {
            // For vertical scrolling, consider both width and height
            const fontSizeFromWidth = calculateFontSizeFromWidth(contentWidth);
            // For height-based calculation, round to nearest multiple of 8
            const heightBasedSize = Math.max(
              8,
              Math.round(contentHeight / 2 / 8) * 8
            );
            newFontSize = Math.min(fontSizeFromWidth, heightBasedSize);
          }

          // Only enforce minimum font size, no maximum limit
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
          whiteSpace: scrollDirection === "horizontal" ? "nowrap" : "pre",
          fontSize: `${currentFontSize}px`,
          fontFamily,
          fontWeight,
          fontStyle,
          padding: 0,
          margin: 0,
          border: "none",
          outline: "none",
          lineHeight: 1.2,
          top: "-9999px",
          left: "-9999px",
        }}
      >
        {text}
      </div>

      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        style={{
          backgroundColor,
          padding: minPadding,
        }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
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
              whiteSpace:
                scrollDirection === "horizontal" ? "nowrap" : "pre-wrap",
              lineHeight: 1.2,
              position: "absolute",
              transform:
                scrollDirection === "horizontal"
                  ? `translateX(-${scrollOffset}px)`
                  : `translateY(-${scrollOffset}px)`,
              transition:
                isHovered && pauseOnHover ? "transform 0.3s ease" : "none",
            }}
          >
            {text}
          </div>
        )}
      </div>
    </BaseShape>
  );
};
