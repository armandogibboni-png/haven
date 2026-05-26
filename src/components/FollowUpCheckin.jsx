import React, { useState } from "react";

const FOLLOWUP_KEY = "haven_followup_v1";

function loadFollowUps() {
  try { return JSON.parse(localStorage.getItem(FOLLOWUP_KEY) || "{}"); } catch { return {}; }
}
function saveFollowUps(data) {
  localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(data));
}

export function initFollowUp(childId) {
  const all = loadFollowUps();
  if (!all[childId]) {
    all[childId] = { startDate: new Date().toISOString(), checkins: {} };
    saveFollowUps(all);
  }
  return all[childId];
}

export function getFollowUpStatus(childId) {
  const all = loadFollowUps();
  const entry = all[childId];
  if (!entry) return null;

  const start = new Date(entry.startDate);
  const now   = new Date();
  const daysSinceStart = (now - start) / (1000 * 60 * 60 * 24);

  const milestones = [
    { key: "m3", days: 90,  label: "3-month" },
    { key: "m6", days: 180, label: "6-month" },
  ];

  return milestones.map(m => ({
    ...m,
    due: daysSinceStart >= m.days,
    dueDate: new Date(start.getTime() + m.days * 86400000).toISOString().slice(0,10),
    completed: !!entry.checkins?.[m.key],
    completedAt: entry.checkins?.[m.key]?.completedAt || null,
    smqScore: entry.checkins?.[m.key]?.smqScore ?? null,
    notes: entry.checkins?.[m.key]?.notes || "",
  }));
}

export function completeFollowUp(childId, milestoneKey, smqScore, notes) {
  const all = loadFollowUps();
  if (!all[childId]) all[childId] = { startDate: new Date().toISOString(), checkins: {} };
  all[childId].checkins[milestoneKey] = {
    completedAt: new Date().toISOString(),
    smqScore: smqScore ?? null,
    notes: notes || "",
  };
  saveFollowUps(all);
}

// ── UI Component ──────────────────────────────────────────
export default function FollowUpCheckin({ child, lang = "en", onOpenSMQ }) {
  const it = lang === "it";
  const status = getFollowUpStatus(child.id);
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [notes, setNotes] = useState("");

  if (!status) {
    return (
      <div style={{ background: "var(--surface2)", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: ".85rem", color: "var(--muted)" }}>
        <p>
          {it
            ? "Avvia il piano per attivare i check-in di follow-up a 3 e 6 mesi."
            : "Start the plan to activate 3-month and 6-month follow-up check-ins."}
        </p>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8 }}
          onClick={() => { initFollowUp(child.id); window.location.reload(); }}
        >
          {it ? "Avvia piano" : "Start plan"}
        </button>
      </div>
    );
  }

  const pending = status.filter(m => m.due && !m.completed);
  const upcoming = status.filter(m => !m.due && !m.completed);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Pending milestones — shown prominently */}
      {pending.map(m => (
        <div key={m.key} className="card" style={{ borderLeft: "4px solid #1A4A5C", marginBottom: 10, background: "#1A4A5C08" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#1A4A5C" }}>
                🗓️ {it ? `Check-in ${m.label === "3-month" ? "3 mesi" : "6 mesi"}` : `${m.label} check-in`}
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>
                {it ? `Scaduto il ${m.dueDate}` : `Due ${m.dueDate}`}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: "#1A4A5C", color: "#fff", border: "none" }}
              onClick={() => setCompleting(m.key)}
            >
              {it ? "Completa" : "Complete"}
            </button>
          </div>

          {completing === m.key && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 10 }}>
                {it
                  ? "Completa il check-in di follow-up. Ti consigliamo di ri-somministrare l'SMQ per confrontare i risultati con la baseline."
                  : "Complete the follow-up check-in. We recommend re-administering the SMQ to compare with the baseline."}
              </p>
              {onOpenSMQ && (
                <button className="btn btn-ghost btn-sm" style={{ marginBottom: 10 }} onClick={onOpenSMQ}>
                  📊 {it ? "Apri SMQ" : "Open SMQ"}
                </button>
              )}
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={it ? "Note sul progresso, cambiamenti osservati…" : "Notes on progress, observed changes…"}
                style={{ resize: "none", marginBottom: 10, fontSize: ".88rem" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setCompleting(null)}>
                  {it ? "Annulla" : "Cancel"}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ flex: 1, background: "#1A4A5C", color: "#fff", border: "none" }}
                  onClick={() => {
                    completeFollowUp(child.id, m.key, null, notes);
                    setCompleting(null);
                    setNotes("");
                    window.location.reload();
                  }}
                >
                  {it ? "Salva ✓" : "Save ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Upcoming milestones */}
      {upcoming.length > 0 && (
        <div>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: ".78rem", color: "var(--muted)", padding: "4px 0", marginBottom: 8 }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "▲" : "▼"} {it ? "Prossimi check-in" : "Upcoming check-ins"}
          </button>
          {expanded && upcoming.map(m => (
            <div key={m.key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", marginBottom: 6, fontSize: ".82rem" }}>
              <span>{it ? (m.label === "3-month" ? "Check-in 3 mesi" : "Check-in 6 mesi") : `${m.label} check-in`}</span>
              <span style={{ color: "var(--muted)" }}>{it ? `Previsto: ${m.dueDate}` : `Due: ${m.dueDate}`}</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed milestones */}
      {status.filter(m => m.completed).map(m => (
        <div key={m.key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#D1FAE5", borderRadius: "var(--radius-sm)", marginBottom: 6, fontSize: ".82rem" }}>
          <span style={{ color: "#065F46", fontWeight: 600 }}>
            ✓ {it ? (m.label === "3-month" ? "Check-in 3 mesi" : "Check-in 6 mesi") : `${m.label} check-in`}
          </span>
          <span style={{ color: "#065F46" }}>{it ? `Completato: ${m.completedAt?.slice(0,10)}` : `Completed: ${m.completedAt?.slice(0,10)}`}</span>
        </div>
      ))}
    </div>
  );
}
