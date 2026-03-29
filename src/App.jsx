import { useState, useEffect } from "react";

export default function App() {
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toDateString());

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setNotes(saved);

    const lastDate = localStorage.getItem("date");
    if (lastDate !== date) {
      localStorage.setItem("date", date);
    }
  }, []);

  // Auto-save notes
  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  return (
    <div style={{ padding: 20 }}>
      <h1>💖 Cupcake App</h1>

      <h2>Daily Notes</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />

      <h2>Goals</h2>
      <button onClick={() => alert("Goal completed 🎉")}>
        Complete Goal
      </button>
    </div>
  );
}
