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
    { id: "learn", label: "Academy" },
    { id: "statistics", label: "Statistics" },
    { id: "challenges", label: "Challenges" },
  ];

  return (
    <header className="h-14 lg:h-16 border-b border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/70 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between select-none transition-colors">
      <div className="flex items-center gap-8 lg:gap-10">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectTab("home")}
        >
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Keyboard className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
          </div>
          <span className="font-semibold text-zinc-950 dark:text-zinc-50 tracking-tight text-base lg:text-lg">
            TypeNow
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800/90 font-semibold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                {item.label}
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
