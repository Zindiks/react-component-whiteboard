import { vi } from "vitest";
import { Component } from "../types/whiteboard";

export const createMockComponent = (
  overrides: Partial<Component> = {}
): Component => ({
  id: 1,
  x: 100,
  y: 100,
  type: "rectangle",
  width: 150,
  height: 100,
  zIndex: 0,
  text: "Test Component",
  fillColor: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 1,
  fontSize: 14,
  fontFamily: "Arial",
  textColor: "#000000",
  textAlign: "left",
  fontWeight: "normal",
  fontStyle: "normal",
  ...overrides,
});

export const createMockTransform = (overrides = {}) => ({
  k: 1,
  x: 0,
  y: 0,
  invert: vi.fn(),
  invertX: vi.fn(),
  invertY: vi.fn(),
  rescaleX: vi.fn(),
  rescaleY: vi.fn(),
  apply: vi.fn(),
  applyX: vi.fn(),
  applyY: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  toString: vi.fn(),
  ...overrides,
});

export const mockEventHandlers = {
  onDrag: vi.fn(),
  onDragStart: vi.fn(),
  onSelect: vi.fn(),
  onDelete: vi.fn(),
  onResize: vi.fn(),
  onTextChange: vi.fn(),
  onImageChange: vi.fn(),
  onEditingChange: vi.fn(),
  onFormattingChange: vi.fn(),
};

export const resetMocks = () => {
  Object.values(mockEventHandlers).forEach((mock) => mock.mockClear());
};
