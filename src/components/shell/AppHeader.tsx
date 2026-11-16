import React from "react";
import {
  Keyboard,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import { Button } from "../ui/Button";

export interface AppHeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  theme: "dark" | "light" | "system";
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
}) => {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "learn", label: "Learn", badge: "Phase 3" },
    { id: "statistics", label: "Statistics", badge: "Phase 4" },
    { id: "challenges", label: "Challenges", badge: "Phase 5" },
  ];

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xs px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectTab("home")}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Keyboard className="w-4 h-4" />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight text-base">
            TypeNow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isClickable = item.id === "home";
            return (
              <button
                key={item.id}
                disabled={!isClickable}
                onClick={() => isClickable && onSelectTab(item.id)}
                className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800/80"
                    : isClickable
                    ? "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-75"
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSound}
          title={soundEnabled ? "Mute sounds" : "Enable keyboard sounds"}
          className="px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4 opacity-50" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTheme}
          title="Toggle dark / light theme"
          className="px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          title="Settings"
          className="px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
