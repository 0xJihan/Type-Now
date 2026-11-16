import React from "react";
import { MousePointerClick } from "lucide-react";

export interface FocusOverlayProps {
  isFocused: boolean;
  onFocus: () => void;
}

export const FocusOverlay: React.FC<FocusOverlayProps> = ({
  isFocused,
  onFocus,
}) => {
  if (isFocused) return null;

  return (
    <div
      onClick={onFocus}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs cursor-pointer rounded-xl select-none transition-all duration-200"
    >
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-sm font-medium shadow-md">
        <MousePointerClick className="w-4 h-4 animate-bounce" />
        <span>Click or press any key to focus</span>
      </div>
    </div>
  );
};
