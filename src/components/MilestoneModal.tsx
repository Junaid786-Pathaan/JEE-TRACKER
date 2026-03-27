import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Flame, Clock, Target, X } from "lucide-react";

interface MilestoneModalProps {
  isOpen: boolean;
  day: number;
  avgScore: number;
  totalHours: number;
  onClose: () => void;
}

export function MilestoneModal({ isOpen, day, avgScore, totalHours, onClose }: MilestoneModalProps) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 w-full max-w-md relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {day} Days Complete!
              </h2>
              <p className="text-muted-foreground mb-8">
                Bhaijaan... tu rukha nahi. Ye bas start hai. Keep pushing boundaries!
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-secondary rounded-xl p-3">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{day}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</div>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <Target className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{Math.round(avgScore)}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</div>
                </div>
                <div className="bg-secondary rounded-xl p-3">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{totalHours}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Hrs</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(126,34,206,0.3)] hover:shadow-[0_0_25px_rgba(126,34,206,0.5)] active:scale-95"
              >
                ⚔️ Continue War
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
