/**
 * Unified Whiteboard Store
 *
 * Combines all whiteboard functionality in a single Zustand store
 * Replaces React Context with pure Zustand for better performance
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Component } from "../types/whiteboard";
import { useComponentStore } from "./componentStore";
import { useSelectionStore } from "./selectionStore";

// UI State types
interface UIState {
  showZoomIndicator: boolean;
  isActivelyZooming: boolean;
  isDragging: boolean;
  isEditingText: boolean;
  editingComponentId: number | null;
  sidebarOpen: boolean;
  currentTool: "select" | "pan" | "zoom";
}

// Zoom state types
interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

// Combined store interface
interface UnifiedWhiteboardState extends UIState, ZoomState {
  // Component operations (delegated to componentStore)
  addComponent: (component: Omit<Component, "id">) => number;
  updateComponent: (id: number, updates: Partial<Component>) => void;
  deleteComponent: (id: number) => void;
  duplicateComponent: (id: number) => number | undefined;
  getComponentById: (id: number) => Component | undefined;
  getAllComponents: () => Component[];

  // Selection operations (delegated to selectionStore)
  selectComponent: (id: number) => void;
  selectMultiple: (ids: number[]) => void;
  toggleSelection: (id: number) => void;
  clearSelection: () => void;
  getSelectedComponents: () => number[];
  copySelected: () => void;
  pasteComponents: (offsetX?: number, offsetY?: number) => void;
  deleteSelected: () => void;

  // UI actions
  setShowZoomIndicator: (show: boolean) => void;
  setIsActivelyZooming: (zooming: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setEditingComponent: (id: number | null) => void;
  toggleSidebar: () => void;
  setCurrentTool: (tool: "select" | "pan" | "zoom") => void;

  // Zoom actions
  setZoom: (scale: number, translateX: number, translateY: number) => void;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;

  // Computed getters
  getTransform: () => string;
  getVisibleComponents: () => Component[];
  getSelectedComponentsData: () => Component[];
}

export const useUnifiedWhiteboardStore = create<UnifiedWhiteboardState>()(
  subscribeWithSelector((set, get) => ({
    // Initial UI state
    showZoomIndicator: false,
    isActivelyZooming: false,
    isDragging: false,
    isEditingText: false,
    editingComponentId: null,
    sidebarOpen: true,
    currentTool: "select",

    // Initial zoom state
    scale: 1,
    translateX: 0,
    translateY: 0,

    // Component operations (delegate to componentStore)
    addComponent: (componentData) => {
      return useComponentStore.getState().addComponent(componentData);
    },

    updateComponent: (id, updates) => {
      useComponentStore.getState().updateComponent(id, updates);
    },

    deleteComponent: (id) => {
      // Remove from selection first
      const currentSelection = useSelectionStore.getState().selectedComponents;
      if (currentSelection.includes(id)) {
        useSelectionStore.getState().toggleSelection(id);
      }
      // Then delete the component
      useComponentStore.getState().deleteComponent(id);
    },

    duplicateComponent: (id) => {
      return useComponentStore.getState().duplicateComponent(id);
    },

    getComponentById: (id) => {
      return useComponentStore.getState().getComponentById(id);
    },

    getAllComponents: () => {
      return useComponentStore.getState().getAllComponents();
    },

    // Selection operations (delegate to selectionStore)
    selectComponent: (id) => {
      useSelectionStore.getState().selectComponent(id);
    },

    selectMultiple: (ids) => {
      useSelectionStore.getState().selectMultiple(ids);
    },

    toggleSelection: (id) => {
      useSelectionStore.getState().toggleSelection(id);
    },

    clearSelection: () => {
      useSelectionStore.getState().clearSelection();
    },

    getSelectedComponents: () => {
      return useSelectionStore.getState().selectedComponents;
    },

    copySelected: () => {
      useSelectionStore.getState().copySelected();
    },

    pasteComponents: (offsetX = 20, offsetY = 20) => {
      const componentStore = useComponentStore.getState();
      useSelectionStore
        .getState()
        .pasteComponents(
          componentStore.getComponentById,
          componentStore.addComponent,
          offsetX,
          offsetY
        );
    },

    deleteSelected: () => {
      const selectedIds = useSelectionStore.getState().selectedComponents;
      selectedIds.forEach((id) => {
        useComponentStore.getState().deleteComponent(id);
      });
      useSelectionStore.getState().clearSelection();
    },

    // UI actions
    setShowZoomIndicator: (show) => {
      set({ showZoomIndicator: show });
    },

    setIsActivelyZooming: (zooming) => {
      set({ isActivelyZooming: zooming });
    },

    setIsDragging: (dragging) => {
      set({ isDragging: dragging });
    },

    setEditingComponent: (id) => {
      set({
        editingComponentId: id,
        isEditingText: id !== null,
      });
    },

    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setCurrentTool: (tool) => {
      set({ currentTool: tool });
    },

    // Zoom actions
    setZoom: (scale, translateX, translateY) => {
      set({ scale, translateX, translateY });
    },

    resetZoom: () => {
      set({
        scale: 1,
        translateX: 0,
        translateY: 0,
        showZoomIndicator: true,
      });

      // Hide zoom indicator after 2 seconds
      setTimeout(() => {
        set({ showZoomIndicator: false });
      }, 2000);
    },

    zoomToFit: () => {
      const components = useComponentStore.getState().getAllComponents();
      if (components.length === 0) return;

      // Calculate bounding box of all components
      const padding = 50;
      const minX = Math.min(...components.map((c) => c.x)) - padding;
      const minY = Math.min(...components.map((c) => c.y)) - padding;
      const maxX =
        Math.max(...components.map((c) => c.x + (c.width || 200))) + padding;
      const maxY =
        Math.max(...components.map((c) => c.y + (c.height || 150))) + padding;

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      // Assume viewport size (could be passed as parameter)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const scaleX = viewportWidth / contentWidth;
      const scaleY = viewportHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

      const translateX =
        (viewportWidth - contentWidth * scale) / 2 - minX * scale;
      const translateY =
        (viewportHeight - contentHeight * scale) / 2 - minY * scale;

      set({
        scale,
        translateX,
        translateY,
        showZoomIndicator: true,
      });

      setTimeout(() => {
        set({ showZoomIndicator: false });
      }, 2000);
    },

    zoomToSelection: () => {
      const selectedIds = useSelectionStore.getState().selectedComponents;
      if (selectedIds.length === 0) return;

      const components = useComponentStore.getState().getAllComponents();
      const selectedComponents = components.filter((c) =>
        selectedIds.includes(c.id)
      );

      if (selectedComponents.length === 0) return;

      // Calculate bounding box of selected components
      const padding = 50;
      const minX = Math.min(...selectedComponents.map((c) => c.x)) - padding;
      const minY = Math.min(...selectedComponents.map((c) => c.y)) - padding;
      const maxX =
        Math.max(...selectedComponents.map((c) => c.x + (c.width || 200))) +
        padding;
      const maxY =
        Math.max(...selectedComponents.map((c) => c.y + (c.height || 150))) +
        padding;

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const scaleX = viewportWidth / contentWidth;
      const scaleY = viewportHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY, 2); // Allow up to 200% zoom

      const translateX =
        (viewportWidth - contentWidth * scale) / 2 - minX * scale;
      const translateY =
        (viewportHeight - contentHeight * scale) / 2 - minY * scale;

      set({
        scale,
        translateX,
        translateY,
        showZoomIndicator: true,
      });

      setTimeout(() => {
        set({ showZoomIndicator: false });
      }, 2000);
    },

    // Computed getters
    getTransform: () => {
      const { scale, translateX, translateY } = get();
      return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    },

    getVisibleComponents: () => {
      // For now, return all components
      // Could implement viewport culling here for performance
      return useComponentStore.getState().getAllComponents();
    },

    getSelectedComponentsData: () => {
      const selectedIds = useSelectionStore.getState().selectedComponents;
      const components = useComponentStore.getState().getAllComponents();
      return components.filter((c) => selectedIds.includes(c.id));
    },
  }))
);

// Convenience hooks for specific concerns
export const useWhiteboardComponents = () => {
  return useUnifiedWhiteboardStore((state) => ({
    components: state.getAllComponents(),
    addComponent: state.addComponent,
    updateComponent: state.updateComponent,
    deleteComponent: state.deleteComponent,
    duplicateComponent: state.duplicateComponent,
    getComponentById: state.getComponentById,
  }));
};

export const useWhiteboardSelection = () => {
  return useUnifiedWhiteboardStore((state) => ({
    selectedComponents: state.getSelectedComponents(),
    selectedComponentsData: state.getSelectedComponentsData(),
    selectComponent: state.selectComponent,
    selectMultiple: state.selectMultiple,
    toggleSelection: state.toggleSelection,
    clearSelection: state.clearSelection,
    copySelected: state.copySelected,
    pasteComponents: state.pasteComponents,
    deleteSelected: state.deleteSelected,
  }));
};

export const useWhiteboardZoom = () => {
  return useUnifiedWhiteboardStore((state) => ({
    scale: state.scale,
    translateX: state.translateX,
    translateY: state.translateY,
    transform: state.getTransform(),
    showZoomIndicator: state.showZoomIndicator,
    isActivelyZooming: state.isActivelyZooming,
    setZoom: state.setZoom,
    resetZoom: state.resetZoom,
    zoomToFit: state.zoomToFit,
    zoomToSelection: state.zoomToSelection,
    setShowZoomIndicator: state.setShowZoomIndicator,
    setIsActivelyZooming: state.setIsActivelyZooming,
  }));
};

export const useWhiteboardUI = () => {
  return useUnifiedWhiteboardStore((state) => ({
    isDragging: state.isDragging,
    isEditingText: state.isEditingText,
    editingComponentId: state.editingComponentId,
    sidebarOpen: state.sidebarOpen,
    currentTool: state.currentTool,
    setIsDragging: state.setIsDragging,
    setEditingComponent: state.setEditingComponent,
    toggleSidebar: state.toggleSidebar,
    setCurrentTool: state.setCurrentTool,
  }));
};
