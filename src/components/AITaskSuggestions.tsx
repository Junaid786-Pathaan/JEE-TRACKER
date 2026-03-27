import { useTracker } from "@/hooks/use-tracker";
import { getCurrentDay } from "@/lib/tracker-logic";
import { getAISuggestions } from "@/lib/intelligence";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AITaskSuggestions() {
  const { state } = useTracker();

  if (!state.startDate) return null;

  const currentDay = getCurrentDay(state.startDate, state.totalDays);
  const suggestions = getAISuggestions(state.days, currentDay);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-primary">
        <Sparkles className="w-4 h-4" />
        AI Task Suggestions
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
          Day {currentDay}
        </span>
      </h3>

      <div className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl border transition-all",
              i === 0
                ? "bg-primary/10 border-primary/30"
                : "bg-secondary border-border"
            )}
          >
            <ChevronRight className={cn(
              "w-4 h-4 mt-0.5 shrink-0",
              i === 0 ? "text-primary" : "text-muted-foreground"
            )} />
            <p className={cn(
              "text-sm font-medium leading-relaxed",
              i === 0 ? "text-foreground" : "text-foreground/80"
            )}>
              {suggestion}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Suggestions auto-update based on your last 7 days of performance
      </p>
    </div>
  );
}
