import React, { useState, useEffect } from "react";
import { getT } from "../i18n.js";

const BOARD_KEY = "haven_board_v1";

export default function FamilyBoard({ family, activeMember, onBack }) {
  const t = getT(family?.language || "en");
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BOARD_KEY);
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (next) => {
    setNotes(next);
    localStorage.setItem(BOARD_KEY, JSON.stringify(next));
  };

  const addNote = () => {
    if (!input.trim()) return;
    const note = {
      id: Date.now().toString(),
      text: input.trim(),
      author: activeMember?.name || "Family",
      authorColor: activeMember?.color || "var(--primary)",
      authorEmoji: activeMember?.emoji || "🏡",
      createdAt: new Date().toISOString(),
    };
    save([note, ...notes]);
    setInput("");
    setAdding(false);
  };

  const removeNote = (id) => save(notes.filter(n => n.id !== id));

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(family?.language === "it" ? "it-IT" : "en-GB", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="header-title">📋 {t("familyBoard")}</span>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            + {t("boardAdd")}
          </button>
        </div>
      </div>

      {/* Add note modal */}
      {adding && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div className="card" style={{ width: "100%", borderRadius: "20px 20px 0 0", padding: "24px 20px", animation: "fadeUp .2s ease" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", marginBottom: 14 }}>
              {activeMember?.emoji || "📝"} {t("boardAdd")}
            </h3>
            <textarea
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t("notePlaceholder")}
              rows={3}
              style={{ resize: "none", marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setAdding(false); setInput(""); }}>{t("cancel")}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={addNote} disabled={!input.trim()}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}

      <div className="content" style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 560, margin: "0 auto" }}>
        {notes.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "40px 24px", color: "var(--muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
            <p>{t("boardEmpty")}</p>
          </div>
        )}
        {notes.map(n => (
          <div key={n.id} className="card fade-up" style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>{n.authorEmoji}</span>
              <span style={{ fontWeight: 700, color: n.authorColor, fontSize: ".9rem" }}>{n.author}</span>
              <span style={{ color: "var(--muted)", fontSize: ".78rem", marginLeft: "auto" }}>{formatDate(n.createdAt)}</span>
            </div>
            <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n.text}</p>
            <button
              onClick={() => removeNote(n.id)}
              style={{
                position: "absolute", top: 12, right: 12,
                background: "none", border: "none", cursor: "pointer",
                color: "var(--border)", fontSize: "1rem",
              }}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
