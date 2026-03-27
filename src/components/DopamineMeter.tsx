import { useTracker } from "@/hooks/use-tracker";
import { getCurrentDay } from "@/lib/tracker-logic";
import {
  calculateDopamineMeter,
  getDopamineState,
  getSmartReward,
} from "@/lib/intelligence";
import { Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function DopamineMeter() {
  const { state } = useTracker();

  if (!state.startDate) return null;

  const currentDay = getCurrentDay(state.startDate, state.totalDays);
  const meter = calculateDopamineMeter(state.days, currentDay);
  const dopamineState = getDopamineState(meter);
  const reward = getSmartReward(state.days, currentDay);

  return (
    <div className="space-y-3">
      {/* Dopamine Meter Card */}
      <div className={cn(
        "rounded-2xl p-5 border transition-all duration-300",
        dopamineState.bgColor,
        dopamineState.borderColor
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("text-sm font-bold flex items-center gap-2", dopamineState.color)}>
            <Zap className="w-4 h-4" />
            Dopamine Meter
          </h3>
          <span className={cn("text-2xl font-black", dopamineState.color)}>
            {meter}
            <span className="text-sm font-normal">/100</span>
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden mb-3">
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", dopamineState.barColor)}
            style={{ width: `${meter}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Low Energy</span>
          <span className={cn("font-bold px-2 py-0.5 rounded-full border text-xs",
            dopamineState.bgColor, dopamineState.borderColor, dopamineState.color
          )}>
            {dopamineState.label}
          </span>
          <span className="text-muted-foreground">Peak</span>
        </div>

        <p className={cn("text-xs italic font-medium", dopamineState.color)}>
          "{dopamineState.message}"
        </p>
      </div>

      {/* Smart Reward */}
      {reward && (
        <div className="bg-yellow-950/30 border border-yellow-500/40 rounded-xl px-4 py-3 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-yellow-400">Reward Unlocked!</span>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {reward.icon} {reward.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
