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
  padding?: number;
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
  padding = 8,
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

  // Predefined font sizes
  const FONT_SIZES = React.useMemo(
    () => [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96],
    []
  );

  // Calculate font size based on container width
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

      const targetCharWidth = containerWidth / longestLine.length;
      let bestFontSize = FONT_SIZES[0];

      for (const size of FONT_SIZES) {
        const estimatedCharWidth = size * 0.55;
        if (estimatedCharWidth <= targetCharWidth) {
          bestFontSize = size;
        } else {
          break;
        }
      }

      if (bestFontSize < 8) bestFontSize = 8;
      return bestFontSize;
    },
    [text, FONT_SIZES, currentFontSize]
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
          const containerWidth = width || 150;
          const maxOffset = Math.max(
            0,
            textBounds.width - containerWidth + padding * 2
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
            if (newOffset > maxOffset + containerWidth) {
              return -containerWidth; // Reset to start from left edge
            }
            return newOffset;
          }
        } else {
          const containerHeight = height || 50;
          const maxOffset = Math.max(
            0,
            textBounds.height - containerHeight + padding * 2
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
            if (newOffset > maxOffset + containerHeight) {
              return -containerHeight; // Reset to start from top edge
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
    padding,
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

  return (
    <BaseShape
      {...props}
      width={containerWidth}
      height={containerHeight}
      selected={selected && !isEditing}
      onResize={(newWidth) => {
        if (onFontSizeChange) {
          const contentWidth = newWidth - 16;
          const newFontSize = calculateFontSizeFromWidth(contentWidth);
          if (newFontSize !== currentFontSize) {
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
          padding,
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
