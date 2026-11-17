export interface SoundPackMeta {
  id: string;
  name: string;
  kind: string;
  author: string;
  summary: string;
  license: string;
  groups: Record<
    string,
    {
      down?: Record<string, string[]> | string[];
      up?: string[];
    }
  >;
}

export interface AudioSettings {
  enabled: boolean;
  packId: string;
  volume: number; // 0.0 - 1.0
  playKeyRelease?: boolean;
}
