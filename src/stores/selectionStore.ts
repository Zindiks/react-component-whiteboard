/**
 * Selection State Store
 *
 * Handles component selection, multi-selection, and selection-related operations
 * Separated from component state for cleaner architecture
 */

import { create } from "zustand";

interface SelectionState {
  // State
  selectedComponents: number[];
  copiedComponents: number[];

  // Actions
  selectComponent: (id: number) => void;
  selectMultiple: (ids: number[]) => void;
  addToSelection: (id: number) => void;
  removeFromSelection: (id: number) => void;
  clearSelection: () => void;
  toggleSelection: (id: number) => void;
  selectAll: (componentIds: number[]) => void;

  // Copy/paste operations
  copySelected: () => void;
  clearCopied: () => void;

  // Queries
  isSelected: (id: number) => boolean;
  getSelectedCount: () => number;
  hasSelection: () => boolean;
  hasCopied: () => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedComponents: [],
  copiedComponents: [],

  selectComponent: (id) => {
    set({ selectedComponents: [id] });
  },

  selectMultiple: (ids) => {
    set({ selectedComponents: ids });
  },

  addToSelection: (id) => {
    set((state) => ({
      selectedComponents: state.selectedComponents.includes(id)
        ? state.selectedComponents
        : [...state.selectedComponents, id],
    }));
  },

  removeFromSelection: (id) => {
    set((state) => ({
      selectedComponents: state.selectedComponents.filter(
        (compId) => compId !== id
      ),
    }));
  },

  clearSelection: () => {
    set({ selectedComponents: [] });
  },

  toggleSelection: (id) => {
    const { selectedComponents } = get();
    if (selectedComponents.includes(id)) {
      get().removeFromSelection(id);
    } else {
      get().addToSelection(id);
    }
  },

  selectAll: (componentIds) => {
    set({ selectedComponents: [...componentIds] });
  },

  copySelected: () => {
    const { selectedComponents } = get();
    set({ copiedComponents: [...selectedComponents] });
  },

  clearCopied: () => {
    set({ copiedComponents: [] });
  },

  // Query methods
  isSelected: (id) => {
    return get().selectedComponents.includes(id);
  },

  getSelectedCount: () => {
    return get().selectedComponents.length;
  },

  hasSelection: () => {
    return get().selectedComponents.length > 0;
  },

  hasCopied: () => {
    return get().copiedComponents.length > 0;
  },
}));
