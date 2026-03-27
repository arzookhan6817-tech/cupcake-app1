import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Alert } from "@/types";

export function useAlerts(uid: string | undefined) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'alerts'), 
      where('toUserId', '==', uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const newAlerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert));
      // Sort by timestamp desc locally since we can't easily compound index without creation
      newAlerts.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      setAlerts(newAlerts);
    });

    return () => unsubscribe();
  }, [uid]);

  const markAsRead = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), { read: true });
    } catch (err) {
      console.error("Failed to mark alert read", err);
    }
  };

  return { alerts, markAsRead };
}
