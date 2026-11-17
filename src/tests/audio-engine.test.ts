import { describe, it, expect } from "vitest";
import manifest from "../../public/sounds/manifest.json";
import { soundManager } from "../audio/sound-manager";

describe("Phase 4: Mechanical Keyboard Audio Engine", () => {
  it("verifies manifest contains all 15 sound packs with complete metadata", () => {
    expect(manifest.length).toBe(15);

    const packIds = manifest.map((p: any) => p.id);
    expect(packIds).toContain("mx-brown");
    expect(packIds).toContain("gateron-red");
    expect(packIds).toContain("topre");
    expect(packIds).toContain("model-f");
    expect(packIds).toContain("rainy-75");

    for (const pack of manifest as any[]) {
      expect(pack.id).toBeDefined();
      expect(pack.name).toBeDefined();
      expect(pack.kind).toBeDefined();
      expect(pack.author).toBeDefined();
      expect(pack.license).toBeDefined();
      expect(pack.groups.alpha).toBeDefined();
    }
  });

  it("ensures MX Brown is configured as the default sound pack", () => {
    const settings = soundManager.getSettings();
    expect(settings.packId).toBe("mx-brown");
    expect(settings.enabled).toBe(true);
  });

  it("handles sound settings updates and volume scaling", () => {
    soundManager.updateSettings({ volume: 0.85, playKeyRelease: true });
    const updated = soundManager.getSettings();
    expect(updated.volume).toBe(0.85);
    expect(updated.playKeyRelease).toBe(true);
  });
});
