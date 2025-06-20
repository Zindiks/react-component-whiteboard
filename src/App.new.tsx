import React from "react";
import { WhiteboardCanvas } from "./components/WhiteboardCanvas";
import { Sidebar } from "./components/Sidebar";
import { useWhiteboardStore } from "./store/whiteboard";

const App: React.FC = () => {
  const { addComponent } = useWhiteboardStore();

  const handleDrop = (componentType: string, x: number, y: number) => {
    addComponent({
      type: componentType,
      x,
      y,
    });
  };

  const handleDragStart = (componentType: string, event: React.DragEvent) => {
    // Set drag data for the component type
    event.dataTransfer.setData("text/plain", componentType);
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar onDragStart={handleDragStart} />
      <div className="flex-1 relative overflow-hidden">
        <WhiteboardCanvas onDrop={handleDrop} />
      </div>
    </div>
  );
};

export default App;
