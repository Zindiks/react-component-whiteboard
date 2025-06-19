import React, { useState, useEffect } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerProps {
  onTimeUpdate?: (time: number) => void;
  initialTime?: number;
}

export const Timer: React.FC<TimerProps> = ({
  onTimeUpdate,
  initialTime = 0,
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
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 min-w-[200px]">
      <div className="text-center mb-4">
        <div className="text-2xl font-mono font-bold text-gray-800">
          {formatTime(time)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {isRunning ? "Running" : "Stopped"}
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            size="sm"
            className="bg-green-500 hover:bg-green-600"
          >
            <Play className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            <Pause className="w-4 h-4" />
          </Button>
        )}

        <Button onClick={handleStop} size="sm" variant="destructive">
          <Square className="w-4 h-4" />
        </Button>

        <Button onClick={handleReset} size="sm" variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Timer;
