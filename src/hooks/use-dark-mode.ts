import { useEffect, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useDarkMode(
  uid: string | undefined,
  darkMode: boolean,
  setDarkMode: (v: boolean) => void
) {
  // Apply class to <html> whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggle = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    if (uid) {
      setDoc(doc(db, "users", uid), { darkMode: next }, { merge: true }).catch(
        (e) => console.error("Dark mode save failed:", e)
      );
    }
  }, [uid, darkMode, setDarkMode]);

  return { toggle };
}
