export interface UserPreferences {
  theme: "dark" | "light" | "system";
  soundPack: string;
  soundVolume: number;
  soundEnabled: boolean;
  defaultMode: "time" | "words";
  defaultTime: number;
  defaultWords: number;
  vocabulary: "top200" | "top1000";
  quickRestart: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  soundPack: "gateron-red",
  soundVolume: 0.7,
  soundEnabled: true,
  defaultMode: "time",
  defaultTime: 30,
  defaultWords: 25,
  vocabulary: "top200",
  quickRestart: true,
};
