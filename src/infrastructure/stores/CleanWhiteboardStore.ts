import { create } from 'zustand';
import { ComponentEntity } from '../../domain/entities/Component.entity';
import { ComponentUseCases } from '../../domain/use-cases/ComponentUseCases';
import { ZustandComponentRepository } from '../repositories/ZustandComponentRepository';
import { ValidationUtils } from '../../domain/schemas/validation.utils';
import { WhiteboardStateSchema } from '../../domain/schemas/whiteboard.schema';
import type { WhiteboardState, OperationResult, Point } from '../../domain/schemas/whiteboard.schema';
import type { ComponentCreate, ComponentUpdate } from '../../domain/schemas/component.schema';

// Define the store actions interface
interface WhiteboardActions {
  // Component operations
  createComponent: (data: ComponentCreate) => Promise<OperationResult>;
  updateComponent: (id: number, data: Partial<ComponentUpdate>) => Promise<OperationResult>;
  deleteComponent: (id: number) => Promise<OperationResult>;
  deleteComponents: (ids: number[]) => Promise<OperationResult>;
  moveComponent: (id: number, x: number, y: number) => Promise<OperationResult>;
  resizeComponent: (id: number, width: number, height: number) => Promise<OperationResult>;
  cloneComponent: (id: number, offsetX?: number, offsetY?: number) => Promise<OperationResult>;
  clearAllComponents: () => Promise<OperationResult>;

  // Selection operations
  selectComponent: (id: number) => void;
  selectComponents: (ids: number[]) => void;
  addToSelection: (id: number) => void;
  removeFromSelection: (id: number) => void;
  clearSelection: () => void;
  selectAll: () => void;
  getSelectedComponents: () => ComponentEntity[];

  // Clipboard operations
  copyComponents: (ids: number[]) => void;
  cutComponents: (ids: number[]) => void;
  pasteComponents: (position?: Point) => Promise<OperationResult>;
  getCopiedComponents: () => ComponentEntity[];

  // Layer operations
  bringToFront: (id: number) => Promise<OperationResult>;
  sendToBack: (id: number) => Promise<OperationResult>;
  updateZIndex: (id: number, zIndex: number) => Promise<OperationResult>;

