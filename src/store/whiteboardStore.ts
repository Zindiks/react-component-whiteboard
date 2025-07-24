import { create } from "zustand";
import { Component, InitialPosition } from "../types/whiteboard";
import { INITIAL_POSITIONS, COMPONENT_SIZES } from "../constants/appConstants";
import { stateLogger } from "../utils/componentLoggers";
import { getDynamicGridSize, snapPointToGrid } from "../utils/gridUtils";

const DEFAULT_COMPONENTS: Component[] = [
  {
    id: 1,
    x: INITIAL_POSITIONS.TIMER.x,
    y: INITIAL_POSITIONS.TIMER.y,
    type: "timer",
    zIndex: 1,
  },
  {
    id: 2,
    x: INITIAL_POSITIONS.WEATHER.x,
    y: INITIAL_POSITIONS.WEATHER.y,
    type: "weather",
    zIndex: 2,
  },
  {
    id: 3,
    x: INITIAL_POSITIONS.BITCOIN.x,
    y: INITIAL_POSITIONS.BITCOIN.y,
    type: "bitcoin",
    zIndex: 3,
  },
  {
    id: 4,
    x: INITIAL_POSITIONS.CURRENCY.x,
    y: INITIAL_POSITIONS.CURRENCY.y,
    type: "currency",
    zIndex: 4,
  },
  {
    id: 5,
    x: INITIAL_POSITIONS.CONFETTI.x,
    y: INITIAL_POSITIONS.CONFETTI.y,
    type: "confetti",
    zIndex: 5,
  },
  {
    id: 6,
    x: INITIAL_POSITIONS.NOTE.x,
    y: INITIAL_POSITIONS.NOTE.y,
    type: "note",
    zIndex: 6,
  },
  {
    id: 7,
    x: INITIAL_POSITIONS.WATCH.x,
    y: INITIAL_POSITIONS.WATCH.y,
    type: "watch",
    zIndex: 7,
  },
  {
    id: 8,
    x: INITIAL_POSITIONS.SCROLLING_TEXT.x,
    y: INITIAL_POSITIONS.SCROLLING_TEXT.y,
    type: "scrollingtext",
    zIndex: 8,
  },
];

interface WhiteboardState {
  // State
  components: Component[];
  selectedComponents: number[];
  initialPositions: InitialPosition[];
  copiedComponents: Component[];

