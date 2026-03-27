import { useState, useEffect } from "react";
import { useTracker } from "@/hooks/use-tracker";
import { SetupWizard } from "@/components/SetupWizard";
import { Sidebar } from "@/components/Sidebar";
import { DayPanel } from "@/components/DayPanel";
import { MilestoneModal } from "@/components/MilestoneModal";
import { SettingsModal } from "@/components/SettingsModal";
import { getCurrentDay, calculateAverage, checkMilestone } from "@/lib/tracker-logic";
import { Activity, ShieldCheck, Settings } from "lucide-react";

export default function Home() {
  const { state, isLoaded, markMilestoneShown } = useTracker();

  const currentDay = state.startDate ? getCurrentDay(state.startDate, state.totalDays) : 1;
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [milestonePopup, setMilestonePopup] = useState<{ day: number; avg: number; hrs: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (state.startDate) {
      setSelectedDay(getCurrentDay(state.startDate, state.totalDays));
    }
  }, [state.startDate, state.totalDays]);

  useEffect(() => {
    if (!state.startDate) return;
    const day = getCurrentDay(state.startDate, state.totalDays);
    const m = checkMilestone(day, state.days, state.milestonesShown);
    if (m) {
      const avg = calculateAverage(state.days, day, 7);
      let totalHrs = 0;
      Object.values(state.days).forEach((d) => (totalHrs += d.studyHours));
      setMilestonePopup({ day: m, avg, hrs: totalHrs });
      markMilestoneShown(m);
    }
  }, [state.days, state.startDate]);

  if (!isLoaded) return null;

  if (!state.startDate) {
    return <SetupWizard />;
  }

  const consistencyAvg = calculateAverage(state.days, currentDay, 7);
  const disciplineAvg = calculateAverage(state.days, currentDay, 30);
  const isFuture = selectedDay > currentDay;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="flex w-full h-full">
        <Sidebar
          currentDay={currentDay}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Header — single Settings button only */}
          <header className="h-14 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center justify-between px-5 shrink-0">
            <div className="flex gap-5">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">7d Avg:</span>
                <span className="text-sm font-bold text-foreground">{consistencyAvg}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">30d Avg:</span>
                <span className="text-sm font-bold text-foreground">{disciplineAvg}%</span>
              </div>
            </div>

            {/* Single settings icon */}
            <button
              onClick={() => setSettingsOpen(true)}
              title="Settings"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-transparent hover:border-border"
            >
              <Settings className="w-5 h-5" />
            </button>
          </header>

          {/* Day Panel */}
          <div className="flex-1 overflow-hidden">
            <DayPanel
              key={selectedDay}
              day={selectedDay}
              isCurrentDay={selectedDay === currentDay}
              isFuture={isFuture}
            />
          </div>
        </main>
      </div>

      <MilestoneModal
        isOpen={!!milestonePopup}
        day={milestonePopup?.day || 0}
        avgScore={milestonePopup?.avg || 0}
        totalHours={milestonePopup?.hrs || 0}
        onClose={() => setMilestonePopup(null)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
