import { useState, useEffect, useCallback, useRef } from "react";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DailyLog } from "@/types";
import { format } from "date-fns";

const LOAD_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), ms)
    ),
  ]);
}

export function useTrackers(
  uid: string | undefined,
  partnerId: string | undefined | null,
  customTrackerName: string
) {
  const [log, setLog] = useState<DailyLog>({ date: format(new Date(), "yyyy-MM-dd"), trackers: {} });
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    async function fetchToday() {
      setLoading(true);
      try {
        const logRef = doc(db, `dailyLogs/${uid}`, today);
        const snap = await withTimeout(getDoc(logRef), LOAD_TIMEOUT_MS);

        if (snap.exists()) {
          const data = snap.data() as DailyLog;
          // Ensure trackers object is always present
          setLog({ date: today, trackers: data.trackers || {} });
        } else {
          const newLog: DailyLog = { date: today, trackers: {} };
          // Write in background — don't block UI
          setDoc(logRef, newLog).catch((e) =>
            console.error("Could not create daily log:", e)
          );
          setLog(newLog);
        }
      } catch (err) {
        console.error("Error fetching daily log (using empty fallback):", err);
        // Fallback: show empty log so UI renders
        setLog({ date: today, trackers: {} });
      } finally {
        setLoading(false);
      }
    }

    fetchToday();
  }, [uid, today]);

  const updateTracker = useCallback(
    (key: string, value: number, userName: string = "Someone") => {
      if (!uid) return;

      // Optimistic local update — instant, no waiting
      setLog((prev) => ({
        ...prev,
        trackers: { ...prev.trackers, [key]: value },
      }));

      // Partner Annoyance alert at 100
      if (key === "partnerAnnoyance" && value === 100) {
        const alertMsg = `${customTrackerName || "Someone"} needs your attention. Do something before it's too late.`;
        alert(alertMsg);
        if (partnerId) {
          addDoc(collection(db, "alerts"), {
            toUserId: partnerId,
            fromUserName: userName,
            message: `🚨 ${customTrackerName || userName} needs your attention. Fix this now.`,
            timestamp: serverTimestamp(),
            read: false,
          }).catch((e) => console.error("Alert write failed:", e));
        }
      }

      // Debounced Firestore write — 500ms
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const logRef = doc(db, `dailyLogs/${uid}`, today);
        setDoc(logRef, { date: today, trackers: { [key]: value } }, { merge: true }).catch(
          (e) => console.error("Tracker save failed:", e)
        );
      }, 500);
    },
    [uid, today, partnerId, customTrackerName]
  );

  return { log, loading, updateTracker };
}
