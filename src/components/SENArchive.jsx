// SEN Plan Archive
// Allows a plan to be archived at end of school year and a fresh plan started.
// Archived plans are read-only and preserved indefinitely in localStorage.
// This supports M (Maintenance) — longitudinal continuity across school years.

const ARCHIVE_KEY = "haven_sen_archive_v1";

export function loadArchive() {
  try { return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "{}"); } catch { return {}; }
}
function saveArchive(data) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(data));
}

// Archive current plan for a child and start fresh
// Returns the new empty plan
export function archivePlan(childId, childName, plan) {
  const all = loadArchive();
  if (!all[childId]) all[childId] = [];
  const year = new Date().getFullYear();
  const label = `${year - 1}/${year}`;
  all[childId].push({
    label,
    archivedAt: new Date().toISOString(),
    childName,
    goals:     plan.goals     || [],
    feedback:  plan.feedback  || [],
    revisions: plan.revisions || [],
    aiSummary: plan.aiSummary || null,
    // Summary stats for quick overview
    stats: {
      goalsCreated:  (plan.goals || []).length,
      goalsAchieved: (plan.goals || []).filter(g => g.status === "achieved").length,
      feedbackCount: (plan.feedback || []).length,
    },
  });
  saveArchive(all);
  return { goals: [], feedback: [], revisions: [], aiSummary: null };
}

export function getArchiveForChild(childId) {
  return loadArchive()[childId] || [];
}

// ── Archive Browser Component ──────────────────────────────
import React, { useState } from "react";

export function ArchiveBrowser({ child, lang = "en" }) {
  const it = lang === "it";
  const archives = getArchiveForChild(child.id);
  const [expanded, setExpanded] = useState(null);

  if (archives.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ fontFamily: "var(--font-display)", fontSize: ".88rem", color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>
        🗄️ {it ? "Anni precedenti" : "Previous years"}
      </h4>
      {[...archives].reverse().map((arc, i) => (
        <div key={i} className="card" style={{ marginBottom: 8, padding: "12px 16px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: ".9rem" }}>📁 {arc.label}</div>
              <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>
                {arc.stats.goalsCreated} {it ? "obiettivi" : "goals"} ·
                {arc.stats.goalsAchieved} {it ? "raggiunti" : "achieved"} ·
                {arc.stats.feedbackCount} {it ? "osservazioni" : "observations"}
              </div>
            </div>
            <span style={{ color: "var(--muted)" }}>{expanded === i ? "▲" : "▼"}</span>
          </div>

          {expanded === i && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              {/* Goals */}
              {arc.goals.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>
                    {it ? "Obiettivi" : "Goals"}
                  </p>
                  {arc.goals.map((g, gi) => (
                    <div key={gi} style={{ display: "flex", gap: 8, fontSize: ".82rem", marginBottom: 4 }}>
                      <span style={{ color: g.status === "achieved" ? "#6A9E7B" : g.status === "review" ? "#E8A838" : "#3D6B7D", fontWeight: 600, flexShrink: 0 }}>
                        {g.status === "achieved" ? "✓" : g.status === "review" ? "~" : "○"}
                      </span>
                      <span>{g.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* AI summary if present */}
              {arc.aiSummary && (
                <div style={{ background: "var(--surface2)", padding: "10px 12px", borderRadius: "var(--radius-sm)", fontSize: ".82rem", lineHeight: 1.6 }}>
                  <p style={{ fontWeight: 600, color: "#2C6B4A", marginBottom: 4 }}>✨ AI {it ? "Sintesi" : "Summary"}</p>
                  <p style={{ color: "var(--muted)" }}>{arc.aiSummary.text.slice(0, 300)}{arc.aiSummary.text.length > 300 ? "…" : ""}</p>
                </div>
              )}

              <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 10 }}>
                🔒 {it ? "Piano archiviato — sola lettura" : "Archived plan — read only"} · {arc.archivedAt?.slice(0,10)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
