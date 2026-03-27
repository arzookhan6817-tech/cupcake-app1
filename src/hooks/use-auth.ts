import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserProfile, DEFAULT_TRACKERS, OPTIONAL_TRACKERS, DEFAULT_GOALS } from "@/types";
import { format, differenceInDays } from "date-fns";

const LOAD_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firebase timeout")), ms)
    ),
  ]);
}

function buildDefaultProfile(fbUser: User, today: string): UserProfile {
  return {
    uid: fbUser.uid,
    name: fbUser.displayName || "Sweetie",
    email: fbUser.email || "",
    photoURL: fbUser.photoURL || "",
    partnerId: null,
    trackerOrder: [...DEFAULT_TRACKERS, ...OPTIONAL_TRACKERS, "partnerAnnoyance"],
    enabledTrackers: [...DEFAULT_TRACKERS],
    customTrackerName: "Partner Annoyance",
    currentStreak: 1,
    lastActiveDate: today,
    goals: { ...DEFAULT_GOALS },
    xp: 0,
    darkMode: false,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);

      if (fbUser) {
        const today = format(new Date(), "yyyy-MM-dd");
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const snap = await withTimeout(getDoc(userRef), LOAD_TIMEOUT_MS);

          if (!snap.exists()) {
            const newProfile = buildDefaultProfile(fbUser, today);
            try {
              await setDoc(userRef, newProfile);
            } catch (e) {
              console.error("Could not persist new profile:", e);
            }
            setProfile(newProfile);
          } else {
            const data = snap.data() as UserProfile;

            // Backfill missing fields for existing users
            if (!data.goals) data.goals = { ...DEFAULT_GOALS };
            if (data.xp === undefined) data.xp = 0;
            if (data.darkMode === undefined) data.darkMode = false;
            if (!data.trackerOrder?.includes("partnerAnnoyance")) {
              data.trackerOrder = [...(data.trackerOrder ?? []), "partnerAnnoyance"];
            }

            // Apply dark mode class immediately
            if (data.darkMode) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }

            // Streak calculation
            let updatedStreak = data.currentStreak || 1;
            if (data.lastActiveDate) {
              try {
                const diff = differenceInDays(new Date(), new Date(data.lastActiveDate));
                if (diff === 1) updatedStreak += 1;
                else if (diff > 1) updatedStreak = 1;
              } catch {
                updatedStreak = 1;
              }
            }

            if (data.lastActiveDate !== today) {
              const update = {
                currentStreak: updatedStreak,
                lastActiveDate: today,
                // Backfill goals/xp if missing
                ...(data.goals ? {} : { goals: DEFAULT_GOALS }),
                ...(data.xp !== undefined ? {} : { xp: 0 }),
              };
              setDoc(userRef, update, { merge: true }).catch((e) =>
                console.error("Streak update failed:", e)
              );
              data.currentStreak = updatedStreak;
              data.lastActiveDate = today;
            }

            setProfile(data);
          }
        } catch (err) {
          console.error("Error loading profile (fallback):", err);
          setProfile(buildDefaultProfile(fbUser, format(new Date(), "yyyy-MM-dd")));
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Safety net: clear loading regardless after 8s
    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const signOut = () => {
    document.documentElement.classList.remove("dark");
    fbSignOut(auth);
  };

  const updateLocalProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...partial } : null));
  };

  return { user, profile, loading, signIn, signOut, updateLocalProfile };
}
