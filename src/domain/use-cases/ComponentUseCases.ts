import { ComponentEntity } from '../entities/Component.entity';
import { IComponentRepository } from '../repositories/IComponentRepository';
import { OperationResult } from '../schemas/whiteboard.schema';
import type { ComponentCreate, ComponentUpdate } from '../schemas/component.schema';

/**
 * Component use cases - contains business logic for component operations
 */
export class ComponentUseCases {
  constructor(private componentRepository: IComponentRepository) {}

  /**
   * Create a new component with validation
   */
  async createComponent(data: ComponentCreate): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      // Generate next ID
      const id = await this.componentRepository.getNextId();
      
      // Create entity (validates automatically)
      const component = ComponentEntity.create(data, id);
      
      // Validate business rules
      const validation = component.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          message: 'Component validation failed',
        };
      }

      // Save to repository
      return await this.componentRepository.create(data);
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
  async updateComponent(id: number, updateData: Partial<ComponentUpdate>): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      // Get existing component
      const existingComponent = await this.componentRepository.getById(id);
      if (!existingComponent) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      // Update component
      const updatedComponent = existingComponent.update({ id, ...updateData });
      
      // Validate business rules
      const validation = updatedComponent.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          message: 'Component validation failed',
        };
      }

      // Save to repository
      return await this.componentRepository.update(updatedComponent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update component',
      };
    }
  }

  /**
   * Delete a component
   */
  async deleteComponent(id: number): Promise<OperationResult> {
    try {
      const exists = await this.componentRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      return await this.componentRepository.delete(id);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete component',
      };
    }
  }

  /**
   * Delete multiple components
   */
  async deleteComponents(ids: number[]): Promise<OperationResult> {
    try {
      if (ids.length === 0) {
        return {
          success: true,
          message: 'No components to delete',
        };
      }

      return await this.componentRepository.deleteMany(ids);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete components',
      };
    }
  }

  /**
   * Get all components
   */
  async getAllComponents(): Promise<ComponentEntity[]> {
    return await this.componentRepository.getAll();
  }

  /**
   * Get component by ID
   */
  async getComponentById(id: number): Promise<ComponentEntity | null> {
    return await this.componentRepository.getById(id);
  }

  /**
   * Move a component to a new position
   */
  async moveComponent(id: number, x: number, y: number): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      const component = await this.componentRepository.getById(id);
      if (!component) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      const updatedComponent = component.updatePosition(x, y);
      return await this.componentRepository.update(updatedComponent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to move component',
      };
    }
  }

  /**
   * Resize a component
   */
  async resizeComponent(id: number, width: number, height: number): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      if (width <= 0 || height <= 0) {
        return {
          success: false,
          error: 'Invalid dimensions',
          message: 'Width and height must be positive numbers',
        };
      }

      const component = await this.componentRepository.getById(id);
      if (!component) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      const updatedComponent = component.updateDimensions(width, height);
      return await this.componentRepository.update(updatedComponent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to resize component',
      };
    }
  }

  /**
   * Change component z-index (layer order)
   */
  async updateComponentZIndex(id: number, zIndex: number): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      const component = await this.componentRepository.getById(id);
      if (!component) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      const updatedComponent = component.updateZIndex(zIndex);
      return await this.componentRepository.update(updatedComponent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update component z-index',
      };
    }
  }

  /**
   * Bring component to front (highest z-index)
   */
  async bringToFront(id: number): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      const maxZIndex = await this.componentRepository.getMaxZIndex();
      return await this.updateComponentZIndex(id, maxZIndex + 1);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to bring component to front',
      };
    }
  }

  /**
   * Send component to back (lowest z-index)
   */
  async sendToBack(id: number): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      return await this.updateComponentZIndex(id, 1);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to send component to back',
      };
    }
  }

  /**
   * Clone a component
   */
  async cloneComponent(id: number, offsetX: number = 20, offsetY: number = 20): Promise<OperationResult & { data?: ComponentEntity }> {
    try {
      const originalComponent = await this.componentRepository.getById(id);
      if (!originalComponent) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component with ID ${id} does not exist`,
        };
      }

      const newId = await this.componentRepository.getNextId();
      const clonedComponent = originalComponent.cloneAtPosition(
        newId,
        originalComponent.position.x + offsetX,
        originalComponent.position.y + offsetY
      );

      const createData = { ...clonedComponent.data };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (createData as any).id; // Remove ID as it will be assigned by create method

      return await this.componentRepository.create(createData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to clone component',
      };
    }
  }

  /**
   * Get components within a selection area
   */
  async getComponentsInSelection(bounds: { left: number; top: number; right: number; bottom: number }): Promise<ComponentEntity[]> {
    return await this.componentRepository.getWithinBounds(bounds);
  }

  /**
   * Get components by type
   */
  async getComponentsByType(type: string): Promise<ComponentEntity[]> {
    return await this.componentRepository.getByType(type);
  }

  /**
   * Clear all components
   */
  async clearAllComponents(): Promise<OperationResult> {
    return await this.componentRepository.clear();
  }
}