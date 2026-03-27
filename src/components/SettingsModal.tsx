import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, AlertTriangle, Settings, Download, Upload, PlusCircle } from "lucide-react";
import { useTracker } from "@/hooks/use-tracker";
import { isDateTodayOrFuture, getTodayString, MAX_TOTAL_DAYS } from "@/lib/tracker-logic";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, setStartDate, setTotalDays, resetAll, exportData, importData } = useTracker();

  const [newDate, setNewDate] = useState(state.startDate || getTodayString());
  const [extendValue, setExtendValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFeedback = () => { setError(""); setSuccess(""); };

  const handleChangeDate = () => {
    clearFeedback();
    if (!newDate) { setError("Please select a date."); return; }
    if (!isDateTodayOrFuture(newDate)) {
      setError("You cannot select a past date. Please pick today or a future date.");
      return;
    }
    setStartDate(newDate);
    setSuccess("Start date updated! Days have been recalculated.");
    setTimeout(() => { setSuccess(""); onClose(); }, 1500);
  };

  const handleExtendDays = () => {
    clearFeedback();
    const val = parseInt(extendValue, 10);
    if (isNaN(val) || extendValue.trim() === "") {
      setError("Please enter a valid number.");
      return;
    }
    if (val <= state.totalDays) {
      setError(`New value must be greater than current total (${state.totalDays} days).`);
      return;
    }
    if (val > MAX_TOTAL_DAYS) {
      setError(`Maximum limit is ${MAX_TOTAL_DAYS} days to maintain focus.`);
      return;
    }
    setTotalDays(val);
    const warning = val > 450
      ? " ⚠️ Too many days may reduce urgency. Stay focused!"
      : "";
    setSuccess(`Mission extended to ${val} days!${warning}`);
    setExtendValue("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importData(content);
      if (ok) {
        setSuccess("Backup restored successfully!");
        setTimeout(() => { setSuccess(""); onClose(); }, 1500);
      } else {
        setError("Invalid backup file. Please select a valid JSON backup.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md relative z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Settings
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Feedback banners */}
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  ✓ {success}
                </div>
              )}

              {/* Change Start Date */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Change Start Date
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Progress is preserved. Days are recalculated from the new start date.
                </p>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={newDate}
                    min={getTodayString()}
                    onChange={(e) => { setNewDate(e.target.value); clearFeedback(); }}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground">Only today or future dates are allowed.</p>
                  <button
                    onClick={handleChangeDate}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98] text-sm"
                  >
                    Update Start Date
                  </button>
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Extend Total Days */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-400" /> Extend Total Days
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Current mission length: <span className="font-bold text-foreground">{state.totalDays} days</span>. You can only extend (max {MAX_TOTAL_DAYS}). No data will be lost.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={state.totalDays + 1}
                    max={MAX_TOTAL_DAYS}
                    value={extendValue}
                    onChange={(e) => { setExtendValue(e.target.value); clearFeedback(); }}
                    placeholder={`e.g. ${state.totalDays + 30}`}
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={handleExtendDays}
                    className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold rounded-xl transition-all text-sm shrink-0"
                  >
                    Extend
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[state.totalDays + 7, state.totalDays + 30, state.totalDays + 60]
                    .filter((v) => v <= MAX_TOTAL_DAYS)
                    .map((preset) => (
                      <button
                        key={preset}
                        onClick={() => { setExtendValue(String(preset)); clearFeedback(); }}
                        className="py-1.5 text-xs bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        +{preset - state.totalDays}d ({preset})
                      </button>
                    ))}
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Backup & Restore */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-500" /> Backup & Restore
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Download your data as a JSON file, or restore from a previous backup.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => exportData()}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    <Download className="w-4 h-4" /> Download Backup
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    <Upload className="w-4 h-4" /> Restore Backup
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Danger Zone */}
              <div>
                <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  This will permanently delete all your progress and cannot be undone.
                </p>
                <button
                  onClick={() => { resetAll(); onClose(); }}
                  className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
