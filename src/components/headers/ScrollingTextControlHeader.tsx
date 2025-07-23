import React from "react";
import { ComponentHeader } from "../ui/ComponentHeader";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  ArrowRight,
  ArrowDown,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Component } from "../../types/whiteboard";

interface ScrollingTextControlHeaderProps {
  selectedComponent: Component;
  position: { x: number; y: number };
  onFormattingChange: (id: number, options: Record<string, unknown>) => void;
}

// Font size options with more variety
const FONT_SIZES = [
  { value: "10", label: "10px (Tiny)" },
  { value: "12", label: "12px (Small)" },
  { value: "14", label: "14px (Normal)" },
  { value: "16", label: "16px (Medium)" },
  { value: "18", label: "18px (Large)" },
  { value: "20", label: "20px (XL)" },
  { value: "24", label: "24px (XXL)" },
  { value: "28", label: "28px (Huge)" },
  { value: "32", label: "32px (Giant)" },
  { value: "40", label: "40px (Massive)" },
];

// Font family options with web-safe fonts
const FONT_FAMILIES = [
  { value: "Arial", label: "Arial (Sans-serif)" },
  { value: "Helvetica", label: "Helvetica (Sans-serif)" },
  { value: "Georgia", label: "Georgia (Serif)" },
  { value: "Times New Roman", label: "Times New Roman (Serif)" },
  { value: "Courier New", label: "Courier New (Monospace)" },
  { value: "Verdana", label: "Verdana (Sans-serif)" },
  { value: "Impact", label: "Impact (Bold)" },
  { value: "Comic Sans MS", label: "Comic Sans MS (Casual)" },
];

// Scroll speed options
const SCROLL_SPEEDS = [
  { value: "10", label: "Very Slow (10px/s)" },
  { value: "25", label: "Slow (25px/s)" },
  { value: "50", label: "Normal (50px/s)" },
  { value: "75", label: "Fast (75px/s)" },
  { value: "100", label: "Very Fast (100px/s)" },
  { value: "150", label: "Super Fast (150px/s)" },
  { value: "200", label: "Ultra Fast (200px/s)" },
];

export const ScrollingTextControlHeader: React.FC<
  ScrollingTextControlHeaderProps
> = ({ selectedComponent, position, onFormattingChange }) => {
  const handleFormattingChange = (options: Record<string, unknown>) => {
    onFormattingChange(selectedComponent.id, options);
  };

  const renderTextControls = () => (
    <>
      {/* Font Size */}
      <Select
        value={String(selectedComponent.fontSize || 16)}
        onValueChange={(value) => {
          handleFormattingChange({ fontSize: Number(value) });
        }}
      >
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Family */}
      <Select
        value={selectedComponent.fontFamily || "Arial"}
        onValueChange={(value) => {
          handleFormattingChange({ fontFamily: value });
        }}
      >
        <SelectTrigger className="w-40 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Text Color Picker */}
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={selectedComponent.textColor || "#374151"}
          onChange={(e) => {
            handleFormattingChange({ textColor: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded border border-border cursor-pointer"
          title="Text Color"
        />
      </div>

      {/* Text Align */}
      <div className="flex items-center gap-1">
        <Button
          variant={selectedComponent.textAlign === "left" ? "default" : "ghost"}
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({ textAlign: "left" });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={
            selectedComponent.textAlign === "center" ? "default" : "ghost"
          }
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({ textAlign: "center" });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={
            selectedComponent.textAlign === "right" ? "default" : "ghost"
          }
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({ textAlign: "right" });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Bold/Italic */}
      <div className="flex items-center gap-1">
        <Button
          variant={
            selectedComponent.fontWeight === "bold" ? "default" : "ghost"
          }
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({
              fontWeight:
                selectedComponent.fontWeight === "bold" ? "normal" : "bold",
            });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={
            selectedComponent.fontStyle === "italic" ? "default" : "ghost"
          }
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({
              fontStyle:
                selectedComponent.fontStyle === "italic" ? "normal" : "italic",
            });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  const renderScrollingControls = () => (
    <>
      {/* Scroll Direction */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[50px] text-foreground">
          Direction:
        </span>
        <Button
          variant={
            selectedComponent.scrollDirection === "horizontal"
              ? "default"
              : "ghost"
          }
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({ scrollDirection: "horizontal" });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
          title="Horizontal Scroll"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant={
            selectedComponent.scrollDirection === "vertical"
              ? "default"
              : "ghost"
          }
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({ scrollDirection: "vertical" });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
          title="Vertical Scroll"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Scroll Speed */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Speed:
        </span>
        <Select
          value={String(selectedComponent.scrollSpeed || 50)}
          onValueChange={(value) => {
            handleFormattingChange({ scrollSpeed: Number(value) });
          }}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCROLL_SPEEDS.map((speed) => (
              <SelectItem key={speed.value} value={speed.value}>
                {speed.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pause on Hover */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Hover:
        </span>
        <Button
          variant={selectedComponent.pauseOnHover ? "default" : "ghost"}
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({
              pauseOnHover: !selectedComponent.pauseOnHover,
            });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
          title={
            selectedComponent.pauseOnHover
              ? "Pause on Hover: ON"
              : "Pause on Hover: OFF"
          }
        >
          {selectedComponent.pauseOnHover ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Bounce on End */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Bounce:
        </span>
        <Button
          variant={selectedComponent.bounceOnEnd ? "default" : "ghost"}
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleFormattingChange({
              bounceOnEnd: !selectedComponent.bounceOnEnd,
            });
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8"
          title={selectedComponent.bounceOnEnd ? "Bounce: ON" : "Bounce: OFF"}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Background Color */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Background:
        </span>
        <input
          type="color"
          value={selectedComponent.backgroundColor || "#ffffff"}
          onChange={(e) => {
            handleFormattingChange({ backgroundColor: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded border border-border cursor-pointer"
          title="Background Color"
        />
      </div>
    </>
  );

  return (
    <ComponentHeader position={position}>
      <div className="flex flex-wrap items-center gap-2 p-2">
        {/* Text Formatting Controls */}
        {renderTextControls()}

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Scrolling Controls */}
        {renderScrollingControls()}
      </div>
    </ComponentHeader>
  );
};
