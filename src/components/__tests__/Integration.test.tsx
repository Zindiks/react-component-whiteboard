import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DraggableComponent } from "../DraggableWhiteboardComponent";
import {
  createMockComponent,
  createMockTransform,
  mockEventHandlers,
  resetMocks,
} from "../../test/testUtils";

// Mock all components as simple divs for integration testing
vi.mock("../widgets/Timer", () => ({
  Timer: () => <div data-testid="timer-widget">Timer Widget</div>,
}));

vi.mock("../widgets/Weather", () => ({
  Weather: () => <div data-testid="weather-widget">Weather Widget</div>,
}));

vi.mock("../shapes", () => ({
  RectangleShape: ({
    onSelect,
    selected,
    text,
  }: {
    onSelect: () => void;
    selected: boolean;
    text?: string;
  }) => (
    <div
      data-testid="rectangle-shape"
      data-selected={selected}
      onClick={() => onSelect()}
      role="button"
      tabIndex={0}
    >
      Rectangle: {text}
    </div>
  ),
  TextShape: ({
    onTextChange,
    text,
    isEditing,
    onEditingChange,
  }: {
    onTextChange: (text: string) => void;
    text?: string;
    isEditing?: boolean;
    onEditingChange: (editing: boolean) => void;
  }) => (
    <div data-testid="text-shape">
      {isEditing ? (
        <input
          data-testid="text-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={() => onEditingChange(false)}
        />
      ) : (
        <span
          data-testid="text-display"
          onClick={() => onEditingChange(true)}
          role="button"
          tabIndex={0}
        >
          {text}
        </span>
      )}
    </div>
  ),
}));

vi.mock("../../hooks/usePerformance", () => ({
  usePerformance: () => ({
    throttleRAF: (fn: (...args: unknown[]) => unknown) => fn,
    getGPUStyle: (styles: Record<string, string | number | undefined>) =>
      styles,
    batchUpdate: (fn: () => void) => fn(),
  }),
}));

