/**
 * Whiteboard Provider - Centralized state and context for whiteboard features
 *
 * This provider combines all whiteboard-related hooks and state management
 * to reduce complexity in App.tsx and provide better separation of concerns.
 */

import React, { createContext, useContext, ReactNode } from "react";
import { useWhiteboardStore } from "../../store/whiteboardStore";
import { useZoomControls } from "../../hooks/useZoomControls";
import { usePanControls } from "../../hooks/usePanControls";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useEventHandlers } from "../../hooks/useEventHandlers";
import { Component } from "../../types/whiteboard";

interface WhiteboardContextValue {
  // Store state
  components: Component[];
  selectedComponents: number[];
  copiedComponents: Component[];

  // Store actions
  setComponents: (
    components: Component[] | ((prev: Component[]) => Component[])
  ) => void;
  setSelectedComponents: (
    components: number[] | ((prev: number[]) => number[])
  ) => void;
  setCopiedComponents: (components: Component[]) => void;
  handleDeleteComponent: (id: number) => void;
  handleDeleteSelected: () => void;
  addNewComponent: (component: Component) => void;
  handleResizeComponent: (id: number, width: number, height: number) => void;
  handleTextChange: (id: number, text: string) => void;
  handleImageChange: (id: number, image: string) => void;
  handleFormattingChange: (id: number, formatting: any) => void;
  handleDrag: (
    id: number,
    deltaX: number,
    deltaY: number,
    shiftPressed: boolean
  ) => void;
  handleSelect: (id: number) => void;
  handleDragStart: (id: number) => void;

  // Zoom controls
  transform: d3.ZoomTransform;
  showZoomIndicator: boolean;
  isActivelyZooming: boolean;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;

  // Refs for D3 integration
  svgRef: React.RefObject<SVGSVGElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

const WhiteboardContext = createContext<WhiteboardContextValue | null>(null);

interface WhiteboardProviderProps {
  children: ReactNode;
}

export const WhiteboardProvider: React.FC<WhiteboardProviderProps> = ({
  children,
}) => {
  // Combine all whiteboard-related hooks here
  const storeState = useWhiteboardStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomControls = useZoomControls({
    svgRef,
    components: storeState.components,
    selectedComponents: storeState.selectedComponents,
  });

  // Additional hooks would be integrated here...

  const contextValue: WhiteboardContextValue = {
    ...storeState,
    ...zoomControls,
    svgRef,
    containerRef,
  };

  return (
    <WhiteboardContext.Provider value={contextValue}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("useWhiteboard must be used within a WhiteboardProvider");
  }
  return context;
};
