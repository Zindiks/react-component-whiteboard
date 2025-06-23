import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Minus, Plus } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { WIDGET_CONSTANTS } from "../../constants/appConstants";

interface ScrollingTextProps {
  initialText?: string;
  width?: number;
  height?: number;
}

export const ScrollingText: React.FC<ScrollingTextProps> = ({
  initialText = "Welcome to the Scrolling Text Component! Edit this text and watch it scroll...",
  width = WIDGET_CONSTANTS.SCROLLING_TEXT_DEFAULT_WIDTH,
  height = 100,
}) => {
  // States
  const [text] = useState(initialText);
  const [speed, setSpeed] = useState(2); // pixels per frame
  const [position, setPosition] = useState(-width);

  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const textWidthRef = useRef<number>(0);

  // Initialize animation
  useEffect(() => {
    if (textRef.current) {
      textWidthRef.current = textRef.current.offsetWidth;
    }
  }, [text]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;

      // Right to left animation (classic marquee)
      setPosition((prevPos) => {
        const newPos = prevPos - speed;
        // Reset position when text has scrolled completely past the left edge
        if (newPos < -textWidthRef.current) {
          return containerWidth;
        }
        return newPos;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [speed]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(Math.max(1, Math.min(10, newSpeed))); // Clamp between 1-10
  };

  return (
    <Card className="border-gray-200 overflow-hidden" style={{ width, height }}>
      {/* Content Area */}
      <div
        className="relative overflow-hidden"
        style={{ height: height - 30 }}
        ref={containerRef}
      >
        <div
          ref={textRef}
          className="absolute whitespace-nowrap text-lg font-medium"
          style={{
            left: `${position}px`,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {text || "Enter some text..."}
        </div>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center justify-between border-t bg-muted px-2 py-1">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleSpeedChange(speed - 1)}
            disabled={speed <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="text-xs text-muted-foreground">Speed: {speed}</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleSpeedChange(speed + 1)}
            disabled={speed >= 10}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            setPosition(containerRef.current?.offsetWidth || 0);
          }}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};
