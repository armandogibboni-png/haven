import React, { useState, useEffect } from "react";
import { getT } from "../i18n.js";

// Bible v3, Section 4.4: Dependency prevention.
// Shown once every 5 chat sessions per profile.
// Dismissable. Never shown to child profiles.
// Never uses language like "I'm always here for you".

const NUDGE_KEY = "haven_nudge_v1";
const NUDGE_INTERVAL = 5; // every N sessions

function getNudgeData(memberId) {
  try {
    const all = JSON.parse(localStorage.getItem(NUDGE_KEY) || "{}");
    return all[memberId] || { sessions: 0, lastShown: null };
  } catch { return { sessions: 0, lastShown: null }; }
}

function setNudgeData(memberId, data) {
  try {
    const all = JSON.parse(localStorage.getItem(NUDGE_KEY) || "{}");
    all[memberId] = data;
    localStorage.setItem(NUDGE_KEY, JSON.stringify(all));
  } catch {}
}

export function incrementNudgeSession(memberId) {
  const d = getNudgeData(memberId);
  setNudgeData(memberId, { ...d, sessions: d.sessions + 1 });
}

const HIDE_ROLES = ["child","sna"];

export default function DependencyNudge({ member, lang = "en" }) {
  const [show, setShow] = useState(false);
  const t = getT(lang);

  useEffect(() => {
    if (HIDE_ROLES.includes(member?.role)) return;
    const d = getNudgeData(member?.id);
    // Show on sessions that are multiples of NUDGE_INTERVAL (but not 0)
    if (d.sessions > 0 && d.sessions % NUDGE_INTERVAL === 0 && d.lastShown !== d.sessions) {
      setShow(true);
    }
  }, [member?.id]);

  const dismiss = () => {
    const d = getNudgeData(member?.id);
    setNudgeData(member?.id, { ...d, lastShown: d.sessions });
    setShow(false);
  };

  if (!show || HIDE_ROLES.includes(member?.role)) return null;

  return (
    <div style={{
      margin: "8px 16px",
      padding: "12px 14px",
      background: "#FEF3C7",
      border: "1px solid #F59E0B55",
      borderRadius: "var(--radius-sm)",
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      animation: "fadeUp .2s ease",
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>💛</span>
      <p style={{ fontSize: ".82rem", color: "#92400E", lineHeight: 1.6, flex: 1 }}>
        {t("dependencyNudge")}
      </p>
      <button
        onClick={dismiss}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#92400E", fontSize: ".78rem", fontWeight: 600,
          flexShrink: 0, padding: "2px 6px",
          borderRadius: 6, background: "#FDE68A",
        }}
      >
        {t("dependencyNudgeBtn")}
      </button>
    </div>
  );
}
