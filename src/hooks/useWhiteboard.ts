/**
 * Whiteboard Context Hook
 *
 * Provides access to the whiteboard context. Must be used within WhiteboardProvider.
 */

import { useContext } from "react";
import {
  WhiteboardContext,
  WhiteboardContextValue,
} from "../features/whiteboard/WhiteboardProvider";

export const useWhiteboard = (): WhiteboardContextValue => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("useWhiteboard must be used within a WhiteboardProvider");
  }
  return context;
};
