import React from "react";
import { BaseWidget, WidgetProps, WidgetState } from "../base/BaseWidget";

export interface TimerProps extends WidgetProps {}
export interface TimerState extends WidgetState {
  seconds: number;
  running: boolean;
}

export class Timer extends BaseWidget<TimerProps, TimerState> {
  interval: NodeJS.Timeout | null = null;

  constructor(props: TimerProps) {
    super(props);
    this.state = {
      ...this.state,
      seconds: 0,
      running: false,
    };
  }

  componentWillUnmount() {
    if (this.interval) clearInterval(this.interval);
  }

  start = () => {
    if (this.state.running) return;
    this.setState({ running: true });
    this.interval = setInterval(() => {
      this.setState((prev) => ({ seconds: prev.seconds + 1 }));
    }, 1000);
  };

  stop = () => {
    if (this.interval) clearInterval(this.interval);
    this.setState({ running: false });
  };

  reset = () => {
    this.stop();
    this.setState({ seconds: 0 });
  };

  protected refreshData(): void {
    // No-op for timer
  }

  protected renderWidgetContent(): React.ReactNode {
    const { seconds, running } = this.state;
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          {Math.floor(seconds / 60)}:
          {(seconds % 60).toString().padStart(2, "0")}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <button onClick={this.start} disabled={running}>
            Start
          </button>
          <button onClick={this.stop} disabled={!running}>
            Stop
          </button>
          <button onClick={this.reset}>Reset</button>
        </div>
      </div>
    );
  }
}

export default Timer;
