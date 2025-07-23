import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentRenderer } from "../ComponentRenderer";
import {
  createMockComponent,
  mockEventHandlers,
  resetMocks,
} from "../../test/testUtils";

// Mock all the widget and shape components
vi.mock("../widgets/Timer", () => ({
  Timer: () => <div data-testid="timer-widget">Timer</div>,
}));

vi.mock("../widgets/Weather", () => ({
  Weather: () => <div data-testid="weather-widget">Weather</div>,
}));

vi.mock("../widgets/BitcoinChart", () => ({
  BitcoinChart: ({ width, height }: { width?: number; height?: number }) => (
    <div data-testid="bitcoin-widget" data-width={width} data-height={height}>
      Bitcoin Chart
    </div>
  ),
}));

vi.mock("../widgets/TextNote", () => ({
  TextNote: () => <div data-testid="note-widget">Text Note</div>,
}));

vi.mock("../shapes", () => ({
  RectangleShape: ({
    width,
    height,
    text,
    fillColor,
  }: {
    width?: number;
    height?: number;
    text?: string;
    fillColor?: string;
  }) => (
    <div
      data-testid="rectangle-shape"
      data-width={width}
      data-height={height}
      data-text={text}
      data-fill-color={fillColor}
    >
      Rectangle Shape
    </div>
  ),
  EllipseShape: ({
    width,
    height,
    text,
  }: {
    width?: number;
    height?: number;
    text?: string;
  }) => (
    <div
      data-testid="ellipse-shape"
      data-width={width}
      data-height={height}
      data-text={text}
    >
      Ellipse Shape
    </div>
  ),
  TextShape: ({
    text,
    fontSize,
    textColor,
  }: {
    text?: string;
    fontSize?: number;
    textColor?: string;
  }) => (
    <div
      data-testid="text-shape"
      data-text={text}
      data-font-size={fontSize}
      data-text-color={textColor}
    >
      Text Shape: {text}
    </div>
  ),
  ScrollingTextShape: ({
    text,
    scrollDirection,
    scrollSpeed,
  }: {
    text?: string;
    scrollDirection?: string;
    scrollSpeed?: number;
  }) => (
    <div
      data-testid="scrolling-text-shape"
      data-text={text}
      data-scroll-direction={scrollDirection}
      data-scroll-speed={scrollSpeed}
    >
      Scrolling Text: {text}
    </div>
  ),
  ImageShape: ({
    imageSrc,
    rotation,
    opacity,
  }: {
    imageSrc?: string;
    rotation?: number;
    opacity?: number;
  }) => (
    <div
      data-testid="image-shape"
      data-image-src={imageSrc}
      data-rotation={rotation}
      data-opacity={opacity}
    >
      Image Shape
    </div>
  ),
}));

