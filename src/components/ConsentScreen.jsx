import React, { useState } from "react";
import PrivacyPolicy from "./PrivacyPolicy.jsx";

// GDPR-compliant consent screen.
// Must be shown BEFORE any data collection begins.
// Covers:
//   - Art. 6(1)(a): consent for AI chat processing
//   - Art. 9(2)(a): explicit consent for health-related data (SM)
//   - Art. 8: parental consent for children under 16
//   - Art. 13: transparency obligations (who processes, why, rights)

export default function ConsentScreen({ lang = "en", onAccept, onDecline }) {
  const [showPolicy, setShowPolicy] = useState(false);
  const [checks, setChecks] = useState({ understand: false, ai: false, parent: false });
  const it = lang === "it";

  const toggle = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  const canContinue = checks.understand && checks.ai;

  if (showPolicy) {
    return <PrivacyPolicy lang={lang} onBack={() => setShowPolicy(false)} />;
  }

  return (
    <div className="screen" style={{ background: "var(--bg)" }}>
      {/* Top accent bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg, var(--primary), var(--ms), var(--green))" }} />

      <div className="content" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 32 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2.8rem", marginBottom: 14 }}>🔐</div>
          <h1 style={{
            fontFamily: "var(--font-display)", color: "var(--primary)",
            fontSize: "1.5rem", fontWeight: 500, marginBottom: 10,
          }}>
            {it ? "Prima di iniziare" : "Before you begin"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.65, maxWidth: 380, margin: "0 auto" }}>
            {it
              ? "Haven tratta alcuni tuoi dati. Prenditi un momento per capire come."
              : "Haven processes some of your data. Please take a moment to understand how."}
          </p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <InfoCard
            emoji="📱"
            color="var(--green)"
            title={it ? "Dati locali — solo sul tuo dispositivo" : "Local data — your device only"}
            body={it
              ? "Nome, ruoli, PIN, note della bacheca e diari restano nel tuo browser. Non escono mai dal dispositivo."
              : "Names, roles, PINs, board notes and diaries stay in your browser. They never leave your device."}
          />
          <InfoCard
            emoji="🤖"
            color="var(--primary)"
            title={it ? "Chat AI — inviata ad Anthropic" : "AI chat — sent to Anthropic"}
            body={it
              ? "I messaggi della chat vengono inviati ad Anthropic, Inc. (USA) per generare risposte. Anthropic tratta questi dati secondo la propria Privacy Policy."
              : "Chat messages are sent to Anthropic, Inc. (USA) to generate responses. Anthropic processes this data under their own Privacy Policy."}
          />
          <InfoCard
            emoji="👧"
            color="var(--ms)"
            title={it ? "Bambini e mutismo selettivo" : "Children & selective mutism"}
            body={it
              ? "Se un bambino usa la chat AI, è necessario il consenso del genitore o tutore. Il profilo SM abilita strumenti specializzati per il bambino."
              : "If a child uses the AI chat, a parent or guardian must give consent on their behalf. The SM profile enables specialised child tools."}
          />
          <InfoCard
            emoji="🗑️"
            color="var(--accent)"
            title={it ? "Diritto alla cancellazione" : "Right to erasure"}
            body={it
              ? "Puoi cancellare tutti i dati in qualsiasi momento da Impostazioni → Reimposta tutti i dati."
              : "You can delete all data at any time from Settings → Reset all data."}
          />
        </div>

        {/* Consent checkboxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>

          <ConsentCheck
            id="understand"
            checked={checks.understand}
            onChange={() => toggle("understand")}
            label={it
              ? "Ho letto e capito come Haven tratta i miei dati, incluso l'invio dei messaggi chat ad Anthropic (USA)."
              : "I have read and understood how Haven processes my data, including sending chat messages to Anthropic (USA)."}
          />

          <ConsentCheck
            id="ai"
            checked={checks.ai}
            onChange={() => toggle("ai")}
            label={it
              ? "Acconsento esplicitamente al trattamento dei messaggi chat da parte di Anthropic per generare risposte AI (GDPR Art. 6(1)(a) e Art. 9(2)(a))."
              : "I explicitly consent to my chat messages being processed by Anthropic to generate AI responses (GDPR Art. 6(1)(a) and Art. 9(2)(a))."}
            highlight
          />

          <ConsentCheck
            id="parent"
            checked={checks.parent}
            onChange={() => toggle("parent")}
            label={it
              ? "Se aggiungo un profilo per un bambino, confermo di essere il genitore o tutore e fornisco il consenso per suo conto (GDPR Art. 8)."
              : "If I add a profile for a child, I confirm I am their parent or guardian and give consent on their behalf (GDPR Art. 8)."}
            optional
          />
        </div>

        {/* Policy link */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            onClick={() => setShowPolicy(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--primary)", fontSize: ".88rem",
              textDecoration: "underline", fontFamily: "var(--font-body)",
            }}
          >
            📄 {it ? "Leggi l'Informativa sulla Privacy completa" : "Read the full Privacy Policy"}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
          <button
            className="btn btn-primary"
            onClick={onAccept}
            disabled={!canContinue}
            style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: canContinue ? 1 : 0.45 }}
          >
            {it ? "Accetto — Configura Haven →" : "I agree — Set up Haven →"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onDecline}
            style={{ width: "100%", fontSize: ".9rem" }}
          >
            {it ? "Non accetto — Esci" : "I decline — Exit"}
          </button>
        </div>

        {/* GDPR notice footer */}
        <p style={{
          textAlign: "center", color: "var(--muted)", fontSize: ".75rem",
          lineHeight: 1.6, marginBottom: 32,
        }}>
          {it
            ? "Haven non utilizza cookie di tracciamento, analytics o pubblicità. Puoi revocare il consenso in qualsiasi momento dalle Impostazioni."
            : "Haven uses no tracking cookies, analytics, or advertising. You can withdraw consent at any time from Settings."}
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────── */

function InfoCard({ emoji, color, title, body }) {
  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 16px",
      borderRadius: "var(--radius-sm)", background: "var(--surface)",
      border: `1px solid ${color}33`, alignItems: "flex-start",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: color + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.2rem", flexShrink: 0,
      }}>{emoji}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: ".88rem", color, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: ".82rem", color: "var(--text)", lineHeight: 1.55 }}>{body}</div>
      </div>
    </div>
  );
}

function ConsentCheck({ id, checked, onChange, label, highlight, optional }) {
  return (
    <div
      onClick={onChange}
      style={{
        display: "flex", gap: 14, padding: "14px 16px",
        borderRadius: "var(--radius-sm)", cursor: "pointer",
        border: `2px solid ${checked ? (highlight ? "var(--primary)" : "var(--green)") : "var(--border)"}`,
        background: checked ? (highlight ? "var(--primary)" : "var(--green)") + "0E" : "var(--surface)",
        transition: "all .15s", alignItems: "flex-start",
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? (highlight ? "var(--primary)" : "var(--green)") : "var(--border)"}`,
        background: checked ? (highlight ? "var(--primary)" : "var(--green)") : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: ".8rem", fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: ".88rem", lineHeight: 1.6, color: "var(--text)" }}>
          {label}
        </p>
        {optional && (
          <span style={{
            fontSize: ".72rem", color: "var(--muted)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: ".04em",
          }}>
            Optional
          </span>
        )}
      </div>
    </div>
  );
}
