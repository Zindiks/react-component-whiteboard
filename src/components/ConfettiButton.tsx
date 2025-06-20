import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Star, Heart, Zap } from "lucide-react";
import { ComponentHeader } from "./ComponentHeader";

interface ConfettiButtonProps {
  width?: number;
  height?: number;
  onHeaderMouseDown?: (event: React.MouseEvent) => void;
}

export const ConfettiButton: React.FC<ConfettiButtonProps> = ({
  width = 250,
  height = 200,
  onHeaderMouseDown,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<Date | null>(null);

  // Different confetti effects
  const confettiEffects = [
    {
      name: "Classic",
      icon: <Sparkles className="w-4 h-4" />,
      effect: () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      },
    },
    {
      name: "Burst",
      icon: <Star className="w-4 h-4" />,
      effect: () => {
        confetti({
          particleCount: 50,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
        });
      },
    },
    {
      name: "Hearts",
      icon: <Heart className="w-4 h-4" />,
      effect: () => {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          shapes: ["circle"],
          colors: ["#ff69b4", "#ff1493", "#dc143c", "#b22222"],
        });
      },
    },
    {
      name: "Fireworks",
      icon: <Zap className="w-4 h-4" />,
      effect: () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti(
            Object.assign({}, defaults, {
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
          );
          confetti(
            Object.assign({}, defaults, {
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
          );
        }, 250);
      },
    },
    {
      name: "School Pride",
      icon: <Sparkles className="w-4 h-4" />,
      effect: () => {
        confetti({
          particleCount: 100,
          spread: 160,
          origin: { y: 0.3 },
          colors: ["#bb0000", "#ffffff"],
        });
      },
    },
    {
      name: "Rainbow",
      icon: <Star className="w-4 h-4" />,
      effect: () => {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
          colors: [
            "#ff0000",
            "#ff8000",
            "#ffff00",
            "#80ff00",
            "#00ff00",
            "#00ff80",
            "#00ffff",
            "#0080ff",
            "#0000ff",
            "#8000ff",
            "#ff0080",
          ],
        });
      },
    },
  ];

  const triggerRandomConfetti = () => {
    const randomEffect =
      confettiEffects[Math.floor(Math.random() * confettiEffects.length)];
    randomEffect.effect();
    setClickCount((prev) => prev + 1);
    setLastClickTime(new Date());
  };

  const triggerSpecificConfetti = (effect: () => void) => {
    effect();
    setClickCount((prev) => prev + 1);
    setLastClickTime(new Date());
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm"
      style={{ width, height }}
    >
      <ComponentHeader
        title="Confetti Button"
        icon={Sparkles}
        iconColor="bg-purple-500"
        onMouseDown={onHeaderMouseDown}
        actions={
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">{clickCount}</p>
            <p className="text-xs text-gray-500">clicks</p>
          </div>
        }
      />
      
      <div className="p-4">

      {/* Main Confetti Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={triggerRandomConfetti}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
        >
          🎉 Celebrate! 🎉
        </button>
      </div>

      {/* Effect Options */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {confettiEffects.slice(0, 6).map((effect, index) => (
          <button
            key={index}
            onClick={() => triggerSpecificConfetti(effect.effect)}
            className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-xs"
            title={effect.name}
          >
            <div className="text-purple-500 mb-1">{effect.icon}</div>
            <span className="text-gray-600 text-xs">{effect.name}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="text-center text-xs text-gray-500">
        {lastClickTime && (
          <span>Last celebration: {lastClickTime.toLocaleTimeString()}</span>
        )}
      </div>
      </div>
    </div>
  );
};