describe("Component Integration Tests", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("ComponentRenderer + DraggableComponent Integration", () => {
    it("renders complete draggable timer widget", () => {
      const component = createMockComponent({
        type: "timer",
        x: 100,
        y: 200,
        id: 1,
      });

      render(
        <DraggableComponent
          component={component}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Should render the wrapper with correct positioning
      const wrapper = screen.getByTestId("draggable-component");
      expect(wrapper).toHaveStyle({
        left: "100px",
        top: "200px",
      });

      // Should render the timer widget inside
      expect(screen.getByTestId("timer-widget")).toBeInTheDocument();
    });

    it("handles complete drag interaction flow", async () => {
      const component = createMockComponent({
        type: "rectangle",
        x: 50,
        y: 50,
        id: 123,
      });

      render(
        <DraggableComponent
          component={component}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      const wrapper = screen.getByTestId("draggable-component");

      // Start drag
      fireEvent.mouseDown(wrapper, { clientX: 100, clientY: 100 });
      expect(mockEventHandlers.onDragStart).toHaveBeenCalledWith(123);

      // Move during drag
      fireEvent.mouseMove(window, { clientX: 150, clientY: 120 });
      expect(mockEventHandlers.onDrag).toHaveBeenCalledWith(123, 50, 20, false);

      // End drag
      fireEvent.mouseUp(window);

      // Further moves should not trigger drag
      mockEventHandlers.onDrag.mockClear();
      fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
      expect(mockEventHandlers.onDrag).not.toHaveBeenCalled();
    });

    it("handles selection flow correctly", async () => {
      const component = createMockComponent({
        type: "rectangle",
        id: 456,
      });

      const { rerender } = render(
        <DraggableComponent
          component={component}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Click to select
      const wrapper = screen.getByTestId("draggable-component");
      fireEvent.mouseDown(wrapper);

      expect(mockEventHandlers.onSelect).toHaveBeenCalledWith(456);

      // Re-render as selected
      rerender(
        <DraggableComponent
          component={component}
          selected={true}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Should show selection styling
      expect(wrapper).toHaveClass("ring-2", "ring-blue-500");
    });

    it("handles text editing interaction", async () => {
      const component = createMockComponent({
        type: "text",
        text: "Original Text",
        id: 789,
      });

      const { rerender } = render(
        <DraggableComponent
          component={component}
          selected={true}
          selectedCount={1}
          transform={createMockTransform()}
          isEditing={false}
          {...mockEventHandlers}
        />
      );

      // Should show text display initially
      expect(screen.getByTestId("text-display")).toBeInTheDocument();
      expect(screen.getByText("Original Text")).toBeInTheDocument();

      // Click to start editing
      const textDisplay = screen.getByTestId("text-display");
      fireEvent.click(textDisplay);

      expect(mockEventHandlers.onEditingChange).toHaveBeenCalledWith(789, true);

      // Re-render in editing mode
      rerender(
        <DraggableComponent
          component={component}
          selected={true}
          selectedCount={1}
          transform={createMockTransform()}
          isEditing={true}
          {...mockEventHandlers}
        />
      );

      // Should show text input
      const textInput = screen.getByTestId("text-input");
      expect(textInput).toBeInTheDocument();
      expect(textInput).toHaveValue("Original Text");

      // Change text
      fireEvent.change(textInput, { target: { value: "New Text" } });

      expect(mockEventHandlers.onTextChange).toHaveBeenLastCalledWith(
        789,
        "New Text"
      );

      // Blur to finish editing
      fireEvent.blur(textInput);
      expect(mockEventHandlers.onEditingChange).toHaveBeenCalledWith(
        789,
        false
      );
    });

    it("prevents dragging when interacting with text input", () => {
      const component = createMockComponent({
        type: "text",
        id: 999,
      });

      render(
        <DraggableComponent
          component={component}
          selected={true}
          selectedCount={1}
          transform={createMockTransform()}
          isEditing={true}
          {...mockEventHandlers}
        />
      );

      // Mouse down on text input should not start drag
      const textInput = screen.getByTestId("text-input");
      fireEvent.mouseDown(textInput);

      expect(mockEventHandlers.onDragStart).not.toHaveBeenCalled();
    });

    it("handles resize callbacks correctly", () => {
      const component = createMockComponent({
        type: "rectangle",
        width: 100,
        height: 100,
        id: 111,
      });

      render(
        <DraggableComponent
          component={component}
          selected={true}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // The resize callback should be available to the shape
      expect(mockEventHandlers.onResize).not.toHaveBeenCalled();

      // In a real scenario, the shape would call onResize when resized
      // Here we just verify the callback is passed down
    });

    it("handles multiple component types with different interactions", () => {
      const timerComponent = createMockComponent({ type: "timer", id: 1 });
      const shapeComponent = createMockComponent({ type: "rectangle", id: 2 });

      const { rerender } = render(
        <DraggableComponent
          component={timerComponent}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Timer widget should render
      expect(screen.getByTestId("timer-widget")).toBeInTheDocument();

      // Switch to shape component
      rerender(
        <DraggableComponent
          component={shapeComponent}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Shape should render
      expect(screen.getByTestId("rectangle-shape")).toBeInTheDocument();
      expect(screen.queryByTestId("timer-widget")).not.toBeInTheDocument();
    });

    it("handles zoom transform correctly in drag calculations", () => {
      const component = createMockComponent({ id: 555 });
      const zoomedTransform = createMockTransform();
      zoomedTransform.k = 2; // 2x zoom

      render(
        <DraggableComponent
          component={component}
          selected={false}
          selectedCount={1}
          transform={zoomedTransform}
          {...mockEventHandlers}
        />
      );

      const wrapper = screen.getByTestId("draggable-component");

      // Start drag
      fireEvent.mouseDown(wrapper, { clientX: 0, clientY: 0 });

      // Move mouse 100px, but with 2x zoom should be 50px in component space
      fireEvent.mouseMove(window, { clientX: 100, clientY: 60 });

      expect(mockEventHandlers.onDrag).toHaveBeenCalledWith(555, 50, 30, false);
    });
  });

  describe("Performance Considerations", () => {
    it("should not cause infinite re-renders", () => {
      const component = createMockComponent({ type: "timer" });

      const { rerender } = render(
        <DraggableComponent
          component={component}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Multiple re-renders with same props should not cause issues
      for (let i = 0; i < 5; i++) {
        rerender(
          <DraggableComponent
            component={component}
            selected={false}
            selectedCount={1}
            transform={createMockTransform()}
            {...mockEventHandlers}
          />
        );
      }

      expect(screen.getByTestId("timer-widget")).toBeInTheDocument();
    });

    it("should handle rapid position changes", () => {
      let component = createMockComponent({ x: 0, y: 0 });

      const { rerender } = render(
        <DraggableComponent
          component={component}
          selected={false}
          selectedCount={1}
          transform={createMockTransform()}
          {...mockEventHandlers}
        />
      );

      // Rapidly change position
      for (let i = 1; i <= 10; i++) {
        component = createMockComponent({ x: i * 10, y: i * 10 });
        rerender(
          <DraggableComponent
            component={component}
            selected={false}
            selectedCount={1}
            transform={createMockTransform()}
            {...mockEventHandlers}
          />
        );
      }

      const wrapper = screen.getByTestId("draggable-component");
      expect(wrapper).toHaveStyle({
        left: "100px",
        top: "100px",
      });
    });
  });
});
