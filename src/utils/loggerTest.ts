/**
 * Simple test to verify logger functionality
 * Run this by importing and calling testLogger() in a component
 */

import { log } from "../utils/logger";
import {
  stateLogger,
  widgetLogger,
  urlLogger,
} from "../utils/componentLoggers";

export function testLogger() {
  console.log("=== Logger Test ===");

  try {
    // Test basic logger
    log.info("Logger initialized successfully");
    log.debug("Debug message with data", { test: "data" });
    log.warn("Warning message");
    log.error("Error message", { error: "test error" });

    // Test component loggers
    stateLogger.info("State manager test");
    widgetLogger.debug("Widget operation test");
    urlLogger.info("URL detection test");

    console.log("=== Logger Test Complete ===");
    return true;
  } catch (error) {
    console.error("Logger test failed:", error);
    return false;
  }
}
