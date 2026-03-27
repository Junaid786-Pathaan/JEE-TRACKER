import { useState, useEffect } from "react";
import { useTracker } from "@/hooks/use-tracker";
import { getCurrentDay } from "@/lib/tracker-logic";
import {
  calculatePerfectDaysInCycle,
  calculatePerformanceStreak,
  getMilestoneReward,
  PERFECT_MILESTONES,
  CYCLE_SIZE,
} from "@/lib/intelligence";
import { cn } from "@/lib/utils";
import { Star, Zap, BarChart2, X } from "lucide-react";

const SHOWN_MILESTONES_KEY = "jee_discipline_milestones_shown";

function getShownMilestones(): Record<number, number[]> {
  try {
    return JSON.parse(localStorage.getItem(SHOWN_MILESTONES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function isMilestoneShown(cycle: number, milestone: number): boolean {
  return (getShownMilestones()[cycle] ?? []).includes(milestone);
}

function markMilestoneShownLocal(cycle: number, milestone: number) {
  const shown = getShownMilestones();
  if (!shown[cycle]) shown[cycle] = [];
  if (!shown[cycle].includes(milestone)) {
    shown[cycle].push(milestone);
    localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify(shown));
  }
}

export function DisciplineChallenge() {
  const { state } = useTracker();
  const [activeReward, setActiveReward] = useState<{ milestone: number; text: string } | null>(null);

  if (!state.startDate) return null;

  const currentDay = getCurrentDay(state.startDate, state.totalDays);
  const { perfectDays, cycleDay, cycleNumber } = calculatePerfectDaysInCycle(state.days, currentDay);
  const { streak: perfStreak, todayStatus, motivationMessage } = calculatePerformanceStreak(
    state.days,
    currentDay
  );

  const is25Done = perfectDays >= 25;
  const progressPct = Math.min((perfectDays / 25) * 100, 100);

  // Check for newly reached milestones
  useEffect(() => {
    if (!state.startDate) return;
    for (const milestone of [...PERFECT_MILESTONES].reverse()) {
      if (perfectDays >= milestone && !isMilestoneShown(cycleNumber, milestone)) {
        markMilestoneShownLocal(cycleNumber, milestone);
        setActiveReward({ milestone, text: getMilestoneReward(milestone) });
        return;
      }
    }
  }, [perfectDays, cycleNumber, state.startDate]);

  const todayStatusConfig = {
    high: { label: "🔥 High Day", color: "text-orange-400", bg: "bg-orange-950/20", border: "border-orange-500/30" },
    neutral: { label: "⚖️ Neutral Day", color: "text-yellow-400", bg: "bg-yellow-950/20", border: "border-yellow-500/30" },
    low: { label: "❌ Failed Day", color: "text-red-400", bg: "bg-red-950/20", border: "border-red-500/30" },
    none: { label: "— Not logged", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
  };
  const statusCfg = todayStatusConfig[todayStatus];

  const daysLeftInCycle = CYCLE_SIZE - cycleDay;

  return (
    <>
      {/* Grand Reward Popup (Day 25) */}
      {activeReward?.milestone === 25 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative bg-violet-950 border-2 border-violet-400/60 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-violet-500/20 text-center">
            <button
              onClick={() => setActiveReward(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-2xl font-black text-violet-300 mb-2 tracking-tight">
              DISCIPLINE UNLOCKED
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              You did what most people can't.<br />
              <span className="font-bold text-foreground">25 perfect days — Cycle {cycleNumber}.</span><br />
              You're becoming unstoppable.
            </p>
            <div className="bg-violet-900/50 border border-violet-500/30 rounded-xl p-4 text-sm text-violet-200 font-medium mb-5">
              🎉 {activeReward.text}
            </div>
            <button
              onClick={() => setActiveReward(null)}
              className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold transition-all"
            >
              Claim Reward 🦁
            </button>
          </div>
        </div>
      )}

      {/* Partial Milestone Toast (Days 5/10/15/20) */}
      {activeReward && activeReward.milestone !== 25 && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs">
          <div className="bg-card border border-yellow-500/40 rounded-2xl p-4 shadow-xl flex items-start gap-3">
            <Star className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold text-yellow-400 block mb-0.5">
                Day {activeReward.milestone} Milestone! 🎯
              </span>
              <p className="text-sm font-medium text-foreground">{activeReward.text}</p>
            </div>
            <button onClick={() => setActiveReward(null)} className="text-muted-foreground hover:text-foreground shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className={cn(
        "rounded-2xl border overflow-hidden transition-all",
        is25Done ? "border-violet-400/60 shadow-lg shadow-violet-500/20" : "border-border"
      )}>
        {/* Header */}
        <div className={cn(
          "px-5 py-4 flex items-center justify-between",
          is25Done ? "bg-violet-950/60" : "bg-card"
        )}>
          <div>
            <h3 className={cn(
              "text-sm font-bold flex items-center gap-2",
              is25Done ? "text-violet-300" : "text-foreground"
            )}>
              <Star className="w-4 h-4" />
              25-Day Discipline Challenge
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Cycle {cycleNumber} · Day {cycleDay}/{CYCLE_SIZE} · resets every 30 days
            </p>
          </div>
          <span className={cn(
            "text-sm font-black px-3 py-1 rounded-full border",
            is25Done
              ? "text-violet-300 border-violet-400/50 bg-violet-900/40"
              : perfectDays >= 15
              ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/30"
              : "text-muted-foreground border-border bg-secondary"
          )}>
            {perfectDays} / 25
          </span>
        </div>

        {/* Progress bar with milestone dots */}
        <div className="px-5 pb-2 pt-1 bg-card">
          <div className="relative w-full h-4 bg-secondary rounded-full overflow-visible mb-1">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                is25Done
                  ? "bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                  : perfectDays >= 15 ? "bg-emerald-500"
                  : perfectDays >= 5 ? "bg-blue-500"
                  : "bg-muted-foreground/40"
              )}
              style={{ width: `${progressPct}%` }}
            />
            {PERFECT_MILESTONES.map((m) => {
              const pct = (m / 25) * 100;
              const reached = perfectDays >= m;
              return (
                <div
                  key={m}
                  className="absolute top-1/2 flex flex-col items-center"
                  style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 z-10",
                    reached
                      ? m === 25 ? "bg-violet-400 border-violet-300" : "bg-emerald-400 border-emerald-300"
                      : "bg-secondary border-muted-foreground/30"
                  )} />
                </div>
              );
            })}
          </div>
          <div className="relative w-full h-4">
            {PERFECT_MILESTONES.map((m) => (
              <span
                key={m}
                className={cn(
                  "absolute text-[9px] font-bold -translate-x-1/2",
                  perfectDays >= m ? "text-emerald-400" : "text-muted-foreground/50"
                )}
                style={{ left: `${(m / 25) * 100}%` }}
              >
                D{m}
              </span>
            ))}
          </div>
        </div>

        {/* Next milestone / completion */}
        <div className="px-5 pb-4 bg-card">
          {is25Done ? (
            <p className="text-xs text-violet-400 font-semibold">
              🏆 Cycle {cycleNumber} Complete! {daysLeftInCycle > 0 ? `${daysLeftInCycle} days left in this cycle.` : "New cycle starts tomorrow!"}
            </p>
          ) : (
            (() => {
              const next = PERFECT_MILESTONES.find((m) => m > perfectDays);
              const needed = next ? next - perfectDays : 0;
              return next ? (
                <p className="text-xs text-muted-foreground">
                  Next reward at <span className="font-bold text-foreground">Day {next}</span>
                  {" — "}{needed} more perfect {needed === 1 ? "day" : "days"} needed
                  {daysLeftInCycle < needed && (
                    <span className="text-orange-400 ml-1">(⚠️ only {daysLeftInCycle}d left in cycle)</span>
                  )}
                </p>
              ) : null;
            })()
          )}
        </div>

        {/* Performance Streak */}
        <div className="border-t border-border px-5 py-4 bg-card/50 space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5" />
            Performance Streak
          </h4>

          <div className={cn(
            "rounded-xl px-4 py-3 border flex items-center justify-between",
            statusCfg.bg, statusCfg.border
          )}>
            <div>
              <span className={cn("text-xs font-bold", statusCfg.color)}>{statusCfg.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">{motivationMessage}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <div className={cn("text-2xl font-black", perfStreak > 0 ? "text-foreground" : "text-muted-foreground")}>
                {perfStreak}
              </div>
              <div className="text-[10px] text-muted-foreground">day streak</div>
            </div>
          </div>

          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                todayStatus === "high" ? "bg-orange-500" :
                todayStatus === "neutral" ? "bg-yellow-500" :
                todayStatus === "low" ? "bg-red-500" : "bg-muted-foreground/30"
              )}
              style={{ width: `${Math.min((perfStreak / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            ≥50 pts → streak grows · 25–50 → holds · &lt;25 → resets
          </p>
        </div>

        {todayStatus === "high" && (
          <div className="mx-5 mb-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-400 font-medium">
              Today counts as a Perfect Day toward the challenge!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
