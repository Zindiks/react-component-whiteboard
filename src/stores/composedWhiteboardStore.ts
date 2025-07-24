/**
 * Composed Whiteboard Store
 *
 * This hook combines the new modular stores (componentStore, selectionStore)
 * while maintaining the same interface as the original whiteboardStore.
 * This allows gradual migration without breaking existing code.
 */

import { useComponentStore } from "./componentStore";
import { useSelectionStore } from "./selectionStore";
import { Component } from "../types/whiteboard";

// Re-export the individual stores for direct access when needed
export { useComponentStore } from "./componentStore";
export { useSelectionStore } from "./selectionStore";

/**
 * Combined whiteboard hook that provides the same interface as the original
 * but uses the new modular stores underneath
 */
export const useComposedWhiteboardStore = () => {
  const componentStore = useComponentStore();
  const selectionStore = useSelectionStore();

  return {
    // Component state and actions
    components: componentStore.components,
    addNewComponent: (type: string, x = 100, y = 100) => {
      return componentStore.addComponent({
        type,
        x,
        y,
        zIndex: componentStore.components.length + 1,
      });
    },
    setComponents: (
      components: Component[] | ((prev: Component[]) => Component[])
    ) => {
      if (typeof components === "function") {
        const newComponents = components(componentStore.components);
        // Update all components at once
        newComponents.forEach((comp) => {
          if (componentStore.getComponentById(comp.id)) {
            componentStore.updateComponent(comp.id, comp);
          } else {
            componentStore.addComponent({ ...comp });
          }
        });
      } else {
        // Replace all components - this is more complex with individual store
        // For now, we'll clear and re-add (this could be optimized)
        componentStore.components.forEach((comp) =>
          componentStore.deleteComponent(comp.id)
        );
        components.forEach((comp) => componentStore.addComponent(comp));
      }
    },
    handleDeleteComponent: componentStore.deleteComponent,
    handleDeleteSelected: () => {
      selectionStore.selectedComponents.forEach((id) => {
        componentStore.deleteComponent(id);
      });
      selectionStore.clearSelection();
    },
    handleResizeComponent: componentStore.resizeComponent,
    handleTextChange: componentStore.updateComponentText,
    handleImageChange: componentStore.updateComponentImage,
    handleFormattingChange: (
      id: number,
      formatting: Record<string, unknown>
    ) => {
      componentStore.updateComponent(id, formatting);
    },
    handleDrag: (id: number, deltaX: number, deltaY: number) => {
      const component = componentStore.getComponentById(id);
      if (component) {
        componentStore.moveComponent(
          id,
          component.x + deltaX,
          component.y + deltaY
        );
      }
    },
    bringToFront: (id: number) => {
      const maxZ = Math.max(
        ...componentStore.components.map((c) => c.zIndex || 0)
      );
      componentStore.updateComponent(id, { zIndex: maxZ + 1 });
    },

    // Selection state and actions
    selectedComponents: selectionStore.selectedComponents,
    setSelectedComponents: (
      selected: number[] | ((prev: number[]) => number[])
    ) => {
      if (typeof selected === "function") {
        const newSelection = selected(selectionStore.selectedComponents);
        selectionStore.selectMultiple(newSelection);
      } else {
        selectionStore.selectMultiple(selected);
      }
    },
    handleSelect: selectionStore.selectComponent,
    handleDragStart: (id: number) => {
      // This was just selecting in the original - keeping same behavior
      if (!selectionStore.isSelected(id)) {
        selectionStore.selectComponent(id);
      }
    },

    // Copy/paste operations
    copiedComponents: selectionStore.copiedComponents
      .map((id) => componentStore.getComponentById(id))
      .filter(Boolean) as Component[],
    setCopiedComponents: (
      components: Component[] | ((prev: Component[]) => Component[])
    ) => {
      // For now, we'll store just the IDs in the selection store
      if (typeof components === "function") {
        const current = selectionStore.copiedComponents
          .map((id) => componentStore.getComponentById(id))
          .filter(Boolean) as Component[];
        components(current); // Call the function but don't use result for now
        selectionStore.copySelected(); // This copies currently selected
      } else {
        // Store the component IDs
        const ids = components.map((c) => c.id);
        selectionStore.selectMultiple(ids);
        selectionStore.copySelected();
        selectionStore.clearSelection();
      }
    },

    // Stub methods for functionality not yet moved to new stores
    // These maintain compatibility but don't use the new stores yet
    initialPositions: [] as const, // TODO: Move to a separate store
    connectionMode: "none" as const, // TODO: Move to a separate store
    setInitialPositions: () => {}, // TODO: Implement
    handleConnectionPointClick: () => {}, // TODO: Implement
    handleShapeClickForConnection: () => {}, // TODO: Implement
    startArrowConnection: () => {}, // TODO: Implement
    cancelArrowConnection: () => {}, // TODO: Implement
    disconnectArrow: () => {}, // TODO: Implement
  };
};
