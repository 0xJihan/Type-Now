import React, { useEffect, useState } from "react";
import { DailyChallenge, ChallengeCompletionRecord } from "@/types/challenges";
import { UserAchievementRecord } from "@/types/achievements";
import { ChallengeEngine, getTodayDateString } from "@/domain/challenge-engine";
import { ACHIEVEMENTS } from "@/domain/achievement-engine";
import { getChallengeCompletions, getUnlockedAchievements } from "@/persistence/db-bridge";
import { Button } from "../ui/Button";
import {
  Trophy,
  Zap,
  Target,
  Clock,
  Sparkles,
  Lock,
  CheckCircle,
  Flag,
  Flame,
  Award,
  Crown,
  GraduationCap,
  CalendarCheck,
  Layers,
  ShieldCheck,
  Crosshair,
  BookOpen,
  Medal,
  Keyboard,
} from "lucide-react";

export interface ChallengesViewProps {
  onStartChallenge: (challenge: DailyChallenge) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Keyboard,
  GraduationCap,
  Award,
  Zap,
  Flame,
  Trophy,
  Crown,
  Target,
  Crosshair,
  Sparkles,
  CalendarCheck,
  Layers,
  ShieldCheck,
  Clock,
  BookOpen,
  Flag,
  Medal,
};

export const ChallengesView: React.FC<ChallengesViewProps> = ({ onStartChallenge }) => {
  const [activeTab, setActiveTab] = useState<"challenges" | "achievements">("challenges");
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completions, setCompletions] = useState<Record<string, ChallengeCompletionRecord>>({});
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, UserAchievementRecord>>({});

  const todayStr = getTodayDateString();

  const loadData = async () => {
    const list = ChallengeEngine.getDailyChallenges(todayStr);
    setChallenges(list);

    const compList = await getChallengeCompletions(todayStr);
    const compMap: Record<string, ChallengeCompletionRecord> = {};
    compList.forEach((c) => {
      compMap[c.challenge_id] = c;
    });
    setCompletions(compMap);

    const achList = await getUnlockedAchievements();
    const achMap: Record<string, UserAchievementRecord> = {};
    achList.forEach((a) => {
      achMap[a.id] = a;
    });
    setUnlockedAchievements(achMap);
  };

  useEffect(() => {
    loadData();
  }, []);

  const unlockedCount = Object.keys(unlockedAchievements).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 select-none py-2">
      {/* Top Toggle Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {activeTab === "challenges" ? "Daily Challenges" : "Achievements & Milestones"}
          </h2>
          <p className="text-xs text-zinc-500">
            {activeTab === "challenges"
              ? `New deterministic trials for ${todayStr}. Offline validated upon test completion.`
              : `${unlockedCount} of ${ACHIEVEMENTS.length} achievements unlocked.`}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "challenges"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Daily Challenges</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "achievements"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Achievements</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Challenges */}
      {activeTab === "challenges" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((ch) => {
            const comp = completions[ch.id];
            const isCompleted = !!comp;

            return (
              <div
                key={ch.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs hover:border-amber-500/50"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10">
                      {ch.mode} trial
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono">Today</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-6 space-y-4">
                  {isCompleted ? (
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                      <span>Result: {comp.wpm} WPM</span>
                      <span>Acc: {comp.accuracy}%</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onStartChallenge(ch)}
                      className="w-full gap-2"
                    >
                      <span>Start Challenge</span>
                      <Zap className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Achievements Trophy Showcase */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = unlockedAchievements[ach.id];
            const IconComp = ICON_MAP[ach.icon] || Trophy;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                  unlocked
                    ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10"
                    : "border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/20 opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    unlocked
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {unlocked ? (
                    <IconComp className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {ach.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                      {ach.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    {ach.description}
                  </p>
                  {unlocked && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block pt-1">
                      Unlocked on {new Date(unlocked.unlocked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
