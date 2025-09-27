import { ComponentEntity } from '../../domain/entities/Component.entity';
import { useCleanWhiteboardStore } from '../stores/CleanWhiteboardStore';
import type { Component } from '../../types/whiteboard';
import type { Component as DomainComponent } from '../../domain/schemas/component.schema';

/**
 * Adapter to bridge between the legacy whiteboard store and the new clean architecture store
 * This allows gradual migration of components while maintaining compatibility
 */
export class LegacyStoreAdapter {
  /**
   * Convert legacy Component type to domain Component type
   */
  static legacyToDomain(legacyComponent: Component): DomainComponent {
    // Map legacy component to domain component
    // Both should be compatible, but this provides a clear conversion layer
    return {
      id: legacyComponent.id,
      x: legacyComponent.x,
      y: legacyComponent.y,
      type: legacyComponent.type as DomainComponent['type'],
      width: legacyComponent.width,
      height: legacyComponent.height,
      zIndex: legacyComponent.zIndex,
      imageSrc: legacyComponent.imageSrc,
      text: legacyComponent.text,
      youtubeUrl: legacyComponent.youtubeUrl,
      soundcloudUrl: legacyComponent.soundcloudUrl,
      spotifyUrl: legacyComponent.spotifyUrl,
      fontSize: legacyComponent.fontSize,
      fontFamily: legacyComponent.fontFamily,
      textColor: legacyComponent.textColor,
      textAlign: legacyComponent.textAlign,
      fontWeight: legacyComponent.fontWeight,
      fontStyle: legacyComponent.fontStyle,
      fillColor: legacyComponent.fillColor,
      strokeColor: legacyComponent.strokeColor,
      strokeWidth: legacyComponent.strokeWidth,
      borderRadius: legacyComponent.borderRadius,
      strokeStyle: legacyComponent.strokeStyle,
      arrowStyle: legacyComponent.arrowStyle,
      arrowSize: legacyComponent.arrowSize,
      rotation: legacyComponent.rotation,
      opacity: legacyComponent.opacity,
      backgroundColor: legacyComponent.backgroundColor,
      scrollDirection: legacyComponent.scrollDirection,
      scrollSpeed: legacyComponent.scrollSpeed,
      pauseOnHover: legacyComponent.pauseOnHover,
      bounceOnEnd: legacyComponent.bounceOnEnd,
    };
  }

  /**
   * Convert domain Component type to legacy Component type
   */
  static domainToLegacy(domainComponent: DomainComponent): Component {
    return {
      id: domainComponent.id,
      x: domainComponent.x,
      y: domainComponent.y,
      type: domainComponent.type,
      width: domainComponent.width,
      height: domainComponent.height,
      zIndex: domainComponent.zIndex,
      imageSrc: domainComponent.imageSrc,
      text: domainComponent.text,
      youtubeUrl: domainComponent.youtubeUrl,
      soundcloudUrl: domainComponent.soundcloudUrl,
      spotifyUrl: domainComponent.spotifyUrl,
      fontSize: domainComponent.fontSize,
      fontFamily: domainComponent.fontFamily,
      textColor: domainComponent.textColor,
      textAlign: domainComponent.textAlign,
      fontWeight: domainComponent.fontWeight,
      fontStyle: domainComponent.fontStyle,
      fillColor: domainComponent.fillColor,
      strokeColor: domainComponent.strokeColor,
      strokeWidth: domainComponent.strokeWidth,
      borderRadius: domainComponent.borderRadius,
      strokeStyle: domainComponent.strokeStyle,
      arrowStyle: domainComponent.arrowStyle,
      arrowSize: domainComponent.arrowSize,
      rotation: domainComponent.rotation,
      opacity: domainComponent.opacity,
      backgroundColor: domainComponent.backgroundColor,
      scrollDirection: domainComponent.scrollDirection,
      scrollSpeed: domainComponent.scrollSpeed,
      pauseOnHover: domainComponent.pauseOnHover,
      bounceOnEnd: domainComponent.bounceOnEnd,
    };
  }

