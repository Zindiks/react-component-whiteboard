import React, { useEffect, useState, useRef } from "react";

interface FPSMonitorProps {
  enabled?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const FPSMonitor: React.FC<FPSMonitorProps> = ({
  enabled = true,
  position = "top-right",
}) => {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const rafId = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const updateFPS = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      frameCount.current++;

      // Update FPS every 500ms
      if (deltaTime >= 500) {
        const currentFPS = Math.round((frameCount.current * 1000) / deltaTime);
        setFps(currentFPS);

        // Keep history for average calculation
        fpsHistory.current.push(currentFPS);
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift();
        }

        // Calculate average FPS
        const avg =
          fpsHistory.current.reduce((sum, val) => sum + val, 0) /
          fpsHistory.current.length;
        setAvgFps(Math.round(avg));

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      rafId.current = requestAnimationFrame(updateFPS);
    };

    rafId.current = requestAnimationFrame(updateFPS);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 9999,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "8px 12px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "12px",
      fontWeight: "bold",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    };

    switch (position) {
      case "top-left":
        return { ...baseStyles, top: "16px", left: "16px" };
      case "top-right":
        return { ...baseStyles, top: "16px", right: "16px" };
      case "bottom-left":
        return { ...baseStyles, bottom: "16px", left: "16px" };
      case "bottom-right":
        return { ...baseStyles, bottom: "16px", right: "16px" };
      default:
        return { ...baseStyles, top: "16px", right: "16px" };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 100) return "#00ff00"; // Green for 100+ FPS
    if (fps >= 60) return "#ffff00"; // Yellow for 60+ FPS
    if (fps >= 30) return "#ff8800"; // Orange for 30+ FPS
    return "#ff0000"; // Red for below 30 FPS
  };

  return (
    <div style={getPositionStyles()}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ color: getFPSColor(fps) }}>FPS: {fps}</div>
        <div
          style={{ color: getFPSColor(avgFps), fontSize: "10px", opacity: 0.8 }}
        >
          Avg: {avgFps}
        </div>
        <div style={{ fontSize: "9px", opacity: 0.6 }}>Target: 120</div>
      </div>
    </div>
  );
};
