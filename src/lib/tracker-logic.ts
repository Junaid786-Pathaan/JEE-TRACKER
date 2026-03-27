import { differenceInDays, parseISO, addDays, format } from "date-fns";

export interface DayData {
  noDistraction: boolean;
  noTimeWaste: boolean;
  questionPractice: boolean;
  questionsCount: number; // 1-100
  revision: boolean;
  lecturesDone: number; // 0-7
  studyHours: number; // 0-24
  mindControl: number; // 0-100
  score: number;
}

export interface TrackerState {
  startDate: string | null;
  days: Record<number, DayData>;
  milestonesShown: number[];
  totalDays: number;
}

export const TOTAL_DAYS = 365;
export const MAX_TOTAL_DAYS = 500;

export const MILESTONES = [7, 21, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 360, 365];

export const DEFAULT_DAY_DATA: DayData = {
  noDistraction: false,
  noTimeWaste: false,
  questionPractice: false,
  questionsCount: 0,
  revision: false,
  lecturesDone: 0,
  studyHours: 0,
  mindControl: 50,
  score: 0,
};

export function getLectureScore(lecturesDone: number): number {
  if (lecturesDone === 0) return 0;
  if (lecturesDone === 1) return 5;
  if (lecturesDone === 2) return 10;
  if (lecturesDone === 3) return 15;
  return 20; // 4-7
}

export function getQuestionScore(questionPractice: boolean, questionsCount: number): number {
  if (!questionPractice) return 0;
  if (questionsCount <= 10) return 0;
  if (questionsCount <= 20) return 10;
  if (questionsCount <= 40) return 15;
  if (questionsCount <= 70) return 20;
  return 25;
}

export function getStudyHourScore(studyHours: number): number {
  if (studyHours < 2) return 0;
  if (studyHours < 4) return 5;
  if (studyHours < 6) return 10;
  if (studyHours < 8) return 15;
  return 20;
}

export function getCombinedBonus(questionPractice: boolean, questionsCount: number, studyHours: number): number {
  if (!questionPractice) return 0;
  if (questionsCount >= 70 && studyHours >= 8) return 15;
  if (questionsCount >= 40 && studyHours >= 6) return 10;
  return 0;
}

export function calculateScore(data: DayData): number {
  let score = 0;

  if (data.noDistraction) score += 15;
  if (data.noTimeWaste) score += 15;
  score += getLectureScore(data.lecturesDone);
  if (data.revision) score += 15;
  if (data.mindControl >= 70) score += 5;
  score += getQuestionScore(data.questionPractice, data.questionsCount);
  score += getStudyHourScore(data.studyHours);
  score += getCombinedBonus(data.questionPractice, data.questionsCount, data.studyHours);

  return Math.min(100, score);
}

export function getStatus(score: number): { label: string; color: string; emoji: string } {
  if (score < 40) return { label: "Waste", color: "text-red-500", emoji: "❌" };
  if (score < 70) return { label: "Average", color: "text-yellow-500", emoji: "⚠️" };
  if (score < 90) return { label: "Good", color: "text-emerald-500", emoji: "✅" };
  return { label: "Beast Mode", color: "text-purple-500", emoji: "🦁" };
}

