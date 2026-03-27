import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Utensils, Drumstick, Gamepad2, Smile, Calculator,
  BookOpen, Briefcase, Flame, Waves, Building2, HeartCrack,
  Minus, Plus, Target, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TRACKER_DEF, DEFAULT_GOALS } from "@/types";
import { GoalSetModal } from "@/components/GoalSetModal";
import confetti from "canvas-confetti";

const ICONS: Record<string, any> = {
  Moon, Utensils, Drumstick, Gamepad2, Smile, Calculator,
  BookOpen, Briefcase, Flame, Waves, Building2, HeartCrack,
};

interface TrackerCardProps {
  trackerKey: string;
  value: number;
  goal: number;
  onChange?: (val: number) => void;
  onGoalChange?: (goal: number) => void;
  customName?: string;
  readOnly?: boolean;
}

function getProgressColor(pct: number): { bar: string; text: string } {
  if (pct >= 100) return { bar: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400" };
  if (pct >= 70) return { bar: "bg-yellow-400", text: "text-yellow-600 dark:text-yellow-400" };
  if (pct >= 30) return { bar: "bg-orange-400", text: "text-orange-600 dark:text-orange-400" };
  return { bar: "bg-red-400", text: "text-red-600 dark:text-red-400" };
}

let lastCelebrated: Record<string, number> = {};

export function TrackerCard({
  trackerKey,
  value = 0,
  goal,
  onChange,
  onGoalChange,
  customName,
  readOnly = false,
}: TrackerCardProps) {
  const def = TRACKER_DEF[trackerKey];
  const Icon = ICONS[def?.icon] || Smile;

  const [localVal, setLocalVal] = useState(value);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    setLocalVal(value ?? 0);
  }, [value]);

  const handleUpdate = (newVal: number) => {
    if (readOnly) return;
    let clamped = newVal;
    if (def?.min !== undefined && clamped < def.min) clamped = def.min;
    if (def?.max !== undefined && clamped > def.max) clamped = def.max;
    setLocalVal(clamped);
    if (onChange) onChange(clamped);

    // Celebrate goal completion
    if (
      goal > 0 &&
      clamped >= goal &&
      (lastCelebrated[trackerKey] ?? -1) < goal
    ) {
      lastCelebrated[trackerKey] = goal;
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2000);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f472b6", "#a78bfa", "#34d399", "#fbbf24", "#60a5fa"],
        scalar: 0.9,
      });
    }
  };

  const label = trackerKey === "partnerAnnoyance" && customName ? customName : (def?.label ?? trackerKey);

  // Progress (skip for partnerAnnoyance — lower is better, no progress bar)
  const isAnnoyance = trackerKey === "partnerAnnoyance";
  const effectiveGoal = goal > 0 ? goal : (DEFAULT_GOALS[trackerKey] ?? 0);
  const progressPct = (!isAnnoyance && effectiveGoal > 0)
    ? Math.min(100, Math.round((localVal / effectiveGoal) * 100))
    : -1;
  const colors = progressPct >= 0 ? getProgressColor(progressPct) : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "bg-card rounded-3xl p-5 shadow-sm border-2 border-border/60 flex flex-col gap-3 relative overflow-hidden transition-shadow",
          justCompleted && "border-emerald-400 shadow-emerald-100 dark:shadow-emerald-900/30 shadow-lg"
        )}
      >
        {/* Completion glow */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 pointer-events-none rounded-3xl"
            />
          )}
        </AnimatePresence>

        {/* Header row */}
        <div className="flex items-center gap-3 relative">
          <div className={cn("p-2.5 rounded-2xl shrink-0", def?.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground leading-tight truncate">
              {label} <span className="text-base">{def?.emoji}</span>
            </h3>
            {!isAnnoyance && effectiveGoal > 0 && (
              <p className={cn("text-xs font-semibold", colors?.text)}>
                {localVal}{def?.unit ? ` ${def.unit}` : ""} / {effectiveGoal}{def?.unit ? ` ${def.unit}` : ""}
                {progressPct === 100 && " ✓"}
              </p>
            )}
          </div>

          {/* Goal set button */}
          {!readOnly && !isAnnoyance && (
            <button
              onClick={() => setShowGoalModal(true)}
              className="p-1.5 rounded-xl hover:bg-border/50 transition-colors shrink-0"
              title="Set goal"
            >
              <Target className={cn("w-4 h-4", effectiveGoal > 0 ? "text-primary" : "text-muted-foreground")} />
            </button>
          )}

          {justCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xl"
            >
              🏆
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        {progressPct >= 0 && (
          <div className="relative h-2 bg-border/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn("h-full rounded-full", colors?.bar)}
            />
          </div>
        )}

        {/* Input controls */}
        {def?.type === "number" ? (
          <div className="flex items-center gap-2">
            <button
              disabled={readOnly}
              onClick={() => handleUpdate(localVal - (def?.step ?? 1))}
              className="h-11 w-11 rounded-2xl bg-secondary/30 text-secondary-foreground hover:bg-secondary/50 active:scale-90 transition-all disabled:opacity-40 flex items-center justify-center shrink-0"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center font-black text-2xl text-foreground">
              {localVal}
              {def?.unit && (
                <span className="text-sm font-semibold text-muted-foreground ml-1">{def.unit}</span>
              )}
            </div>
            <button
              disabled={readOnly}
              onClick={() => handleUpdate(localVal + (def?.step ?? 1))}
              className="h-11 w-11 rounded-2xl bg-primary/15 text-primary hover:bg-primary/25 active:scale-90 transition-all disabled:opacity-40 flex items-center justify-center shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="py-1">
            <input
              type="range"
              min={def?.min ?? 0}
              max={def?.max ?? 100}
              step={def?.step ?? 1}
              value={localVal}
              onChange={(e) => handleUpdate(Number(e.target.value))}
              disabled={readOnly}
              className={cn("w-full accent-primary", readOnly && "opacity-60 cursor-not-allowed")}
            />
            <div className="flex justify-between mt-1 text-xs font-bold text-muted-foreground">
              <span>{def?.min ?? 0}</span>
              <span className={cn("text-base font-black", isAnnoyance && localVal > 70 ? "text-destructive" : "text-primary")}>
                {localVal}
              </span>
              <span>{def?.max ?? 100}</span>
            </div>
            {isAnnoyance && localVal >= 80 && (
              <p className="text-center text-xs font-bold text-destructive mt-1 animate-pulse">
                {localVal === 100 ? "⚠️ Critical!" : "⚠️ Getting dangerous…"}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {showGoalModal && (
        <GoalSetModal
          trackerKey={trackerKey}
          currentGoal={effectiveGoal}
          customName={customName}
          onSave={(g) => onGoalChange?.(g)}
          onClose={() => setShowGoalModal(false)}
        />
      )}
    </>
  );
}
