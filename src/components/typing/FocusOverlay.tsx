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
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/85 backdrop-blur-xs cursor-pointer rounded-xl lg:rounded-2xl select-none transition-all duration-200"
    >
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-text-primary text-surface text-sm font-medium shadow-md border border-border-strong/40">
        <MousePointerClick className="w-4 h-4 text-accent animate-bounce" />
        <span>Click or press any key to focus</span>
      </div>
    </div>
  );
};
