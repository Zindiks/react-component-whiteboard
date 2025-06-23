import React, { useState, useEffect } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <Card className="min-w-[200px] overflow-hidden bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="text-center">
          <div
            className={cn(
              "text-3xl font-mono font-bold mb-4 transition-colors",
              isRunning ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {isRunning ? "Running" : "Stopped"}
          </div>
          <div className="flex justify-center space-x-2">
            {!isRunning ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStart}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                title="Start Timer"
              >
                <Play className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePause}
                className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                title="Pause Timer"
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
              title="Stop Timer"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;
