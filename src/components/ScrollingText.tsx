import React, { useState, useEffect, useRef } from "react";
import {
  Edit3,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";

interface ScrollingTextProps {
  initialText?: string;
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const ScrollingText: React.FC<ScrollingTextProps> = ({
  initialText = "Welcome to the Scrolling Text Component! Edit this text and watch it scroll...",
  width = 400,
  height = 100,
  onHeaderMouseDown,
  onDelete,
}) => {
  // States
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(2); // pixels per frame
  const [position, setPosition] = useState(-width);
  const [direction, setDirection] = useState<"ltr" | "rtl">("rtl"); // left-to-right or right-to-left

  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const textWidthRef = useRef<number>(0);

  // For editing mode
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize animation
  useEffect(() => {
    if (textRef.current) {
      textWidthRef.current = textRef.current.offsetWidth;
    }
  }, [text]);

  // Animation loop
  useEffect(() => {
    if (isEditing || isPaused) return;

    const animate = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;

      if (direction === "rtl") {
        // Right to left animation (classic marquee)
        setPosition((prevPos) => {
          const newPos = prevPos - speed;
          // Reset position when text has scrolled completely past the left edge
          if (newPos < -textWidthRef.current) {
            return containerWidth;
          }
          return newPos;
        });
      } else {
        // Left to right animation
        setPosition((prevPos) => {
          const newPos = prevPos + speed;
          // Reset position when text has scrolled completely past the right edge
          if (newPos > containerWidth) {
            return -textWidthRef.current;
          }
          return newPos;
        });
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isEditing, isPaused, speed, direction]);

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleDirectionToggle = () => {
    setDirection((prev) => (prev === "rtl" ? "ltr" : "rtl"));
    // Reset position when changing direction
    if (direction === "rtl") {
      setPosition(-textWidthRef.current);
    } else {
      setPosition(containerRef.current?.offsetWidth || 0);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(Math.max(1, Math.min(10, newSpeed))); // Clamp between 1-10
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setIsEditing(true);
      setIsPaused(true);
    } else {
      setIsEditing(false);
      if (textareaRef.current) {
        setText(textareaRef.current.value);
      }
      // Don't automatically unpause when exiting edit mode
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      style={{ width, height }}
    >
      <ComponentHeader
        title="Scrolling Text"
        icon={ScrollText}
        iconColor="bg-pink-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <div className="flex items-center space-x-1">
            <button
              className={`p-1 rounded-full hover:bg-gray-200 text-gray-500 ${
                isEditing ? "bg-blue-100 text-blue-600" : ""
              }`}
              onClick={handleEditToggle}
              title={isEditing ? "Save" : "Edit text"}
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              className={`p-1 rounded-full hover:bg-gray-200 text-gray-500 ${
                isPaused ? "bg-gray-200" : ""
              }`}
              onClick={handlePauseToggle}
              disabled={isEditing}
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
            <button
              className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
              onClick={handleDirectionToggle}
              disabled={isEditing}
              title="Change direction"
            >
              {direction === "rtl" ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        }
      />

      {/* Content Area */}
      <div
        className="relative overflow-hidden"
        style={{ height: height - 40 }}
        ref={containerRef}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            defaultValue={text}
            className="w-full h-full p-3 text-sm border-none resize-none focus:outline-none"
            placeholder="Enter text to display..."
            style={{ fontSize: "16px" }}
          />
        ) : (
          <>
            <div
              ref={textRef}
              className="absolute whitespace-nowrap"
              style={{
                left: `${position}px`,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "18px",
                fontWeight: 500,
                color: "#333",
              }}
            >
              {text || "Enter some text..."}
            </div>
          </>
        )}
      </div>

      {/* Speed Controls */}
      {!isEditing && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-2 py-1">
          <div className="flex items-center space-x-1">
            <button
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
              onClick={() => handleSpeedChange(speed - 1)}
              disabled={speed <= 1}
            >
              <span className="text-xs font-bold">-</span>
            </button>
            <div className="text-xs text-gray-600">Speed: {speed}</div>
            <button
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
              onClick={() => handleSpeedChange(speed + 1)}
              disabled={speed >= 10}
            >
              <span className="text-xs font-bold">+</span>
            </button>
          </div>
          <button
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
            onClick={() => {
              setPosition(
                direction === "rtl"
                  ? containerRef.current?.offsetWidth || 0
                  : -textWidthRef.current
              );
            }}
            title="Reset position"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