  // UI state operations
  setGridVisible: (visible: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setSelecting: (selecting: boolean) => void;
  setSelectionArea: (start: Point | null, end: Point | null) => void;
  setDragOffset: (offset: Point | null) => void;

  // Query operations
  getComponentById: (id: number) => ComponentEntity | null;
  getComponentsByType: (type: string) => ComponentEntity[];
  getComponentsInBounds: (bounds: { left: number; top: number; right: number; bottom: number }) => ComponentEntity[];
  getAllComponents: () => ComponentEntity[];

  // Utility operations
  refreshStore: () => void;
  validateState: () => { isValid: boolean; errors: string[] };
}

// Combined store interface
interface CleanWhiteboardStore extends WhiteboardState, WhiteboardActions {}

// Create the clean architecture whiteboard store
export const useCleanWhiteboardStore = create<CleanWhiteboardStore>((set, get) => {
  // Initialize repository and use cases
  const repository = new ZustandComponentRepository();
  const componentUseCases = new ComponentUseCases(repository);

  // Helper function to update components in store
  const updateComponentsInStore = async () => {
    const components = await repository.getAll();
    set({ components });
  };

  const initialState: WhiteboardState = {
    components: [],
    selectedComponents: [],
    copiedComponents: [],
    isGridVisible: true,
    isDragging: false,
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
    dragOffset: null,
  };

  return {
    ...initialState,

    // Component operations
    createComponent: async (data: ComponentCreate): Promise<OperationResult> => {
      const result = await componentUseCases.createComponent(data);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    updateComponent: async (id: number, data: Partial<ComponentUpdate>): Promise<OperationResult> => {
      const result = await componentUseCases.updateComponent(id, data);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    deleteComponent: async (id: number): Promise<OperationResult> => {
      const result = await componentUseCases.deleteComponent(id);
      if (result.success) {
        await updateComponentsInStore();
        // Remove from selection if it was selected
        set((state) => ({
          selectedComponents: state.selectedComponents.filter(selectedId => selectedId !== id),
        }));
      }
      return result;
    },

    deleteComponents: async (ids: number[]): Promise<OperationResult> => {
      const result = await componentUseCases.deleteComponents(ids);
      if (result.success) {
        await updateComponentsInStore();
        // Remove from selection
        set((state) => ({
          selectedComponents: state.selectedComponents.filter(selectedId => !ids.includes(selectedId)),
        }));
      }
      return result;
    },

    moveComponent: async (id: number, x: number, y: number): Promise<OperationResult> => {
      const result = await componentUseCases.moveComponent(id, x, y);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    resizeComponent: async (id: number, width: number, height: number): Promise<OperationResult> => {
      const result = await componentUseCases.resizeComponent(id, width, height);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    cloneComponent: async (id: number, offsetX: number = 20, offsetY: number = 20): Promise<OperationResult> => {
      const result = await componentUseCases.cloneComponent(id, offsetX, offsetY);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    clearAllComponents: async (): Promise<OperationResult> => {
      const result = await componentUseCases.clearAllComponents();
      if (result.success) {
        await updateComponentsInStore();
        set({ selectedComponents: [], copiedComponents: [] });
      }
      return result;
    },

    // Selection operations
    selectComponent: (id: number) => {
      set({ selectedComponents: [id] });
    },

    selectComponents: (ids: number[]) => {
      set({ selectedComponents: ids });
    },

    addToSelection: (id: number) => {
      set((state) => ({
        selectedComponents: state.selectedComponents.includes(id) 
          ? state.selectedComponents 
          : [...state.selectedComponents, id],
      }));
    },

    removeFromSelection: (id: number) => {
      set((state) => ({
        selectedComponents: state.selectedComponents.filter(selectedId => selectedId !== id),
      }));
    },

    clearSelection: () => {
      set({ selectedComponents: [] });
    },

    selectAll: () => {
      const { components } = get();
      set({ selectedComponents: components.map(comp => comp.id) });
    },

    getSelectedComponents: () => {
      const { components, selectedComponents } = get();
      return components.filter(comp => selectedComponents.includes(comp.id));
    },

    // Clipboard operations
    copyComponents: (ids: number[]) => {
      const { components } = get();
      const componentsToCopy = components.filter(comp => ids.includes(comp.id));
      set({ copiedComponents: componentsToCopy });
    },

    cutComponents: (ids: number[]) => {
      const { copyComponents, deleteComponents } = get();
      copyComponents(ids);
      // Note: deleteComponents is async, so we can't await here
      // This is a limitation of the current design
      deleteComponents(ids);
    },

    pasteComponents: async (position?: Point): Promise<OperationResult> => {
      const { copiedComponents } = get();
      if (copiedComponents.length === 0) {
        return {
          success: false,
          message: 'No components to paste',
        };
      }

      try {
        const results: OperationResult[] = [];
        const baseOffset = position || { x: 20, y: 20 };

        for (let i = 0; i < copiedComponents.length; i++) {
          const component = copiedComponents[i];
          const componentData = { ...component.toJSON() };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (componentData as any).id; // Remove ID as it will be assigned by create

          // Apply offset
          componentData.x += baseOffset.x + (i * 10); // Slight cascade for multiple components
          componentData.y += baseOffset.y + (i * 10);

          const result = await componentUseCases.createComponent(componentData);
          results.push(result);
        }

        await updateComponentsInStore();

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        if (failCount === 0) {
          return {
            success: true,
            message: `Successfully pasted ${successCount} components`,
          };
        } else {
          return {
            success: false,
            message: `Pasted ${successCount} components, ${failCount} failed`,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to paste components',
        };
      }
    },

    getCopiedComponents: () => {
      return get().copiedComponents;
    },

    // Layer operations
    bringToFront: async (id: number): Promise<OperationResult> => {
      const result = await componentUseCases.bringToFront(id);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    sendToBack: async (id: number): Promise<OperationResult> => {
      const result = await componentUseCases.sendToBack(id);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    updateZIndex: async (id: number, zIndex: number): Promise<OperationResult> => {
      const result = await componentUseCases.updateComponentZIndex(id, zIndex);
      if (result.success) {
        await updateComponentsInStore();
      }
      return result;
    },

    // UI state operations
    setGridVisible: (visible: boolean) => {
      set({ isGridVisible: visible });
    },

    setDragging: (dragging: boolean) => {
      set({ isDragging: dragging });
    },

    setSelecting: (selecting: boolean) => {
      set({ isSelecting: selecting });
    },

    setSelectionArea: (start: Point | null, end: Point | null) => {
      set({ selectionStart: start, selectionEnd: end });
    },

    setDragOffset: (offset: Point | null) => {
      set({ dragOffset: offset });
    },

    // Query operations
    getComponentById: (id: number): ComponentEntity | null => {
      const { components } = get();
      return components.find(comp => comp.id === id) || null;
    },

    getComponentsByType: (type: string): ComponentEntity[] => {
      const { components } = get();
      return components.filter(comp => comp.type === type);
    },

    getComponentsInBounds: (bounds: { left: number; top: number; right: number; bottom: number }): ComponentEntity[] => {
      const { components } = get();
      return components.filter(comp => {
        const compBounds = comp.getBounds();
        return (
          compBounds.left < bounds.right &&
          compBounds.right > bounds.left &&
          compBounds.top < bounds.bottom &&
          compBounds.bottom > bounds.top
        );
      });
    },

    getAllComponents: (): ComponentEntity[] => {
      return get().components;
    },

    // Utility operations
    refreshStore: () => {
      updateComponentsInStore();
    },

    validateState: (): { isValid: boolean; errors: string[] } => {
      const state = get();
      const validation = ValidationUtils.validate(WhiteboardStateSchema, {
        components: state.components.map(comp => comp.toJSON()),
        selectedComponents: state.selectedComponents,
        copiedComponents: state.copiedComponents.map(comp => comp.toJSON()),
        isGridVisible: state.isGridVisible,
        isDragging: state.isDragging,
        isSelecting: state.isSelecting,
        selectionStart: state.selectionStart,
        selectionEnd: state.selectionEnd,
        dragOffset: state.dragOffset,
      });

      return {
        isValid: validation.success,
        errors: validation.success ? [] : [validation.error || 'Validation failed'],
      };
    },
  };
});

// Export types for use in components
export type { CleanWhiteboardStore, WhiteboardActions };