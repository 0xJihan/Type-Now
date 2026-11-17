import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SliderProps {
  value: number; // 0.0 to 1.0 or custom
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  className,
  disabled = false,
}) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={twMerge(
        clsx(
          "w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-40 disabled:cursor-not-allowed",
          className
        )
      )}
    />
  );
};
