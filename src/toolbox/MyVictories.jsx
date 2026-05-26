import React, { useState, useEffect } from "react";
import { getT } from "../i18n.js";

const VICTORIES_KEY = "haven_victories_v1";

const TAGS_EN = ["Spoke 🗣️","Waved 👋","Made eye contact 👀","Smiled 😊","Answered ✅","Played together 🤝","Tried something new 🌱","Felt calm 😌"];
const TAGS_IT = ["Ho parlato 🗣️","Ho salutato 👋","Contatto visivo 👀","Ho sorriso 😊","Ho risposto ✅","Giocato insieme 🤝","Ho provato qualcosa di nuovo 🌱","Mi sono sentito/a calmo/a 😌"];

export default function MyVictories({ member, family, onBack }) {
  const lang = family?.language || "en";
  const it = lang === "it";
  const t = getT(lang);
  const [victories, setVictories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [desc, setDesc] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = it ? TAGS_IT : TAGS_EN;

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(VICTORIES_KEY) || "[]");
      setVictories(all.filter(v => v.memberId === member.id));
    } catch {}
  }, [member.id]);

  const saveVictory = () => {
    if (!desc.trim() && selectedTags.length === 0) return;
    const entry = {
      id: Date.now().toString(),
      memberId: member.id,
      desc: desc.trim(),
      tags: selectedTags,
      timestamp: new Date().toISOString(),
    };
    try {
      const all = JSON.parse(localStorage.getItem(VICTORIES_KEY) || "[]");
      const next = [entry, ...all];
      localStorage.setItem(VICTORIES_KEY, JSON.stringify(next));
      setVictories(next.filter(v => v.memberId === member.id));
    } catch {}
    setDesc(""); setSelectedTags([]); setAdding(false);
  };

  const deleteVictory = (id) => {
    try {
      const all = JSON.parse(localStorage.getItem(VICTORIES_KEY) || "[]");
      const next = all.filter(v => v.id !== id);
      localStorage.setItem(VICTORIES_KEY, JSON.stringify(next));
      setVictories(next.filter(v => v.memberId === member.id));
    } catch {}
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString(it ? "it-IT" : "en-GB", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="header-title">🌟 {t("myVictories")}</span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setAdding(true)}>
          + {it ? "Aggiungi" : "Add"}
        </button>
      </div>

      {/* Add modal */}
      {adding && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div className="card" style={{ width: "100%", maxWidth: 520, borderRadius: "20px 20px 0 0", padding: "24px 20px", animation: "fadeUp .2s ease" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", marginBottom: 16 }}>
              🌟 {it ? "Aggiungi una vittoria" : "Add a victory"}
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label>{it ? "Descrivi cosa è successo" : "Describe what happened"}</label>
              <textarea
                autoFocus rows={2}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder={it ? "es. Oggi ho salutato la maestra…" : "e.g. Today I said hi to my teacher…"}
                style={{ resize: "none" }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label>{it ? "O scegli un tag" : "Or choose a tag"}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className="btn btn-sm"
                    style={{
                      background: selectedTags.includes(tag) ? (member.color || "var(--primary)") : "var(--surface2)",
                      color: selectedTags.includes(tag) ? "#fff" : "var(--text)",
                      border: `1.5px solid ${selectedTags.includes(tag) ? (member.color || "var(--primary)") : "var(--border)"}`,
                    }}
                  >{tag}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setAdding(false); setDesc(""); setSelectedTags([]); }}>{t("cancel")}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveVictory} disabled={!desc.trim() && selectedTags.length === 0}>
                🌟 {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="content" style={{ maxWidth: 480, margin: "0 auto" }}>
        {victories.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🌱</div>
            <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
              {it
                ? `Ogni piccolo passo conta, ${member.name}. Aggiungi la tua prima vittoria!`
                : `Every small step matters, ${member.name}. Add your first victory!`}
            </p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {victories.map(v => (
            <div key={v.id} className="card fade-up" style={{ borderLeft: `4px solid ${member.color || "var(--primary)"}`, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 600 }}>{formatDate(v.timestamp)}</span>
                <button onClick={() => deleteVictory(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--border)", fontSize: ".9rem" }}>✕</button>
              </div>
              {v.desc && <p style={{ marginTop: 8, lineHeight: 1.6, fontSize: ".95rem" }}>{v.desc}</p>}
              {v.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {v.tags.map(tag => (
                    <span key={tag} style={{
                      background: (member.color || "var(--primary)") + "22",
                      color: member.color || "var(--primary)",
                      padding: "2px 10px", borderRadius: 20, fontSize: ".78rem", fontWeight: 600,
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
