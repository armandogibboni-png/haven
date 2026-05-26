import React, { useState } from "react";
import { getMetricsSummary, getFidelityScore } from "../metrics.js";
import { getT } from "../i18n.js";

// RE-AIM readiness dashboard — live status based on localStorage metrics.
// Shows current RE-AIM compliance status so the team can track readiness at any time.
// Accessible from Settings.

const CHECKS = (summary, lang) => {
  const it = lang === "it";
  const s = summary;
  return [
    {
      dim: "R",
      name: it ? "Reach" : "Reach",
      items: [
        { label: it ? "Popolazione target definita (SM + SEN)" : "Target population defined (SM + SEN)", done: true },
        { label: it ? "Accesso senza installazione (PWA)" : "No-install access (PWA)", done: true },
        { label: it ? "Supporto EN + IT" : "EN + IT language support", done: true },
        { label: it ? "Metriche engagement attive" : "Engagement metrics active", done: s.allTime.totalChatSessions > 0 || s.allTime.totalFeedback > 0 },
        { label: it ? "Almeno 1 sessione chat registrata" : "At least 1 chat session recorded", done: s.allTime.totalChatSessions > 0 },
      ]
    },
    {
      dim: "E",
      name: it ? "Effectiveness" : "Effectiveness",
      items: [
        { label: it ? "Contenuti basati su evidenze (SM Resource Manual, NCSE, NICE)" : "Evidence-based content (SM Resource Manual, NCSE, NICE)", done: true },
        { label: it ? "SMQ integrato nel SEN Plan" : "SMQ integrated in SEN Plan", done: true },
        { label: it ? "GAS scaffolding negli obiettivi" : "GAS scaffolding in goals", done: true },
        { label: it ? "Almeno 1 SMQ completato" : "At least 1 SMQ completed", done: s.allTime.smqCompleted > 0 },
        { label: it ? "Follow-up 3/6 mesi attivi" : "3/6-month follow-ups active", done: true },
        { label: it ? "Disclaimer AI in tutti i contesti clinici" : "AI disclaimer in all clinical contexts", done: true },
      ]
    },
    {
      dim: "A",
      name: it ? "Adoption" : "Adoption",
      items: [
        { label: it ? "Ruolo insegnante implementato (PIN obbligatorio)" : "Teacher role implemented (PIN required)", done: true },
        { label: it ? "Ruolo SNA implementato (sola lettura)" : "SNA role implemented (read-only)", done: true },
        { label: it ? "Consenso genitore in enrollment" : "Parent consent note in enrollment", done: true },
        { label: it ? "Pilot MOU disponibile in /docs" : "Pilot MOU available in /docs", done: true },
        { label: it ? "Teacher Quick-Start Guide disponibile" : "Teacher Quick-Start Guide available", done: true },
        { label: it ? "Accesso GDPR-compliant per insegnante" : "GDPR-compliant teacher access", done: true },
      ]
    },
    {
      dim: "I",
      name: it ? "Implementation" : "Implementation",
      items: [
        { label: it ? "Soglia fedeltà definita e visibile" : "Fidelity threshold defined and visible", done: true },
        { label: it ? "Prompt inattività 7 giorni" : "7-day inactivity prompt", done: true },
        { label: it ? "Tasto escalation crisi con contatti NCSE/CAMHS" : "Crisis escalation button with NCSE/CAMHS contacts", done: true },
        { label: it ? "Fedeltà corrente ≥ 80%" : "Current fidelity ≥ 80%", done: (s.fidelity ?? 0) >= 80 },
        { label: it ? "Almeno 1 obiettivo creato" : "At least 1 goal created", done: s.allTime.goalsCreated > 0 },
        { label: it ? "Almeno 1 osservazione di feedback" : "At least 1 feedback observation", done: s.allTime.totalFeedback > 0 },
      ]
    },
    {
      dim: "M",
      name: it ? "Maintenance" : "Maintenance",
      items: [
        { label: it ? "Archiviazione piano per anno scolastico" : "SEN Plan school year archiving", done: true },
        { label: it ? "Export dati disponibile" : "Data export available", done: true },
        { label: it ? "Check-in follow-up 3/6 mesi" : "3/6-month follow-up check-ins", done: true },
        { label: it ? "Almeno 1 obiettivo raggiunto" : "At least 1 goal achieved", done: s.allTime.goalsAchieved > 0 },
        { label: it ? "Almeno 1 revisione proposta" : "At least 1 revision proposed", done: s.allTime.revisionsProposed > 0 },
      ]
    },
  ];
};

