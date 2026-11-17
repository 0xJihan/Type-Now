import React, { useState } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Trash2,
  Check,
  Palette,
  Database,
} from "lucide-react";
import { UserPreferences } from "@/types/preferences";
import { soundManager } from "@/audio/sound-manager";
import { Button } from "../ui/Button";
import { Slider } from "../ui/Slider";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  onClearHistory: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onClearHistory,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  if (!isOpen) return null;

  const soundPacks = soundManager.getManifest();

  const handlePreviewSound = (packId: string) => {
    soundManager.updateSettings({ packId, enabled: true });
    soundManager.playKey("a");
  };

  const handleSelectSoundPack = (packId: string) => {
    onUpdatePreferences({ soundPack: packId });
    soundManager.updateSettings({ packId });
  };

  const handleClearHistory = async () => {
    setClearing(true);
    await onClearHistory();
    setClearing(false);
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Appearance Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </div>
            <div className="flex items-center gap-2">
              {(["dark", "light", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdatePreferences({ theme: t })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                    preferences.theme === t
                      ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Sound Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <Volume2 className="w-4 h-4" />
                <span>Mechanical Keyboard Audio</span>
              </div>
              <button
                onClick={() => {
                  const enabled = !preferences.soundEnabled;
                  onUpdatePreferences({ soundEnabled: enabled });
                  soundManager.updateSettings({ enabled });
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  preferences.soundEnabled
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {preferences.soundEnabled ? "Enabled" : "Muted"}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-4 py-1">
              <VolumeX className="w-4 h-4 text-zinc-400 shrink-0" />
              <Slider
                value={preferences.soundVolume}
                disabled={!preferences.soundEnabled}
                onChange={(val) => {
                  onUpdatePreferences({ soundVolume: val });
                  soundManager.updateSettings({ volume: val });
                }}
              />
              <span className="text-xs font-mono text-zinc-500 w-8 text-right">
                {Math.round(preferences.soundVolume * 100)}%
              </span>
            </div>

            {/* Key Release Toggle */}
            <div className="flex items-center justify-between py-1 text-xs">
              <span className="text-zinc-500">Play key release (up) acoustics</span>
              <input
                type="checkbox"
                checked={preferences.playKeyRelease ?? true}
                onChange={(e) => {
                  const playKeyRelease = e.target.checked;
                  onUpdatePreferences({ playKeyRelease });
                  soundManager.updateSettings({ playKeyRelease });
                }}
                className="accent-amber-500 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Sound Packs List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {soundPacks.map((pack) => {
                const isSelected = preferences.soundPack === pack.id;
                return (
                  <div
                    key={pack.id}
                    onClick={() => handleSelectSoundPack(pack.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-amber-500/60 bg-amber-500/5 dark:bg-amber-500/10"
                        : "border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {pack.name}
                        </span>
                        {pack.id === "mx-brown" && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded bg-amber-500/10 font-medium">
                            Default
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400 px-1.5 py-0.2 rounded-sm bg-zinc-100 dark:bg-zinc-800">
                          {pack.kind}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 block truncate max-w-[280px]">
                        {pack.summary}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewSound(pack.id);
                        }}
                        title="Preview audio sample"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      {isSelected && (
                        <Check className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Local SQLite Storage Section */}
          <section className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Database className="w-4 h-4" />
              <span>Offline SQLite Data</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                All records, progress, and achievements are saved locally.
              </span>

              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={clearing}
                    onClick={handleClearHistory}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmClear(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmClear(true)}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Data
                </Button>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
