export interface UserPreferences {
  theme: "dark" | "light" | "system";
  soundPack: string;
  soundVolume: number;
  soundEnabled: boolean;
  playKeyRelease?: boolean;
  defaultMode: "time" | "words" | "sentence" | "quote" | "code" | "custom";
  defaultTime: number;
  defaultWords: number;
  vocabulary: "top200" | "top1000" | "top5000" | "advanced";
  quickRestart: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "dark",
  soundPack: "mx-brown",
  soundVolume: 0.7,
  soundEnabled: true,
  playKeyRelease: true,
  defaultMode: "time",
  defaultTime: 30,
  defaultWords: 25,
  vocabulary: "top200",
  quickRestart: true,
};
