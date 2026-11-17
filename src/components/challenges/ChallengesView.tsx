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
    <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-8 select-none py-2">
      {/* Top Toggle Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {activeTab === "challenges" ? "Daily Challenges" : "Achievements & Milestones"}
          </h2>
          <p className="text-xs text-text-secondary">
            {activeTab === "challenges"
              ? `New deterministic trials for ${todayStr}. Offline validated upon test completion.`
              : `${unlockedCount} of ${ACHIEVEMENTS.length} achievements unlocked.`}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border shadow-2xs text-xs font-medium">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "challenges"
                ? "bg-text-primary text-surface font-semibold shadow-2xs"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Daily Challenges</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "achievements"
                ? "bg-text-primary text-surface font-semibold shadow-2xs"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
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
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all shadow-2xs ${
                  isCompleted
                    ? "border-success/40 bg-success-soft/25"
                    : "border-border bg-surface hover:border-accent/50"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold px-2 py-0.5 rounded bg-accent-soft">
                      {ch.mode} trial
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle className="w-4 h-4" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted font-mono">Today</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-text-primary">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6 space-y-4">
                  {isCompleted ? (
                    <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
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
                className={`p-4 rounded-xl border flex items-start gap-4 transition-all shadow-2xs ${
                  unlocked
                    ? "border-accent/40 bg-accent-soft/30"
                    : "border-border bg-surface opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    unlocked
                      ? "bg-accent text-accent-foreground shadow-2xs"
                      : "bg-surface-secondary text-text-muted border border-border"
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
                    <h4 className="font-semibold text-xs text-text-primary">
                      {ach.title}
                    </h4>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                      {ach.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    {ach.description}
                  </p>
                  {unlocked && (
                    <span className="text-[10px] text-accent font-mono block pt-1">
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