export default function REAIMReadiness({ lang = "en", onBack }) {
  const it = lang === "it";
  const summary = getMetricsSummary();
  const checks = CHECKS(summary, lang);

  const totalItems = checks.reduce((n, d) => n + d.items.length, 0);
  const doneItems  = checks.reduce((n, d) => n + d.items.filter(i => i.done).length, 0);
  const pct = Math.round((doneItems / totalItems) * 100);

  const DIM_COLORS = { R: "#3D6B7D", E: "#6A9E7B", A: "#C4785A", I: "#1A4A5C", M: "#9B7BB8" };

  return (
    <div className="screen">
      <div className="header">
        {onBack && <button className="back-btn" onClick={onBack}>←</button>}
        <span className="header-title">📊 RE-AIM Readiness</span>
      </div>

      <div className="content" style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Overall score */}
        <div className="card" style={{ textAlign: "center", marginBottom: 24, background: `linear-gradient(135deg, ${pct >= 80 ? "#D1FAE5" : pct >= 60 ? "#FEF3C7" : "#FEE2E2"}, var(--surface))` }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: pct >= 80 ? "#065F46" : pct >= 60 ? "#92400E" : "#B91C1C" }}>
            {pct}%
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--primary)", marginBottom: 4 }}>
            {it ? "Preparazione RE-AIM complessiva" : "Overall RE-AIM Readiness"}
          </div>
          <div style={{ fontSize: ".8rem", color: "var(--muted)" }}>
            {doneItems}/{totalItems} {it ? "criteri soddisfatti" : "criteria met"}
          </div>
          {/* Progress bar */}
          <div style={{ height: 8, background: "var(--border)", borderRadius: 20, marginTop: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#6A9E7B" : pct >= 60 ? "#E8A838" : "#B91C1C", borderRadius: 20, transition: "width .3s" }} />
          </div>
        </div>

        {/* Per-dimension */}
        {checks.map(dim => {
          const dimDone = dim.items.filter(i => i.done).length;
          const dimPct  = Math.round((dimDone / dim.items.length) * 100);
          const col = DIM_COLORS[dim.dim];
          return (
            <div key={dim.dim} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${col}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "1.1rem", color: col }}>{dim.dim}</span>
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{dim.name}</span>
                </div>
                <span style={{ fontSize: ".8rem", fontWeight: 700, color: dimPct === 100 ? "#065F46" : dimPct >= 60 ? "#92400E" : "#B91C1C" }}>
                  {dimPct}%
                </span>
              </div>
              {dim.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: ".82rem", marginBottom: 5, alignItems: "flex-start" }}>
                  <span style={{ color: item.done ? "#6A9E7B" : "#B91C1C", flexShrink: 0, marginTop: 1 }}>
                    {item.done ? "✓" : "✗"}
                  </span>
                  <span style={{ color: item.done ? "var(--text)" : "var(--muted)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          );
        })}

        {/* Metrics summary */}
        <div className="card" style={{ marginBottom: 24, background: "var(--surface2)" }}>
          <p style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            📈 {it ? "Metriche aggregate (questa settimana)" : "Aggregate metrics (this week)"}
          </p>
          {[
            [it ? "Chat sessioni" : "Chat sessions", summary.thisWeek.chatSessions],
            [it ? "Osservazioni SEN" : "SEN observations", summary.thisWeek.feedbackEntries],
            [it ? "Check-in emotivi" : "Emotion check-ins", summary.thisWeek.emotionCheckins],
            [it ? "Vittorie registrate" : "Victories logged", summary.thisWeek.victories],
          ].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", marginBottom: 4 }}>
              <span>{label}</span>
              <span style={{ fontWeight: 700 }}>{val}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}>
              <span>{it ? "Fedeltà complessiva" : "Overall fidelity"}</span>
              <span style={{ fontWeight: 700, color: (summary.fidelity ?? 0) >= 80 ? "#6A9E7B" : "#E8A838" }}>
                {summary.fidelity !== null ? `${summary.fidelity}%` : "—"}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: ".72rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 32 }}>
          {it
            ? "I dati qui sopra si basano sull'attività locale (localStorage). Nessun dato viene inviato a server esterni. Il framework RE-AIM è basato su Glasgow et al. (1999)."
            : "Data above is based on local activity (localStorage). No data is sent to external servers. RE-AIM framework based on Glasgow et al. (1999)."}
        </p>
      </div>
    </div>
  );
}
