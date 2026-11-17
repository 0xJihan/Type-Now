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
      className={`flex flex-col items-center select-none p-4 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 ${className}`}
    >
      {/* Target Key and Finger Indicator Banner */}
      <div className="flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs">
        <span className="text-zinc-500">
          Target Key:{" "}
          <strong className="text-zinc-900 dark:text-zinc-100 font-mono text-sm ml-1 px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800">
            {targetChar === " " ? "Space" : targetChar || "•"}
          </strong>
        </span>

        {fingerInfo && (
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
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
                  className={`relative flex items-center justify-center rounded border transition-colors shadow-2xs ${width} ${
                    isTarget
                      ? "bg-amber-500 text-zinc-950 font-bold border-amber-600 scale-105 z-10 animate-pulse"
                      : "bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80"
                  }`}
                >
                  <span>{key}</span>
                  {/* Home row bumps on F and J */}
                  {isHomeKey && !isTarget && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
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
