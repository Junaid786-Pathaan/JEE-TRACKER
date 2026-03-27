import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getRealDate, getStatus } from "@/lib/tracker-logic";
import { useTracker } from "@/hooks/use-tracker";
import { Lock, CheckCircle2 } from "lucide-react";

interface SidebarProps {
  currentDay: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export function Sidebar({ currentDay, selectedDay, onSelectDay }: SidebarProps) {
  const { state } = useTracker();
  const currentDayRef = useRef<HTMLButtonElement>(null);
  const totalDays = state.totalDays;

  useEffect(() => {
    if (currentDayRef.current) {
      currentDayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentDay]);

  const daysList = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <aside className="w-72 h-full border-r border-border/50 bg-card/80 backdrop-blur-md flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-border/50 shrink-0">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <img src="/logo.png" alt="JEE Tracker" className="w-7 h-7 rounded-md object-cover" />
          Mission Timeline
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Day {currentDay} of {totalDays}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1" style={{ scrollBehavior: "smooth" }}>
        {daysList.map((day) => {
          const isPast = day < currentDay;
          const isCurrent = day === currentDay;
          const isFuture = day > currentDay;
          const dayData = state.days[day];
          const status = dayData ? getStatus(dayData.score) : null;
          const realDate = state.startDate ? getRealDate(state.startDate, day) : "";
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              ref={isCurrent ? currentDayRef : null}
              disabled={isFuture}
              onClick={() => !isFuture && onSelectDay(day)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 relative group",
                isCurrent && "bg-primary/15 border border-primary/40",
                isPast && !isSelected && "hover:bg-secondary border border-transparent hover:border-border/50",
                isPast && isSelected && "bg-secondary border border-border",
                isFuture && "opacity-35 cursor-not-allowed border border-transparent",
              )}
            >
              {isCurrent && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-full" />
              )}

              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                isCurrent && "bg-primary text-primary-foreground",
                isPast && !dayData && "bg-secondary text-muted-foreground",
                isPast && dayData && dayData.score >= 70 && "bg-emerald-500/20 text-emerald-500",
                isPast && dayData && dayData.score < 70 && dayData.score >= 40 && "bg-yellow-500/20 text-yellow-500",
                isPast && dayData && dayData.score < 40 && "bg-red-500/20 text-red-500",
                isFuture && "bg-secondary text-muted-foreground",
              )}>
                {isFuture ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isPast && dayData ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{day}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={cn(
                    "text-sm font-semibold truncate",
                    isCurrent ? "text-primary" : "text-foreground"
                  )}>
                    {isCurrent ? "Today" : `Day ${day}`}
                  </span>
                  {status && (
                    <span className="text-xs shrink-0" title={`${status.label}: ${dayData?.score}`}>
                      {status.emoji}
                    </span>
                  )}
                  {isFuture && (
                    <span className="text-xs text-muted-foreground shrink-0">🔒</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{realDate}</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
