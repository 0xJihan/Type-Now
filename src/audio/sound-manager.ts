import { AudioSettings, SoundPackMeta } from "@/types/audio";

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentPack: SoundPackMeta | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private manifest: SoundPackMeta[] = [];
  private settings: AudioSettings = {
    enabled: true,
    packId: "gateron-red",
    volume: 0.7,
  };
  private isLoading = false;

  constructor() {
    this.loadManifest();
  }

  private async loadManifest(): Promise<void> {
    try {
      const res = await fetch("/sounds/manifest.json");
      if (res.ok) {
        this.manifest = await res.json();
        const pack =
          this.manifest.find((p) => p.id === this.settings.packId) ||
          this.manifest[0];
        if (pack) {
          this.currentPack = pack;
          this.preloadPack(pack);
        }
      }
    } catch {
      // Offline or headless test environment fallback
    }
  }

  public getManifest(): SoundPackMeta[] {
    return this.manifest;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (this.masterGain && typeof newSettings.volume === "number") {
      this.masterGain.gain.setValueAtTime(
        this.settings.enabled ? this.settings.volume : 0,
        this.ctx?.currentTime || 0
      );
    }
    if (newSettings.packId && newSettings.packId !== this.currentPack?.id) {
      const pack = this.manifest.find((p) => p.id === newSettings.packId);
      if (pack) {
        this.currentPack = pack;
        this.preloadPack(pack);
      }
    }
  }

  private initAudio(): void {
    if (this.ctx) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.settings.enabled
        ? this.settings.volume
        : 0;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // AudioContext unavailable
    }
  }

  private async preloadPack(pack: SoundPackMeta): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    this.initAudio();
    if (!this.ctx) {
      this.isLoading = false;
      return;
    }

    const filesToLoad = new Set<string>();
    for (const group of Object.values(pack.groups)) {
      if (group.down) {
        if (Array.isArray(group.down)) {
          group.down.forEach((f) => filesToLoad.add(f));
        } else {
          for (const list of Object.values(group.down)) {
            list.forEach((f) => filesToLoad.add(f));
          }
        }
      }
    }

    const loadPromises = Array.from(filesToLoad).map(async (filename) => {
      const key = `${pack.id}/${filename}`;
      if (this.bufferCache.has(key)) return;

      try {
        const response = await fetch(`/sounds/${pack.id}/${filename}`);
        if (!response.ok) return;
        const arrayBuf = await response.arrayBuffer();
        if (this.ctx) {
          const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
          this.bufferCache.set(key, audioBuf);
        }
      } catch {
        // Silently skip corrupted/unavailable sample
      }
    });

    await Promise.all(loadPromises);
    this.isLoading = false;
  }

  public playKey(key: string): void {
    if (!this.settings.enabled || this.settings.volume <= 0) return;

    this.initAudio();
    if (!this.ctx || !this.masterGain || !this.currentPack) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    let groupName = "alpha";
    const lowerKey = key.toLowerCase();
    if (lowerKey === " " || lowerKey === "space") {
      groupName = this.currentPack.groups["space"] ? "space" : "alpha";
    } else if (lowerKey === "backspace") {
      groupName = this.currentPack.groups["backspace"] ? "backspace" : "alpha";
    } else if (lowerKey === "enter") {
      groupName = this.currentPack.groups["enter"] ? "enter" : "alpha";
    } else if (["shift", "control", "alt", "meta"].includes(lowerKey)) {
      groupName = this.currentPack.groups["modifier"] ? "modifier" : "alpha";
    }

    const group = this.currentPack.groups[groupName] || this.currentPack.groups["alpha"];
    if (!group?.down) return;

    let sampleList: string[] = [];
    if (Array.isArray(group.down)) {
      sampleList = group.down;
    } else {
      // Prioritize medium or hard samples
      const downVariants = group.down as Record<string, string[]>;
      sampleList =
        downVariants["medium"] ||
        downVariants["hard"] ||
        downVariants["slam"] ||
        downVariants["soft"] ||
        Object.values(downVariants).flat();
    }

    if (!sampleList || sampleList.length === 0) return;

    const randomIndex = Math.floor(Math.random() * sampleList.length);
    const chosenSample = sampleList[randomIndex];
    const cacheKey = `${this.currentPack.id}/${chosenSample}`;
    const buffer = this.bufferCache.get(cacheKey);

    if (!buffer) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      // Micro-pitch jitter (±2%) to avoid mechanical repetition
      const jitter = 0.98 + Math.random() * 0.04;
      source.playbackRate.setValueAtTime(jitter, this.ctx.currentTime);

      source.connect(this.masterGain);
      source.start(0);
    } catch {
      // Playback errors must never block or throw
    }
  }
}

export const soundManager = new SoundManager();
