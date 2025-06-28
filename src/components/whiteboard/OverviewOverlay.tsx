import React from "react";
import { Overview } from "../Overview";
import { Component } from "../../types/whiteboard";

interface OverviewOverlayProps {
  show: boolean;
  components: Component[];
  selectedComponents: number[];
  transform: any;
  onNavigateToComponent: (component: Component) => void;
  onClose: () => void;
  getWhiteboardBounds: () => any;
  zIndex: number;
  overviewRef: React.RefObject<HTMLDivElement>;
}

export const OverviewOverlay: React.FC<OverviewOverlayProps> = ({
  show,
  components,
  selectedComponents,
  transform,
  onNavigateToComponent,
  onClose,
  getWhiteboardBounds,
  zIndex,
  overviewRef,
}) => {
  if (!show) return null;
  return (
    <div
      ref={overviewRef}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border rounded-xl shadow-2xl overflow-hidden"
      style={{
        zIndex,
        maxWidth: "80vw",
        maxHeight: "80vh",
      }}
    >
      <Overview
        components={components}
        selectedComponents={selectedComponents}
        transform={transform}
        onNavigateToComponent={onNavigateToComponent}
        onClose={onClose}
        getWhiteboardBounds={getWhiteboardBounds}
      />
    </div>
  );
};
