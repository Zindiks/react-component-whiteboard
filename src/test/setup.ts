import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock d3 module for tests
vi.mock("d3", () => ({
  select: vi.fn(),
  selectAll: vi.fn(),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
  })),
  zoomIdentity: {
    k: 1,
    x: 0,
    y: 0,
  },
  zoomTransform: vi.fn(() => ({
    k: 1,
    x: 0,
    y: 0,
  })),
}));

// Mock performance APIs
Object.defineProperty(window, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) =>
  setTimeout(cb, 16)
);
global.cancelAnimationFrame = vi.fn();