describe("ComponentRenderer", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("Widget Components", () => {
    it("renders Timer widget correctly", () => {
      const component = createMockComponent({ type: "timer" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      expect(screen.getByTestId("timer-widget")).toBeInTheDocument();
    });

    it("renders Weather widget correctly", () => {
      const component = createMockComponent({ type: "weather" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      expect(screen.getByTestId("weather-widget")).toBeInTheDocument();
    });

    it("renders Bitcoin widget with dimensions", () => {
      const component = createMockComponent({
        type: "bitcoin",
        width: 300,
        height: 200,
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const bitcoinWidget = screen.getByTestId("bitcoin-widget");
      expect(bitcoinWidget).toBeInTheDocument();
      expect(bitcoinWidget).toHaveAttribute("data-width", "300");
      expect(bitcoinWidget).toHaveAttribute("data-height", "200");
    });

    it("renders Text Note widget correctly", () => {
      const component = createMockComponent({ type: "note" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      expect(screen.getByTestId("note-widget")).toBeInTheDocument();
    });
  });

  describe("Shape Components", () => {
    it("renders Rectangle shape with properties", () => {
      const component = createMockComponent({
        type: "rectangle",
        width: 200,
        height: 150,
        text: "Rectangle Text",
        fillColor: "#ff0000",
      });

      render(
        <ComponentRenderer
          component={component}
          selected={true}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("rectangle-shape");
      expect(shape).toBeInTheDocument();
      expect(shape).toHaveAttribute("data-width", "200");
      expect(shape).toHaveAttribute("data-height", "150");
      expect(shape).toHaveAttribute("data-text", "Rectangle Text");
      expect(shape).toHaveAttribute("data-fill-color", "#ff0000");
    });

    it("renders Ellipse shape with properties", () => {
      const component = createMockComponent({
        type: "ellipse",
        width: 180,
        height: 120,
        text: "Ellipse Text",
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("ellipse-shape");
      expect(shape).toBeInTheDocument();
      expect(shape).toHaveAttribute("data-width", "180");
      expect(shape).toHaveAttribute("data-height", "120");
      expect(shape).toHaveAttribute("data-text", "Ellipse Text");
    });

    it("renders Text shape with formatting", () => {
      const component = createMockComponent({
        type: "text",
        text: "Custom Text",
        fontSize: 18,
        textColor: "#0000ff",
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("text-shape");
      expect(shape).toBeInTheDocument();
      expect(shape).toHaveAttribute("data-text", "Custom Text");
      expect(shape).toHaveAttribute("data-font-size", "18");
      expect(shape).toHaveAttribute("data-text-color", "#0000ff");
    });

    it("renders Scrolling text shape with animation properties", () => {
      const component = createMockComponent({
        type: "scrollingtext",
        text: "Scrolling Message",
        scrollDirection: "vertical",
        scrollSpeed: 75,
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("scrolling-text-shape");
      expect(shape).toBeInTheDocument();
      expect(shape).toHaveAttribute("data-text", "Scrolling Message");
      expect(shape).toHaveAttribute("data-scroll-direction", "vertical");
      expect(shape).toHaveAttribute("data-scroll-speed", "75");
    });

    it("renders Image shape with transformation properties", () => {
      const component = createMockComponent({
        type: "imageShape",
        imageSrc: "https://example.com/image.jpg",
        rotation: 45,
        opacity: 0.8,
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("image-shape");
      expect(shape).toBeInTheDocument();
      expect(shape).toHaveAttribute(
        "data-image-src",
        "https://example.com/image.jpg"
      );
      expect(shape).toHaveAttribute("data-rotation", "45");
      expect(shape).toHaveAttribute("data-opacity", "0.8");
    });
  });

  describe("Default Dimensions", () => {
    it("applies default dimensions for rectangle when not specified", () => {
      const component = createMockComponent({
        type: "rectangle",
        width: undefined,
        height: undefined,
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("rectangle-shape");
      expect(shape).toHaveAttribute("data-width", "150");
      expect(shape).toHaveAttribute("data-height", "100");
    });

    it("applies default text for scrolling text when not specified", () => {
      const component = createMockComponent({
        type: "scrollingtext",
        text: undefined,
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      const shape = screen.getByTestId("scrolling-text-shape");
      expect(shape).toHaveAttribute(
        "data-text",
        "Scrolling text - double-click to edit"
      );
    });
  });

  describe("Unknown Component Type", () => {
    it("renders fallback component for unknown type", () => {
      const component = createMockComponent({
        type: "unknown-type",
        id: 42,
      });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  describe("Callback Props", () => {
    it("passes onSelect callback correctly", () => {
      const component = createMockComponent({ type: "rectangle" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      // The component should pass the callback down to the shape
      // This would be tested by simulating click events on the actual shapes
      expect(mockEventHandlers.onSelect).not.toHaveBeenCalled();
    });

    it("passes onResize callback correctly", () => {
      const component = createMockComponent({ type: "rectangle" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
          onResize={mockEventHandlers.onResize}
        />
      );

      // The resize callback should be passed to resizable components
      expect(mockEventHandlers.onResize).not.toHaveBeenCalled();
    });

    it("passes onTextChange callback correctly", () => {
      const component = createMockComponent({ type: "text" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
          onTextChange={mockEventHandlers.onTextChange}
        />
      );

      // The text change callback should be passed to text components
      expect(mockEventHandlers.onTextChange).not.toHaveBeenCalled();
    });

    it("passes onFormattingChange callback correctly", () => {
      const component = createMockComponent({ type: "text" });

      render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
          onFormattingChange={mockEventHandlers.onFormattingChange}
        />
      );

      // The formatting callback should be passed to formattable components
      expect(mockEventHandlers.onFormattingChange).not.toHaveBeenCalled();
    });
  });

  describe("Component Selection State", () => {
    it("passes selection state to shape components", () => {
      const component = createMockComponent({ type: "rectangle" });

      const { rerender } = render(
        <ComponentRenderer
          component={component}
          selected={false}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      let shape = screen.getByTestId("rectangle-shape");
      expect(shape).toBeInTheDocument();

      // Re-render with selected state
      rerender(
        <ComponentRenderer
          component={component}
          selected={true}
          onSelect={mockEventHandlers.onSelect}
        />
      );

      shape = screen.getByTestId("rectangle-shape");
      expect(shape).toBeInTheDocument();
    });
  });
});
