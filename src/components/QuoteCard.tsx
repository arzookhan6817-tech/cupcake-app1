import { useMemo, useState } from "react";
import { QUOTES } from "@/types";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function QuoteCard() {
  const dailyIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear =
      Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
      );
    return dayOfYear % QUOTES.length;
  }, []);

  const [index, setIndex] = useState(dailyIndex);
  const [key, setKey] = useState(0);

  const quote = QUOTES[index];

  const refresh = () => {
    setIndex((prev) => (prev + 1) % QUOTES.length);
    setKey((k) => k + 1);
  };

  const accentMap: Record<string, string> = {
    fun: "text-fuchsia-500 dark:text-fuchsia-400",
    motivational: "text-primary",
    triggering: "text-orange-500 dark:text-orange-400",
  };

  return (
    <div className="bg-card rounded-3xl px-5 py-4 border border-border/50 shadow-sm flex items-center gap-3 mb-5">
      <span className="text-2xl shrink-0">🧁</span>
      <AnimatePresence mode="wait">
        <motion.p
          key={key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={`flex-1 text-sm font-semibold italic leading-snug ${accentMap[quote.type] ?? "text-foreground"}`}
        >
          "{quote.text}"
        </motion.p>
      </AnimatePresence>
      <button
        onClick={refresh}
        className="p-2 rounded-full hover:bg-border/50 transition-colors shrink-0"
        title="New quote"
      >
        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
