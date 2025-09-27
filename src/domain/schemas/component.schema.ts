import { z } from 'zod';

// Base coordinate schema
export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Text alignment schema
export const TextAlignSchema = z.enum(['left', 'center', 'right']);

// Font weight schema
export const FontWeightSchema = z.enum(['normal', 'bold']);

// Font style schema
export const FontStyleSchema = z.enum(['normal', 'italic']);

// Stroke style schema
export const StrokeStyleSchema = z.enum(['solid', 'dashed', 'dotted']);

// Arrow style schema
export const ArrowStyleSchema = z.enum(['none', 'arrow', 'double-arrow']);

// Scroll direction schema
export const ScrollDirectionSchema = z.enum(['horizontal', 'vertical']);

// Component type schema - extensible for new component types
export const ComponentTypeSchema = z.enum([
  'timer',
  'weather',
  'bitcoin',
  'currency',
  'confetti',
  'note',
  'watch',
  'youtube',
  'soundcloud',
  'spotify',
  'linkpreview',
  'image',
  'text',
  'rectangle',
  'ellipse',
  'line',
  'arrow',
  'scrollingtext',
]);

// Core component schema with validation
export const ComponentSchema = z.object({
  // Required fields
  id: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  type: ComponentTypeSchema,
  
  // Optional positioning and sizing
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  zIndex: z.number().int().optional(),
  
  // Media content
  imageSrc: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
  soundcloudUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
  
  // Text content and formatting
  text: z.string().optional(),
  fontSize: z.number().positive().optional(),
  fontFamily: z.string().optional(),
  textColor: z.string().optional(),
  textAlign: TextAlignSchema.optional(),
  fontWeight: FontWeightSchema.optional(),
  fontStyle: FontStyleSchema.optional(),
  
  // Shape formatting
  fillColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  borderRadius: z.number().min(0).optional(),
  
  // Line formatting
  strokeStyle: StrokeStyleSchema.optional(),
  arrowStyle: ArrowStyleSchema.optional(),
  arrowSize: z.number().positive().optional(),
  
  // Visual effects
  rotation: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  backgroundColor: z.string().optional(),
  
  // Scrolling text options
  scrollDirection: ScrollDirectionSchema.optional(),
  scrollSpeed: z.number().positive().optional(),
  pauseOnHover: z.boolean().optional(),
  bounceOnEnd: z.boolean().optional(),
});

// Component creation schema (without ID and default values)
export const ComponentCreateSchema = ComponentSchema.omit({ id: true });

// Component update schema (partial, but ID is required)
export const ComponentUpdateSchema = ComponentSchema.partial().required({ id: true });

// Initial position schema
export const InitialPositionSchema = z.object({
  id: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
});

// Type exports for use in other parts of the application
export type Component = z.infer<typeof ComponentSchema>;
export type ComponentCreate = z.infer<typeof ComponentCreateSchema>;
export type ComponentUpdate = z.infer<typeof ComponentUpdateSchema>;
export type Point = z.infer<typeof PointSchema>;
export type InitialPosition = z.infer<typeof InitialPositionSchema>;
export type ComponentType = z.infer<typeof ComponentTypeSchema>;
export type TextAlign = z.infer<typeof TextAlignSchema>;
export type FontWeight = z.infer<typeof FontWeightSchema>;
export type FontStyle = z.infer<typeof FontStyleSchema>;
export type StrokeStyle = z.infer<typeof StrokeStyleSchema>;
export type ArrowStyle = z.infer<typeof ArrowStyleSchema>;
export type ScrollDirection = z.infer<typeof ScrollDirectionSchema>;