/**
 * Overview Component
 *
 * This component provides a minimap/overview of the whiteboard that shows:
 * - All components positioned on the whiteboard
 * - Current viewport indicator
 * - Navigation functionality to jump to specific components
 * - Statistics about the whiteboard state
 * - Visual indicators for selected components
 */

import React from "react";
import * as d3 from "d3";
import { Component } from "../types/whiteboard";

export interface OverviewProps {
  components: Component[];
  selectedComponents: number[];
  transform: d3.ZoomTransform;
  onNavigateToComponent: (component: Component) => void;
  onClose: () => void;
  getWhiteboardBounds: () => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export const Overview: React.FC<OverviewProps> = ({
  components,
  selectedComponents,
  transform,
  onNavigateToComponent,
  onClose,
  getWhiteboardBounds,
}) => {
  const bounds = getWhiteboardBounds();
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  // Calculate overview dimensions
  const maxOverviewWidth = 600;
  const maxOverviewHeight = 400;
  const aspectRatio = boundsWidth / boundsHeight;

  let overviewWidth = maxOverviewWidth;
  let overviewHeight = maxOverviewWidth / aspectRatio;

  if (overviewHeight > maxOverviewHeight) {
    overviewHeight = maxOverviewHeight;
    overviewWidth = maxOverviewHeight * aspectRatio;
  }

  const scale = overviewWidth / boundsWidth;

  // Calculate current viewport rectangle in overview coordinates
  const viewportLeft = (-transform.x / transform.k - bounds.minX) * scale;
  const viewportTop = (-transform.y / transform.k - bounds.minY) * scale;
  const viewportWidth = (window.innerWidth / transform.k) * scale;
  const viewportHeight = (window.innerHeight / transform.k) * scale;

  const getComponentColor = (type: string) => {
    switch (type) {
      case "timer":
        return "#f59e0b";
      case "weather":
        return "#06b6d4";
      case "bitcoin":
        return "#f97316";
      case "currency":
        return "#10b981";
      case "note":
        return "#8b5cf6";
      case "confetti":
        return "#ec4899";
      case "watch":
        return "#6366f1";
      case "scrollingtext":
        return "#14b8a6";
      case "youtubeVideo":
        return "#ef4444";
      case "soundcloud":
        return "#f97316";
      case "spotify":
        return "#22c55e";
      case "stylishlink":
        return "#3b82f6";
      case "imageShape":
        return "#6b7280";
      case "pdfShape":
        return "#dc2626";
      case "rectangle":
        return "#3b82f6";
      case "ellipse":
        return "#10b981";
      case "line":
        return "#ef4444";
      case "arrow":
        return "#f59e0b";
      case "text":
        return "#8b5cf6";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Whiteboard Overview
          </h3>
          <p className="text-sm text-muted-foreground">
            {components.length} components • Click to navigate
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Close overview"
        >
          ✕
        </button>
      </div>

      {/* Overview Canvas */}
      <div className="p-4">
        <div
          className="relative border rounded-lg overflow-hidden"
          style={{
            width: `${overviewWidth}px`,
            height: `${overviewHeight}px`,
            backgroundColor: "#f8fafc",
          }}
        >
          {/* Grid pattern */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="overview-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#overview-grid)" />
          </svg>

          {/* Current viewport indicator */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={{
              left: `${Math.max(0, viewportLeft)}px`,
              top: `${Math.max(0, viewportTop)}px`,
              width: `${Math.min(
                overviewWidth - Math.max(0, viewportLeft),
                viewportWidth
              )}px`,
              height: `${Math.min(
                overviewHeight - Math.max(0, viewportTop),
                viewportHeight
              )}px`,
            }}
          />

          {/* Components */}
          {components.map((component) => {
            const x = (component.x - bounds.minX) * scale;
            const y = (component.y - bounds.minY) * scale;
            const width = (component.width || 200) * scale;
            const height = (component.height || 200) * scale;
            const isSelected = selectedComponents.includes(component.id);

            return (
              <div
                key={component.id}
                className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${Math.max(4, width)}px`,
                  height: `${Math.max(4, height)}px`,
                  backgroundColor: getComponentColor(component.type),
                  borderRadius: "2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onClick={() => onNavigateToComponent(component)}
                title={`${component.type} (ID: ${component.id})`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded border"></div>
            <span>Current View</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 ring-2 ring-blue-500 rounded border"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg text-sm">
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {components.length}
            </div>
            <div className="text-muted-foreground">Components</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {selectedComponents.length}
            </div>
            <div className="text-muted-foreground">Selected</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {Math.round(transform.k * 100)}%
            </div>
            <div className="text-muted-foreground">Zoom</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Navigation:</strong>
          </p>
          <p>• Click any component to navigate to it</p>
          <p>
            • Press <kbd className="px-1 py-0.5 bg-muted rounded">3</kbd> or{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded">O</kbd> to toggle
            overview
          </p>
          <p>
            • Press <kbd className="px-1 py-0.5 bg-muted rounded">Escape</kbd>{" "}
            to close
          </p>
        </div>
      </div>
    </div>
  );
};
