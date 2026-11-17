import React from "react";
import { KEY_FINGER_MAP } from "@/data/curriculum";
import { Finger } from "@/types/academy";

export interface VisualKeyboardProps {
  targetChar?: string;
  className?: string;
}

const KEYBOARD_ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Space"],
];

const FINGER_LABELS: Record<Finger, { name: string; color: string }> = {
  "left-pinky": { name: "Left Pinky", color: "text-rose-500 dark:text-rose-400" },
  "left-ring": { name: "Left Ring", color: "text-orange-500 dark:text-orange-400" },
  "left-middle": { name: "Left Middle", color: "text-amber-500 dark:text-amber-400" },
  "left-index": { name: "Left Index", color: "text-emerald-500 dark:text-emerald-400" },
  thumb: { name: "Thumb", color: "text-blue-500 dark:text-blue-400" },
  "right-index": { name: "Right Index", color: "text-emerald-500 dark:text-emerald-400" },
  "right-middle": { name: "Right Middle", color: "text-amber-500 dark:text-amber-400" },
  "right-ring": { name: "Right Ring", color: "text-orange-500 dark:text-orange-400" },
  "right-pinky": { name: "Right Pinky", color: "text-rose-500 dark:text-rose-400" },
};

export const VisualKeyboard: React.FC<VisualKeyboardProps> = ({
  targetChar = "",
  className = "",
}) => {
  const normTarget = targetChar.toLowerCase();
  const activeFinger: Finger | undefined =
    normTarget === " "
      ? "thumb"
      : KEY_FINGER_MAP[normTarget] || KEY_FINGER_MAP[targetChar];

  const fingerInfo = activeFinger ? FINGER_LABELS[activeFinger] : null;

  return (
    <div
      className={`flex flex-col items-center select-none p-4 rounded-2xl bg-surface border border-border shadow-2xs ${className}`}
    >
      {/* Target Key and Finger Indicator Banner */}
      <div className="flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs">
        <span className="text-text-secondary">
          Target Key:{" "}
          <strong className="text-text-primary font-mono text-sm ml-1 px-2 py-0.5 rounded bg-surface-secondary border border-border-strong">
            {targetChar === " " ? "Space" : targetChar || "•"}
          </strong>
        </span>

        {fingerInfo && (
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className={fingerInfo.color}>{fingerInfo.name}</span>
          </span>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1 w-full max-w-lg items-center text-[11px] font-mono">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 w-full justify-center">
            {row.map((key) => {
              const isTarget =
                key.toLowerCase() === normTarget ||
                (key === "Space" && targetChar === " ");
              const isHomeKey = key.toLowerCase() === "f" || key.toLowerCase() === "j";

              // Sizing
              let width = "w-8 h-8";
              if (key === "Backspace" || key === "Tab") width = "w-14 h-8";
              if (key === "Caps" || key === "Enter") width = "w-16 h-8";
              if (key === "Shift") width = "w-20 h-8";
              if (key === "Space") width = "w-56 h-8";

              return (
                <div
                  key={key}
                  className={`relative flex items-center justify-center rounded-md border transition-colors shadow-2xs ${width} ${
                    isTarget
                      ? "bg-accent text-accent-foreground font-bold border-accent-hover scale-105 z-10 shadow-sm"
                      : "bg-surface text-text-primary border-border"
                  }`}
                >
                  <span>{key}</span>
                  {/* Home row bumps on F and J */}
                  {isHomeKey && !isTarget && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 rounded-full bg-border-strong" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