export interface CoachData {
  mood: string;
  emoji: string;
  message: string;
  streakMessage: string | null;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getCoachData(
  score: number,
  currentDay: number,
  days: Record<number, DayData>
): CoachData {
  let mood: string;
  let emoji: string;
  let message: string;
  let bgColor: string;
  let borderColor: string;
  let textColor: string;

  if (score < 30) {
    mood = "Angry";
    emoji = "😡";
    bgColor = "bg-red-950/40";
    borderColor = "border-red-600/50";
    textColor = "text-red-400";
    message = pickRandom([
      "Sach bolun? Tu serious hi nahi hai abhi. Ye sab band kar aur padh.",
      "Aise chalega to goal sirf sapna hi rahega. Uth, kuch kar.",
      "Tera competitor abhi 8 ghante padh raha hai. Tu kya kar raha hai?",
      "Itna waste? Sharmo. Real IIT aspirant aise nahi karta.",
    ]);
  } else if (score < 50) {
    mood = "Disappointed";
    emoji = "😐";
    bgColor = "bg-orange-950/30";
    borderColor = "border-orange-500/30";
    textColor = "text-orange-400";
    message = pickRandom([
      "Effort hai, par direction weak hai. Focus karo kya important hai.",
      "Ye level safe zone hai, growth nahi. Comfort zone tod.",
      "Thoda kam tha aaj. Kal aur zyada de — ye settle nahi karta.",
      "Average se IIT nahi milti. Aur tu filhaal average se bhi neeche hai.",
    ]);
  } else if (score < 70) {
    mood = "Neutral";
    emoji = "⚠️";
    bgColor = "bg-yellow-950/30";
    borderColor = "border-yellow-500/30";
    textColor = "text-yellow-400";
    message = pickRandom([
      "Thoda aur push karega to level change ho jayega. Ruk mat.",
      "Average se bahar nikalna padega. Tu capable hai — prove kar.",
      "Score decent hai, par ceiling tod. Next level ke liye stretch kar.",
      "Theek hai, par 'theek hai' se kuch nahi milta. Aur de.",
    ]);
  } else if (score < 90) {
    mood = "Motivating";
    emoji = "💪";
    bgColor = "bg-emerald-950/30";
    borderColor = "border-emerald-500/30";
    textColor = "text-emerald-400";
    message = pickRandom([
      "Good... ab consistency dikha. Ek din nahi, 365 din.",
      "Yahi pace maintain kar, result aayega. Trust the process.",
      "Aaj solid tha. Kal aur solid hona — that's the game.",
      "Strong day bhai! Ab ye standard banana hai — har roz.",
    ]);
  } else if (score < 100) {
    mood = "Proud";
    emoji = "👏";
    bgColor = "bg-purple-950/30";
    borderColor = "border-purple-500/40";
    textColor = "text-purple-400";
    message = pickRandom([
      "Strong performance. Ye daily kar diya to game completely change.",
      "Tu close hai top level ke. Thoda aur — full 100 nikal.",
      "Elite zone mein aa raha hai. Bas rukna mat ab.",
      "Bahut badhiya. Ye consistency chahiye — ek din nahi, daily.",
    ]);
  } else {
    mood = "Beast Mode";
    emoji = "🦁";
    bgColor = "bg-violet-950/40";
    borderColor = "border-violet-400/50";
    textColor = "text-violet-300";
    message = pickRandom([
      "BEAST MODE ON 🦁! Aaj tu peak pe tha — aise hi din future decide karte hain.",
      "BEAST MODE ON 🦁! Ye performance rare hoti hai — isi consistency se rank banti hai.",
      "PERFECT SCORE! 🦁 Tu aaj fire mein tha. IIT ke gate khul rahe hain.",
      "100/100! 🦁 Ye log achieve nahi kar paate — tu kar gaya. Ab aise hi roz.",
    ]);
  }

  // Streak / streak warning messages
  let streakMessage: string | null = null;
  if (currentDay >= 3) {
    const d1 = days[currentDay - 1];
    const d2 = days[currentDay - 2];
    const d3 = days[currentDay - 3];

    // 2 consecutive bad days — warning overrides everything
    if (d1 && d1.score < 50 && d2 && d2.score < 50) {
      streakMessage = "⚠️ Warning: Tu slip ho raha hai. Control le warna downfall start hoga.";
    } else if (currentDay >= 5) {
      const d4 = days[currentDay - 4];
      const d5 = days[currentDay - 5];
      // 5-day streak >= 90
      if (d1?.score >= 90 && d2?.score >= 90 && d3?.score >= 90 && d4?.score >= 90 && d5?.score >= 90) {
        streakMessage = "⚡ Ab tu elite zone me enter kar raha hai. Top 1% wali territory hai ye.";
      } else if (d1?.score >= 80 && d2?.score >= 80 && d3?.score >= 80) {
        // 3-day streak >= 80
        streakMessage = "🔥 Consistency build ho rahi hai... ye hi difference banata hai.";
      }
    } else if (d1?.score >= 80 && d2?.score >= 80 && d3?.score >= 80) {
      streakMessage = "🔥 Consistency build ho rahi hai... ye hi difference banata hai.";
    }
  }

  return { mood, emoji, message, streakMessage, bgColor, borderColor, textColor };
}

// Kept for any legacy usage
export function getCoachMessage(score: number): string {
  if (score < 30) return "Sach bolun? Tu serious hi nahi hai abhi. Uth aur padh.";
  if (score < 50) return "Effort hai, par direction weak hai. Improve karo.";
  if (score < 70) return "Thoda aur push karega to level change ho jayega.";
  if (score < 90) return "Good... ab consistency dikha. Yahi pace rakho.";
  if (score < 100) return "Strong performance. Ye daily kar diya to game change.";
  return "BEAST MODE ON 🦁! Aaj tu peak pe tha!";
}

export function getPunishments(currentDay: number, days: Record<number, DayData>): string[] {
  const punishments: string[] = [];
  if (currentDay <= 1) return punishments;

  const yesterday = days[currentDay - 1] || DEFAULT_DAY_DATA;
  const dayBefore = days[currentDay - 2];

  if (yesterday.score === 0) {
    punishments.push("+2 Extra Study Hours Today");
    punishments.push("Solve +50 Extra Questions");
    punishments.push("Mandatory Deep Revision");
  } else if (yesterday.score < 60) {
    punishments.push("Solve +30 Extra Questions");
    punishments.push("Revise your weakest topic for 1 hour");
  }

  if (yesterday.score < 60 && dayBefore && dayBefore.score < 60) {
    punishments.push("🚨 RECOVERY MODE: Next 3 days Min 8 Hours Study, NO Entertainment!");
  }

  return punishments;
}

export function getRealDate(startDate: string, dayNumber: number): string {
  const start = parseISO(startDate);
  const targetDate = addDays(start, dayNumber - 1);
  return format(targetDate, "MMM do, yyyy");
}

export function getCurrentDay(startDate: string, totalDays: number = TOTAL_DAYS): number {
  const start = parseISO(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startNorm = new Date(start);
  startNorm.setHours(0, 0, 0, 0);
  const diff = differenceInDays(today, startNorm) + 1;
  return Math.max(1, Math.min(totalDays, diff));
}

export function calculateAverage(days: Record<number, DayData>, currentDay: number, count: number): number {
  if (currentDay <= 1) return 0;
  let total = 0;
  let actualCount = 0;

  for (let i = currentDay - 1; i >= Math.max(1, currentDay - count); i--) {
    total += days[i]?.score || 0;
    actualCount++;
  }

  return actualCount === 0 ? 0 : Math.round(total / actualCount);
}

export function checkMilestone(
  currentDay: number,
  days: Record<number, DayData>,
  shownMilestones: number[]
): number | null {
  if (!MILESTONES.includes(currentDay) || shownMilestones.includes(currentDay)) {
    return null;
  }

  let recentTotal = 0;
  let validDays = 0;
  for (let i = currentDay; i >= Math.max(1, currentDay - 2); i--) {
    const score = days[i]?.score || 0;
    if (score === 0) return null;
    recentTotal += score;
    validDays++;
  }

  const avg = recentTotal / validDays;
  if (avg >= 70) return currentDay;
  return null;
}

// Validate that a date string is today or in the future
export function isDateTodayOrFuture(dateStr: string): boolean {
  const selected = new Date(dateStr);
  selected.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
