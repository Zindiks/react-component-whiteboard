/**
 * Sidebar Controls Hook
 *
 * This hook provides sidebar and category management functionality for the whiteboard.
 * It manages the sidebar open/close state, active category selection, and drag-and-drop
 * state for components and images from external sources.
 */

import { useCallback, useState } from "react";
import { COMPONENT_CATEGORIES } from "../constants/componentCategories";
import type { Category } from "../constants/componentCategories";

export interface SidebarControlsState {
  activeCategory: string | null;
  isSidebarOpen: boolean;
  isDragOverBoard: boolean;
  dragType: "component" | "image" | null;
}

export interface SidebarControlsActions {
  setActiveCategory: (category: string | null) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsDragOverBoard: (isDragOver: boolean) => void;
  setDragType: (type: "component" | "image" | null) => void;
  handleCategoryClick: (categoryName: string) => void;
  handleCloseSidebar: () => void;
  getActiveCategory: () => Category | null;
}

export interface UseSidebarControlsReturn
  extends SidebarControlsState,
    SidebarControlsActions {}

export const useSidebarControls = (): UseSidebarControlsReturn => {
  // Sidebar state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragOverBoard, setIsDragOverBoard] = useState(false);
  const [dragType, setDragType] = useState<"component" | "image" | null>(null);

  // Category click handler - toggles sidebar or switches categories
  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      if (activeCategory === categoryName && isSidebarOpen) {
        // If same category is clicked while sidebar is open, close it
        setIsSidebarOpen(false);
        setActiveCategory(null);
      } else {
        // Open sidebar with new category
        setActiveCategory(categoryName);
        setIsSidebarOpen(true);
      }
    },
    [activeCategory, isSidebarOpen]
  );

  // Close sidebar handler
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setActiveCategory(null);
  }, []);

  // Get the active category object
  const getActiveCategory = useCallback(() => {
    return (
      COMPONENT_CATEGORIES.find((cat) => cat.name === activeCategory) || null
    );
  }, [activeCategory]);

  return {
    // State
    activeCategory,
    isSidebarOpen,
    isDragOverBoard,
    dragType,

    // Actions
    setActiveCategory,
    setIsSidebarOpen,
    setIsDragOverBoard,
    setDragType,
    handleCategoryClick,
    handleCloseSidebar,
    getActiveCategory,
  };
};
