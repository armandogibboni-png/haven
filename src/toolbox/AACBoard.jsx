import React, { useState, useCallback } from "react";
import { getT } from "../i18n.js";

const CATEGORIES = {
  en: [
    { id: "needs", label: "Needs", emoji: "🏠", color: "#C4785A",
      phrases: ["I need water","I need to go to the bathroom","I'm hungry","I'm cold","I'm hot","I need help","I need a break","I feel sick"] },
    { id: "feelings", label: "Feelings", emoji: "💭", color: "#9B7BB8",
      phrases: ["I'm happy","I'm nervous","I'm scared","I'm angry","I'm tired","I feel ok","I'm excited","I need a hug"] },
    { id: "school", label: "School", emoji: "📚", color: "#3D6B7D",
      phrases: ["I understand","I don't understand","Can you repeat?","I need more time","I know the answer","I'd like to go out","I finished","I need to ask something"] },
    { id: "yesno", label: "Yes / No", emoji: "✅", color: "#6A9E7B",
      phrases: ["Yes","No","Maybe","I don't know","Ok","Not ok","Please","Thank you"] },
    { id: "home", label: "Home", emoji: "🏡", color: "#E8A838",
      phrases: ["I'm home","I had a good day","I had a hard day","I want to play","I want to rest","Can we talk later?","I need quiet time","I love you"] },
  ],
  it: [
    { id: "needs", label: "Bisogni", emoji: "🏠", color: "#C4785A",
      phrases: ["Ho sete","Devo andare in bagno","Ho fame","Ho freddo","Ho caldo","Ho bisogno di aiuto","Ho bisogno di una pausa","Mi sento male"] },
    { id: "feelings", label: "Emozioni", emoji: "💭", color: "#9B7BB8",
      phrases: ["Sono felice","Sono nervoso/a","Ho paura","Sono arrabbiato/a","Sono stanco/a","Sto bene","Sono emozionato/a","Ho bisogno di un abbraccio"] },
    { id: "school", label: "Scuola", emoji: "📚", color: "#3D6B7D",
      phrases: ["Ho capito","Non ho capito","Puoi ripetere?","Ho bisogno di più tempo","So la risposta","Vorrei uscire","Ho finito","Devo fare una domanda"] },
    { id: "yesno", label: "Sì / No", emoji: "✅", color: "#6A9E7B",
      phrases: ["Sì","No","Forse","Non lo so","Va bene","Non va bene","Per favore","Grazie"] },
    { id: "home", label: "Casa", emoji: "🏡", color: "#E8A838",
      phrases: ["Sono a casa","Ho avuto una bella giornata","È stata una giornata difficile","Voglio giocare","Voglio riposare","Possiamo parlare dopo?","Ho bisogno di silenzio","Ti voglio bene"] },
  ],
};

function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "it" ? "it-IT" : "en-GB";
  utter.rate = 0.9;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

export default function AACBoard({ member, family, onBack }) {
  const lang = family?.language || "en";
  const t = getT(lang);
  const cats = CATEGORIES[lang] || CATEGORIES.en;
  const [activeCat, setActiveCat] = useState(cats[0].id);
  const [sentence, setSentence] = useState([]);
  const [speaking, setSpeaking] = useState(false);

  const category = cats.find(c => c.id === activeCat) || cats[0];

  const addPhrase = useCallback((phrase) => {
    speak(phrase, lang);
    setSentence(prev => [...prev, phrase]);
  }, [lang]);

  const speakSentence = () => {
    if (!sentence.length) return;
    setSpeaking(true);
    speak(sentence.join(". "), lang);
    setTimeout(() => setSpeaking(false), sentence.length * 1500);
  };

  const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="header-title">🔊 {t("aacBoard")}</span>
        {!hasTTS && (
          <span style={{ marginLeft: "auto", fontSize: ".75rem", color: "var(--accent)", fontWeight: 600 }}>
            TTS unavailable
          </span>
        )}
      </div>

      {/* Sentence builder */}
      <div style={{
        padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)",
        minHeight: 60, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        {sentence.length === 0 ? (
          <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>
            {lang === "it" ? "Tocca una frase per iniziare…" : "Tap a phrase to start…"}
          </span>
        ) : (
          <>
            {sentence.map((p, i) => (
              <span key={i} style={{
                background: (member.color || "var(--primary)") + "22",
                color: member.color || "var(--primary)",
                padding: "4px 10px", borderRadius: 20, fontSize: ".85rem", fontWeight: 600,
              }}>{p}</span>
            ))}
          </>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {sentence.length > 0 && (
            <>
              <button
                className="btn btn-sm"
                style={{ background: speaking ? "#6A9E7B" : "var(--primary)", color: "#fff", border: "none" }}
                onClick={speakSentence}
              >
                {speaking ? "🔊…" : "▶ Speak"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSentence([])}>✕</button>
            </>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 0,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        scrollbarWidth: "none",
      }}>
        {cats.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "10px 16px", border: "none", cursor: "pointer",
              background: activeCat === cat.id ? cat.color + "22" : "transparent",
              borderBottom: activeCat === cat.id ? `2px solid ${cat.color}` : "2px solid transparent",
              flexShrink: 0, transition: "all .15s",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{cat.emoji}</span>
            <span style={{ fontSize: ".7rem", fontWeight: 600, color: activeCat === cat.id ? cat.color : "var(--muted)" }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Phrases grid */}
      <div className="content" style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {category.phrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => addPhrase(phrase)}
              style={{
                padding: "16px 14px", borderRadius: 14,
                border: `1.5px solid ${category.color}44`,
                background: category.color + "11",
                cursor: "pointer", textAlign: "center",
                fontSize: ".9rem", fontWeight: 600,
                color: "var(--text)", lineHeight: 1.4,
                transition: "all .1s",
              }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(.97)"; e.currentTarget.style.background = category.color + "33"; }}
              onMouseUp={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = category.color + "11"; }}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
