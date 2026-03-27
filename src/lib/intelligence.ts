import { DayData, DEFAULT_DAY_DATA } from "./tracker-logic";

export function calculateDopamineMeter(
  days: Record<number, DayData>,
  currentDay: number
): number {
  let meter = 50;
  // Include today + past 9 days (10-day window)
  for (let i = currentDay; i >= Math.max(1, currentDay - 9); i--) {
    const dayData = days[i];
    // Skip today if not yet logged (score = 0 and no fields filled)
    if (i === currentDay && (!dayData || dayData.score === 0)) continue;
    const score = dayData?.score ?? 0;
    if (score >= 90) meter += 8;
    else if (score >= 70) meter += 5;
    else if (score >= 50) meter += 2;
    else if (score >= 30) meter -= 4;
    else meter -= 10;
  }
  return Math.max(0, Math.min(100, Math.round(meter)));
}

export function getDopamineState(meter: number): {
  label: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
} {
  if (meter < 34) {
    return {
      label: "Low Energy",
      message: "Teri motivation crash ho rahi hai. Aaj ek solid session de — wapas aa.",
      color: "text-red-400",
      bgColor: "bg-red-950/30",
      borderColor: "border-red-600/40",
      barColor: "bg-red-500",
    };
  }
  if (meter < 67) {
    return {
      label: "Building Up",
      message: "Sahi direction mein hai. Consistency banaye rakh — dopamine build hoga.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-950/20",
      borderColor: "border-yellow-600/40",
      barColor: "bg-yellow-500",
    };
  }
  return {
    label: "Peak Performance",
    message: "Tu zone mein hai! Ye momentum mat todo — IIT is closer than ever.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/20",
    borderColor: "border-emerald-600/40",
    barColor: "bg-emerald-500",
  };
}

export function calculateStreak(
  days: Record<number, DayData>,
  currentDay: number
): number {
  let streak = 0;
  for (let i = currentDay - 1; i >= 1; i--) {
    if ((days[i]?.score ?? 0) >= 60) streak++;
    else break;
  }
  return streak;
}

export function calculateConsistencyScore(
  days: Record<number, DayData>,
  currentDay: number
): number {
  if (currentDay <= 1) return 0;
  const count = Math.min(currentDay - 1, 30);
  let total = 0;
  for (let i = currentDay - 1; i >= Math.max(1, currentDay - count); i--) {
    total += days[i]?.score ?? 0;
  }
  return Math.round(total / count);
}

export function getAISuggestions(
  days: Record<number, DayData>,
  currentDay: number
): string[] {
  if (currentDay <= 1) {
    return [
      "Aim for 8+ study hours on Day 1 — set the tone",
      "Solve 40+ questions to build momentum",
      "Complete at least 3 lectures today",
      "Turn off all distractions from the start",
    ];
  }

  const recent: DayData[] = [];
  for (let i = currentDay - 1; i >= Math.max(1, currentDay - 7); i--) {
    recent.push(days[i] ?? { ...DEFAULT_DAY_DATA });
  }

  const avgScore = recent.reduce((a, b) => a + b.score, 0) / recent.length;
  const avgHours = recent.reduce((a, b) => a + b.studyHours, 0) / recent.length;
  const avgQ = recent.reduce((a, b) => a + b.questionsCount, 0) / recent.length;
  const avgLectures = recent.reduce((a, b) => a + b.lecturesDone, 0) / recent.length;
  const revisionCount = recent.filter((d) => d.revision).length;
  const distractionFreeCount = recent.filter((d) => d.noDistraction).length;

  const suggestions: string[] = [];

  if (avgScore >= 80) {
    suggestions.push(`Elite level! Push for ${Math.min(Math.round(avgQ + 15), 100)}+ questions to go even harder`);
    suggestions.push("Try 10+ study hours today — you're in the zone");
  } else if (avgScore >= 60) {
    suggestions.push(`Increase questions to ${Math.round(avgQ + 10)} today — you're close to the next tier`);
    if (avgHours < 7) suggestions.push(`Target ${Math.round(avgHours + 1.5)}+ study hours to break your average`);
  } else {
    suggestions.push("Start the day with 2-hour distraction-free block");
    suggestions.push("Solve 30 questions before lunch — build the habit");
  }

  if (avgLectures < 2) {
    suggestions.push("Complete 3+ lectures today — syllabus coverage is lagging");
  } else if (avgLectures >= 4) {
    suggestions.push("Great lecture pace! Make sure to revise yesterday's concepts");
  }

  if (revisionCount < 2) {
    suggestions.push("Revision missing from recent days — dedicate 45 min to revision today");
  }

  if (distractionFreeCount < recent.length / 2) {
    suggestions.push("Block all social media for the next 4 hours — it's killing your score");
  }

  if (suggestions.length < 3) {
    suggestions.push("Track your weak topics and solve targeted questions on them");
  }

  return suggestions.slice(0, 4);
}

