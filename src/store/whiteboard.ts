import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Connection type definition
export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: "straight" | "curved" | "dotted" | "dashed";
  color: string;
  label?: string;
}

// Types for our whiteboard components
export interface WhiteboardComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  props?: Record<string, unknown>;
  zIndex?: number;
}

export interface ComponentRegistry {
  [key: string]: {
    name: string;
    component: React.ComponentType<Record<string, unknown>>;
    defaultProps?: Record<string, unknown>;
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

  // Connections between components
  connections: Connection[];
  selectedConnection: string | null;
  isCreatingConnection: boolean;
  connectionStartComponent: string | null;
  connectionType: "straight" | "curved" | "dotted" | "dashed";
  connectionColor: string;

  // Drag state
  isDragging: boolean;
  dragStartPosition: { x: number; y: number } | null;

  // Selection rectangle state
  isSelecting: boolean;
  selectionStart: { x: number; y: number } | null;
  selectionEnd: { x: number; y: number } | null;

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

  // Selection rectangle actions
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  selectComponentsInRectangle: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    multiSelect?: boolean
  ) => void;
  registerComponent: (type: string, config: ComponentRegistry[string]) => void;
  moveComponents: (
    componentIds: string[],
    deltaX: number,
    deltaY: number,
    snapToGrid?: boolean
  ) => void;
  duplicateComponents: (componentIds: string[]) => void;

  // Connection actions
  addConnection: (connection: Omit<Connection, "id">) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  removeConnection: (id: string) => void;
  selectConnection: (id: string | null) => void;
  startConnectionCreation: (componentId: string) => void;
  finishConnectionCreation: (componentId: string) => void;
  cancelConnectionCreation: () => void;
  setConnectionType: (
    type: "straight" | "curved" | "dotted" | "dashed"
  ) => void;
  setConnectionColor: (color: string) => void;

  // Navigation utility actions
  getBoundingBox: () => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null;
  centerView: () => void;
  zoomToFit: (padding?: number) => void;
}

