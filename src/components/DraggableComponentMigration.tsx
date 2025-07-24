/**
 * Migration Example: DraggableComponent with New Stores
 * 
 * This shows how to gradually migrate components to use the new store architecture
 * while maintaining full compatibility with existing code.
 */

import React from 'react';
import { DraggableComponent as OriginalDraggableComponent } from './DraggableWhiteboardComponent';
import { useComposedWhiteboardStore } from '../stores/composedWhiteboardStore';
import { Component } from '../types/whiteboard';

interface DraggableComponentNewStoreProps {
  component: Component;
  selected: boolean;
  selectedCount: number;
  transform: d3.ZoomTransform;
  isEditing?: boolean;
  onEditingChange?: (id: number, editing: boolean) => void;
  onFormattingChange?: (id: number, formatting: Record<string, unknown>) => void;
}

/**
 * Example component using the new store architecture
 * This is a drop-in replacement for components that want to use the new stores
 */
export const DraggableComponentNewStore: React.FC<DraggableComponentNewStoreProps> = (props) => {
  // Use the new composed store instead of the original whiteboardStore
  const {
    handleSelect,
    handleDragStart,
    handleDrag,
    handleDeleteComponent,
    handleResizeComponent,
    handleTextChange,
    handleImageChange,
    handleFormattingChange,
  } = useComposedWhiteboardStore();

  // Pass the same props but with handlers from the new store
  return (
    <OriginalDraggableComponent
      {...props}
      onSelect={handleSelect}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDelete={handleDeleteComponent}
      onResize={handleResizeComponent}
      onTextChange={handleTextChange}
      onImageChange={handleImageChange}
      onFormattingChange={handleFormattingChange}
    />
  );
};

/**
 * Migration utility: Wrapper that can switch between old and new store
 * Set USE_NEW_STORES to true to test the new architecture
 */
const USE_NEW_STORES = false; // Set to true to test new store architecture

export const DraggableComponentMigrated: React.FC<DraggableComponentNewStoreProps> = (props) => {
  if (USE_NEW_STORES) {
    return <DraggableComponentNewStore {...props} />;
  }
  
  // Fallback to original component with original store (would need original props)
  return <OriginalDraggableComponent {...props as any} />;
};
