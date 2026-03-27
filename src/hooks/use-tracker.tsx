import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TrackerState, DayData, DEFAULT_DAY_DATA, calculateScore, TOTAL_DAYS } from "@/lib/tracker-logic";

interface TrackerContextType {
  state: TrackerState;
  setStartDate: (date: string) => void;
  updateDay: (dayNumber: number, data: Partial<DayData>) => void;
  markMilestoneShown: (milestone: number) => void;
  setTotalDays: (days: number) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  resetAll: () => void;
  isLoaded: boolean;
}

const STORAGE_KEY = "jee_tracker_data";

const initialState: TrackerState = {
  startDate: null,
  days: {},
  milestonesShown: [],
  totalDays: TOTAL_DAYS,
};

const TrackerContext = createContext<TrackerContextType | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TrackerState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({
          startDate: parsed.startDate || null,
          days: parsed.days || {},
          milestonesShown: parsed.milestonesShown || [],
          totalDays: parsed.totalDays || TOTAL_DAYS,
        });
      } catch (e) {
        console.error("Failed to parse tracker data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const setStartDate = (date: string) => {
    setState((prev) => ({ ...prev, startDate: date }));
  };

  const setTotalDays = (newTotal: number) => {
    setState((prev) => ({ ...prev, totalDays: newTotal }));
  };

  const updateDay = (dayNumber: number, data: Partial<DayData>) => {
    setState((prev) => {
      const currentDayData = prev.days[dayNumber] || { ...DEFAULT_DAY_DATA };
      const updatedData = { ...currentDayData, ...data };
      updatedData.score = calculateScore(updatedData);
      return {
        ...prev,
        days: {
          ...prev.days,
          [dayNumber]: updatedData,
        },
      };
    });
  };

  const markMilestoneShown = (milestone: number) => {
    setState((prev) => ({
      ...prev,
      milestonesShown: [...new Set([...prev.milestonesShown, milestone])],
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jee_tracker_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && typeof parsed === "object" && "days" in parsed) {
        setState({
          startDate: parsed.startDate || null,
          days: parsed.days || {},
          milestonesShown: parsed.milestonesShown || [],
          totalDays: parsed.totalDays || TOTAL_DAYS,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetAll = () => {
    if (confirm("Are you sure? This will wipe all your progress!")) {
      setState(initialState);
    }
  };

  return (
    <TrackerContext.Provider
      value={{ state, setStartDate, updateDay, markMilestoneShown, setTotalDays, exportData, importData, resetAll, isLoaded }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