// Helper function to snap to grid
const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Generate unique ID
const generateId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate connection ID
const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useWhiteboardStore = create<WhiteboardState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    transform: { x: 0, y: 0, k: 1 },
    gridSize: 20,
    gridVisible: true,
    components: [
      { id: "timer_1", type: "timer", x: 100, y: 100, zIndex: 1 },
      { id: "weather_1", type: "weather", x: 300, y: 200, zIndex: 2 },
      { id: "bitcoin_1", type: "bitcoin", x: 600, y: 100, zIndex: 3 },
      { id: "currency_1", type: "currency", x: 100, y: 400, zIndex: 4 },
      { id: "confetti_1", type: "confetti", x: 400, y: 400, zIndex: 5 },
      { id: "note_1", type: "note", x: 700, y: 400, zIndex: 6 },
    ],
    selectedComponents: [],
    connections: [],
    selectedConnection: null,
    isCreatingConnection: false,
    connectionStartComponent: null,
    connectionType: "curved",
    connectionColor: "#3b82f6",
    isDragging: false,
    dragStartPosition: null,
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
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
      set((state) => {
        // Also remove any connections that use this component
        const updatedConnections = state.connections.filter(
          (conn) => conn.fromId !== id && conn.toId !== id
        );

        return {
          components: state.components.filter((comp) => comp.id !== id),
          selectedComponents: state.selectedComponents.filter(
            (selectedId) => selectedId !== id
          ),
          connections: updatedConnections,
          selectedConnection:
            state.selectedConnection &&
            (state.connections.find((c) => c.id === state.selectedConnection)
              ?.fromId === id ||
              state.connections.find((c) => c.id === state.selectedConnection)
                ?.toId === id)
              ? null
              : state.selectedConnection,
        };
      }),

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

    // Selection rectangle actions
    startSelection: (x, y) =>
      set({
        isSelecting: true,
        selectionStart: { x, y },
        selectionEnd: { x, y },
      }),

    updateSelection: (x, y) =>
      set({
        selectionEnd: { x, y },
      }),

    endSelection: () =>
      set({
        isSelecting: false,
        selectionStart: null,
        selectionEnd: null,
      }),

    selectComponentsInRectangle: (x1, y1, x2, y2, multiSelect = false) => {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      console.log("Selection rectangle bounds (canvas coords):", {
        minX,
        maxX,
        minY,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      });

      set((state) => {
        const componentsInRectangle = state.components
          .filter((component) => {
            // Use default props from registry if available, otherwise fallback to defaults
            const registry = state.componentRegistry[component.type];
            const defaultWidth =
              (registry?.defaultProps?.width as number) || 250;
            const defaultHeight =
              (registry?.defaultProps?.height as number) || 200;

            const compWidth = component.width || defaultWidth;
            const compHeight = component.height || defaultHeight;
            const compRight = component.x + compWidth;
            const compBottom = component.y + compHeight;

            // Check if component intersects with selection rectangle using more generous bounds
            // A component is selected if any part of it overlaps with the selection rectangle
            const intersects = !(
              component.x >= maxX ||
              compRight <= minX ||
              component.y >= maxY ||
              compBottom <= minY
            );

            return intersects;
          })
          .map((comp) => comp.id);

        console.log("Components selected:", componentsInRectangle);

        if (multiSelect) {
          // Add to existing selection
          const newSelection = new Set([
            ...state.selectedComponents,
            ...componentsInRectangle,
          ]);
          return {
            selectedComponents: Array.from(newSelection),
          };
        } else {
          // Replace selection
          return {
            selectedComponents: componentsInRectangle,
          };
        }
      });
    },

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
              x: snapToGrid ? Math.round(newX / gridSize) * gridSize : newX,
              y: snapToGrid ? Math.round(newY / gridSize) * gridSize : newY,
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

    // Connection actions
    addConnection: (connection) => {
      const newConnection: Connection = {
        ...connection,
        id: generateConnectionId(),
      };

      set((state) => ({
        connections: [...state.connections, newConnection],
      }));

      return newConnection.id;
    },

    updateConnection: (id, updates) =>
      set((state) => ({
        connections: state.connections.map((conn) =>
          conn.id === id ? { ...conn, ...updates } : conn
        ),
      })),

    removeConnection: (id) =>
      set((state) => ({
        connections: state.connections.filter((conn) => conn.id !== id),
        selectedConnection:
          state.selectedConnection === id ? null : state.selectedConnection,
      })),

    selectConnection: (id) => set({ selectedConnection: id }),

    startConnectionCreation: (componentId) =>
      set({
        isCreatingConnection: true,
        connectionStartComponent: componentId,
        selectedConnection: null,
      }),

    finishConnectionCreation: (componentId) =>
      set((state) => {
        if (
          !state.isCreatingConnection ||
          !state.connectionStartComponent ||
          state.connectionStartComponent === componentId
        ) {
          return {
            isCreatingConnection: false,
            connectionStartComponent: null,
          };
        }

        const newConnection: Connection = {
          id: generateConnectionId(),
          fromId: state.connectionStartComponent,
          toId: componentId,
          type: state.connectionType,
          color: state.connectionColor,
        };

        return {
          connections: [...state.connections, newConnection],
          isCreatingConnection: false,
          connectionStartComponent: null,
        };
      }),

    cancelConnectionCreation: () =>
      set({
        isCreatingConnection: false,
        connectionStartComponent: null,
      }),

    setConnectionType: (type) => set({ connectionType: type }),

    setConnectionColor: (color) => set({ connectionColor: color }),

    // Navigation utility actions
    getBoundingBox: () => {
      const { components } = get();
      if (components.length === 0) return null;

      const boundingBox = components.reduce(
        (acc, component) => {
          const minX = Math.min(acc.minX, component.x);
          const minY = Math.min(acc.minY, component.y);
          const maxX = Math.max(acc.maxX, component.x + (component.width || 0));
          const maxY = Math.max(
            acc.maxY,
            component.y + (component.height || 0)
          );

          return { minX, minY, maxX, maxY };
        },
        {
          minX: Infinity,
          minY: Infinity,
          maxX: -Infinity,
          maxY: -Infinity,
        }
      );

      return boundingBox;
    },

    centerView: () => {
      const boundingBox = get().getBoundingBox();
      if (!boundingBox) return;

      const { minX, minY, maxX, maxY } = boundingBox;
      const width = maxX - minX;
      const height = maxY - minY;

      set({
        transform: {
          x: -minX + (window.innerWidth - width) / 2,
          y: -minY + (window.innerHeight - height) / 2,
          k: get().transform.k,
        },
      });
    },

    zoomToFit: (padding = 20) => {
      const boundingBox = get().getBoundingBox();
      if (!boundingBox) return;

      const { minX, minY, maxX, maxY } = boundingBox;
      const width = maxX - minX;
      const height = maxY - minY;

      const xZoom = (window.innerWidth - padding * 2) / width;
      const yZoom = (window.innerHeight - padding * 2) / height;
      const zoom = Math.min(xZoom, yZoom, 1);

      set({
        transform: {
          x: -minX * zoom + padding,
          y: -minY * zoom + padding,
          k: zoom,
        },
      });
    },
  }))
);

export default useWhiteboardStore;
