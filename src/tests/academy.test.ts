import { describe, it, expect } from "vitest";
import { CURRICULUM, KEY_FINGER_MAP } from "../data/curriculum";

describe("Phase 5: Typing Academy Curriculum", () => {
  it("verifies all 10 chapters exist in the curriculum", () => {
    expect(CURRICULUM.length).toBe(10);
    const chapterIds = CURRICULUM.map((c) => c.id);
    expect(chapterIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("ensures each chapter contains structured lessons with real non-empty exercises", () => {
    for (const ch of CURRICULUM) {
      expect(ch.lessons.length).toBeGreaterThanOrEqual(1);
      for (const lesson of ch.lessons) {
        expect(lesson.title).toBeDefined();
        expect(lesson.minAccuracy).toBeGreaterThanOrEqual(90);
        expect(lesson.minWpm).toBeGreaterThanOrEqual(15);
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(1);
        for (const ex of lesson.exercises) {
          expect(ex.trim().length).toBeGreaterThan(5);
        }
      }
    }
  });

  it("verifies prerequisite chain: Chapter 1 Lesson 1 is open, subsequent lessons require prerequisites", () => {
    const ch1les1 = CURRICULUM[0].lessons[0];
    expect(ch1les1.prerequisites.length).toBe(0);

    const ch1les2 = CURRICULUM[0].lessons[1];
    expect(ch1les2.prerequisites).toContain("ch1-les1");
  });

  it("maps QWERTY keys to anatomical touch typing fingers accurately", () => {
    // Home row
    expect(KEY_FINGER_MAP["a"]).toBe("left-pinky");
    expect(KEY_FINGER_MAP["s"]).toBe("left-ring");
    expect(KEY_FINGER_MAP["d"]).toBe("left-middle");
    expect(KEY_FINGER_MAP["f"]).toBe("left-index");

    expect(KEY_FINGER_MAP["j"]).toBe("right-index");
    expect(KEY_FINGER_MAP["k"]).toBe("right-middle");
    expect(KEY_FINGER_MAP["l"]).toBe("right-ring");
    expect(KEY_FINGER_MAP[";"]).toBe("right-pinky");

    // Spacebar
    expect(KEY_FINGER_MAP[" "]).toBe("thumb");
  });
});
