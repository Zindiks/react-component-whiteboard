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
}

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
    components: [],
    selectedComponents: [],
    connections: [],
    selectedConnection: null,
    isCreatingConnection: false,
    connectionStartComponent: null,
    connectionType: "curved",
    connectionColor: "#3b82f6",
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
  }))
);

export default useWhiteboardStore;
