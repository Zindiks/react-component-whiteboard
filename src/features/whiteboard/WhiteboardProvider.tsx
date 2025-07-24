/**
 * Whiteboard Provider - Centralized state and context for whiteboard features
 *
 * This provider combines all whiteboard-related hooks and state management
 * to reduce complexity in App.tsx and provide better separation of concerns.
 */

import React, { createContext, ReactNode, useRef } from "react";
import { useWhiteboardStore } from "../../store/whiteboardStore";
import {
  useZoomControls,
  UseZoomControlsReturn,
} from "../../hooks/useZoomControls";
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
    selectedComponents: number[] | ((prev: number[]) => number[])
  ) => void;
  setCopiedComponents: (components: Component[]) => void;
  handleDeleteComponent: (id: number) => void;
  handleDeleteSelected: () => void;
  addNewComponent: (type: string, x?: number, y?: number) => number | undefined;
  handleResizeComponent: (id: number, width: number, height: number) => void;
  handleTextChange: (id: number, text: string) => void;
  handleImageChange: (id: number, image: string) => void;
  handleFormattingChange: (
    id: number,
    formatting: Record<string, unknown>
  ) => void;
  handleDrag: (
    id: number,
    deltaX: number,
    deltaY: number,
    zoomLevel?: number,
    enableSnap?: boolean
  ) => void;
  handleSelect: (id: number) => void;
  handleDragStart: (id: number) => void;

  // Zoom controls
  zoomControls: UseZoomControlsReturn;

  // Refs for D3 integration
  svgRef: React.RefObject<SVGSVGElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const WhiteboardContext = createContext<WhiteboardContextValue | null>(
  null
);

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
  // const panControls = usePanControls({ containerRef });
  // const dragAndDrop = useDragAndDrop({ svgRef, containerRef });
  // const eventHandlers = useEventHandlers({ svgRef, containerRef });

  const contextValue: WhiteboardContextValue = {
    // Store state and actions
    components: storeState.components,
    selectedComponents: storeState.selectedComponents,
    copiedComponents: storeState.copiedComponents,
    setComponents: storeState.setComponents,
    setSelectedComponents: storeState.setSelectedComponents,
    setCopiedComponents: storeState.setCopiedComponents,
    handleDeleteComponent: storeState.handleDeleteComponent,
    handleDeleteSelected: storeState.handleDeleteSelected,
    addNewComponent: storeState.addNewComponent,
    handleResizeComponent: storeState.handleResizeComponent,
    handleTextChange: storeState.handleTextChange,
    handleImageChange: storeState.handleImageChange,
    handleFormattingChange: storeState.handleFormattingChange,
    handleDrag: storeState.handleDrag,
    handleSelect: storeState.handleSelect,
    handleDragStart: storeState.handleDragStart,

    // Zoom controls
    zoomControls,

    // Refs
    svgRef,
    containerRef,
  };

  return (
    <WhiteboardContext.Provider value={contextValue}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export type { WhiteboardContextValue };