  // Actions
  setComponents: (
    components: Component[] | ((prev: Component[]) => Component[])
  ) => void;
  setSelectedComponents: (
    selectedComponents: number[] | ((prev: number[]) => number[])
  ) => void;
  setInitialPositions: (initialPositions: InitialPosition[]) => void;
  setCopiedComponents: (
    copiedComponents: Component[] | ((prev: Component[]) => Component[])
  ) => void;
  handleDeleteComponent: (id: number) => void;
  handleDeleteSelected: () => void;
  addNewComponent: (type: string, x?: number, y?: number) => number | undefined;
  bringToFront: (id: number) => void;
  handleResizeComponent: (id: number, width: number, height: number) => void;
  handleTextChange: (id: number, text: string) => void;
  handleImageChange: (id: number, imageSrc: string) => void;
  handleFormattingChange: (
    id: number,
    formattingOptions: Record<string, unknown>
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
  handleConnectionPointClick: () => void;
  handleShapeClickForConnection: () => void;
  startArrowConnection: () => void;
  cancelArrowConnection: () => void;
  disconnectArrow: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  // Initial state
  components: DEFAULT_COMPONENTS,
  selectedComponents: [],
  initialPositions: [],
  copiedComponents: [],

  // Setters
  setComponents: (components) =>
    set((state) => ({
      components:
        typeof components === "function"
          ? components(state.components)
          : components,
    })),

  setSelectedComponents: (selectedComponents) =>
    set((state) => ({
      selectedComponents:
        typeof selectedComponents === "function"
          ? selectedComponents(state.selectedComponents)
          : selectedComponents,
    })),

  setInitialPositions: (initialPositions) => set({ initialPositions }),

  setCopiedComponents: (copiedComponents) =>
    set((state) => ({
      copiedComponents:
        typeof copiedComponents === "function"
          ? copiedComponents(state.copiedComponents)
          : copiedComponents,
    })),

  // Actions
  handleDeleteComponent: (id: number) => {
    stateLogger.debug("Deleting component", { componentId: id });

    set((state) => {
      const newComponents = state.components.filter(
        (component) => component.id !== id
      );

      // Check if any copied components are now invalid
      let newCopiedComponents = state.copiedComponents;
      if (state.copiedComponents.length > 0) {
        const invalidComponents = state.copiedComponents.filter(
          (copied) => !newComponents.some((current) => current.id === copied.id)
        );
        if (invalidComponents.length > 0) {
          newCopiedComponents = []; // Clear all copied components if any are invalid
        }
      }

      return {
        components: newComponents,
        selectedComponents: state.selectedComponents.filter(
          (selectedId) => selectedId !== id
        ),
        copiedComponents: newCopiedComponents,
      };
    });
  },

  handleDeleteSelected: () => {
    const state = get();
    if (state.selectedComponents.length > 0) {
      set((state) => {
        const newComponents = state.components.filter(
          (component) => !state.selectedComponents.includes(component.id)
        );

        // Check if any copied components are now invalid
        let newCopiedComponents = state.copiedComponents;
        if (state.copiedComponents.length > 0) {
          const invalidComponents = state.copiedComponents.filter(
            (copied) =>
              !newComponents.some((current) => current.id === copied.id)
          );
          if (invalidComponents.length > 0) {
            newCopiedComponents = []; // Clear all copied components if any are invalid
          }
        }

        return {
          components: newComponents,
          selectedComponents: [],
          copiedComponents: newCopiedComponents,
        };
      });
    }
  },

  addNewComponent: (type: string, x?: number, y?: number) => {
    const state = get();
    const newId = Math.max(...state.components.map((c) => c.id)) + 1;
    const highestZIndex = Math.max(
      ...state.components.map((c) => c.zIndex || 0),
      0
    );

    stateLogger.debug("Adding new component", {
      componentType: type,
      componentId: newId,
      position: { x, y },
      zIndex: highestZIndex + 1,
    });

    // Create base component
    const newComponent: Component = {
      id: newId,
      x: x ?? 200 + Math.random() * 200,
      y: y ?? 200 + Math.random() * 200,
      type,
      zIndex: highestZIndex + 1, // Place new component on top
    };

    // Add default properties for shape components
    if (["rectangle", "ellipse"].includes(type)) {
      newComponent.width = 120;
      newComponent.height = 80;
    } else if (["arrow", "line"].includes(type)) {
      newComponent.width = 150;
      newComponent.height = 20;
    } else if (type === "text") {
      newComponent.width = 150;
      newComponent.height = 50;
      newComponent.text = "Double-click to edit";
    } else if (type === "scrollingtext") {
      newComponent.width = 300;
      newComponent.height = 60;
      newComponent.text = "Scrolling text - double-click to edit";
      newComponent.scrollDirection = "horizontal";
      newComponent.scrollSpeed = 50;
      newComponent.pauseOnHover = true;
      newComponent.bounceOnEnd = false;
      newComponent.backgroundColor = "transparent";
    } else if (type === "imageShape") {
      newComponent.width = 200;
      newComponent.height = 150;
    } else if (type === "pdfShape") {
      newComponent.width = COMPONENT_SIZES.PDF_WIDTH;
      newComponent.height = COMPONENT_SIZES.PDF_HEIGHT;
    } else if (type === "linkpreview") {
      newComponent.width = COMPONENT_SIZES.LINK_PREVIEW_WIDTH;
      newComponent.height = COMPONENT_SIZES.LINK_PREVIEW_HEIGHT;
    }

    set((state) => ({
      components: [...state.components, newComponent],
    }));

    // Return the new component ID so it can be selected
    return newId;
  },

  bringToFront: (id: number) => {
    set((state) => {
      const component = state.components.find((c) => c.id === id);
      if (!component) return state;

      const highestZIndex = Math.max(
        ...state.components.map((c) => c.zIndex || 0),
        0
      );

      return {
        components: state.components.map((c) =>
          c.id === id ? { ...c, zIndex: highestZIndex + 1 } : c
        ),
      };
    });
  },

  handleResizeComponent: (id: number, width: number, height: number) => {
    stateLogger.debug("Resizing component", {
      componentId: id,
      dimensions: { width, height },
    });

    set((state) => ({
      components: state.components.map((component) =>
        component.id === id ? { ...component, width, height } : component
      ),
    }));
  },

  handleTextChange: (id: number, text: string) => {
    stateLogger.debug("Changing component text", {
      componentId: id,
      textLength: text.length,
    });

    set((state) => ({
      components: state.components.map((component) =>
        component.id === id ? { ...component, text } : component
      ),
    }));
  },

  handleImageChange: (id: number, imageSrc: string) => {
    stateLogger.debug("Changing component image", {
      componentId: id,
      imageUrl:
        imageSrc.substring(0, 100) + (imageSrc.length > 100 ? "..." : ""),
    });

    set((state) => ({
      components: state.components.map((component) => {
        if (component.id === id) {
          // For new images, we'll let the ImageShape component handle the aspect ratio
          // adjustment when the image loads, so we just update the imageSrc here
          return { ...component, imageSrc };
        }
        return component;
      }),
    }));
  },

  handleFormattingChange: (
    id: number,
    formattingOptions: Record<string, unknown>
  ) => {
    stateLogger.debug("Changing component formatting", {
      componentId: id,
      formattingOptions,
    });

    set((state) => ({
      components: state.components.map((component) =>
        component.id === id ? { ...component, ...formattingOptions } : component
      ),
    }));
  },

  handleDrag: (
    id: number,
    deltaX: number,
    deltaY: number,
    zoomLevel: number = 1,
    enableSnap: boolean = true
  ) => {
    const state = get();
    const gridSize = getDynamicGridSize(zoomLevel);

    if (
      state.selectedComponents.length > 1 &&
      state.selectedComponents.includes(id)
    ) {
      // Moving multiple selected components
      set((state) => ({
        components: state.components.map((component) => {
          const initialPos = state.initialPositions.find(
            (pos) => pos.id === component.id
          );
          if (initialPos && state.selectedComponents.includes(component.id)) {
            const newX = initialPos.x + deltaX;
            const newY = initialPos.y + deltaY;

            if (enableSnap) {
              const snapped = snapPointToGrid(newX, newY, gridSize);
              return {
                ...component,
                x: snapped.x,
                y: snapped.y,
              };
            } else {
              return {
                ...component,
                x: newX,
                y: newY,
              };
            }
          }
          return component;
        }),
      }));
    } else {
      // Single component drag
      const initialPos = state.initialPositions.find((pos) => pos.id === id);
      if (initialPos) {
        set((state) => ({
          components: state.components.map((component) => {
            if (component.id === id) {
              const newX = initialPos.x + deltaX;
              const newY = initialPos.y + deltaY;

              if (enableSnap) {
                const snapped = snapPointToGrid(newX, newY, gridSize);
                return {
                  ...component,
                  x: snapped.x,
                  y: snapped.y,
                };
              } else {
                return {
                  ...component,
                  x: newX,
                  y: newY,
                };
              }
            }
            return component;
          }),
        }));
      }
    }
  },

  handleSelect: (id: number) => {
    // Simple selection - no connection mode interference
    set({ selectedComponents: [id] });
  },

  handleDragStart: (id: number) => {
    const state = get();
    // Bring the component to the front when starting to drag
    get().bringToFront(id);

    if (
      state.selectedComponents.length > 1 &&
      state.selectedComponents.includes(id)
    ) {
      // Multiple selected components: dragging one moves all selected
      const positions = state.selectedComponents.map((selectedId) => {
        const component = state.components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      set({ initialPositions: positions });
    } else {
      // Single component drag - store initial position and select it
      const component = state.components.find((c) => c.id === id);
      if (component) {
        set({
          initialPositions: [{ id, x: component.x, y: component.y }],
          selectedComponents: [id],
        });
      }
    }
  },

  // Connection handling functions - simplified to prevent automatic connections
  handleConnectionPointClick: () => {
    // Disabled automatic connections to prevent shapes sticking together
    return;
  },

  handleShapeClickForConnection: () => {
    // Only handle connection mode for explicit arrow connections
    // Don't automatically connect shapes to each other
    return;
  },

  startArrowConnection: () => {
    // Disabled to prevent shapes from sticking together
    return;
  },

  cancelArrowConnection: () => {
    // Disabled to prevent shapes from sticking together
    return;
  },

  disconnectArrow: () => {
    // Disabled to prevent shapes from sticking together
    return;
  },
}));
