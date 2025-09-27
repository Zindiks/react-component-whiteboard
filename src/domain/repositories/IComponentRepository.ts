import { ComponentEntity } from '../entities/Component.entity';
import { OperationResult } from '../schemas/whiteboard.schema';
import type { Component, ComponentCreate } from '../schemas/component.schema';

/**
 * Interface for component repository operations
 * Defines the contract for component data persistence and retrieval
 */
export interface IComponentRepository {
  /**
   * Get all components
   */
  getAll(): Promise<ComponentEntity[]>;

  /**
   * Get component by ID
   */
  getById(id: number): Promise<ComponentEntity | null>;

  /**
   * Get components by type
   */
  getByType(type: string): Promise<ComponentEntity[]>;

  /**
   * Get components within bounds
   */
  getWithinBounds(bounds: { left: number; top: number; right: number; bottom: number }): Promise<ComponentEntity[]>;

  /**
   * Create a new component
   */
  create(data: ComponentCreate): Promise<OperationResult & { data?: ComponentEntity }>;

  /**
   * Update an existing component
   */
  update(component: ComponentEntity): Promise<OperationResult & { data?: ComponentEntity }>;

  /**
   * Delete a component by ID
   */
  delete(id: number): Promise<OperationResult>;

  /**
   * Delete multiple components by IDs
   */
  deleteMany(ids: number[]): Promise<OperationResult>;

  /**
   * Clear all components
   */
  clear(): Promise<OperationResult>;

  /**
   * Get the next available ID
   */
  getNextId(): Promise<number>;

  /**
   * Get the highest z-index
   */
  getMaxZIndex(): Promise<number>;

  /**
   * Bulk create components
   */
  createMany(components: ComponentCreate[]): Promise<OperationResult & { data?: ComponentEntity[] }>;

  /**
   * Bulk update components
   */
  updateMany(components: ComponentEntity[]): Promise<OperationResult & { data?: ComponentEntity[] }>;

  /**
   * Find components by predicate
   */
  find(predicate: (component: ComponentEntity) => boolean): Promise<ComponentEntity[]>;

  /**
   * Check if component exists by ID
   */
  exists(id: number): Promise<boolean>;

  /**
   * Get component count
   */
  count(): Promise<number>;

  /**
   * Get components sorted by field
   */
  getSorted(field: keyof Component, direction: 'asc' | 'desc'): Promise<ComponentEntity[]>;
}