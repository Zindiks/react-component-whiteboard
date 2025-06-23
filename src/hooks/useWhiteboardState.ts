import { useState, useCallback } from "react";
import { Component, InitialPosition } from "../types/whiteboard";

const DEFAULT_COMPONENTS: Component[] = [
  { id: 1, x: 100, y: 100, type: "timer", zIndex: 1 },
  { id: 2, x: 300, y: 200, type: "weather", zIndex: 2 },
  { id: 3, x: 600, y: 100, type: "bitcoin", zIndex: 3 },
  { id: 4, x: 100, y: 400, type: "currency", zIndex: 4 },
  { id: 5, x: 400, y: 400, type: "confetti", zIndex: 5 },
  { id: 6, x: 700, y: 400, type: "note", zIndex: 6 },
  { id: 7, x: 1000, y: 100, type: "watch", zIndex: 7 },
  { id: 8, x: 1000, y: 400, type: "scrollingtext", zIndex: 8 },
  { id: 9, x: 500, y: 200, type: "youtubeVideo", zIndex: 9 },
  { id: 10, x: 800, y: 200, type: "soundcloud", zIndex: 10 },
  { id: 11, x: 300, y: 600, type: "spotify", zIndex: 11 },
  { id: 12, x: 600, y: 600, type: "stylishlink", zIndex: 12 },
];

export const useWhiteboardState = () => {
  const [components, setComponents] = useState<Component[]>(DEFAULT_COMPONENTS);
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const [initialPositions, setInitialPositions] = useState<InitialPosition[]>(
    []
  );
  const [copiedComponents, setCopiedComponents] = useState<Component[]>([]);

  const handleDeleteComponent = useCallback((id: number) => {
    console.log(`Deleting component with ID: ${id}`);
    setComponents((prev) => prev.filter((component) => component.id !== id));
    setSelectedComponents((prev) =>
      prev.filter((selectedId) => selectedId !== id)
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedComponents.length > 0) {
      setComponents((prev) =>
        prev.filter((component) => !selectedComponents.includes(component.id))
      );
      setSelectedComponents([]);
    }
  }, [selectedComponents]);

  const addNewComponent = useCallback(
    (type: string, x?: number, y?: number) => {
      const newId = Math.max(...components.map((c) => c.id)) + 1;
      const highestZIndex = Math.max(
        ...components.map((c) => c.zIndex || 0),
        0
      );

      console.log(`Adding new ${type} component with ID: ${newId}`);

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
      }

      setComponents((prev) => [...prev, newComponent]);
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
      console.log(`Resizing component ${id} to ${width}x${height}`);
      setComponents((prev) =>
        prev.map((component) =>
          component.id === id ? { ...component, width, height } : component
        )
      );
    },
    []
  );

  const handleTextChange = useCallback((id: number, text: string) => {
    console.log(`Changing text for component ${id} to: ${text}`);
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, text } : component
      )
    );
  }, []);

  const handleImageChange = useCallback((id: number, imageSrc: string) => {
    console.log(`Changing image for component ${id} to: ${imageSrc}`);
    setComponents((prev) =>
      prev.map((component) =>
        component.id === id ? { ...component, imageSrc } : component
      )
    );
  }, []);

  const handleDrag = useCallback(
    (id: number, deltaX: number, deltaY: number) => {
      if (selectedComponents.length > 1 && selectedComponents.includes(id)) {
        // Moving multiple selected components
        setComponents((prevComponents) =>
          prevComponents.map((component) => {
            const initialPos = initialPositions.find(
              (pos) => pos.id === component.id
            );
            if (initialPos && selectedComponents.includes(component.id)) {
              return {
                ...component,
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              };
            }
            return component;
          })
        );
      } else {
        // Single component drag
        const initialPos = initialPositions.find((pos) => pos.id === id);
        if (initialPos) {
          setComponents((prevComponents) =>
            prevComponents.map((component) =>
              component.id === id
                ? {
                    ...component,
                    x: initialPos.x + deltaX,
                    y: initialPos.y + deltaY,
                  }
                : component
            )
          );
        }
      }
    },
    [selectedComponents, initialPositions]
  );

  const handleSelect = useCallback((id: number) => {
    // Single selection only - replace any existing selection
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

  return {
    // State
    components,
    selectedComponents,
    initialPositions,
    copiedComponents,

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
    handleDrag,
    handleSelect,
    handleDragStart,
  };
};