  /**
   * Convert ComponentEntity array to legacy Component array
   */
  static entitiesToLegacy(entities: ComponentEntity[]): Component[] {
    return entities.map(entity => this.domainToLegacy(entity.toJSON()));
  }

  /**
   * Convert legacy Component array to ComponentEntity array
   */
  static legacyToEntities(legacyComponents: Component[]): ComponentEntity[] {
    return legacyComponents.map(legacyComp => {
      const domainComp = this.legacyToDomain(legacyComp);
      return ComponentEntity.fromUnsafeData(domainComp);
    });
  }
}

/**
 * Hook to use clean architecture store with legacy component compatibility
 * This can gradually replace useWhiteboardStore in components
 */
export const useWhiteboardStoreWithCleanArchitecture = () => {
  const cleanStore = useCleanWhiteboardStore();

  return {
    // Legacy-compatible component operations
    components: LegacyStoreAdapter.entitiesToLegacy(cleanStore.components),
    selectedComponents: cleanStore.selectedComponents,
    copiedComponents: LegacyStoreAdapter.entitiesToLegacy(cleanStore.copiedComponents),
    
    // UI state (unchanged)
    isGridVisible: cleanStore.isGridVisible,
    isDragging: cleanStore.isDragging,
    isSelecting: cleanStore.isSelecting,
    selectionStart: cleanStore.selectionStart,
    selectionEnd: cleanStore.selectionEnd,
    dragOffset: cleanStore.dragOffset,

    // Component operations (with validation)
    addNewComponent: async (type: string, x?: number, y?: number) => {
      const componentData = {
        type: type as DomainComponent['type'],
        x: x || 0,
        y: y || 0,
      };
      return await cleanStore.createComponent(componentData);
    },
    
    updateComponent: async (id: number, updates: Partial<Component>) => {
      return await cleanStore.updateComponent(id, updates);
    },
    
    deleteComponent: async (id: number) => {
      return await cleanStore.deleteComponent(id);
    },
    
    deleteComponents: async (ids: number[]) => {
      return await cleanStore.deleteComponents(ids);
    },
    
    moveComponent: async (id: number, x: number, y: number) => {
      return await cleanStore.moveComponent(id, x, y);
    },
    
    resizeComponent: async (id: number, width: number, height: number) => {
      return await cleanStore.resizeComponent(id, width, height);
    },
    
    cloneComponent: async (id: number) => {
      return await cleanStore.cloneComponent(id);
    },

    // Selection operations
    setSelectedComponents: cleanStore.selectComponents,
    clearSelection: cleanStore.clearSelection,
    selectAll: cleanStore.selectAll,

    // Clipboard operations
    copyComponents: cleanStore.copyComponents,
    pasteComponents: cleanStore.pasteComponents,

    // Layer operations
    bringToFront: cleanStore.bringToFront,
    sendToBack: cleanStore.sendToBack,

    // UI state operations
    setGridVisible: cleanStore.setGridVisible,
    setDragging: cleanStore.setDragging,
    setSelecting: cleanStore.setSelecting,
    setSelectionArea: cleanStore.setSelectionArea,
    setDragOffset: cleanStore.setDragOffset,

    // Utility operations
    validateState: cleanStore.validateState,
    refreshStore: cleanStore.refreshStore,

    // Clean architecture specific methods (for components that want to use them)
    cleanArchitecture: {
      getComponentById: cleanStore.getComponentById,
      getComponentsByType: cleanStore.getComponentsByType,
      getComponentsInBounds: cleanStore.getComponentsInBounds,
      getAllComponents: cleanStore.getAllComponents,
      getSelectedComponents: cleanStore.getSelectedComponents,
      getCopiedComponents: cleanStore.getCopiedComponents,
    },
  };
};