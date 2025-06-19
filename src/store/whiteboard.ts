import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Types for our whiteboard components
export interface WhiteboardComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  props?: Record<string, any>;
  zIndex?: number;
}

export interface ComponentRegistry {
  [key: string]: {
    name: string;
    component: React.ComponentType<any>;
    defaultProps?: Record<string, any>;
    icon?: React.ReactNode;
    category?: string;
  };
}

interface WhiteboardState {
  // Canvas state
  transform: { x: number; y: number; k: number };
  gridSize: number;
  gridVisible: boolean;

  // Components on the whiteboard
  components: WhiteboardComponent[];
  selectedComponents: string[];

  // Drag state
  isDragging: boolean;
  dragStartPosition: { x: number; y: number } | null;

  // Component registry
  componentRegistry: ComponentRegistry;

  // Actions
  setTransform: (transform: { x: number; y: number; k: number }) => void;
  addComponent: (component: Omit<WhiteboardComponent, "id">) => void;
  updateComponent: (id: string, updates: Partial<WhiteboardComponent>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setDragging: (
    isDragging: boolean,
    startPosition?: { x: number; y: number }
  ) => void;
  registerComponent: (type: string, config: ComponentRegistry[string]) => void;
  moveComponents: (
    componentIds: string[],
    deltaX: number,
    deltaY: number,
    snapToGrid?: boolean
  ) => void;
  duplicateComponents: (componentIds: string[]) => void;
}

// Helper function to snap to grid
const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Generate unique ID
const generateId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useWhiteboardStore = create<WhiteboardState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    transform: { x: 0, y: 0, k: 1 },
    gridSize: 20,
    gridVisible: true,
    components: [],
    selectedComponents: [],
    isDragging: false,
    dragStartPosition: null,
    componentRegistry: {},

    // Actions
    setTransform: (transform) => set({ transform }),

    addComponent: (component) => {
      const id = generateId();
      const newComponent: WhiteboardComponent = {
        ...component,
        id,
        zIndex: get().components.length,
      };

      set((state) => ({
        components: [...state.components, newComponent],
      }));

      return id;
    },

    updateComponent: (id, updates) =>
      set((state) => ({
        components: state.components.map((comp) =>
          comp.id === id ? { ...comp, ...updates } : comp
        ),
      })),

    removeComponent: (id) =>
      set((state) => ({
        components: state.components.filter((comp) => comp.id !== id),
        selectedComponents: state.selectedComponents.filter(
          (selectedId) => selectedId !== id
        ),
      })),

    selectComponent: (id, multiSelect = false) =>
      set((state) => {
        if (multiSelect) {
          const isSelected = state.selectedComponents.includes(id);
          return {
            selectedComponents: isSelected
              ? state.selectedComponents.filter(
                  (selectedId) => selectedId !== id
                )
              : [...state.selectedComponents, id],
          };
        } else {
          return {
            selectedComponents: [id],
          };
        }
      }),

    clearSelection: () => set({ selectedComponents: [] }),

    setDragging: (isDragging, startPosition) =>
      set({ isDragging, dragStartPosition: startPosition || null }),

    registerComponent: (type, config) =>
      set((state) => ({
        componentRegistry: {
          ...state.componentRegistry,
          [type]: config,
        },
      })),

    moveComponents: (componentIds, deltaX, deltaY, snapToGrid = true) => {
      const { gridSize } = get();

      set((state) => ({
        components: state.components.map((comp) => {
          if (componentIds.includes(comp.id)) {
            const newX = comp.x + deltaX;
            const newY = comp.y + deltaY;

            return {
              ...comp,
              x: snapToGrid ? snapToGrid(newX, gridSize) : newX,
              y: snapToGrid ? snapToGrid(newY, gridSize) : newY,
            };
          }
          return comp;
        }),
      }));
    },

    duplicateComponents: (componentIds) => {
      const { components } = get();
      const toDuplicate = components.filter((comp) =>
        componentIds.includes(comp.id)
      );

      const duplicated = toDuplicate.map((comp) => ({
        ...comp,
        id: generateId(),
        x: comp.x + 20,
        y: comp.y + 20,
        zIndex: components.length + toDuplicate.indexOf(comp),
      }));

      set((state) => ({
        components: [...state.components, ...duplicated],
        selectedComponents: duplicated.map((comp) => comp.id),
      }));
    },
  }))
);

export default useWhiteboardStore;
