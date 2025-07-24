/**
 * Keyboard Shortcuts Hook
 *
 * Extracted from useEventHandlers for better separation of concerns
 * Handles all keyboard interactions with input field detection
 */

import { useEffect, useCallback } from "react";

interface KeyboardShortcutsProps {
  onCopy: () => void;
  onPaste: () => Promise<void>;
  onPasteImage: () => Promise<void>;
  onDelete: () => void;
  onSelectAll: () => void;
  onEscape: () => void;
  onToggleOverview: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onResetZoom: () => void;
  onZoomToFit: () => void;
  onZoomToSelection: () => void;
  disabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onCopy,
  onPaste,
  onPasteImage,
  onDelete,
  onSelectAll,
  onEscape,
  onToggleOverview,
  onToggleGrid,
  onToggleSnap,
  onResetZoom,
  onZoomToFit,
  onZoomToSelection,
  disabled = false,
}: KeyboardShortcutsProps) => {
  const isInputActive = useCallback((): boolean => {
    const activeElement = document.activeElement;
    return !!(
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.hasAttribute("contenteditable") ||
        activeElement.closest("input, textarea, [contenteditable]"))
    );
  }, []);

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (disabled) return;

      const { key, metaKey, ctrlKey, shiftKey } = event;
      const isModifierPressed = metaKey || ctrlKey;
      const isInputFocused = isInputActive();

      // Always allow Escape, even in input fields
      if (key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }

      // Block other shortcuts when typing in input fields
      if (isInputFocused) return;

      switch (key) {
        case "c":
          if (isModifierPressed) {
            event.preventDefault();
            onCopy();
          }
          break;

        case "v":
          if (isModifierPressed) {
            event.preventDefault();
            if (shiftKey) {
              await onPasteImage();
            } else {
              await onPaste();
            }
          }
          break;

        case "a":
          if (isModifierPressed) {
            event.preventDefault();
            onSelectAll();
          }
          break;

        case "Delete":
        case "Backspace":
          event.preventDefault();
          onDelete();
          break;

        case "o":
          if (isModifierPressed) {
            event.preventDefault();
            onToggleOverview();
          }
          break;

        case "g":
          if (isModifierPressed) {
            event.preventDefault();
            if (shiftKey) {
              onToggleSnap();
            } else {
              onToggleGrid();
            }
          }
          break;

        case "0":
          if (isModifierPressed) {
            event.preventDefault();
            onResetZoom();
          }
          break;

        case "1":
          if (isModifierPressed) {
            event.preventDefault();
            onZoomToFit();
          }
          break;

        case "2":
          if (isModifierPressed) {
            event.preventDefault();
            onZoomToSelection();
          }
          break;
      }
    },
    [
      disabled,
      onCopy,
      onPaste,
      onPasteImage,
      onDelete,
      onSelectAll,
      onEscape,
      onToggleOverview,
      onToggleGrid,
      onToggleSnap,
      onResetZoom,
      onZoomToFit,
      onZoomToSelection,
      isInputActive,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { isInputActive };
};
