import React from "react";

interface DragOverlayProps {
  isDragOver: boolean;
  style: React.CSSProperties;
  zIndex: number;
  message: string;
  previewLabel?: string;
  previewIcon?: string;
  previewWidth?: number;
  previewHeight?: number;
  previewX?: number;
  previewY?: number;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  isDragOver,
  style,
  zIndex,
  message,
  previewLabel,
  previewIcon,
  previewWidth,
  previewHeight,
  previewX,
  previewY,
}) => {
  if (!isDragOver) return null;
  return (
    <div style={{ ...style, zIndex }}>
      {previewLabel || previewIcon ? (
        <div
          style={{
            position: "absolute",
            left: previewX !== undefined ? previewX : "50%",
            top: previewY !== undefined ? previewY : "50%",
            transform:
              previewX !== undefined && previewY !== undefined
                ? "translate(-50%, -50%)"
                : "translate(-50%, -50%)",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            padding: 0,
            minWidth: previewWidth || 180,
            minHeight: previewHeight || 80,
            width: previewWidth,
            height: previewHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            border: "2px dashed #3b82f6",
            overflow: "hidden",
          }}
        >
          {/* Grid background for drop preview */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              backgroundImage:
                "linear-gradient(0deg, #e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {previewIcon && (
              <div style={{ fontSize: 36, marginBottom: 8 }}>{previewIcon}</div>
            )}
            {previewLabel && (
              <div style={{ fontWeight: 600, fontSize: 18 }}>
                {previewLabel}
              </div>
            )}
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
              {message}
            </div>
          </div>
        </div>
      ) : (
        <div>{message}</div>
      )}
    </div>
  );
};
