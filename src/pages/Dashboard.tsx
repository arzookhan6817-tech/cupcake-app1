import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTrackers } from "@/hooks/use-trackers";
import { usePartner } from "@/hooks/use-partner";
import { useAlerts } from "@/hooks/use-alerts";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TrackerCard } from "@/components/TrackerCard";
import { DashboardStats } from "@/components/DashboardStats";
import { AlertBanner } from "@/components/AlertBanner";
import { SmartMessage } from "@/components/SmartMessage";
import { QuoteCard } from "@/components/QuoteCard";
import { Settings, LogOut, Heart, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_GOALS, XP_PER_GOAL, UserProfile } from "@/types";

export function Dashboard() {
  const { profile, signOut, updateLocalProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"me" | "partner">("me");

  // Dark mode
  const [darkMode, setDarkMode] = useState(profile?.darkMode ?? false);
  useEffect(() => { if (profile) setDarkMode(profile.darkMode ?? false); }, [profile?.darkMode]);
  const { toggle: toggleDark } = useDarkMode(profile?.uid, darkMode, (v) => {
    setDarkMode(v);
    updateLocalProfile({ darkMode: v });
  });

  const { log, updateTracker, loading: logLoading } = useTrackers(
    profile?.uid,
    profile?.partnerId,
    profile?.customTrackerName || "Partner Annoyance"
  );
  const { partnerProfile, partnerLog, loading: partnerLoading } = usePartner(profile?.partnerId);
  const { alerts, markAsRead } = useAlerts(profile?.uid);

  // Switch back to "me" tab when partner removed
  useEffect(() => {
    if (!profile?.partnerId) setActiveTab("me");
  }, [profile?.partnerId]);

  // ── Goal management ──
  const goals: Record<string, number> = useMemo(
    () => ({ ...DEFAULT_GOALS, ...(profile?.goals ?? {}) }),
    [profile?.goals]
  );

  const handleGoalChange = useCallback(
    async (trackerKey: string, goal: number) => {
      if (!profile?.uid) return;
      const updatedGoals = { ...goals, [trackerKey]: goal };
      updateLocalProfile({ goals: updatedGoals });
      try {
        await setDoc(doc(db, "users", profile.uid), { goals: updatedGoals }, { merge: true });
      } catch (e) {
        console.error("Goal save failed:", e);
      }
    },
    [profile?.uid, goals, updateLocalProfile]
  );

  // ── XP: count goals completed today ──
  const todayXP = useMemo(() => {
    if (!log) return profile?.xp ?? 0;
    let earned = 0;
    Object.entries(log.trackers).forEach(([key, val]) => {
      const g = goals[key] ?? 0;
      if (g > 0 && val >= g) earned += XP_PER_GOAL;
    });
    return earned;
  }, [log, goals, profile?.xp]);

  // ── Overall progress for SmartMessage ──
  const overallProgress = useMemo(() => {
    const trackers = log?.trackers ?? {};
    const keys = Object.keys(goals).filter(
      (k) => k !== "partnerAnnoyance" && goals[k] > 0
    );
    if (keys.length === 0) return 0;
    const sum = keys.reduce((acc, k) => {
      const val = trackers[k] ?? 0;
      return acc + Math.min(100, (val / goals[k]) * 100);
    }, 0);
    return Math.round(sum / keys.length);
  }, [log, goals]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold">Setting up your profile…</p>
        </div>
      </div>
    );
  }

  const currentLog = activeTab === "me" ? log : (partnerLog ?? { date: "", trackers: {} });
  const currentProfile = activeTab === "me" ? profile : partnerProfile;
  const currentGoals = activeTab === "me" ? goals : { ...DEFAULT_GOALS, ...(partnerProfile?.goals ?? {}) };
  const isLoading = activeTab === "me" ? logLoading : partnerLoading;

  const order = currentProfile?.trackerOrder ?? [];
  const enabled = new Set(currentProfile?.enabledTrackers ?? []);
  const displayTrackers = order.filter(
    (k) => k === "partnerAnnoyance" || enabled.has(k)
  );
  if (!displayTrackers.includes("partnerAnnoyance")) displayTrackers.push("partnerAnnoyance");

  return (
    <div className="min-h-screen bg-background pb-24">
      <AlertBanner alerts={alerts} onDismiss={markAsRead} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {profile.name[0]}
              </div>
            )}
            <div>
              <h1 className="font-black text-lg leading-tight text-foreground">
                🧁 {profile.name.split(" ")[0]}
              </h1>
              {profile.partnerId && partnerProfile && (
                <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-primary" />
                  Synced with {partnerProfile.name.split(" ")[0]}
                </p>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex gap-1.5">
            <button
              onClick={toggleDark}
              className="p-2.5 bg-card rounded-full shadow-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-card rounded-full shadow-sm border border-border/50 text-foreground hover:bg-secondary/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={signOut}
              className="p-2.5 bg-card rounded-full shadow-sm border border-border/50 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Partner tabs */}
        {profile.partnerId && partnerProfile && (
          <div className="flex px-4 pb-3 gap-2">
            <button
              onClick={() => setActiveTab("me")}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === "me"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-secondary/30 text-secondary-foreground hover:bg-secondary/50"
              }`}
            >
              My Day
            </button>
            <button
              onClick={() => setActiveTab("partner")}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === "partner"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {partnerProfile.name.split(" ")[0]}'s Day
            </button>
          </div>
        )}
      </header>

      <main className="px-4 pt-5 max-w-lg mx-auto">
        <DashboardStats
          caloriesIntake={currentLog?.trackers?.caloriesIntake ?? 0}
          caloriesBurned={currentLog?.trackers?.caloriesBurned ?? 0}
          workHours={currentLog?.trackers?.work ?? 0}
          learningHours={currentLog?.trackers?.skillLearning ?? 0}
          streak={currentProfile?.currentStreak ?? 0}
          xp={todayXP}
        />

        {/* Smart message + quote — only on "My Day" */}
        {activeTab === "me" && (
          <>
            <SmartMessage overallProgress={overallProgress} />
            <QuoteCard />
          </>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence>
              {displayTrackers.map((key) => (
                <TrackerCard
                  key={key}
                  trackerKey={key}
                  value={currentLog?.trackers?.[key] ?? 0}
                  goal={currentGoals[key] ?? 0}
                  onChange={(val) => updateTracker(key, val, profile.name)}
                  onGoalChange={
                    activeTab === "me" ? (g) => handleGoalChange(key, g) : undefined
                  }
                  customName={currentProfile?.customTrackerName || profile.customTrackerName}
                  readOnly={activeTab === "partner"}
                />
              ))}
            </AnimatePresence>

            {displayTrackers.length === 0 && (
              <div className="text-center py-12">
                <img
                  src={`${import.meta.env.BASE_URL}images/empty-state.png`}
                  alt="Empty"
                  className="w-40 mx-auto mb-4 mix-blend-multiply opacity-80"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <p className="text-muted-foreground font-semibold">
                  No trackers enabled.
                  <br />
                  Check your settings!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            profile={profile}
            onClose={() => setShowSettings(false)}
            onProfileUpdate={updateLocalProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
