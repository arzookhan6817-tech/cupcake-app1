import { motion } from "framer-motion";

interface StatsProps {
  caloriesIntake: number;
  caloriesBurned: number;
  workHours: number;
  learningHours: number;
  streak: number;
  xp: number;
}

export function DashboardStats({
  caloriesIntake,
  caloriesBurned,
  workHours,
  learningHours,
  streak,
  xp,
}: StatsProps) {
  const netCalories = (caloriesIntake || 0) - (caloriesBurned || 0);
  const productiveHours = (workHours || 0) + (learningHours || 0);

  return (
    <div className="grid grid-cols-4 gap-2.5 mb-5">
      {/* Net Calories */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-orange-100 dark:bg-orange-900/30 rounded-2xl p-3 flex flex-col items-center text-center"
      >
        <span className="text-xl mb-1">🔥</span>
        <div className="font-black text-lg text-orange-700 dark:text-orange-300 leading-none">
          {netCalories}
        </div>
        <div className="text-[9px] uppercase tracking-wider font-bold text-orange-500 dark:text-orange-400 mt-1">
          Net kcal
        </div>
      </motion.div>

      {/* Productive Hours */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl p-3 flex flex-col items-center text-center"
      >
        <span className="text-xl mb-1">🧠</span>
        <div className="font-black text-lg text-cyan-700 dark:text-cyan-300 leading-none">
          {productiveHours}h
        </div>
        <div className="text-[9px] uppercase tracking-wider font-bold text-cyan-500 dark:text-cyan-400 mt-1">
          Focus
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-rose-100 dark:bg-rose-900/30 rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden"
      >
        <span className="text-xl mb-1">⚡</span>
        <div className="font-black text-lg text-rose-700 dark:text-rose-300 leading-none">
          {streak}
        </div>
        <div className="text-[9px] uppercase tracking-wider font-bold text-rose-500 dark:text-rose-400 mt-1">
          Streak
        </div>
      </motion.div>

      {/* XP */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-violet-100 dark:bg-violet-900/30 rounded-2xl p-3 flex flex-col items-center text-center"
      >
        <span className="text-xl mb-1">⭐</span>
        <div className="font-black text-lg text-violet-700 dark:text-violet-300 leading-none">
          {xp}
        </div>
        <div className="text-[9px] uppercase tracking-wider font-bold text-violet-500 dark:text-violet-400 mt-1">
          XP
        </div>
      </motion.div>
    </div>
  );
}
