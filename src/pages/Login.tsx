import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-20 -right-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-primary/10 border-4 border-white text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <img 
            src={`${import.meta.env.BASE_URL}images/cupcake-mascot.png`} 
            alt="Cupcake Mascot" 
            className="w-48 h-48 mx-auto mb-6 drop-shadow-2xl"
          />
        </motion.div>
        
        <h1 className="text-4xl font-extrabold text-foreground mb-3 font-display">Cupcake</h1>
        <p className="text-muted-foreground font-medium text-lg mb-8">
          Track your habits, share your mood, and nurture your relationship playfully.
        </p>

        <button 
          onClick={signIn}
          className="w-full py-4 px-6 rounded-2xl bg-foreground text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-foreground/20"
        >
          <LogIn className="w-6 h-6" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
