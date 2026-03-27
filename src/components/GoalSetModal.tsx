import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target } from "lucide-react";
import { TRACKER_DEF, DEFAULT_GOALS } from "@/types";

interface GoalSetModalProps {
  trackerKey: string;
  currentGoal: number;
  customName?: string;
  onSave: (goal: number) => void;
  onClose: () => void;
}

export function GoalSetModal({ trackerKey, currentGoal, customName, onSave, onClose }: GoalSetModalProps) {
  const def = TRACKER_DEF[trackerKey];
  const [value, setValue] = useState(currentGoal || DEFAULT_GOALS[trackerKey] || 0);

  const label = trackerKey === "partnerAnnoyance" && customName ? customName : def?.label ?? trackerKey;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="bg-card rounded-3xl p-6 w-full max-w-xs shadow-2xl border-2 border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Set Goal</h3>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-border/50 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mb-5">
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">
              Daily target {def?.unit ? `(${def.unit})` : ""}
            </label>
            <input
              type="number"
              value={value}
              min={def?.min ?? 0}
              max={def?.max}
              step={def?.step ?? 1}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none text-xl font-bold text-center transition-all"
            />
            {def?.type === "slider" && (
              <input
                type="range"
                min={def.min}
                max={def.max}
                step={def.step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full mt-3"
              />
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-secondary/30 text-secondary-foreground font-bold hover:bg-secondary/50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
