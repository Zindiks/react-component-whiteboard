import React, { useState } from "react";
import { LinkPreview } from "./src/components/widgets/LinkPreview";

export const TestLinkPreview: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<"compact" | "medium" | "full">(
    "full"
  );

  console.log("TestLinkPreview render - displayMode:", displayMode);

  return (
    <div className="p-4">
      <h1>Link Preview Test</h1>

      {/* External controls (like floating header) */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            console.log("Setting external displayMode to compact");
            setDisplayMode("compact");
          }}
          className={`px-3 py-1 border rounded ${
            displayMode === "compact" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Compact (S)
        </button>
        <button
          onClick={() => {
            console.log("Setting external displayMode to medium");
            setDisplayMode("medium");
          }}
          className={`px-3 py-1 border rounded ${
            displayMode === "medium" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Medium (M)
        </button>
        <button
          onClick={() => {
            console.log("Setting external displayMode to full");
            setDisplayMode("full");
          }}
          className={`px-3 py-1 border rounded ${
            displayMode === "full" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Full (L)
        </button>
      </div>

      <div className="border p-4" style={{ width: "400px", height: "300px" }}>
        <LinkPreview
          initialUrl="https://github.com"
          displayMode={displayMode}
          onDisplayModeChange={(newMode) => {
            console.log(
              "LinkPreview onDisplayModeChange called with:",
              newMode
            );
            setDisplayMode(newMode);
          }}
        />
      </div>
    </div>
  );
};
