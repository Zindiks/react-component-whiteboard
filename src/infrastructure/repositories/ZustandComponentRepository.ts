import { ComponentEntity } from '../../domain/entities/Component.entity';
import { IComponentRepository } from '../../domain/repositories/IComponentRepository';
import { OperationResult } from '../../domain/schemas/whiteboard.schema';
import type { Component, ComponentCreate } from '../../domain/schemas/component.schema';

/**
 * Zustand-based implementation of the component repository
 * This adapts the Zustand store to implement our clean architecture repository pattern
 */
export class ZustandComponentRepository implements IComponentRepository {
  private components: ComponentEntity[] = [];
  private nextId: number = 1;

  constructor(initialComponents: Component[] = []) {
    this.components = initialComponents.map(comp => ComponentEntity.fromUnsafeData(comp));
    this.nextId = Math.max(...this.components.map(c => c.id), 0) + 1;
  }

  /**
   * Get all components
   */
  async getAll(): Promise<ComponentEntity[]> {
    return [...this.components];
  }

  /**
   * Get component by ID
   */
  async getById(id: number): Promise<ComponentEntity | null> {
    return this.components.find(comp => comp.id === id) || null;
  }

  /**
   * Get components by type
   */
  async getByType(type: string): Promise<ComponentEntity[]> {
    return this.components.filter(comp => comp.type === type);
  }

  /**
   * Get components within bounds
   */
  async getWithinBounds(bounds: { left: number; top: number; right: number; bottom: number }): Promise<ComponentEntity[]> {
    return this.components.filter(comp => {
      const compBounds = comp.getBounds();
      return (
        compBounds.left < bounds.right &&
        compBounds.right > bounds.left &&
        compBounds.top < bounds.bottom &&
        compBounds.bottom > bounds.top
      );
    });
  }

  /**
   * Create a new component
   */
  async create(data: ComponentCreate): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      const component = ComponentEntity.create(data, this.nextId++);
      
      // Validate component
      const validation = component.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          message: 'Component validation failed',
        };
      }

      this.components.push(component);
      
      return {
        success: true,
        data: component,
        message: 'Component created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create component',
      };
    }
  }

  /**
   * Update an existing component
   */
  async update(component: ComponentEntity): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      const index = this.components.findIndex(comp => comp.id === component.id);
      if (index === -1) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${component.id} does not exist`,
        };
      }

      // Validate component
      const validation = component.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          message: 'Component validation failed',
        };
      }

      this.components[index] = component;
      
      return {
        success: true,
        data: component,
        message: 'Component updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update component',
      };
    }
  }

  /**
   * Delete a component by ID
   */
  async delete(id: number): Promise<OperationResult> {
    try {
      const index = this.components.findIndex(comp => comp.id === id);
      if (index === -1) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      this.components.splice(index, 1);
      
      return {
        success: true,
        message: 'Component deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete component',
      };
    }
  }

  /**
   * Delete multiple components by IDs
   */
  async deleteMany(ids: number[]): Promise<OperationResult> {
    try {
      const initialCount = this.components.length;
      this.components = this.components.filter(comp => !ids.includes(comp.id));
      const deletedCount = initialCount - this.components.length;
      
      return {
        success: true,
        message: `Successfully deleted ${deletedCount} components`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete components',
      };
    }
  }

  /**
   * Clear all components
   */
  async clear(): Promise<OperationResult> {
    try {
      const count = this.components.length;
      this.components = [];
      this.nextId = 1;
      
      return {
        success: true,
        message: `Cleared ${count} components`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to clear components',
      };
    }
  }

  /**
   * Get the next available ID
   */
  async getNextId(): Promise<number> {
    return this.nextId;
  }

  /**
   * Get the highest z-index
   */
  async getMaxZIndex(): Promise<number> {
    return Math.max(...this.components.map(comp => comp.zIndex || 0), 0);
  }

  /**
   * Bulk create components
   */
  async createMany(components: ComponentCreate[]): Promise<OperationResult & { data?: ComponentEntity[] }> {
    try {
      const createdComponents: ComponentEntity[] = [];
      const errors: string[] = [];

      for (const componentData of components) {
        const result = await this.create(componentData);
        if (result.success && result.data) {
          createdComponents.push(result.data);
        } else {
          errors.push(result.error || 'Unknown error');
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          message: `${errors.length} components failed to create`,
        };
      }

      return {
        success: true,
        data: createdComponents,
        message: `Successfully created ${createdComponents.length} components`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create components',
      };
    }
  }

  /**
   * Bulk update components
   */
  async updateMany(components: ComponentEntity[]): Promise<OperationResult & { data?: ComponentEntity[] }> {
    try {
      const updatedComponents: ComponentEntity[] = [];
      const errors: string[] = [];

      for (const component of components) {
        const result = await this.update(component);
        if (result.success && result.data) {
          updatedComponents.push(result.data);
        } else {
          errors.push(result.error || 'Unknown error');
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          message: `${errors.length} components failed to update`,
        };
      }

      return {
        success: true,
        data: updatedComponents,
        message: `Successfully updated ${updatedComponents.length} components`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update components',
      };
    }
  }

  /**
   * Find components by predicate
   */
  async find(predicate: (component: ComponentEntity) => boolean): Promise<ComponentEntity[]> {
    return this.components.filter(predicate);
  }

  /**
   * Check if component exists by ID
   */
  async exists(id: number): Promise<boolean> {
    return this.components.some(comp => comp.id === id);
  }

  /**
   * Get component count
   */
  async count(): Promise<number> {
    return this.components.length;
  }

  /**
   * Get components sorted by field
   */
  async getSorted(field: keyof Component, direction: 'asc' | 'desc'): Promise<ComponentEntity[]> {
    const sorted = [...this.components].sort((a, b) => {
      const aValue = a.data[field];
      const bValue = b.data[field];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === undefined) return direction === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Internal method to get raw component data for Zustand store
   */
  getRawComponents(): Component[] {
    return this.components.map(comp => comp.toJSON());
  }

  /**
   * Internal method to set components from raw data (for Zustand store integration)
   */
  setRawComponents(components: Component[]): void {
    this.components = components.map(comp => ComponentEntity.fromUnsafeData(comp));
    this.nextId = Math.max(...this.components.map(c => c.id), 0) + 1;
  }
}