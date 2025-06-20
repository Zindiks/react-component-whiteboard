import React, { useState, useEffect } from "react";
import { Play, Pause, Square, RotateCcw, Clock } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";

interface TimerProps {
  onTimeUpdate?: (time: number) => void;
  initialTime?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

export const Timer: React.FC<TimerProps> = ({
  onTimeUpdate,
  initialTime = 0,
  onHeaderMouseDown,
  onDelete,
}) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const newTime = initialTime + elapsed;
        setTime(newTime);
        onTimeUpdate?.(newTime);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, initialTime, onTimeUpdate]);

  const handleStart = () => {
    if (!isRunning) {
      setStartTime(Date.now() - (time - initialTime) * 1000);
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 min-w-[200px]">
      <ComponentHeader
        title="Timer"
        icon={Clock}
        iconColor="bg-green-500"
        onMouseDown={onHeaderMouseDown}
        onDelete={onDelete}
        actions={
          <div className="flex space-x-1">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="p-1 rounded-full hover:bg-gray-200 text-green-600"
                title="Start Timer"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="p-1 rounded-full hover:bg-gray-200 text-yellow-600"
                title="Pause Timer"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleStop}
              className="p-1 rounded-full hover:bg-gray-200 text-red-600"
              title="Stop Timer"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="p-4">
        <div className="text-center mb-4">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(time)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {isRunning ? "Running" : "Stopped"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
