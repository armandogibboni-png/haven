import React, { useState } from "react";
import { getT } from "../i18n.js";
import { buildFriendCard } from "../prompts.js";

const MODEL = "claude-sonnet-4-20250514";

export default function FriendsRelatives({ family, onBack }) {
  const t = getT(family?.language || "en");
  const msMembers = family.members.filter(m => m.msFlag);
  const [cards, setCards] = useState({}); // { memberId: { text, loading, error } }
  const [selected, setSelected] = useState(msMembers[0]?.id || null);

  const generateCard = async (member) => {
    setCards(prev => ({ ...prev, [member.id]: { loading: true, text: null, error: null } }));
    try {
      const prompt = buildFriendCard(member, family);
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || data.error);
      const text = data.content?.[0]?.text || "";
      setCards(prev => ({ ...prev, [member.id]: { loading: false, text, error: null } }));
    } catch (e) {
      setCards(prev => ({ ...prev, [member.id]: { loading: false, text: null, error: e.message } }));
    }
  };

  const copyCard = (text) => navigator.clipboard?.writeText(text);

  const lang = family?.language || "en";
  const it = lang === "it";

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="header-title">🤝 {t("friendsRelatives")}</span>
      </div>

      <div className="content" style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Intro */}
        <div className="card" style={{ background: "linear-gradient(135deg, #3D6B7D11, #9B7BB811)", borderColor: "var(--primary)", marginBottom: 20 }}>
          <p style={{ fontSize: ".9rem", lineHeight: 1.6, color: "var(--text)" }}>
            {it
              ? "Questa sezione ti aiuta a creare una breve guida da condividere con amici e parenti, in modo che possano interagire nel modo giusto con il tuo bambino."
              : "This section helps you create a short guide to share with friends and relatives, so they know how to interact comfortably with your child."}
          </p>
        </div>

        {/* Member selector (if multiple MS members) */}
        {msMembers.length > 1 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {msMembers.map(m => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className="btn btn-sm"
                style={{
                  background: selected === m.id ? m.color || "var(--primary)" : "var(--surface2)",
                  color: selected === m.id ? "#fff" : "var(--text)",
                  border: `1.5px solid ${selected === m.id ? m.color || "var(--primary)" : "var(--border)"}`,
                }}
              >
                {m.emoji} {m.name}
              </button>
            ))}
          </div>
        )}

        {msMembers.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "36px 24px", color: "var(--muted)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔷</div>
            <p style={{ fontSize: ".9rem" }}>
              {it
                ? "Nessun membro con flag MS. Aggiungi un membro con il flag Mutismo Selettivo per generare le card."
                : "No members with the SM flag. Add a member with the Selective Mutism flag to generate cards."}
            </p>
          </div>
        )}

        {/* Card for selected MS member */}
        {selected && msMembers.map(m => m.id === selected && (
          <div key={m.id}>
            {/* Static SM tips always shown */}
            <SMTipsCard t={t} member={m} lang={lang} />

            {/* AI card */}
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", marginBottom: 12, fontSize: "1.1rem" }}>
                {it ? `Card personalizzata per ${m.name}` : `Personalised card for ${m.name}`}
              </h3>

              {!cards[m.id] && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "var(--muted)", fontSize: ".9rem", marginBottom: 16 }}>
                    {it
                      ? `Genera una card personalizzata che puoi stampare o condividere con chi interagisce con ${m.name}.`
                      : `Generate a personalised card you can print or share with anyone who interacts with ${m.name}.`}
                  </p>
                  <button className="btn btn-primary" onClick={() => generateCard(m)}>
                    ✨ {it ? "Genera card" : "Generate card"}
                  </button>
                </div>
              )}

              {cards[m.id]?.loading && (
                <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: 20 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />
                  ))}
                </div>
              )}

              {cards[m.id]?.error && (
                <div style={{ background: "#FEE2E2", padding: "12px 16px", borderRadius: "var(--radius-sm)", color: "#B91C1C", fontSize: ".85rem" }}>
                  ⚠️ {cards[m.id].error}
                </div>
              )}

              {cards[m.id]?.text && (
                <div className="card" style={{ background: "var(--surface)", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: "1.8rem" }}>{m.emoji}</span>
                    <span className="ms-badge">🔷 SM</span>
                  </div>
                  <p style={{ lineHeight: 1.7, fontSize: ".95rem", whiteSpace: "pre-wrap" }}>
                    {cards[m.id].text}
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => copyCard(cards[m.id].text)}>
                      📋 {it ? "Copia" : "Copy"}
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => window.print()}>
                      🖨️ {it ? "Stampa" : "Print"}
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => generateCard(m)}>
                      🔄 {it ? "Rigenera" : "Regenerate"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SMTipsCard({ t, member, lang }) {
  const it = lang === "it";
  const tips = it ? [
    "Sii paziente — non finire le sue frasi",
    "Accetta risposte non verbali (cenni, indicare, scrivere)",
    "Non attirare l'attenzione sul silenzio",
    "Usa il discorso indiretto (parla con qualcun altro nelle vicinanze)",
    "Celebra ogni tentativo di comunicazione, anche piccolo",
  ] : [
    "Be patient — don't finish their sentences",
    "Accept non-verbal responses (nods, pointing, writing)",
    "Don't draw attention to the silence",
    "Use indirect speech (talk to someone else nearby)",
    "Celebrate every communication attempt, however small",
  ];

  return (
    <div className="card" style={{ borderLeft: "4px solid var(--ms)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: "1.8rem" }}>{member.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{member.name}</div>
          <span className="ms-badge">🔷 Selective Mutism</span>
        </div>
      </div>
      <p style={{ fontSize: ".88rem", color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
        {it
          ? "Il mutismo selettivo è un disturbo d'ansia per cui una persona capace di parlare non riesce a farlo in certi contesti sociali. Non è timidezza, non è scelta."
          : "Selective mutism is an anxiety-based condition where a person who is fully capable of speech cannot speak in certain social situations. It's not shyness — it's anxiety."}
      </p>
      <h4 style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--primary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {it ? "Come aiutare" : "How to help"}
      </h4>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {tips.map((tip, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: ".9rem", lineHeight: 1.5 }}>
            <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
