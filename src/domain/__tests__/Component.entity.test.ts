import { describe, it, expect } from 'vitest';
import { ComponentEntity } from '../entities/Component.entity';

describe('ComponentEntity', () => {
  const validComponentData = {
    id: 1,
    x: 100,
    y: 200,
    type: 'rectangle' as const,
    width: 150,
    height: 100,
    zIndex: 1,
  };

  describe('constructor', () => {
    it('should create a valid component entity', () => {
      const component = new ComponentEntity(validComponentData);
      expect(component.id).toBe(1);
      expect(component.type).toBe('rectangle');
      expect(component.position).toEqual({ x: 100, y: 200 });
      expect(component.dimensions).toEqual({ width: 150, height: 100 });
    });

    it('should throw error for invalid data', () => {
      const invalidData = { ...validComponentData, id: -1 };
      expect(() => new ComponentEntity(invalidData)).toThrow();
    });
  });

  describe('create static method', () => {
    it('should create component from creation data', () => {
      const createData = { ...validComponentData };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (createData as any).id;
      
      const component = ComponentEntity.create(createData, 5);
      expect(component.id).toBe(5);
      expect(component.type).toBe('rectangle');
    });
  });

  describe('fromUnsafeData static method', () => {
    it('should create component from unsafe data', () => {
      const component = ComponentEntity.fromUnsafeData(validComponentData);
      expect(component.id).toBe(1);
    });

    it('should throw error for invalid unsafe data', () => {
      const invalidData = { x: 100, y: 200 }; // missing required fields
      expect(() => ComponentEntity.fromUnsafeData(invalidData)).toThrow();
    });
  });

  describe('update method', () => {
    it('should update component with valid data', () => {
      const component = new ComponentEntity(validComponentData);
      const updated = component.update({ id: 1, x: 300, y: 400 });
      
      expect(updated.position).toEqual({ x: 300, y: 400 });
      expect(updated.id).toBe(1);
      // Original component should remain unchanged
      expect(component.position).toEqual({ x: 100, y: 200 });
    });

    it('should throw error when trying to change ID', () => {
      const component = new ComponentEntity(validComponentData);
      expect(() => component.update({ id: 2, x: 300 })).toThrow('Cannot change component ID during update');
    });
  });

  describe('position and dimension methods', () => {
    it('should update position correctly', () => {
      const component = new ComponentEntity(validComponentData);
      const moved = component.updatePosition(500, 600);
      
      expect(moved.position).toEqual({ x: 500, y: 600 });
      expect(moved.id).toBe(component.id);
    });

    it('should update dimensions correctly', () => {
      const component = new ComponentEntity(validComponentData);
      const resized = component.updateDimensions(250, 200);
      
      expect(resized.dimensions).toEqual({ width: 250, height: 200 });
      expect(resized.id).toBe(component.id);
    });

    it('should update z-index correctly', () => {
      const component = new ComponentEntity(validComponentData);
      const layered = component.updateZIndex(10);
      
      expect(layered.zIndex).toBe(10);
      expect(layered.id).toBe(component.id);
    });
  });

  describe('bounds and collision detection', () => {
    it('should calculate bounds correctly', () => {
      const component = new ComponentEntity(validComponentData);
      const bounds = component.getBounds();
      
      expect(bounds).toEqual({
        left: 100,
        top: 200,
        right: 250, // 100 + 150
        bottom: 300, // 200 + 100
        width: 150,
        height: 100,
      });
    });

    it('should detect point containment correctly', () => {
      const component = new ComponentEntity(validComponentData);
      
      expect(component.containsPoint(150, 250)).toBe(true); // inside
      expect(component.containsPoint(100, 200)).toBe(true); // on edge
      expect(component.containsPoint(50, 150)).toBe(false); // outside
      expect(component.containsPoint(300, 350)).toBe(false); // outside
    });

    it('should detect component overlap correctly', () => {
      const component1 = new ComponentEntity(validComponentData);
      const component2 = new ComponentEntity({
        ...validComponentData,
        id: 2,
        x: 150,
        y: 250,
      });
      const component3 = new ComponentEntity({
        ...validComponentData,
        id: 3,
        x: 300,
        y: 400,
      });
      
      expect(component1.overlaps(component2)).toBe(true); // overlapping
      expect(component1.overlaps(component3)).toBe(false); // separate
    });
  });

  describe('clone methods', () => {
    it('should clone component with new ID', () => {
      const component = new ComponentEntity(validComponentData);
      const cloned = component.clone(10);
      
      expect(cloned.id).toBe(10);
      expect(cloned.position).toEqual(component.position);
      expect(cloned.type).toBe(component.type);
    });

    it('should clone component at new position', () => {
      const component = new ComponentEntity(validComponentData);
      const cloned = component.cloneAtPosition(10, 400, 500);
      
      expect(cloned.id).toBe(10);
      expect(cloned.position).toEqual({ x: 400, y: 500 });
      expect(cloned.type).toBe(component.type);
    });
  });

  describe('type checking methods', () => {
    it('should identify media components correctly', () => {
      const imageComponent = new ComponentEntity({
        ...validComponentData,
        type: 'image',
        imageSrc: 'https://example.com/image.jpg',
      });
      const youtubeComponent = new ComponentEntity({
        ...validComponentData,
        type: 'youtube',
        youtubeUrl: 'https://youtube.com/watch?v=test',
      });
      const rectangleComponent = new ComponentEntity(validComponentData);
      
      expect(imageComponent.isMediaComponent()).toBe(true);
      expect(youtubeComponent.isMediaComponent()).toBe(true);
      expect(rectangleComponent.isMediaComponent()).toBe(false);
    });

    it('should identify text components correctly', () => {
      const textComponent = new ComponentEntity({
        ...validComponentData,
        type: 'text',
        text: 'Hello World',
      });
      const rectangleComponent = new ComponentEntity(validComponentData);
      
      expect(textComponent.isTextComponent()).toBe(true);
      expect(rectangleComponent.isTextComponent()).toBe(false);
    });

    it('should identify shape components correctly', () => {
      const rectangleComponent = new ComponentEntity({
        ...validComponentData,
        type: 'rectangle',
      });
      const circleComponent = new ComponentEntity({
        ...validComponentData,
        type: 'ellipse',
      });
      const timerComponent = new ComponentEntity({
        ...validComponentData,
        type: 'timer',
      });
      
      expect(rectangleComponent.isShapeComponent()).toBe(true);
      expect(circleComponent.isShapeComponent()).toBe(true);
      expect(timerComponent.isShapeComponent()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate correct components', () => {
      const component = new ComponentEntity(validComponentData);
      const validation = component.validate();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors for required fields', () => {
      const imageComponent = new ComponentEntity({
        ...validComponentData,
        type: 'image',
        // missing imageSrc
      });
      const validation = imageComponent.validate();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Image component requires imageSrc');
    });

    it('should detect invalid dimensions during creation', () => {
      const invalidData = {
        ...validComponentData,
        width: -10,
      };
      
      // This should throw during construction since Zod validation happens first
      expect(() => new ComponentEntity(invalidData)).toThrow();
    });
  });

  describe('serialization', () => {
    it('should convert to JSON correctly', () => {
      const component = new ComponentEntity(validComponentData);
      const json = component.toJSON();
      
      expect(json).toEqual(validComponentData);
      expect(json).not.toBe(component.data); // should be a copy
    });

    it('should convert to string correctly', () => {
      const component = new ComponentEntity(validComponentData);
      const str = component.toString();
      
      expect(str).toBe('Component(id=1, type=rectangle, x=100, y=200)');
    });
  });
});