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
  X,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Component } from "../../types/whiteboard";

interface ShapeControlHeaderProps {
  selectedComponent: Component;
  position: { x: number; y: number };
  onFormattingChange: (id: number, options: Record<string, unknown>) => void;
  onClose: () => void;
  onStartArrowConnection?: (arrowId: number) => void;
  onCancelArrowConnection?: () => void;
  onDisconnectArrow?: (arrowId: number) => void;
  connectionMode?: {
    active: boolean;
    selectedArrowId?: number | null;
    connectionStep?: "start" | "end" | null;
  };
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

// Border width options with descriptive labels
const BORDER_WIDTHS = [
  { value: "0", label: "None (0px)" },
  { value: "1", label: "Thin (1px)" },
  { value: "2", label: "Normal (2px)" },
  { value: "3", label: "Medium (3px)" },
  { value: "4", label: "Thick (4px)" },
  { value: "6", label: "Bold (6px)" },
  { value: "8", label: "Heavy (8px)" },
  { value: "10", label: "Massive (10px)" },
];

// Border radius options with descriptive labels
const BORDER_RADIUS_OPTIONS = [
  { value: "0", label: "Sharp (0px)" },
  { value: "2", label: "Slight (2px)" },
  { value: "4", label: "Small (4px)" },
  { value: "8", label: "Medium (8px)" },
  { value: "12", label: "Large (12px)" },
  { value: "16", label: "XL (16px)" },
  { value: "20", label: "XXL (20px)" },
  { value: "24", label: "Huge (24px)" },
  { value: "32", label: "Giant (32px)" },
  { value: "50", label: "Pill (50px)" },
];

// Stroke style options
const STROKE_STYLES = [
  { value: "solid", label: "Solid Line" },
  { value: "dashed", label: "Dashed Line" },
  { value: "dotted", label: "Dotted Line" },
];

// Arrow style options
const ARROW_STYLES = [
  { value: "none", label: "No Arrow" },
  { value: "arrow", label: "Single Arrow" },
  { value: "double-arrow", label: "Double Arrow" },
];

// Arrow size options
const ARROW_SIZES = [
  { value: "4", label: "Tiny (4px)" },
  { value: "6", label: "Small (6px)" },
  { value: "8", label: "Medium (8px)" },
  { value: "10", label: "Normal (10px)" },
  { value: "12", label: "Large (12px)" },
  { value: "14", label: "XL (14px)" },
  { value: "16", label: "XXL (16px)" },
  { value: "18", label: "Huge (18px)" },
];

// Bend style options
const BEND_STYLES = [
  { value: "straight", label: "Straight" },
  { value: "elbowed", label: "Elbowed (L-shaped)" },
  { value: "curved", label: "Curved" },
];

// Bend radius options for curved arrows
const BEND_RADIUS_OPTIONS = [
  { value: "10", label: "Small (10px)" },
  { value: "15", label: "Medium (15px)" },
  { value: "20", label: "Normal (20px)" },
  { value: "25", label: "Large (25px)" },
  { value: "30", label: "XL (30px)" },
  { value: "40", label: "XXL (40px)" },
];

// Elbow offset options for elbowed arrows
const ELBOW_OFFSET_OPTIONS = [
  { value: "20", label: "Close (20%)" },
  { value: "30", label: "Near (30%)" },
  { value: "40", label: "Medium (40%)" },
  { value: "50", label: "Center (50%)" },
  { value: "60", label: "Far (60%)" },
  { value: "70", label: "Distant (70%)" },
  { value: "80", label: "Very Far (80%)" },
];

export const ShapeControlHeader: React.FC<ShapeControlHeaderProps> = ({
  selectedComponent,
  position,
  onFormattingChange,
  onClose,
  onStartArrowConnection,
  onCancelArrowConnection,
  onDisconnectArrow,
  connectionMode,
}) => {
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
          <AlignRight className="h-4 w-4" />
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

  const renderShapeControls = () => (
    <>
      {/* Fill Color Picker */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Fill:
        </span>
        <input
          type="color"
          value={selectedComponent.fillColor || "#f3f4f6"}
          onChange={(e) => {
            handleFormattingChange({ fillColor: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded border border-border cursor-pointer"
          title="Fill Color"
        />
      </div>

      {/* Border Color Picker */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Border:
        </span>
        <input
          type="color"
          value={selectedComponent.strokeColor || "#9ca3af"}
          onChange={(e) => {
            handleFormattingChange({ strokeColor: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded border border-border cursor-pointer"
          title="Border Color"
        />
      </div>

      {/* Border Width */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Width:
        </span>
        <Select
          value={String(selectedComponent.strokeWidth || 2)}
          onValueChange={(value) => {
            handleFormattingChange({ strokeWidth: Number(value) });
          }}
        >
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BORDER_WIDTHS.map((width) => (
              <SelectItem key={width.value} value={width.value}>
                {width.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Border Radius (for rectangle only) */}
      {selectedComponent.type === "rectangle" && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium min-w-[40px] text-foreground">
            Radius:
          </span>
          <Select
            value={String(selectedComponent.borderRadius || 8)}
            onValueChange={(value) => {
              handleFormattingChange({ borderRadius: Number(value) });
            }}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BORDER_RADIUS_OPTIONS.map((radius) => (
                <SelectItem key={radius.value} value={radius.value}>
                  {radius.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );

  const renderLineControls = () => (
    <>
      {/* Stroke Color Picker */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Color:
        </span>
        <input
          type="color"
          value={selectedComponent.strokeColor || "#9ca3af"}
          onChange={(e) => {
            handleFormattingChange({ strokeColor: e.target.value });
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded border border-border cursor-pointer"
          title="Stroke Color"
        />
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Width:
        </span>
        <Select
          value={String(selectedComponent.strokeWidth || 2)}
          onValueChange={(value) => {
            handleFormattingChange({ strokeWidth: Number(value) });
          }}
        >
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BORDER_WIDTHS.filter((w) => w.value !== "0").map((width) => (
              <SelectItem key={width.value} value={width.value}>
                {width.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stroke Style */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium min-w-[40px] text-foreground">
          Style:
        </span>
        <Select
          value={selectedComponent.strokeStyle || "solid"}
          onValueChange={(value) => {
            handleFormattingChange({
              strokeStyle: value as "solid" | "dashed" | "dotted",
            });
          }}
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STROKE_STYLES.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Arrow Style (for arrow only) */}
      {selectedComponent.type === "arrow" && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium min-w-[40px] text-foreground">
            Arrow:
          </span>
          <Select
            value={selectedComponent.arrowStyle || "arrow"}
            onValueChange={(value) => {
              handleFormattingChange({
                arrowStyle: value as "none" | "arrow" | "double-arrow",
              });
            }}
          >
            <SelectTrigger className="w-30 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARROW_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Arrow Size (for arrow only) */}
      {selectedComponent.type === "arrow" && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium min-w-[40px] text-foreground">
            Size:
          </span>
          <Select
            value={String(selectedComponent.arrowSize || 10)}
            onValueChange={(value) => {
              handleFormattingChange({ arrowSize: Number(value) });
            }}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ARROW_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Bend Style (for smart arrow only) */}
      {selectedComponent.type === "smartArrow" && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium min-w-[40px] text-foreground">
            Bend:
          </span>
          <Select
            value={selectedComponent.bendStyle || "straight"}
            onValueChange={(value) => {
              handleFormattingChange({
                bendStyle: value as "straight" | "elbowed" | "curved",
              });
            }}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BEND_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Bend Radius (for curved smart arrows only) */}
      {selectedComponent.type === "smartArrow" &&
        selectedComponent.bendStyle === "curved" && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium min-w-[50px] text-foreground">
              Radius:
            </span>
            <Select
              value={String(selectedComponent.bendRadius || 20)}
              onValueChange={(value) => {
                handleFormattingChange({ bendRadius: Number(value) });
              }}
            >
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BEND_RADIUS_OPTIONS.map((radius) => (
                  <SelectItem key={radius.value} value={radius.value}>
                    {radius.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

      {/* Elbow Offset (for elbowed smart arrows only) */}
      {selectedComponent.type === "smartArrow" &&
        selectedComponent.bendStyle === "elbowed" && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium min-w-[50px] text-foreground">
              Offset:
            </span>
            <Select
              value={String(selectedComponent.elbowOffset || 50)}
              onValueChange={(value) => {
                handleFormattingChange({ elbowOffset: Number(value) });
              }}
            >
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ELBOW_OFFSET_OPTIONS.map((offset) => (
                  <SelectItem key={offset.value} value={offset.value}>
                    {offset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
    </>
  );

  const renderImageControls = () => (
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium min-w-[40px] text-foreground">
        Radius:
      </span>
      <Select
        value={String(selectedComponent.borderRadius || 8)}
        onValueChange={(value) => {
          handleFormattingChange({ borderRadius: Number(value) });
        }}
      >
        <SelectTrigger className="w-24 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BORDER_RADIUS_OPTIONS.map((radius) => (
            <SelectItem key={radius.value} value={radius.value}>
              {radius.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <ComponentHeader
      position={position}
      visible={true}
      headerWidth="auto"
      offsetY={-40}
    >
      {/* Shape-specific controls */}
      {selectedComponent.type === "text" && renderTextControls()}

      {/* Shape formatting controls */}
      {(selectedComponent.type === "rectangle" ||
        selectedComponent.type === "circle" ||
        selectedComponent.type === "ellipse") &&
        renderShapeControls()}

      {/* Line and Arrow specific controls */}
      {(selectedComponent.type === "line" ||
        selectedComponent.type === "arrow") &&
        renderLineControls()}

      {/* Image specific controls */}
      {selectedComponent.type === "image" && renderImageControls()}

      {/* Smart Arrow Connection Controls */}
      {selectedComponent.type === "smartArrow" && (
        <>
          {connectionMode?.active &&
          connectionMode.selectedArrowId === selectedComponent.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-600">
                {connectionMode.connectionStep === "start"
                  ? "1. Click first shape to connect"
                  : "2. Click second shape to connect"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelArrowConnection?.();
                }}
                className="h-6 text-xs"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartArrowConnection?.(selectedComponent.id);
                }}
                className="h-6 text-xs bg-blue-50 hover:bg-blue-100"
              >
                🔗 Connect Shapes
              </Button>
              {(selectedComponent.startShapeId ||
                selectedComponent.endShapeId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDisconnectArrow?.(selectedComponent.id);
                  }}
                  className="h-6 text-xs text-red-600 hover:bg-red-50"
                >
                  🔌 Disconnect
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </ComponentHeader>
  );
};
