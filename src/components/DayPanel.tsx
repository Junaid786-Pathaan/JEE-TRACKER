import { useEffect, useMemo, useState } from "react";
import { useTracker } from "@/hooks/use-tracker";
import {
  DayData,
  DEFAULT_DAY_DATA,
  getCoachData,
  getPunishments,
  getStatus,
  getRealDate,
  getQuestionScore,
  getStudyHourScore,
  getCombinedBonus,
  getLectureScore,
  getCurrentDay,
} from "@/lib/tracker-logic";
import { CheckCircle2, Circle, AlertTriangle, MessageSquareWarning, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DopamineMeter } from "@/components/DopamineMeter";
import { AITaskSuggestions } from "@/components/AITaskSuggestions";
import { DisciplineChallenge } from "@/components/DisciplineChallenge";

interface DayPanelProps {
  day: number;
  isCurrentDay: boolean;
  isFuture: boolean;
}

export function DayPanel({ day, isCurrentDay, isFuture }: DayPanelProps) {
  const { state, updateDay } = useTracker();
  const dayData = state.days[day] || DEFAULT_DAY_DATA;
  const status = getStatus(dayData.score);
  const realDate = state.startDate ? getRealDate(state.startDate, day) : "";

  const [localData, setLocalData] = useState<DayData>(dayData);

  useEffect(() => {
    setLocalData(state.days[day] || DEFAULT_DAY_DATA);
  }, [day, state.days]);

  const handleChange = (field: keyof DayData, value: any) => {
    if (!isCurrentDay) return;
    const newData = { ...localData, [field]: value };
    if (field === "questionPractice" && !value) {
      newData.questionsCount = 0;
    }
    setLocalData(newData);
    updateDay(day, newData);
  };

  const punishments = isCurrentDay ? getPunishments(day, state.days) : [];

  const currentDayNum = state.startDate ? getCurrentDay(state.startDate, state.totalDays) : day;
  const coachData = useMemo(
    () => getCoachData(localData.score, currentDayNum, state.days),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localData.score, currentDayNum]
  );

  // Dynamic score components
  const qScore = getQuestionScore(localData.questionPractice, localData.questionsCount);
  const hScore = getStudyHourScore(localData.studyHours);
  const bonus = getCombinedBonus(localData.questionPractice, localData.questionsCount, localData.studyHours);
  const lScore = getLectureScore(localData.lecturesDone);

  if (isFuture) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Day {day} — Locked 🔒</h2>
        <p className="text-muted-foreground max-w-sm">
          {realDate} — This day hasn't arrived yet. Stay consistent and it will unlock.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
      {/* Top Banner */}
      <div className="bg-card/50 border-b border-border/50 p-6 md:p-8 flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            Day {day}
            {isCurrentDay && (
              <span className="text-sm font-semibold px-3 py-1 bg-primary/20 rounded-full text-primary border border-primary/30">
                Today
              </span>
            )}
            {!isCurrentDay && !isFuture && (
              <span className="text-sm font-normal px-3 py-1 bg-secondary rounded-full text-muted-foreground border border-border">
                Past Record (View Only)
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">{realDate}</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
            {localData.score}
          </div>
          <div className={cn("text-lg font-bold flex items-center justify-end gap-1", status.color)}>
            {status.emoji} {status.label}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto pb-16">

        {/* Punishments Alert */}
        {punishments.length > 0 && isCurrentDay && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5">
            <h3 className="text-destructive font-bold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              Punishments Active
            </h3>
            <ul className="space-y-2">
              {punishments.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Coach */}
        <div className={cn(
          "rounded-2xl p-5 border shadow-sm transition-all duration-300",
          coachData.bgColor,
          coachData.borderColor
        )}>
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="relative">
                <img
                  src={`${import.meta.env.BASE_URL}images/coach-avatar.png`}
                  alt="AI Coach"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shadow-md"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                {/* Mood emoji badge */}
                <span className="absolute -bottom-1 -right-1 text-base leading-none">
                  {coachData.emoji}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm font-bold mb-1.5 flex items-center gap-2", coachData.textColor)}>
                <MessageSquareWarning className="w-4 h-4 shrink-0" />
                AI Strict Coach
                <span className={cn(
                  "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border",
                  coachData.bgColor, coachData.borderColor, coachData.textColor
                )}>
                  {coachData.emoji} {coachData.mood}
                </span>
              </h4>
              <p className="text-foreground/90 font-medium leading-relaxed italic text-sm">
                "{coachData.message}"
              </p>
            </div>
          </div>

          {/* Streak / elite message */}
          {coachData.streakMessage && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-sm font-semibold text-foreground/80">
                {coachData.streakMessage}
              </p>
            </div>
          )}
        </div>

        {/* AI & Discipline Widgets — only shown for current day */}
        {isCurrentDay && (
          <>
            <DopamineMeter />
            <DisciplineChallenge />
            <AITaskSuggestions />
          </>
        )}

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CheckboxItem
            label="No Distractions"
            desc="0 social media, 0 YouTube shorts"
            checked={localData.noDistraction}
            onChange={(v) => handleChange("noDistraction", v)}
            disabled={!isCurrentDay}
            points="+15"
          />
          <CheckboxItem
            label="No Time Waste"
            desc="Stuck to the schedule strictly"
            checked={localData.noTimeWaste}
            onChange={(v) => handleChange("noTimeWaste", v)}
            disabled={!isCurrentDay}
            points="+15"
          />

          {/* Question Practice — full width with conditional count input */}
          <div className="md:col-span-2">
            <CheckboxItem
              label="Question Practice"
              desc="Solved actual problems today"
              checked={localData.questionPractice}
              onChange={(v) => handleChange("questionPractice", v)}
              disabled={!isCurrentDay}
              points="up to +25"
            />
            {localData.questionPractice && (
              <div className="mt-2 ml-1 p-4 bg-secondary/60 border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Questions solved today
                      <span className="ml-1.5 font-normal text-muted-foreground">(1–100)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      disabled={!isCurrentDay}
                      value={localData.questionsCount || ""}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value);
                        const clamped = isNaN(raw) ? 0 : Math.min(100, Math.max(0, raw));
                        handleChange("questionsCount", clamped);
                      }}
                      placeholder="0"
                      className="w-24 px-3 py-2 rounded-lg border bg-background border-border text-foreground text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <QuestionScoreTier count={localData.questionsCount} />
                  </div>
                </div>
                {/* Tier breakdown */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                  {[
                    { range: "0–10", pts: "0 pts", active: localData.questionsCount <= 10 },
                    { range: "11–20", pts: "+10 pts", active: localData.questionsCount > 10 && localData.questionsCount <= 20 },
                    { range: "21–40", pts: "+15 pts", active: localData.questionsCount > 20 && localData.questionsCount <= 40 },
                    { range: "41–70", pts: "+20 pts", active: localData.questionsCount > 40 && localData.questionsCount <= 70 },
                    { range: "71–100", pts: "+25 pts", active: localData.questionsCount > 70 },
                  ].map((tier) => (
                    <div
                      key={tier.range}
                      className={cn(
                        "rounded-lg py-1.5 px-1 border transition-all",
                        tier.active && localData.questionsCount > 0
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-secondary border-border text-muted-foreground"
                      )}
                    >
                      <div className="font-semibold">{tier.range}</div>
                      <div>{tier.pts}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CheckboxItem
            label="Revision Done"
            desc="Reviewed old concepts"
            checked={localData.revision}
            onChange={(v) => handleChange("revision", v)}
            disabled={!isCurrentDay}
            points="+15"
          />
        </div>

        {/* Sliders */}
        <div className="space-y-7 bg-card border border-border rounded-2xl p-6">

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-sm">Self Study Hours</label>
              <span className="text-primary font-bold text-sm">
                {localData.studyHours} hrs
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  → +{hScore} pts
                </span>
              </span>
            </div>
            <input
              type="range"
              min="0" max="24" step="0.5"
              value={localData.studyHours}
              onChange={(e) => handleChange("studyHours", parseFloat(e.target.value))}
              disabled={!isCurrentDay}
              className="w-full accent-primary disabled:opacity-50"
            />
            {/* Study hour tiers */}
            <div className="grid grid-cols-5 gap-1 mt-2 text-center text-[10px]">
              {[
                { range: "<2h", pts: "0 pts", active: localData.studyHours < 2 },
                { range: "2–4h", pts: "+5 pts", active: localData.studyHours >= 2 && localData.studyHours < 4 },
                { range: "4–6h", pts: "+10 pts", active: localData.studyHours >= 4 && localData.studyHours < 6 },
                { range: "6–8h", pts: "+15 pts", active: localData.studyHours >= 6 && localData.studyHours < 8 },
                { range: "8h+", pts: "+20 pts", active: localData.studyHours >= 8 },
              ].map((tier) => (
                <div
                  key={tier.range}
                  className={cn(
                    "rounded-lg py-1 border transition-all",
                    tier.active
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-secondary border-border text-muted-foreground"
                  )}
                >
                  <div className="font-semibold">{tier.range}</div>
                  <div>{tier.pts}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-3">
              <label className="font-semibold text-sm">Lectures Completed</label>
              <span className="text-primary font-bold text-sm">
                {localData.lecturesDone} lectures → +{lScore} pts
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                const pts = getLectureScore(num);
                return (
                  <button
                    key={num}
                    disabled={!isCurrentDay}
                    onClick={() => handleChange("lecturesDone", num)}
                    className={cn(
                      "flex-1 min-w-[2.5rem] py-2 rounded-lg font-bold transition-all border text-sm flex flex-col items-center",
                      localData.lecturesDone === num
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(126,34,206,0.3)]"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <span>{num}</span>
                    <span className="text-[9px] font-normal opacity-70">+{pts}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">
              0→0pt · 1→5pt · 2→10pt · 3→15pt · 4+→20pt
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-sm">Mind Control Level</label>
              <span className="text-primary font-bold text-sm">
                {localData.mindControl}%
                <span className="text-xs text-muted-foreground font-normal ml-1">(≥70 gives +5pts)</span>
              </span>
            </div>
            <input
              type="range"
              min="0" max="100" step="5"
              value={localData.mindControl}
              onChange={(e) => handleChange("mindControl", parseInt(e.target.value))}
              disabled={!isCurrentDay}
              className="w-full accent-primary disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Distracted</span>
              <span>Laser Focused</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">
            Live Score Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreItem label="No Distraction" value={localData.noDistraction ? 15 : 0} max={15} />
            <ScoreItem label="No Time Waste" value={localData.noTimeWaste ? 15 : 0} max={15} />
            <ScoreItem label={`Lectures (${localData.lecturesDone})`} value={lScore} max={20} highlight />
            <ScoreItem label="Revision" value={localData.revision ? 15 : 0} max={15} />
            <ScoreItem label="Mind Control" value={localData.mindControl >= 70 ? 5 : 0} max={5} />
            <ScoreItem label="Questions" value={qScore} max={25} highlight />
            <ScoreItem label="Study Hours" value={hScore} max={20} highlight />
            {/* Bonus */}
            <div className={cn(
              "rounded-xl p-3 border flex flex-col items-center justify-center text-center col-span-1",
              bonus > 0 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-secondary border-border"
            )}>
              <div className="flex items-center gap-1">
                <Zap className={cn("w-3.5 h-3.5", bonus > 0 ? "text-yellow-500" : "text-muted-foreground")} />
                <span className={cn("text-xl font-black", bonus > 0 ? "text-yellow-500" : "text-muted-foreground")}>
                  +{bonus}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 leading-tight">Combo Bonus</div>
              {bonus === 0 && (
                <div className="text-[9px] text-muted-foreground mt-0.5">Q≥40 & 6h+</div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Final Score (capped at 100)</span>
            <div className={cn("text-2xl font-black", status.color)}>
              {localData.score} / 100 {status.emoji}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function QuestionScoreTier({ count }: { count: number }) {
  let pts = 0;
  let label = "";
  if (count <= 0) { pts = 0; label = "No questions yet"; }
  else if (count <= 10) { pts = 0; label = "Too few — need 11+ for points"; }
  else if (count <= 20) { pts = 10; label = "Getting there! +10 pts"; }
  else if (count <= 40) { pts = 15; label = "Good effort! +15 pts"; }
  else if (count <= 70) { pts = 20; label = "Strong! +20 pts"; }
  else { pts = 25; label = "Beast! +25 pts"; }

  return (
    <div className={cn(
      "rounded-lg px-3 py-2 border text-sm font-semibold transition-all",
      pts === 25 ? "bg-purple-500/20 border-purple-500/40 text-purple-400" :
      pts === 20 ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
      pts === 15 ? "bg-blue-500/20 border-blue-500/40 text-blue-400" :
      pts === 10 ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" :
      "bg-secondary border-border text-muted-foreground"
    )}>
      {label}
    </div>
  );
}

function CheckboxItem({ label, desc, checked, onChange, disabled, points }: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
  points: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border text-left transition-all w-full",
        checked ? "bg-primary/10 border-primary/50" : "bg-card border-border hover:bg-secondary",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {checked ? (
          <CheckCircle2 className="w-6 h-6 text-primary" />
        ) : (
          <Circle className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground flex items-center justify-between gap-2 flex-wrap">
          <span>{label}</span>
          <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
            {points}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

function ScoreItem({ label, value, max, highlight }: { label: string; value: number; max: number; highlight?: boolean }) {
  const earned = value > 0;
  return (
    <div className={cn(
      "rounded-xl p-3 border flex flex-col items-center justify-center text-center",
      earned && highlight ? "bg-primary/10 border-primary/30" :
      earned ? "bg-emerald-500/10 border-emerald-500/30" :
      "bg-secondary border-border"
    )}>
      <div className={cn(
        "text-xl font-black",
        earned && highlight ? "text-primary" :
        earned ? "text-emerald-500" :
        "text-muted-foreground"
      )}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 leading-tight">{label}</div>
      <div className="text-[10px] text-muted-foreground">/ {max}</div>
    </div>
  );
}
