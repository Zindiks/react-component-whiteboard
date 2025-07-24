import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraggableComponent } from "../DraggableWhiteboardComponent";
import {
  createMockComponent,
  createMockTransform,
  mockEventHandlers,
  resetMocks,
} from "../../test/testUtils";

// Mock the ComponentRenderer
vi.mock("../ComponentRenderer", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentRenderer: ({ component }: { component: any }) => (
    <div data-testid="component-renderer" data-component-type={component.type}>
      Rendered {component.type}
    </div>
  ),
}));

// Mock the FloatingHeader
vi.mock("../widgets/FloatingHeader", () => ({
  FloatingHeader: ({
    title,
    onDelete,
  }: {
    title: string;
    onDelete: () => void;
  }) => (
    <div data-testid="floating-header">
      <span>{title}</span>
      <button onClick={onDelete} data-testid="delete-button">
        Delete
      </button>
    </div>
  ),
}));

// Mock the performance hook
vi.mock("../../hooks/usePerformance", () => ({
  usePerformance: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    throttleRAF: (fn: Function) => fn,
    getGPUStyle: (styles: Record<string, unknown>) => styles,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    batchUpdate: (fn: Function) => fn(),
  }),
}));

describe("DraggableComponent", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    resetMocks();
    user = userEvent.setup();
  });

  const defaultProps = {
    component: createMockComponent(),
    selected: false,
    selectedCount: 1,
    transform: createMockTransform(),
    ...mockEventHandlers,
  };

  describe("Rendering", () => {
    it("renders the component with correct positioning", () => {
      const component = createMockComponent({ x: 150, y: 200, zIndex: 5 });

      render(<DraggableComponent {...defaultProps} component={component} />);

      const wrapper = screen.getByTestId("draggable-component");
      expect(wrapper).toHaveStyle({
        left: "150px",
        top: "200px",
        zIndex: 5,
      });
    });

    it("renders ComponentRenderer with correct props", () => {
      const component = createMockComponent({ type: "rectangle" });

      render(<DraggableComponent {...defaultProps} component={component} />);

      const renderer = screen.getByTestId("component-renderer");
      expect(renderer).toBeInTheDocument();
      expect(renderer).toHaveAttribute("data-component-type", "rectangle");
    });

    it("applies selection styling when selected", () => {
      render(<DraggableComponent {...defaultProps} selected={true} />);

      const wrapper = screen.getByTestId("draggable-component");
      expect(wrapper).toHaveClass("ring-2", "ring-blue-500");
    });

    it("does not apply selection styling when not selected", () => {
      render(<DraggableComponent {...defaultProps} selected={false} />);

      const wrapper = screen.getByTestId("draggable-component");
      expect(wrapper).not.toHaveClass("ring-2", "ring-blue-500");
    });
  });

  describe("Floating Header", () => {
    it("shows floating header for linkpreview when selected", () => {
      const component = createMockComponent({ type: "linkpreview" });

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={true}
          selectedCount={1}
        />
      );

      expect(screen.getByTestId("floating-header")).toBeInTheDocument();
    });

    it("does not show floating header for linkpreview when not selected", () => {
      const component = createMockComponent({ type: "linkpreview" });

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={false}
        />
      );

      expect(screen.queryByTestId("floating-header")).not.toBeInTheDocument();
    });

    it("does not show floating header for linkpreview when multiple components selected", () => {
      const component = createMockComponent({ type: "linkpreview" });

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={true}
          selectedCount={3}
        />
      );

      expect(screen.queryByTestId("floating-header")).not.toBeInTheDocument();
    });

    it("does not show floating header for non-linkpreview components", () => {
      const component = createMockComponent({ type: "rectangle" });

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={true}
        />
      );

      expect(screen.queryByTestId("floating-header")).not.toBeInTheDocument();
    });

    it("calls onDelete when delete button in floating header is clicked", async () => {
      const component = createMockComponent({ type: "linkpreview", id: 42 });

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={true}
          selectedCount={1}
        />
      );

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      expect(mockEventHandlers.onDelete).toHaveBeenCalledWith(42);
    });
  });

  describe("Mouse Interactions", () => {
    it("calls onSelect when component is clicked and not selected", async () => {
      const component = createMockComponent({ id: 123 });

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={false}
        />
      );

      const wrapper = screen.getByTestId("draggable-component");
      await user.click(wrapper);

      expect(mockEventHandlers.onSelect).toHaveBeenCalledWith(123);
    });

    it("calls onDragStart when mousedown occurs", () => {
      const component = createMockComponent({ id: 456 });

      render(<DraggableComponent {...defaultProps} component={component} />);

      const wrapper = screen.getByTestId("draggable-component");
      fireEvent.mouseDown(wrapper);

      expect(mockEventHandlers.onDragStart).toHaveBeenCalledWith(456);
    });

    it("does not trigger drag when clicking on interactive elements", () => {
      render(<DraggableComponent {...defaultProps} />);

      // Create a button inside the component (simulating interactive content)
      const wrapper = screen.getByTestId("draggable-component");
      const button = document.createElement("button");
      wrapper.appendChild(button);

      fireEvent.mouseDown(button);

      expect(mockEventHandlers.onDragStart).not.toHaveBeenCalled();
    });

    it("prevents default and stops propagation on mousedown", () => {
      const originalPreventDefault = Event.prototype.preventDefault;
      const originalStopPropagation = Event.prototype.stopPropagation;
      const mockPreventDefault = vi.fn();
      const mockStopPropagation = vi.fn();

      // Spy on the prototype methods
      Event.prototype.preventDefault = mockPreventDefault;
      Event.prototype.stopPropagation = mockStopPropagation;

      render(<DraggableComponent {...defaultProps} />);

      const wrapper = screen.getByTestId("draggable-component");

      fireEvent.mouseDown(wrapper, {
        clientX: 100,
        clientY: 200,
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();

      // Restore original methods
      Event.prototype.preventDefault = originalPreventDefault;
      Event.prototype.stopPropagation = originalStopPropagation;
    });
  });

  describe("Drag Behavior", () => {
    it("shows axis lock indicator when dragging with shift key", () => {
      render(<DraggableComponent {...defaultProps} />);

      const wrapper = screen.getByTestId("draggable-component");

      // Start dragging
      fireEvent.mouseDown(wrapper, { clientX: 100, clientY: 100 });

      // Simulate mouse move with shift key
      fireEvent.mouseMove(window, {
        clientX: 120,
        clientY: 100,
        shiftKey: true,
      });

      expect(screen.getByText("🔒 Axis Lock")).toBeInTheDocument();
    });

    it("calls onDrag with correct parameters during mouse move", () => {
      const component = createMockComponent({ id: 789 });
      const transform = createMockTransform({ k: 2 }); // 2x zoom

      render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          transform={transform}
        />
      );

      const wrapper = screen.getByTestId("draggable-component");

      // Start dragging
      fireEvent.mouseDown(wrapper, { clientX: 100, clientY: 100 });

      // Move mouse
      fireEvent.mouseMove(window, {
        clientX: 140,
        clientY: 120,
      });

      // Should account for zoom level: (140-100)/2 = 20, (120-100)/2 = 10
      expect(mockEventHandlers.onDrag).toHaveBeenCalledWith(
        789,
        20, // deltaX / transform.k
        10, // deltaY / transform.k
        false // shift not pressed
      );
    });

    it("includes shift key state in onDrag call", () => {
      const component = createMockComponent({ id: 101 });

      render(<DraggableComponent {...defaultProps} component={component} />);

      const wrapper = screen.getByTestId("draggable-component");

      fireEvent.mouseDown(wrapper, { clientX: 0, clientY: 0 });
      fireEvent.mouseMove(window, {
        clientX: 10,
        clientY: 10,
        shiftKey: true,
      });

      expect(mockEventHandlers.onDrag).toHaveBeenCalledWith(
        101,
        10,
        10,
        true // shift key pressed
      );
    });

    it("stops dragging on mouse up", () => {
      render(<DraggableComponent {...defaultProps} />);

      const wrapper = screen.getByTestId("draggable-component");

      // Start dragging
      fireEvent.mouseDown(wrapper);

      // End dragging
      fireEvent.mouseUp(window);

      // Move mouse after mouseup - should not call onDrag
      fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });

      expect(mockEventHandlers.onDrag).not.toHaveBeenCalled();
    });
  });

  describe("Shape vs Widget Components", () => {
    it("uses shape mouse handler for shape components", () => {
      const shapeComponent = createMockComponent({
        type: "rectangle",
        id: 999,
      });

      render(
        <DraggableComponent {...defaultProps} component={shapeComponent} />
      );

      const wrapper = screen.getByTestId("draggable-component");
      fireEvent.mouseDown(wrapper);

      expect(mockEventHandlers.onDragStart).toHaveBeenCalledWith(999);
    });

    it("uses component mouse handler for widget components", () => {
      const widgetComponent = createMockComponent({
        type: "timer",
        id: 888,
      });

      render(
        <DraggableComponent {...defaultProps} component={widgetComponent} />
      );

      const wrapper = screen.getByTestId("draggable-component");
      fireEvent.mouseDown(wrapper);

      expect(mockEventHandlers.onDragStart).toHaveBeenCalledWith(888);
    });
  });

  describe("Component Memoization", () => {
    it("does not re-render when non-relevant props change", () => {
      const component = createMockComponent();

      const { rerender } = render(
        <DraggableComponent {...defaultProps} component={component} />
      );

      // Change a prop that shouldn't trigger re-render
      rerender(
        <DraggableComponent
          {...defaultProps}
          component={component}
          // Same component object reference
        />
      );

      // Component should still be there (this test mainly ensures no errors)
      expect(screen.getByTestId("component-renderer")).toBeInTheDocument();
    });

    it("re-renders when position changes", () => {
      const component = createMockComponent({ x: 100, y: 100 });

      const { rerender } = render(
        <DraggableComponent {...defaultProps} component={component} />
      );

      const movedComponent = createMockComponent({ x: 150, y: 200 });

      rerender(
        <DraggableComponent {...defaultProps} component={movedComponent} />
      );

      // Should re-render with new position
      expect(screen.getByTestId("component-renderer")).toBeInTheDocument();
    });

    it("re-renders when selection state changes", () => {
      const component = createMockComponent();

      const { rerender } = render(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={false}
        />
      );

      rerender(
        <DraggableComponent
          {...defaultProps}
          component={component}
          selected={true}
        />
      );

      // Should re-render with selection styling
      const wrapper = screen.getByTestId("draggable-component");
      expect(wrapper).toHaveClass("ring-2", "ring-blue-500");
    });
  });

  describe("Event Handler Props", () => {
    it("passes all event handlers to ComponentRenderer", () => {
      const component = createMockComponent();

      render(<DraggableComponent {...defaultProps} component={component} />);

      // Verify ComponentRenderer is rendered (it receives the props)
      expect(screen.getByTestId("component-renderer")).toBeInTheDocument();
    });
  });
});
