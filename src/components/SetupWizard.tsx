import { useState } from "react";
import { useTracker } from "@/hooks/use-tracker";
import { Calendar, Rocket, ShieldAlert, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { isDateTodayOrFuture, getTodayString } from "@/lib/tracker-logic";

export function SetupWizard() {
  const { setStartDate } = useTracker();
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState("");

  const handleStart = () => {
    setError("");
    if (!date) {
      setError("Please select a start date.");
      return;
    }

    if (!isDateTodayOrFuture(date)) {
      setError("You cannot select a past date. Please pick today or a future date.");
      return;
    }

    setStartDate(date);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="JEE Tracker" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
          </div>

          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            The 365-Day War
          </h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Commit to the ultimate JEE discipline challenge. No excuses. No backing down.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Select Mission Start Date
              </label>
              <input
                type="date"
                value={date}
                min={getTodayString()}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                }}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                You can only start today or plan a future start date.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-destructive mt-0.5" />
              <p className="text-muted-foreground">
                <strong className="text-destructive">Warning:</strong> This tracker is unforgiving. If you slack off, you will face virtual punishments. Are you ready?
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Start The Journey <Rocket className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
