import React from "react";
import {
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
    <header className="h-14 lg:h-16 border-b border-border bg-surface px-6 lg:px-12 flex items-center justify-between select-none transition-colors">
      <div className="flex items-center gap-8 lg:gap-10">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectTab("home")}
        >
          <img
            src="/logo.png"
            alt="TypeNow logo"
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg object-contain shadow-2xs border border-border"
          />
          <span className="font-semibold text-text-primary tracking-tight text-base lg:text-lg">
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
                    ? "text-text-primary bg-surface-secondary font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSound}
          title={soundEnabled ? "Mute sounds" : "Enable keyboard sounds"}
          className="px-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-accent" />
          ) : (
            <VolumeX className="w-4 h-4 text-text-muted opacity-70" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTheme}
          title="Toggle dark / light theme"
          className="px-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
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
          className="px-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
