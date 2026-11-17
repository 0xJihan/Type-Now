import React, { useEffect, useState } from "react";
import { CURRICULUM } from "@/data/curriculum";
import { Lesson, LessonProgressRecord } from "@/types/academy";
import { getLessonProgress, saveLessonProgress } from "@/persistence/db-bridge";
import { VisualKeyboard } from "./VisualKeyboard";
import { TypingArea } from "../typing/TypingArea";
import { TypingEngine } from "@/domain/typing-engine";
import { Button } from "../ui/Button";
import {
  Lock,
  CheckCircle,
  Award,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const AcademyView: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, LessonProgressRecord>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [engine, setEngine] = useState<TypingEngine | null>(null);
  const [words, setWords] = useState<any[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [lessonResult, setLessonResult] = useState<{
    passed: boolean;
    wpm: number;
    accuracy: number;
  } | null>(null);

  // Load progress on mount
  const refreshProgress = async () => {
    const list = await getLessonProgress();
    const map: Record<string, LessonProgressRecord> = {};
    list.forEach((p) => {
      map[p.lesson_id] = p;
    });
    setProgress(map);
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  // Determine if a lesson is unlocked
  const isLessonUnlocked = (lesson: Lesson): boolean => {
    if (lesson.prerequisites.length === 0) return true;
    return lesson.prerequisites.every((prereqId) => {
      const p = progress[prereqId];
      return p && p.completed;
    });
  };

  // Start a lesson
  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setExerciseIndex(0);
    setLessonResult(null);
    setupExercise(lesson, 0);
  };

  const setupExercise = (lesson: Lesson, idx: number) => {
    const text = lesson.exercises[idx] || lesson.exercises[0];
    const parsedWords = TypingEngine.parseTextIntoWords(text);

    const newEngine = new TypingEngine(
      {
        mode: "custom",
        modeValue: parsedWords.length,
        vocabulary: "top200",
        language: "en",
        customText: text,
      },
      {
        onTick: () => {
          setWords([...newEngine.getWords()]);
          setCurrentWordIndex(newEngine.getCurrentWordIndex());
        },
        onStateChange: () => {
          setWords([...newEngine.getWords()]);
          setCurrentWordIndex(newEngine.getCurrentWordIndex());
        },
        onComplete: async (result) => {
          const passed =
            result.accuracy >= lesson.minAccuracy && result.netWpm >= lesson.minWpm;

          if (idx < lesson.exercises.length - 1 && passed) {
            // Next exercise in lesson
            setExerciseIndex(idx + 1);
            setupExercise(lesson, idx + 1);
          } else {
            // Finished lesson
            setLessonResult({
              passed,
              wpm: result.netWpm,
              accuracy: result.accuracy,
            });

            if (passed) {
              const record: LessonProgressRecord = {
                lesson_id: lesson.id,
                chapter_id: lesson.chapterId,
                completed: true,
                mastered: result.accuracy >= 98 && result.netWpm >= lesson.minWpm + 10,
                best_wpm: result.netWpm,
                best_accuracy: result.accuracy,
                attempts: 1,
                last_attempt_at: Date.now(),
              };
              await saveLessonProgress(record);
              await refreshProgress();
            }
          }
        },
      }
    );

    setEngine(newEngine);
    setWords(newEngine.getWords());
    setCurrentWordIndex(0);
  };

  // Current target character for visual keyboard guide
  const currentWord = words[currentWordIndex];
  const targetChar =
    currentWord && currentWord.typed.length < currentWord.target.length
      ? currentWord.target[currentWord.typed.length]
      : " ";

  // Exit back to curriculum
  const exitLesson = () => {
    engine?.cancel();
    setActiveLesson(null);
    setEngine(null);
    setLessonResult(null);
  };

  if (activeLesson) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 select-none animate-in fade-in duration-200">
        {/* Lesson Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={exitLesson} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Curriculum</span>
          </Button>

          <div className="flex flex-col items-center">
            <h2 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              {activeLesson.title}
            </h2>
            <span className="text-xs text-zinc-500">
              Exercise {exerciseIndex + 1} of {activeLesson.exercises.length} • Min:{" "}
              {activeLesson.minWpm} WPM / {activeLesson.minAccuracy}% Acc
            </span>
          </div>

          <div className="w-20" />
        </div>

        {/* Typing Stage */}
        {engine && (
          <TypingArea
            engine={engine}
            words={words}
            currentWordIndex={currentWordIndex}
            onRestart={() => setupExercise(activeLesson, exerciseIndex)}
          />
        )}

        {/* Visual Keyboard Guide */}
        <VisualKeyboard targetChar={targetChar} />

        {/* Lesson Result Modal */}
        {lessonResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-center">
                {lessonResult.passed ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {lessonResult.passed ? "Lesson Complete!" : "Keep Practicing"}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {lessonResult.passed
                    ? "Great job! You achieved the required speed and accuracy."
                    : `You need ${activeLesson.minWpm} WPM and ${activeLesson.minAccuracy}% accuracy to advance.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-xs text-zinc-400 font-medium">Your Speed</span>
                  <span className="block text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(lessonResult.wpm)} <span className="text-xs font-normal">WPM</span>
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-medium">Your Accuracy</span>
                  <span className="block text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(lessonResult.accuracy)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setupExercise(activeLesson, 0)}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry</span>
                </Button>

                {lessonResult.passed ? (
                  <Button variant="primary" onClick={exitLesson} className="gap-2">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={exitLesson}>
                    Exit to Menu
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Calculate overall course progress
  const totalLessons = CURRICULUM.reduce((sum, ch) => sum + ch.lessons.length, 0);
  const completedLessons = Object.values(progress).filter((p) => p.completed).length;
  const overallPct = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 select-none py-2">
      {/* Academy Overview Banner */}
      <div className="p-6 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>TypeNow Academy</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Touch Typing Curriculum
          </h2>
          <p className="text-xs text-zinc-500 max-w-md">
            Progressive 10-chapter curriculum designed to build touch typing intuition, proper finger
            placement, and sustained accuracy.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {overallPct}%
            </span>
            <span className="text-xs text-zinc-400">Complete</span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-400">
            {completedLessons} of {totalLessons} lessons completed
          </span>
        </div>
      </div>

      {/* Chapters Accordion / List */}
      <div className="space-y-6">
        {CURRICULUM.map((chapter) => {
          const chCompleted = chapter.lessons.filter((l) => progress[l.id]?.completed).length;
          const isChDone = chCompleted === chapter.lessons.length;

          return (
            <div
              key={chapter.id}
              className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/20 overflow-hidden"
            >
              <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                      Chapter {chapter.id.toString().padStart(2, "0")}
                    </span>
                    {isChDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle className="w-3 h-3" /> Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{chapter.description}</p>
                </div>

                <span className="text-xs font-mono text-zinc-400">
                  {chCompleted}/{chapter.lessons.length}
                </span>
              </div>

              {/* Lessons Grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {chapter.lessons.map((lesson) => {
                  const unlocked = isLessonUnlocked(lesson);
                  const p = progress[lesson.id];
                  const completed = p?.completed;
                  const mastered = p?.mastered;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => unlocked && startLesson(lesson)}
                      className={`p-4 rounded-xl border transition-all ${
                        !unlocked
                          ? "opacity-50 border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-900/10 cursor-not-allowed"
                          : completed
                          ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 cursor-pointer"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-amber-500/60 bg-white dark:bg-zinc-900/60 cursor-pointer shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-zinc-400 capitalize">
                          {lesson.difficulty}
                        </span>

                        <div>
                          {!unlocked && <Lock className="w-4 h-4 text-zinc-400" />}
                          {unlocked && completed && !mastered && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                          {unlocked && mastered && (
                            <Award className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mb-3">
                        {lesson.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 text-[10px] text-zinc-400 font-mono">
                        <span>
                          Target: {lesson.minWpm} WPM / {lesson.minAccuracy}%
                        </span>
                        {completed && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Best: {Math.round(p.best_wpm)} WPM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
