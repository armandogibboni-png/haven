import React, { useState } from "react";
import { getT } from "../i18n.js";
import { trackEmotionCheckin, touchLastActivity } from "../metrics.js";

const EMOTIONS = [
  { id: "happy",   emoji: "😊", en: "Happy",     it: "Felice" },
  { id: "calm",    emoji: "😌", en: "Calm",      it: "Calmo/a" },
  { id: "nervous", emoji: "😟", en: "Nervous",   it: "Nervoso/a" },
  { id: "scared",  emoji: "😨", en: "Scared",    it: "Spaventato/a" },
  { id: "angry",   emoji: "😠", en: "Angry",     it: "Arrabbiato/a" },
  { id: "sad",     emoji: "😢", en: "Sad",       it: "Triste" },
  { id: "tired",   emoji: "😴", en: "Tired",     it: "Stanco/a" },
  { id: "excited", emoji: "🤩", en: "Excited",   it: "Eccitato/a" },
];

const BODY_ZONES = [
  { id: "head",    en: "Head",    it: "Testa" },
  { id: "chest",   en: "Chest",   it: "Petto" },
  { id: "stomach", en: "Tummy",   it: "Pancia" },
  { id: "hands",   en: "Hands",   it: "Mani" },
  { id: "legs",    en: "Legs",    it: "Gambe" },
  { id: "all",     en: "All over", it: "Dappertutto" },
];

const CHECKIN_KEY = "haven_checkins_v1";

export default function EmotionCheckin({ member, family, onBack }) {
  const lang = family?.language || "en";
  const it = lang === "it";
  const [step, setStep] = useState(0);
  const [emotion, setEmotion] = useState(null);
  const [body, setBody] = useState([]);
  const [level, setLevel] = useState(5);
  const [saved, setSaved] = useState(false);

  const toggleBody = (id) => setBody(prev =>
    prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
  );

  const saveCheckin = () => {
    const entry = {
      id: Date.now().toString(),
      memberId: member.id,
      memberName: member.name,
      emotion, body, level,
      timestamp: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]");
      localStorage.setItem(CHECKIN_KEY, JSON.stringify([entry, ...existing].slice(0, 200)));
    } catch {}
    trackEmotionCheckin();
    touchLastActivity(member.role);
    setSaved(true);
  };

  const thermometerColor = level <= 3 ? "#6A9E7B" : level <= 6 ? "#E8A838" : "#E57373";

  if (saved) return (
    <div className="screen" style={{ justifyContent: "center", alignItems: "center", gap: 20, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: "3rem", animation: "pulse 1.5s infinite" }}>🌟</div>
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", fontSize: "1.5rem" }}>
        {it ? "Grazie!" : "Thank you!"}
      </h2>
      <p style={{ color: "var(--muted)", fontSize: ".95rem", maxWidth: 280 }}>
        {it
          ? `Bravissimo/a ${member.name} — hai condiviso come ti senti. Questo conta moltissimo.`
          : `Well done ${member.name} — you shared how you're feeling. That matters a lot.`}
      </p>
      <button className="btn btn-primary" onClick={onBack}>
        {it ? "← Torna" : "← Back"}
      </button>
    </div>
  );

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={step === 0 ? onBack : () => setStep(s => s - 1)}>←</button>
        <span className="header-title">{it ? "Come mi sento" : "How do I feel"}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: step >= i ? (member.color || "var(--primary)") : "var(--border)",
            }} />
          ))}
        </div>
      </div>

      <div className="content" style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Step 0: Emotion */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", marginBottom: 20, fontSize: "1.3rem" }}>
              {it ? `Ciao ${member.name}! Come ti senti adesso?` : `Hi ${member.name}! How are you feeling right now?`}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {EMOTIONS.map(em => (
                <button
                  key={em.id}
                  onClick={() => { setEmotion(em.id); setStep(1); }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "14px 8px", borderRadius: 14,
                    border: `2px solid ${emotion === em.id ? (member.color || "var(--primary)") : "var(--border)"}`,
                    background: emotion === em.id ? (member.color || "var(--primary)") + "11" : "var(--surface)",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{em.emoji}</span>
                  <span style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text)" }}>
                    {it ? em.it : em.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Body + level */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", marginBottom: 6, fontSize: "1.2rem" }}>
              {it ? "Dove lo senti nel corpo?" : "Where do you feel it in your body?"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 16 }}>
              {it ? "(puoi scegliere più di uno)" : "(you can pick more than one)"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
              {BODY_ZONES.map(z => (
                <button
                  key={z.id}
                  onClick={() => toggleBody(z.id)}
                  className="btn btn-sm"
                  style={{
                    background: body.includes(z.id) ? (member.color || "var(--primary)") : "var(--surface2)",
                    color: body.includes(z.id) ? "#fff" : "var(--text)",
                    border: `1.5px solid ${body.includes(z.id) ? (member.color || "var(--primary)") : "var(--border)"}`,
                  }}
                >{it ? z.it : z.en}</button>
              ))}
            </div>

            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: ".95rem" }}>
              {it ? "Quanto è forte questa sensazione?" : "How strong is this feeling?"}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <div style={{
                flex: 1, height: 12, borderRadius: 20,
                background: "var(--surface2)", position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${level * 10}%`,
                  background: thermometerColor,
                  borderRadius: 20, transition: "width .2s, background .2s",
                }} />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: thermometerColor, fontWeight: 600, minWidth: 28 }}>
                {level}
              </span>
            </div>
            <input
              type="range" min={1} max={10} value={level}
              onChange={e => setLevel(Number(e.target.value))}
              style={{ width: "100%", accentColor: thermometerColor, marginBottom: 28 }}
            />
            <p style={{ color: "var(--muted)", textAlign: "center", fontSize: ".85rem", marginBottom: 20 }}>
              {level <= 3
                ? (it ? "😌 Mi sento tranquillo/a" : "😌 Feeling calm")
                : level <= 6
                  ? (it ? "😟 Un po' difficile" : "😟 A little tough")
                  : (it ? "😨 Molto difficile" : "😨 Very tough right now")}
            </p>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setStep(2)}>
              {it ? "Avanti →" : "Next →"}
            </button>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", marginBottom: 20, fontSize: "1.3rem" }}>
              {it ? "Riepilogo" : "Summary"}
            </h2>
            <div className="card" style={{ marginBottom: 20, textAlign: "left" }}>
              <Row label={it ? "Emozione" : "Feeling"} value={EMOTIONS.find(e => e.id === emotion)?.emoji + " " + (it ? EMOTIONS.find(e => e.id === emotion)?.it : EMOTIONS.find(e => e.id === emotion)?.en)} />
              {body.length > 0 && <Row label={it ? "Dove" : "Where"} value={body.map(b => it ? BODY_ZONES.find(z => z.id === b)?.it : BODY_ZONES.find(z => z.id === b)?.en).join(", ")} />}
              <Row label={it ? "Intensità" : "Intensity"} value={`${level}/10`} color={thermometerColor} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={saveCheckin}>
              {it ? "Salva ✓" : "Save ✓"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--muted)", fontSize: ".88rem" }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || "var(--text)" }}>{value}</span>
    </div>
  );
}
