import React, { useState, useEffect } from "react";
import { getLastActivity, trackInactivityPrompt } from "../metrics.js";

const INACTIVITY_DAYS = 7;

// Shows a gentle nudge if no activity recorded for a role in INACTIVITY_DAYS days.
// Dismissable per session. Does not block usage.
export default function InactivityPrompt({ role, lang = "en", context = "senplan" }) {
  const [show, setShow] = useState(false);
  const it = lang === "it";

  useEffect(() => {
    const last = getLastActivity(role);
    if (!last) return; // never used — don't prompt
    const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince >= INACTIVITY_DAYS) {
      setShow(true);
      trackInactivityPrompt(role);
    }
  }, [role]);

  if (!show) return null;

  const messages = {
    teacher: {
      en: `It's been over ${INACTIVITY_DAYS} days since your last observation. Regular entries help track progress and support the student effectively.`,
      it: `Sono passati più di ${INACTIVITY_DAYS} giorni dall'ultima osservazione. Le osservazioni regolari aiutano a monitorare i progressi.`,
    },
    parent: {
      en: `It's been over ${INACTIVITY_DAYS} days since your last update. A quick note from home helps the teacher understand what's working.`,
      it: `Sono passati più di ${INACTIVITY_DAYS} giorni dall'ultimo aggiornamento. Una breve nota da casa aiuta l'insegnante a capire cosa funziona.`,
    },
    default: {
      en: `It's been a while since your last activity. Check in when you can.`,
      it: `È passato un po' di tempo dall'ultima attività. Aggiorna quando puoi.`,
    },
  };

  const msg = (messages[role] || messages.default)[it ? "it" : "en"];

  return (
    <div style={{
      background: "#FEF3C7",
      border: "1.5px solid #F59E0B",
      borderRadius: "var(--radius-sm)",
      padding: "12px 16px",
      marginBottom: 16,
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
    }}>
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>⏰</span>
      <p style={{ fontSize: ".85rem", color: "#92400E", lineHeight: 1.6, flex: 1 }}>{msg}</p>
      <button
        onClick={() => setShow(false)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#92400E", fontSize: "1rem", flexShrink: 0 }}
      >✕</button>
    </div>
  );
}
