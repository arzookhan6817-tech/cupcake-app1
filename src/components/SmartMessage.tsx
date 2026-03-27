import { useMemo } from "react";
import { motion } from "framer-motion";

interface SmartMessageProps {
  overallProgress: number; // 0–100
}

function getTimeContext(): { period: string; message: string } {
  const hour = new Date().getHours();
  const remaining = 24 - hour;

  if (remaining <= 3) {
    return {
      period: "late",
      message: "Time is running out. Move now.",
    };
  }
  if (hour < 12) {
    return {
      period: "morning",
      message: "Fresh start. Set the tone for today.",
    };
  }
  if (hour < 17) {
    return {
      period: "afternoon",
      message: "Half day gone. Stay sharp.",
    };
  }
  if (hour < 21) {
    return {
      period: "evening",
      message: "Last push. Finish strong.",
    };
  }
  return {
    period: "night",
    message: "Day's ending. Reflect and reset.",
  };
}

function getProgressMessage(progress: number): string {
  if (progress === 0) return "Let's begin. Every point matters.";
  if (progress < 30) return "You just started. Momentum matters.";
  if (progress < 70) return "You're getting there. Keep pushing.";
  if (progress < 100) return "Almost done. Don't stop now.";
  return "You did it. That's discipline. 🏆";
}

const periodEmoji: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌆",
  night: "🌙",
  late: "⏰",
};

const periodColor: Record<string, string> = {
  morning: "from-amber-100 to-orange-50 border-amber-200 dark:from-amber-900/30 dark:to-orange-900/20 dark:border-amber-800/40",
  afternoon: "from-sky-100 to-blue-50 border-sky-200 dark:from-sky-900/30 dark:to-blue-900/20 dark:border-sky-800/40",
  evening: "from-violet-100 to-purple-50 border-violet-200 dark:from-violet-900/30 dark:to-purple-900/20 dark:border-violet-800/40",
  night: "from-indigo-100 to-slate-50 border-indigo-200 dark:from-indigo-900/30 dark:to-slate-900/20 dark:border-indigo-800/40",
  late: "from-red-100 to-rose-50 border-red-200 dark:from-red-900/30 dark:to-rose-900/20 dark:border-red-800/40",
};

export function SmartMessage({ overallProgress }: SmartMessageProps) {
  const { period, message: timeMsg } = useMemo(() => getTimeContext(), []);
  const progressMsg = getProgressMessage(overallProgress);

  const colorClass = periodColor[period];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`rounded-3xl px-5 py-4 bg-gradient-to-r border mb-5 ${colorClass}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{periodEmoji[period]}</span>
        <div>
          <p className="font-bold text-foreground text-sm">{timeMsg}</p>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium">{progressMsg}</p>
        </div>
        {overallProgress > 0 && (
          <div className="ml-auto shrink-0 text-right">
            <span className="text-xl font-black text-foreground">{Math.round(overallProgress)}%</span>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">done</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
