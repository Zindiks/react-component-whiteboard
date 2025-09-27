import { ComponentSchema, ComponentUpdateSchema } from '../schemas/component.schema';
import { ValidationUtils } from '../schemas/validation.utils';
import type { Component as ComponentType, ComponentCreate, ComponentUpdate } from '../schemas/component.schema';

/**
 * Component entity class with validation and business logic
 */
export class ComponentEntity {
  private _data: ComponentType;

  constructor(data: ComponentType) {
    const validation = ValidationUtils.validate(ComponentSchema, data);
    if (!validation.success) {
      throw new Error(validation.error || 'Invalid component data');
    }
    this._data = validation.data!;
  }

  /**
   * Create a new component from creation data
   */
  static create(data: ComponentCreate, id: number): ComponentEntity {
    const componentData = { ...data, id };
    return new ComponentEntity(componentData);
  }

  /**
   * Create component from potentially unsafe data
   */
  static fromUnsafeData(data: unknown): ComponentEntity {
    const validation = ValidationUtils.validate(ComponentSchema, data);
    if (!validation.success) {
      throw new Error(validation.error || 'Invalid component data');
    }
    return new ComponentEntity(validation.data!);
  }

  /**
   * Get component data (immutable)
   */
  get data(): Readonly<ComponentType> {
    return Object.freeze({ ...this._data });
  }

  /**
   * Get component ID
   */
  get id(): number {
    return this._data.id;
  }

  /**
   * Get component type
   */
  get type(): string {
    return this._data.type;
  }

  /**
   * Get component position
   */
  get position(): { x: number; y: number } {
    return { x: this._data.x, y: this._data.y };
  }

  /**
   * Get component dimensions
   */
  get dimensions(): { width?: number; height?: number } {
    return { width: this._data.width, height: this._data.height };
  }

  /**
   * Get component z-index
   */
  get zIndex(): number | undefined {
    return this._data.zIndex;
  }

  /**
   * Update component with validated data
   */
  update(updateData: ComponentUpdate): ComponentEntity {
    if (updateData.id !== this._data.id) {
      throw new Error('Cannot change component ID during update');
    }

    const validation = ValidationUtils.validate(ComponentUpdateSchema, updateData);
    if (!validation.success) {
      throw new Error(validation.error || 'Invalid update data');
    }

    const newData = { ...this._data, ...validation.data };
    return new ComponentEntity(newData);
  }

  /**
   * Update component position
   */
  updatePosition(x: number, y: number): ComponentEntity {
    return this.update({ id: this._data.id, x, y });
  }

  /**
   * Update component dimensions
   */
  updateDimensions(width: number, height: number): ComponentEntity {
    return this.update({ id: this._data.id, width, height });
  }

  /**
   * Update component z-index
   */
  updateZIndex(zIndex: number): ComponentEntity {
    return this.update({ id: this._data.id, zIndex });
  }

  /**
   * Check if component overlaps with another component
   */
  overlaps(other: ComponentEntity): boolean {
    const thisRight = this._data.x + (this._data.width || 0);
    const thisBottom = this._data.y + (this._data.height || 0);
    const otherRight = other._data.x + (other._data.width || 0);
    const otherBottom = other._data.y + (other._data.height || 0);

    return !(
      thisRight <= other._data.x ||
      this._data.x >= otherRight ||
      thisBottom <= other._data.y ||
      this._data.y >= otherBottom
    );
  }

  /**
   * Check if point is within component bounds
   */
  containsPoint(x: number, y: number): boolean {
    const width = this._data.width || 0;
    const height = this._data.height || 0;
    
    return (
      x >= this._data.x &&
      x <= this._data.x + width &&
      y >= this._data.y &&
      y <= this._data.y + height
    );
  }

  /**
   * Get component bounds
   */
  getBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
    const width = this._data.width || 0;
    const height = this._data.height || 0;
    
    return {
      left: this._data.x,
      top: this._data.y,
      right: this._data.x + width,
      bottom: this._data.y + height,
      width,
      height,
    };
  }

  /**
   * Clone component with new ID
   */
  clone(newId: number): ComponentEntity {
    return new ComponentEntity({ ...this._data, id: newId });
  }

  /**
   * Clone component at new position
   */
  cloneAtPosition(newId: number, x: number, y: number): ComponentEntity {
    return new ComponentEntity({ ...this._data, id: newId, x, y });
  }

  /**
   * Check if component is a media component (has media URLs)
   */
  isMediaComponent(): boolean {
    return !!(
      this._data.imageSrc ||
      this._data.youtubeUrl ||
      this._data.soundcloudUrl ||
      this._data.spotifyUrl
    );
  }

  /**
   * Check if component is a text component
   */
  isTextComponent(): boolean {
    return this._data.type === 'text' || this._data.type === 'scrollingtext' || !!this._data.text;
  }

  /**
   * Check if component is a shape component
   */
  isShapeComponent(): boolean {
    return ['rectangle', 'ellipse', 'line', 'arrow'].includes(this._data.type);
  }

  /**
   * Validate component data integrity
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields based on component type
    switch (this._data.type) {
      case 'image':
        if (!this._data.imageSrc) {
          errors.push('Image component requires imageSrc');
        }
        break;
      case 'youtube':
        if (!this._data.youtubeUrl) {
          errors.push('YouTube component requires youtubeUrl');
        }
        break;
      case 'soundcloud':
        if (!this._data.soundcloudUrl) {
          errors.push('SoundCloud component requires soundcloudUrl');
        }
        break;
      case 'spotify':
        if (!this._data.spotifyUrl) {
          errors.push('Spotify component requires spotifyUrl');
        }
        break;
      case 'text':
      case 'scrollingtext':
        if (!this._data.text) {
          errors.push('Text component requires text content');
        }
        break;
    }

    // Validate dimensions if provided
    if (this._data.width !== undefined && this._data.width <= 0) {
      errors.push('Width must be positive');
    }
    if (this._data.height !== undefined && this._data.height <= 0) {
      errors.push('Height must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): ComponentType {
    return { ...this._data };
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `Component(id=${this._data.id}, type=${this._data.type}, x=${this._data.x}, y=${this._data.y})`;
  }
}