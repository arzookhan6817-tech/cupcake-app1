import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { Alert } from "@/types";

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none">
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="w-full max-w-md bg-gradient-to-r from-destructive to-rose-500 text-destructive-foreground p-4 rounded-2xl shadow-xl shadow-destructive/20 flex items-start gap-3 pointer-events-auto"
          >
            <div className="bg-white/20 p-2 rounded-full shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h4 className="font-bold text-lg leading-tight">Attention!</h4>
              <p className="text-white/90 font-medium text-sm mt-1">{alert.message}</p>
            </div>
            <button 
              onClick={() => onDismiss(alert.id)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
