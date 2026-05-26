import React from "react";
import { getMetricsSummary, getFidelityScore } from "../metrics.js";

// Displays current week's observation counts vs fidelity threshold.
// Minimum threshold: >= 1 teacher obs AND >= 1 parent obs per week per student.
// Visual-only: green (met), amber (partial), red (not met this week).

const MIN_TEACHER = 1;
const MIN_PARENT  = 1;

export default function FidelityBadge({ lang = "en", compact = false }) {
  const it = lang === "it";
  const summary = getMetricsSummary();
  const { teacherObs, feedbackEntries } = summary.thisWeek;
  const fidelity = summary.fidelity;

  // For this week: teacher obs from SEN Plan role breakdown
  // We use teacherObs for teacher, and (feedbackEntries - teacherObs) for parent estimate
  const parentEst = Math.max(0, feedbackEntries - teacherObs);
  const teacherMet = teacherObs >= MIN_TEACHER;
  const parentMet  = parentEst >= MIN_PARENT;
  const bothMet    = teacherMet && parentMet;
  const neitherMet = !teacherMet && !parentMet;

  const color = bothMet ? "#6A9E7B" : neitherMet ? "#B91C1C" : "#E8A838";
  const bg    = bothMet ? "#D1FAE5" : neitherMet ? "#FEE2E2" : "#FEF3C7";

  if (compact) {
    return (
      <span style={{ fontSize: ".7rem", fontWeight: 700, background: bg, color, padding: "2px 8px", borderRadius: 20 }}>
        {bothMet ? "✓" : "~"} {it ? "Fedeltà" : "Fidelity"}
        {fidelity !== null ? ` ${fidelity}%` : ""}
      </span>
    );
  }

  return (
    <div style={{
      background: bg,
      border: `1.5px solid ${color}44`,
      borderRadius: "var(--radius-sm)",
      padding: "10px 14px",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: ".78rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".05em" }}>
          📊 {it ? "Fedeltà questa settimana" : "Fidelity this week"}
        </span>
        {fidelity !== null && (
          <span style={{ fontSize: ".78rem", fontWeight: 700, color }}>
            {it ? "Totale:" : "Overall:"} {fidelity}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <FidelityItem
          label={it ? "Insegnante" : "Teacher"}
          count={teacherObs}
          min={MIN_TEACHER}
          met={teacherMet}
          color={color}
          it={it}
        />
        <FidelityItem
          label={it ? "Genitore" : "Parent"}
          count={parentEst}
          min={MIN_PARENT}
          met={parentMet}
          color={color}
          it={it}
        />
      </div>
      {!bothMet && (
        <p style={{ fontSize: ".75rem", color, marginTop: 8, lineHeight: 1.5 }}>
          {it
            ? `Soglia: ≥${MIN_TEACHER} osservazione insegnante + ≥${MIN_PARENT} genitore a settimana per studente.`
            : `Threshold: ≥${MIN_TEACHER} teacher observation + ≥${MIN_PARENT} parent entry per student per week.`}
        </p>
      )}
    </div>
  );
}

function FidelityItem({ label, count, min, met, color, it }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: ".9rem" }}>{met ? "✅" : "⬜"}</span>
      <div>
        <div style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text)" }}>{label}</div>
        <div style={{ fontSize: ".72rem", color: met ? "#065F46" : "#92400E" }}>
          {count}/{min} {it ? "questa sett." : "this week"}
        </div>
      </div>
    </div>
  );
}
