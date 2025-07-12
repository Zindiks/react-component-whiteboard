import { useState, useCallback } from "react";
import { Component, InitialPosition } from "../types/whiteboard";
import { INITIAL_POSITIONS, COMPONENT_SIZES } from "../constants/appConstants";
import { stateLogger } from "../utils/componentLoggers";
import { getDynamicGridSize, snapPointToGrid } from "../utils/gridUtils";
import { clearCopiedComponentsIfInvalid } from "../utils/clipboardOperations";

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

export const useWhiteboardState = () => {
  const [components, setComponents] = useState<Component[]>(DEFAULT_COMPONENTS);
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const [initialPositions, setInitialPositions] = useState<InitialPosition[]>(
    []
  );
  const [copiedComponents, setCopiedComponents] = useState<Component[]>([]);
  const [connectionMode] = useState<{
    active: boolean;
    selectedArrowId: number | null;
    connectionStep: "start" | "end" | null;
    startShapeId: number | null;
    endShapeId: number | null;
    startConnectionPoint: string | null;
    endConnectionPoint: string | null;
  }>({
    active: false, // Disabled to prevent shapes sticking together
    selectedArrowId: null,
    connectionStep: null,
    startShapeId: null,
    endShapeId: null,
    startConnectionPoint: null,
    endConnectionPoint: null,
  });

  const handleDeleteComponent = useCallback(
    (id: number) => {
      stateLogger.debug("Deleting component", { componentId: id });
      setComponents((prev) => {
        const newComponents = prev.filter((component) => component.id !== id);
        // Clear copied components if any become invalid
        clearCopiedComponentsIfInvalid(
          copiedComponents,
          newComponents,
          setCopiedComponents
        );
        return newComponents;
      });
      setSelectedComponents((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
    },
    [copiedComponents]
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedComponents.length > 0) {
      setComponents((prev) => {
        const newComponents = prev.filter(
          (component) => !selectedComponents.includes(component.id)
        );
        // Clear copied components if any become invalid
        clearCopiedComponentsIfInvalid(
          copiedComponents,
          newComponents,
          setCopiedComponents
        );
        return newComponents;
      });
      setSelectedComponents([]);
    }
  }, [selectedComponents, copiedComponents]);

  const addNewComponent = useCallback(
    (type: string, x?: number, y?: number) => {
      const newId = Math.max(...components.map((c) => c.id)) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
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

      setComponents((prev) => [...prev, newComponent]);

      // Return the new component ID so it can be selected
      return newId;
    },
    [components]
  );

  const bringToFront = useCallback((id: number) => {
    setComponents((prevComponents) => {
      const component = prevComponents.find((c) => c.id === id);
      if (!component) return prevComponents;

      const highestZIndex = Math.max(
        ...prevComponents.map((c) => c.zIndex || 0),
        0
      );

      return prevComponents.map((c) =>
        c.id === id ? { ...c, zIndex: highestZIndex + 1 } : c
      );
    });
  }, []);

  const handleResizeComponent = useCallback(
    (id: number, width: number, height: number) => {
      stateLogger.debug("Resizing component", {
        componentId: id,
        dimensions: { width, height },
      });
      setComponents((prev) =>
        prev.map((component) =>
          component.id === id ? { ...component, width, height } : component
        )
      );
    },
    []
  );

  const handleTextChange = useCallback((id: number, text: string) => {
    stateLogger.debug("Changing component text", {
      componentId: id,
      textLength: text.length,
    });
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, text } : component
      )
    );
  }, []);

  const handleImageChange = useCallback((id: number, imageSrc: string) => {
    stateLogger.debug("Changing component image", {
      componentId: id,
      imageUrl:
        imageSrc.substring(0, 100) + (imageSrc.length > 100 ? "..." : ""),
    });

    setComponents((prev) =>
      prev.map((component) => {
        if (component.id === id) {
          // For new images, we'll let the ImageShape component handle the aspect ratio
          // adjustment when the image loads, so we just update the imageSrc here
          return { ...component, imageSrc };
        }
        return component;
      })
    );
  }, []);

  const handleFormattingChange = useCallback(
    (id: number, formattingOptions: Record<string, unknown>) => {
      stateLogger.debug("Changing component formatting", {
        componentId: id,
        formattingOptions,
      });
      setComponents((prev) =>
        prev.map((component) =>
          component.id === id
            ? { ...component, ...formattingOptions }
            : component
        )
      );
    },
    []
  );

  const handleDrag = useCallback(
    (
      id: number,
      deltaX: number,
      deltaY: number,
      zoomLevel: number = 1,
      enableSnap: boolean = true
    ) => {
      const gridSize = getDynamicGridSize(zoomLevel);

      if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
        // Moving multiple selected components
        setComponents((prevComponents) =>
          prevComponents.map((component) => {
            const initialPos = initialPositions.find(
              (pos) => pos.id === component.id
            );
            if (initialPos && selectedComponents.includes(component.id)) {
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
          })
        );
      } else {
        // Single component drag
        const initialPos = initialPositions.find((pos) => pos.id === id);
        if (initialPos) {
          setComponents((prevComponents) =>
            prevComponents.map((component) => {
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
            })
          );
        }
      }
    },
    [selectedComponents, initialPositions]
  );

  // Simplified shape click handler - no automatic connections
  const handleShapeClickForConnection = useCallback(() => {
    // Only handle connection mode for explicit arrow connections
    // Don't automatically connect shapes to each other
    return;
  }, []);

  const handleSelect = useCallback((id: number) => {
    // Simple selection - no connection mode interference
    setSelectedComponents([id]);
  }, []);

  const handleDragStart = (id: number) => {
    // Bring the component to the front when starting to drag
    bringToFront(id);

    if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
      // Multiple selected components: dragging one moves all selected
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId);
        return { id: selectedId, x: component?.x || 0, y: component?.y || 0 };
      });
      setInitialPositions(positions);
    } else {
      // Single component drag - store initial position and select it
      const component = components.find((c) => c.id === id);
      if (component) {
        setInitialPositions([{ id, x: component.x, y: component.y }]);
        setSelectedComponents([id]);
      }
    }
  };

  // Connection handling functions - simplified to prevent automatic connections
  const handleConnectionPointClick = useCallback(() => {
    // Disabled automatic connections to prevent shapes sticking together
    return;
  }, []);

  const startArrowConnection = useCallback(() => {
    // Disabled to prevent shapes from sticking together
    return;
  }, []);

  const cancelArrowConnection = useCallback(() => {
    // Disabled to prevent shapes from sticking together
    return;
  }, []);

  const disconnectArrow = useCallback(() => {
    // Disabled to prevent shapes from sticking together
    return;
  }, []);

  return {
    // State
    components,
    selectedComponents,
    initialPositions,
    copiedComponents,
    connectionMode,

    // Setters for external use
    setComponents,
    setSelectedComponents,
    setInitialPositions,
    setCopiedComponents,

    // Actions
    handleDeleteComponent,
    handleDeleteSelected,
    addNewComponent,
    bringToFront,
    handleResizeComponent,
    handleTextChange,
    handleImageChange,
    handleFormattingChange,
    handleDrag,
    handleSelect,
    handleDragStart,

    // Connection actions - disabled to prevent shapes sticking together
    handleConnectionPointClick,
    handleShapeClickForConnection,
    startArrowConnection,
    cancelArrowConnection,
    disconnectArrow,
  };
};