export function getSmartReward(
  days: Record<number, DayData>,
  currentDay: number
): { text: string; icon: string } | null {
  const todayScore = days[currentDay]?.score ?? 0;
  if (todayScore === 0 || currentDay < 2) return null;

  const last7: number[] = [];
  for (let i = currentDay; i >= Math.max(1, currentDay - 6); i--) {
    last7.push(days[i]?.score ?? 0);
  }
  const avg7 = last7.reduce((a, b) => a + b, 0) / last7.length;

  const last3 = last7.slice(0, 3);
  const avg3 = last3.reduce((a, b) => a + b, 0) / last3.length;

  if (todayScore === 100) return { text: "Perfect Day! Take a 20 min victory break", icon: "🏆" };
  if (avg7 >= 85) return { text: "7-day consistency king! 1 Hour break earned", icon: "👑" };
  if (avg3 >= 80) return { text: "3-day streak strong! 30 Min break earned", icon: "🎯" };
  if (todayScore >= 90) return { text: "Beast mode today! 15 Min break earned", icon: "🦁" };

  return null;
}

// ─── 25-Day Perfect Challenge (cycle-based, resets every 30 days) ──────────

const PERFECT_DAY_THRESHOLD = 70;
export const CYCLE_SIZE = 30;

export interface PerfectCycleResult {
  perfectDays: number; // total perfect days in current 30-day cycle
  cycleDay: number;    // which day within the current cycle (1–30)
  cycleNumber: number; // 1-indexed cycle number
  cycleStart: number;  // first day of current cycle (absolute day number)
}

export function calculatePerfectDaysInCycle(
  days: Record<number, DayData>,
  currentDay: number
): PerfectCycleResult {
  const cycleIndex = Math.floor((currentDay - 1) / CYCLE_SIZE); // 0-indexed
  const cycleStart = cycleIndex * CYCLE_SIZE + 1;

  let perfectDays = 0;
  for (let i = cycleStart; i <= currentDay; i++) {
    if ((days[i]?.score ?? 0) >= PERFECT_DAY_THRESHOLD) perfectDays++;
  }

  return {
    perfectDays,
    cycleDay: currentDay - cycleStart + 1,
    cycleNumber: cycleIndex + 1,
    cycleStart,
  };
}

export const PERFECT_MILESTONES = [5, 10, 15, 20, 25] as const;

export type PerfectMilestone = (typeof PERFECT_MILESTONES)[number];

export function getMilestoneReward(milestone: number): string {
  if (milestone === 25) return "2–3 hour guilt-free break 🎉 Watch content, play games — you earned it!";
  if (milestone === 20) return "1 Hour break — elite territory 👑";
  if (milestone === 15) return "45 Min break — halfway champion 💪";
  if (milestone === 10) return "30 Min break — consistency is real 🔥";
  if (milestone === 5) return "20 Min break — great start ✅";
  return "";
}

// ─── Performance Streak ───────────────────────────────────────────────────

export interface PerformanceStreakResult {
  streak: number;
  todayStatus: "high" | "neutral" | "low" | "none";
  motivationMessage: string;
}

export function calculatePerformanceStreak(
  days: Record<number, DayData>,
  currentDay: number
): PerformanceStreakResult {
  let streak = 0;
  for (let i = 1; i < currentDay; i++) {
    const score = days[i]?.score ?? 0;
    if (score >= 50) streak++;
    else if (score < 25) streak = 0;
    // 25–50: no change
  }

  const todayScore = days[currentDay]?.score ?? 0;
  let todayStatus: "high" | "neutral" | "low" | "none" = "none";
  let motivationMessage = "";

  if (todayScore === 0) {
    todayStatus = "none";
    motivationMessage = "Log today's data to update your performance streak.";
  } else if (todayScore >= 50) {
    todayStatus = "high";
    motivationMessage = "You're building momentum. Keep stacking wins.";
    streak++;
  } else if (todayScore >= 25) {
    todayStatus = "neutral";
    motivationMessage = "You're surviving, not winning. Push harder.";
  } else {
    todayStatus = "low";
    motivationMessage = "This is exactly how dreams die. Fix this NOW.";
    streak = 0;
  }

  return { streak, todayStatus, motivationMessage };
}

export function getAdaptiveDifficulty(
  days: Record<number, DayData>,
  currentDay: number
): { level: string; description: string; color: string } {
  if (currentDay <= 3) {
    return { level: "Standard", description: "Baseline challenge — build your routine", color: "text-blue-400" };
  }
  const recent: DayData[] = [];
  for (let i = currentDay - 1; i >= Math.max(1, currentDay - 7); i--) {
    recent.push(days[i] ?? { ...DEFAULT_DAY_DATA });
  }
  const avg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
  if (avg >= 80) return { level: "Elite Challenge", description: "You're consistent — push harder, aim 90+", color: "text-purple-400" };
  if (avg >= 65) return { level: "Elevated", description: "Good pace — increase question count by 10 today", color: "text-emerald-400" };
  if (avg >= 50) return { level: "Standard", description: "Average performance — stay focused, no slip today", color: "text-blue-400" };
  return { level: "Recovery Mode", description: "Scores are low — simplify goals, rebuild consistency first", color: "text-orange-400" };
}
