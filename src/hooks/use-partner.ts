import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, DailyLog } from "@/types";
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

export function usePartner(partnerId: string | null | undefined) {
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [partnerLog, setPartnerLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) {
      setPartnerProfile(null);
      setPartnerLog(null);
      return;
    }

    async function fetchPartnerData() {
      setLoading(true);
      try {
        const userRef = doc(db, "users", partnerId!);
        const userSnap = await withTimeout(getDoc(userRef), LOAD_TIMEOUT_MS);
        if (userSnap.exists()) {
          setPartnerProfile(userSnap.data() as UserProfile);
        } else {
          setPartnerProfile(null);
        }

        const today = format(new Date(), "yyyy-MM-dd");
        const logRef = doc(db, `dailyLogs/${partnerId}`, today);
        const logSnap = await withTimeout(getDoc(logRef), LOAD_TIMEOUT_MS);
        setPartnerLog(
          logSnap.exists()
            ? (logSnap.data() as DailyLog)
            : { date: today, trackers: {} }
        );
      } catch (err) {
        console.error("Error fetching partner data:", err);
        setPartnerProfile(null);
        setPartnerLog({ date: format(new Date(), "yyyy-MM-dd"), trackers: {} });
      } finally {
        setLoading(false);
      }
    }

    fetchPartnerData();
  }, [partnerId]);

  const linkPartnerByEmail = async (currentUid: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("No user found with that email.");
        return false;
      }

      const targetUser = snap.docs[0].data() as UserProfile;
      if (targetUser.uid === currentUid) {
        setError("You cannot link yourself.");
        return false;
      }

      const batch = writeBatch(db);
      batch.set(doc(db, "users", currentUid), { partnerId: targetUser.uid }, { merge: true });
      batch.set(doc(db, "users", targetUser.uid), { partnerId: currentUid }, { merge: true });
      await batch.commit();

      return true;
    } catch (err) {
      console.error("Link partner failed:", err);
      setError("Failed to link partner. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bidirectional partner unlink.
   * Optimistically clears local state first, then writes to Firestore.
   * Handles edge cases: partner doc not found, network failure, null partnerId.
   */
  const unlinkPartner = async (currentUid: string, currentPartnerId: string) => {
    if (!currentPartnerId) return false;

    // Optimistic update — clear partner data instantly
    setPartnerProfile(null);
    setPartnerLog(null);
    setError(null);

    try {
      const batch = writeBatch(db);

      // Always clear current user
      batch.set(doc(db, "users", currentUid), { partnerId: null }, { merge: true });

      // Clear partner only if their doc still points back (safe check)
      try {
        const partnerSnap = await withTimeout(
          getDoc(doc(db, "users", currentPartnerId)),
          LOAD_TIMEOUT_MS
        );
        if (partnerSnap.exists()) {
          const partnerData = partnerSnap.data() as UserProfile;
          if (partnerData.partnerId === currentUid) {
            batch.set(
              doc(db, "users", currentPartnerId),
              { partnerId: null },
              { merge: true }
            );
          }
        }
      } catch (partnerFetchErr) {
        // Partner doc unreachable — still clear current user
        console.warn("Could not fetch partner doc, clearing only current user:", partnerFetchErr);
      }

      await batch.commit();
      return true;
    } catch (err) {
      console.error("Unlink partner failed:", err);
      setError("Failed to remove partner. Please try again.");
      return false;
    }
  };

  return { partnerProfile, partnerLog, loading, error, linkPartnerByEmail, unlinkPartner };
}
