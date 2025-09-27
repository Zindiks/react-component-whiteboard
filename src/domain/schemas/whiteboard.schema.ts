import { z } from 'zod';
import { ComponentSchema, PointSchema } from './component.schema';

// Whiteboard state schema (for raw data validation)
export const WhiteboardStateSchema = z.object({
  components: z.array(ComponentSchema),
  selectedComponents: z.array(z.number().int().positive()),
  copiedComponents: z.array(ComponentSchema),
  isGridVisible: z.boolean(),
  isDragging: z.boolean(),
  isSelecting: z.boolean(),
  selectionStart: PointSchema.nullable(),
  selectionEnd: PointSchema.nullable(),
  dragOffset: PointSchema.nullable(),
});

// Whiteboard state interface for the store (uses ComponentEntity)
export interface WhiteboardState {
  components: import('../entities/Component.entity').ComponentEntity[];
  selectedComponents: number[];
  copiedComponents: import('../entities/Component.entity').ComponentEntity[];
  isGridVisible: boolean;
  isDragging: boolean;
  isSelecting: boolean;
  selectionStart: Point | null;
  selectionEnd: Point | null;
  dragOffset: Point | null;
}

// Transform schema for zoom/pan operations
export const TransformSchema = z.object({
  x: z.number(),
  y: z.number(),
  k: z.number().positive(),
});

// Bounds schema for component boundaries
export const BoundsSchema = z.object({
  left: z.number(),
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  width: z.number().min(0),
  height: z.number().min(0),
});

// Selection rectangle schema
export const SelectionRectSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().min(0),
  height: z.number().min(0),
});

// Grid configuration schema
export const GridConfigSchema = z.object({
  size: z.number().positive(),
  visible: z.boolean(),
  snapToGrid: z.boolean(),
  color: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

// Zoom configuration schema
export const ZoomConfigSchema = z.object({
  min: z.number().positive(),
  max: z.number().positive(),
  step: z.number().positive(),
});

// Component operation result schema
export const OperationResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Clipboard operation schema
export const ClipboardOperationSchema = z.object({
  action: z.enum(['copy', 'cut', 'paste']),
  components: z.array(ComponentSchema),
  position: PointSchema.optional(),
});

// Export types
export type WhiteboardStateRaw = z.infer<typeof WhiteboardStateSchema>;
export type Transform = z.infer<typeof TransformSchema>;
export type Bounds = z.infer<typeof BoundsSchema>;
export type SelectionRect = z.infer<typeof SelectionRectSchema>;
export type GridConfig = z.infer<typeof GridConfigSchema>;
export type ZoomConfig = z.infer<typeof ZoomConfigSchema>;
export type OperationResult = z.infer<typeof OperationResultSchema>;
export type ClipboardOperation = z.infer<typeof ClipboardOperationSchema>;
export type Point = z.infer<typeof PointSchema>;