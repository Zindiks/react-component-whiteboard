import { useCallback, useRef, useEffect } from "react";

interface PerformanceOptions {
  targetFPS?: number;
  enableGPUAcceleration?: boolean;
  batchUpdates?: boolean;
}

interface ThrottledCallback<T extends unknown[]> {
  (...args: T): void;
  cancel(): void;
}

/**
 * Custom hook for performance optimization using requestAnimationFrame
 * Targets 120fps by throttling updates and using GPU acceleration
 */
export const usePerformance = (options: PerformanceOptions = {}) => {
  const {
    targetFPS = 120,
    enableGPUAcceleration = true,
    batchUpdates = true,
  } = options;

  const frameRate = 1000 / targetFPS; // ~8.33ms for 120fps
  const rafId = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  const pendingUpdates = useRef<Set<() => void>>(new Set());

  // Throttle function using requestAnimationFrame for smooth 120fps
  const throttleRAF = useCallback(
    <T extends unknown[]>(
      callback: (...args: T) => void,
      immediate: boolean = false
    ): ThrottledCallback<T> => {
      let rafId: number;
      let lastArgs: T | null = null;
      let isScheduled = false;

      const throttledFn = (...args: T) => {
        lastArgs = args;

        if (isScheduled) return;

        if (immediate) {
          callback(...args);
          return;
        }

        isScheduled = true;
        rafId = requestAnimationFrame((timestamp) => {
          if (timestamp - lastUpdateTime.current >= frameRate) {
            if (lastArgs) {
              callback(...lastArgs);
              lastUpdateTime.current = timestamp;
            }
          }
          isScheduled = false;
        });
      };

      throttledFn.cancel = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          isScheduled = false;
        }
      };

      return throttledFn;
    },
    [frameRate]
  );

  // Batch multiple updates into a single frame
  const batchUpdate = useCallback(
    (updateFn: () => void) => {
      if (!batchUpdates) {
        updateFn();
        return;
      }

      pendingUpdates.current.add(updateFn);

      if (rafId.current) return;

      rafId.current = requestAnimationFrame(() => {
        const updates = Array.from(pendingUpdates.current);
        pendingUpdates.current.clear();
        rafId.current = undefined;

        // Execute all batched updates
        updates.forEach((update) => update());
      });
    },
    [batchUpdates]
  );

  // GPU acceleration helper
  const getGPUStyle = useCallback(
    (additionalStyles: React.CSSProperties = {}): React.CSSProperties => {
      if (!enableGPUAcceleration) return additionalStyles;

      return {
        ...additionalStyles,
        willChange: "transform, opacity",
        transform: additionalStyles.transform || "translateZ(0)", // Force GPU layer
        backfaceVisibility: "hidden",
        perspective: 1000,
      };
    },
    [enableGPUAcceleration]
  );

  // Optimize element for smooth animations
  const optimizeElement = useCallback(
    (element: HTMLElement | null) => {
      if (!element || !enableGPUAcceleration) return;

      element.style.willChange = "transform, opacity";
      element.style.backfaceVisibility = "hidden";
      element.style.perspective = "1000px";
      element.style.transform = element.style.transform || "translateZ(0)";
    },
    [enableGPUAcceleration]
  );

  // Cleanup on unmount
  useEffect(() => {
    const currentPendingUpdates = pendingUpdates.current;
    const currentRafId = rafId.current;

    return () => {
      if (currentRafId) {
        cancelAnimationFrame(currentRafId);
      }
      currentPendingUpdates.clear();
    };
  }, []);

  return {
    throttleRAF,
    batchUpdate,
    getGPUStyle,
    optimizeElement,
    frameRate,
    targetFPS,
  };
};

/**
 * Hook for optimized drag operations with high-performance updates
 */
export const useOptimizedDrag = () => {
  const { throttleRAF, batchUpdate, getGPUStyle } = usePerformance({
    targetFPS: 120,
  });
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const currentDelta = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Optimized mouse move handler
  const optimizedMouseMove = useCallback(
    (callback: (deltaX: number, deltaY: number, event: MouseEvent) => void) => {
      return throttleRAF((event: MouseEvent) => {
        if (!isDragging.current) return;

        const deltaX = event.clientX - dragStartPos.current.x;
        const deltaY = event.clientY - dragStartPos.current.y;

        // Store current delta for batching
        currentDelta.current = { x: deltaX, y: deltaY };

        batchUpdate(() => {
          callback(currentDelta.current.x, currentDelta.current.y, event);
        });
      });
    },
    [throttleRAF, batchUpdate]
  );

  const startDrag = useCallback((x: number, y: number) => {
    isDragging.current = true;
    dragStartPos.current = { x, y };
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
    currentDelta.current = { x: 0, y: 0 };
  }, []);

  return {
    optimizedMouseMove,
    startDrag,
    endDrag,
    getGPUStyle,
    isDragging: isDragging.current,
  };
};
