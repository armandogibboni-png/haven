import React, { useState, useEffect } from "react";
import { getT } from "../i18n.js";

const SEN_KEY = "haven_sen_v1";
const MODEL   = "claude-sonnet-4-20250514";

const AREAS_EN = ["communication","social","learning","behaviour","custom"];
const STATUS_COLORS = {
  active:   "#3D6B7D",
  achieved: "#6A9E7B",
  review:   "#E8A838",
};

function loadPlans() {
  try { return JSON.parse(localStorage.getItem(SEN_KEY) || "{}"); } catch { return {}; }
}
function savePlans(plans) {
  localStorage.setItem(SEN_KEY, JSON.stringify(plans));
}
function getPlan(childId) {
  const all = loadPlans();
  return all[childId] || { goals: [], feedback: [], revisions: [], aiSummary: null };
}
function setPlan(childId, plan) {
  const all = loadPlans();
  all[childId] = plan;
  savePlans(all);
}

// ── Main SENPlan component ────────────────────────────────
export default function SENPlan({ child, viewer, family, onBack }) {
  const t   = getT(family?.language || "en");
  const it  = (family?.language || "en") === "it";
  const [plan, setPlanState]    = useState(() => getPlan(child.id));
  const [activeTab, setTab]     = useState("goals");
  const [showGoalForm, setGoalForm] = useState(false);
  const [showFeedback, setFeedbackForm] = useState(false);
  const [showRevision, setRevisionForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]    = useState(null);

  const isTeacher = viewer.role === "teacher";
  const isParent  = ["parent","partner","caregiver"].includes(viewer.role);

  const update = (newPlan) => {
    setPlanState(newPlan);
    setPlan(child.id, newPlan);
  };

  // ── Goals ────────────────────────────────────────────
  const addGoal = (goal) => {
    update({ ...plan, goals: [...plan.goals, { ...goal, id: Date.now().toString(), createdAt: new Date().toISOString(), createdBy: viewer.name }] });
    setGoalForm(false);
  };
  const toggleGoalStatus = (id) => {
    const statuses = ["active","review","achieved"];
    update({ ...plan, goals: plan.goals.map(g => g.id === id ? { ...g, status: statuses[(statuses.indexOf(g.status)+1) % statuses.length] } : g) });
  };
  const deleteGoal = (id) => update({ ...plan, goals: plan.goals.filter(g => g.id !== id) });

  // ── Feedback ─────────────────────────────────────────
  const addFeedback = (text, context) => {
    const entry = { id: Date.now().toString(), text, context, author: viewer.name, role: viewer.role, timestamp: new Date().toISOString() };
    update({ ...plan, feedback: [entry, ...plan.feedback] });
    setFeedbackForm(false);
  };

  // ── AI Synthesis ──────────────────────────────────────
  const generateSummary = async () => {
    if (plan.feedback.length < 2) return;
    setAiLoading(true); setAiError(null);
    const feedbackText = plan.feedback.slice(0,15).map(f =>
      `[${f.role} - ${new Date(f.timestamp).toLocaleDateString()}]: ${f.text}`
    ).join("\n");
    const goalText = plan.goals.map(g => `[${g.area}] ${g.description} (${g.status})`).join("\n");
    const prompt = it
      ? `Sei un esperto di bisogni educativi speciali e mutismo selettivo. Analizza queste osservazioni e obiettivi del PEI/PDP di ${child.name} e genera una sintesi clinicamente utile (max 200 parole) che:\n1. Evidenzi i pattern emergenti\n2. Segnali progressi o regressioni\n3. Proponga 1-2 possibili aggiustamenti al piano\n\nObiettivi:\n${goalText}\n\nOsservazioni recenti:\n${feedbackText}\n\nScrivi in italiano. Tono professionale ma leggibile da genitori e insegnanti.`
      : `You are an expert in special educational needs and selective mutism. Analyse these observations and goals from ${child.name}'s SEN Plan and generate a clinically useful synthesis (max 200 words) that:\n1. Highlights emerging patterns\n2. Flags progress or regression\n3. Suggests 1-2 possible plan adjustments\n\nGoals:\n${goalText}\n\nRecent observations:\n${feedbackText}\n\nProfessional but readable by both parents and teachers.`;

    try {
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 500, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || data.error);
      const summary = { text: data.content?.[0]?.text || "", generatedAt: new Date().toISOString(), generatedBy: "AI" };
      update({ ...plan, aiSummary: summary });
    } catch (e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  };

  // ── Revisions ─────────────────────────────────────────
  const proposeRevision = (text) => {
    const rev = { id: Date.now().toString(), text, proposedBy: viewer.name, proposedByRole: viewer.role, proposedAt: new Date().toISOString(), status: "pending" };
    update({ ...plan, revisions: [rev, ...plan.revisions] });
    setRevisionForm(false);
  };
  const respondRevision = (id, approved) => {
    update({ ...plan, revisions: plan.revisions.map(r => r.id === id ? { ...r, status: approved ? "approved" : "rejected", respondedBy: viewer.name, respondedAt: new Date().toISOString() } : r) });
  };

  const pendingRevisions = plan.revisions.filter(r => r.status === "pending");
  const areas = AREAS_EN;

  // ── Export plain text ─────────────────────────────────
  const exportPlan = () => {
    const lines = [
      `${t("senPlanFull")} — ${child.name}`,
      `${t("senLastUpdated")}: ${new Date().toLocaleDateString()}`,
      "",
      `=== ${t("senGoals")} ===`,
      ...plan.goals.map(g => `[${g.area.toUpperCase()}] ${g.description} — ${g.status}`),
      "",
      `=== ${t("senFeedback")} ===`,
      ...plan.feedback.slice(0,20).map(f => `${new Date(f.timestamp).toLocaleDateString()} | ${f.author} (${f.role}): ${f.text}`),
      "",
      ...(plan.aiSummary ? [`=== ${t("senAISummary")} ===`, plan.aiSummary.text] : []),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `SEN_Plan_${child.name}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="screen">
      {/* Header — prominent SEN Plan identity */}
      <div style={{ background: "linear-gradient(135deg, #1A4A5C 0%, #2C6B4A 100%)", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff", fontSize: "1rem" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "rgba(255,255,255,.2)", color: "#fff", fontSize: ".7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: ".05em" }}>
                {t("senPlanBadge")}
              </span>
              {child.msFlag && <span className="ms-badge" style={{ fontSize: ".68rem" }}>🔷 SM</span>}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "1.2rem", fontWeight: 500, marginTop: 4 }}>{child.name}</h2>
          </div>
          <button onClick={exportPlan} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", color: "#fff", fontSize: ".82rem", fontWeight: 600 }}>
            ↓ {t("senExport")}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2 }}>
          {["goals","feedback","revisions","summary"].map(tab => (
            <button key={tab} onClick={() => setTab(tab)} style={{
              padding: "8px 14px", border: "none", cursor: "pointer",
              background: activeTab === tab ? "rgba(255,255,255,.18)" : "transparent",
              color: activeTab === tab ? "#fff" : "rgba(255,255,255,.6)",
              fontWeight: activeTab === tab ? 700 : 400,
              fontFamily: "var(--font-body)", fontSize: ".82rem",
              borderRadius: "8px 8px 0 0",
              borderBottom: activeTab === tab ? "2px solid #fff" : "2px solid transparent",
            }}>
              {tab === "goals"     && `🎯 ${t("senGoals")}`}
              {tab === "feedback"  && `📝 ${t("senFeedback")}`}
              {tab === "revisions" && `🔄 ${t("senRevisions")}${pendingRevisions.length > 0 ? ` (${pendingRevisions.length})` : ""}`}
              {tab === "summary"   && `✨ ${t("senAISummary")}`}
            </button>
          ))}
        </div>
      </div>

      <div className="content" style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* ── GOALS TAB ── */}
        {activeTab === "goals" && (
          <div>
            {showGoalForm
              ? <GoalForm areas={areas} t={t} it={it} onSave={addGoal} onCancel={() => setGoalForm(false)} />
              : <button className="btn btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={() => setGoalForm(true)}>+ {t("senAddGoal")}</button>
            }
            {plan.goals.length === 0
              ? <EmptyState emoji="🎯" text={t("senNoGoals")} />
              : plan.goals.map(g => (
                <GoalCard key={g.id} goal={g} t={t} it={it} onToggle={() => toggleGoalStatus(g.id)} onDelete={() => deleteGoal(g.id)} />
              ))
            }
          </div>
        )}

        {/* ── FEEDBACK TAB ── */}
        {activeTab === "feedback" && (
          <div>
            {showFeedback
              ? <FeedbackForm t={t} it={it} viewer={viewer} onSave={addFeedback} onCancel={() => setFeedbackForm(false)} />
              : <button className="btn btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={() => setFeedbackForm(true)}>+ {t("senAddFeedback")}</button>
            }
            {plan.feedback.length === 0
              ? <EmptyState emoji="📝" text={t("senNoFeedback")} />
              : plan.feedback.map(f => <FeedbackCard key={f.id} entry={f} t={t} />)
            }
          </div>
        )}

        {/* ── REVISIONS TAB ── */}
        {activeTab === "revisions" && (
          <div>
            {showRevision
              ? <RevisionForm t={t} it={it} viewer={viewer} onSave={proposeRevision} onCancel={() => setRevisionForm(false)} />
              : <button className="btn" style={{ width: "100%", marginBottom: 16, background: "linear-gradient(135deg, #1A4A5C, #2C6B4A)", color: "#fff", border: "none" }} onClick={() => setRevisionForm(true)}>
                  🔄 {t("senProposeRevision")}
                </button>
            }
            {plan.revisions.length === 0
              ? <EmptyState emoji="🔄" text={it ? "Nessuna revisione ancora." : "No revisions yet."} />
              : plan.revisions.map(r => (
                <RevisionCard key={r.id} rev={r} t={t} isParent={isParent} onRespond={respondRevision} />
              ))
            }
          </div>
        )}

        {/* ── AI SUMMARY TAB ── */}
        {activeTab === "summary" && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: "linear-gradient(135deg, #1A4A5C11, #2C6B4A11)", borderColor: "#2C6B4A44" }}>
              <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.65 }}>
                {it
                  ? `L'AI analizza le osservazioni recenti e gli obiettivi di ${child.name} per evidenziare pattern, progressi e possibili aggiustamenti al piano. Richiede almeno 2 osservazioni.`
                  : `The AI analyses ${child.name}'s recent observations and goals to highlight patterns, progress, and possible plan adjustments. Requires at least 2 observations.`}
              </p>
            </div>

            <button
              className="btn"
              style={{ width: "100%", marginBottom: 20, background: "linear-gradient(135deg, #1A4A5C, #2C6B4A)", color: "#fff", border: "none", opacity: plan.feedback.length < 2 ? 0.4 : 1 }}
              onClick={generateSummary}
              disabled={plan.feedback.length < 2 || aiLoading}
            >
              {aiLoading
                ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Dots /> {t("loading")}</span>
                : `✨ ${t("senAISummaryBtn")}`}
            </button>

            {aiError && <div style={{ background: "#FEE2E2", padding: "12px", borderRadius: "var(--radius-sm)", color: "#B91C1C", fontSize: ".85rem", marginBottom: 16 }}>⚠️ {aiError}</div>}

            {plan.aiSummary && (
              <div className="card" style={{ borderLeft: "4px solid #2C6B4A" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#2C6B4A", textTransform: "uppercase", letterSpacing: ".05em" }}>✨ {t("senAISummary")}</span>
                  <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{new Date(plan.aiSummary.generatedAt).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: ".92rem", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{plan.aiSummary.text}</p>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: ".75rem", color: "var(--muted)" }}>
                    {it ? "⚠️ Sintesi generata da AI a supporto decisionale. Non sostituisce valutazione professionale." : "⚠️ AI-generated synthesis for decision support. Does not replace professional assessment."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function GoalCard({ goal, t, it, onToggle, onDelete }) {
  const statusKey = { active: "senGoalActive", achieved: "senGoalAchieved", review: "senGoalReview" };
  const color = STATUS_COLORS[goal.status || "active"];
  return (
    <div className="card fade-up" style={{ marginBottom: 12, borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: ".72rem", fontWeight: 700, background: color + "22", color, padding: "2px 8px", borderRadius: 20 }}>
              {it ? { communication:"Comunicazione", social:"Sociale", learning:"Apprendimento", behaviour:"Comportamento", custom:"Personalizzato" }[goal.area] || goal.area : goal.area}
            </span>
            <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>{t(statusKey[goal.status] || "senGoalActive")}</span>
          </div>
          <p style={{ fontSize: ".93rem", lineHeight: 1.55 }}>{goal.description}</p>
          <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 6 }}>
            {t("senBy")} {goal.createdBy} · {new Date(goal.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={onToggle} style={{ background: color + "22", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: ".8rem", color }}>↻</button>
          <button onClick={onDelete} style={{ background: "#FEE2E222", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", fontSize: ".8rem", color: "#B91C1C" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

function FeedbackCard({ entry, t }) {
  const roleColors = { teacher: "#1A4A5C", parent: "#3D6B7D", partner: "#8B5E7A", caregiver: "#6B8E6B" };
  const color = roleColors[entry.role] || "var(--muted)";
  return (
    <div className="card fade-up" style={{ marginBottom: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: ".8rem", fontWeight: 700, color }}>{entry.author} <span style={{ fontWeight: 400, color: "var(--muted)" }}>({entry.role})</span></span>
        <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
      </div>
      <p style={{ fontSize: ".9rem", lineHeight: 1.6 }}>{entry.text}</p>
      {entry.context && <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 6, fontStyle: "italic" }}>{entry.context}</p>}
    </div>
  );
}

function RevisionCard({ rev, t, isParent, onRespond }) {
  const statusStyles = {
    pending:  { bg: "#FEF3C7", color: "#92400E", label: t("senRevisionPending") },
    approved: { bg: "#D1FAE5", color: "#065F46", label: t("senRevisionApproved") },
    rejected: { bg: "#FEE2E2", color: "#B91C1C", label: t("senRevisionRejected") },
  };
  const s = statusStyles[rev.status] || statusStyles.pending;
  return (
    <div className="card fade-up" style={{ marginBottom: 12, border: `1.5px solid ${s.color}44` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: ".75rem", background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{s.label}</span>
        <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{new Date(rev.proposedAt).toLocaleDateString()}</span>
      </div>
      <p style={{ fontSize: ".92rem", lineHeight: 1.6, marginBottom: 8 }}>{rev.text}</p>
      <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>
        {t("senProposedBy")} {rev.proposedBy} ({rev.proposedByRole})
        {rev.respondedBy && <> · {t("senApprovedBy")} {rev.respondedBy}</>}
      </p>
      {rev.status === "pending" && isParent && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-sm" style={{ flex: 1, background: "#D1FAE5", color: "#065F46", border: "none" }} onClick={() => onRespond(rev.id, true)}>✓ {t("senRevisionApprove")}</button>
          <button className="btn btn-sm" style={{ flex: 1, background: "#FEE2E2", color: "#B91C1C", border: "none" }} onClick={() => onRespond(rev.id, false)}>✕ {t("senRevisionReject")}</button>
        </div>
      )}
    </div>
  );
}

function GoalForm({ areas, t, it, onSave, onCancel }) {
  const [area, setArea] = useState("communication");
  const [desc, setDesc] = useState("");
  const areaLabels = it ? { communication:"Comunicazione", social:"Sociale", learning:"Apprendimento", behaviour:"Comportamento", custom:"Personalizzato" } : {};
  return (
    <div className="card" style={{ marginBottom: 16, borderColor: "#2C6B4A" }}>
      <h4 style={{ fontFamily: "var(--font-display)", color: "#1A4A5C", marginBottom: 14 }}>🎯 {t("senAddGoal")}</h4>
      <div style={{ marginBottom: 12 }}>
        <label>{t("senGoalArea")}</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {areas.map(a => (
            <button key={a} onClick={() => setArea(a)} className="btn btn-sm" style={{ background: area === a ? "#1A4A5C" : "var(--surface2)", color: area === a ? "#fff" : "var(--text)", border: `1px solid ${area === a ? "#1A4A5C" : "var(--border)"}` }}>
              {areaLabels[a] || a}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>{t("senGoalDesc")}</label>
        <textarea autoFocus rows={3} value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: "none" }} placeholder={it ? "es. Rispondere verbalmente all'appello entro marzo…" : "e.g. Respond verbally to the register by March…"} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>{t("cancel")}</button>
        <button className="btn" style={{ flex: 1, background: "#1A4A5C", color: "#fff", border: "none" }} onClick={() => { if (desc.trim()) onSave({ area, description: desc.trim(), status: "active" }); }} disabled={!desc.trim()}>{t("save")}</button>
      </div>
    </div>
  );
}

function FeedbackForm({ t, it, viewer, onSave, onCancel }) {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  return (
    <div className="card" style={{ marginBottom: 16, borderColor: "#2C6B4A" }}>
      <h4 style={{ fontFamily: "var(--font-display)", color: "#1A4A5C", marginBottom: 14 }}>📝 {t("senAddFeedback")}</h4>
      <div style={{ marginBottom: 10 }}>
        <label>{t("senFeedbackText")}</label>
        <textarea autoFocus rows={3} value={text} onChange={e => setText(e.target.value)} style={{ resize: "none" }} placeholder={it ? "es. Oggi ha risposto con un cenno durante la lezione di matematica…" : "e.g. Today responded with a nod during the maths lesson…"} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>{it ? "Contesto (opzionale)" : "Context (optional)"}</label>
        <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder={it ? "es. Piccolo gruppo, nessun rumore" : "e.g. Small group, quiet room"} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>{t("cancel")}</button>
        <button className="btn" style={{ flex: 1, background: "#1A4A5C", color: "#fff", border: "none" }} onClick={() => { if (text.trim()) onSave(text.trim(), context.trim()); }} disabled={!text.trim()}>{t("save")}</button>
      </div>
    </div>
  );
}

function RevisionForm({ t, it, viewer, onSave, onCancel }) {
  const [text, setText] = useState("");
  return (
    <div className="card" style={{ marginBottom: 16, borderColor: "#2C6B4A" }}>
      <h4 style={{ fontFamily: "var(--font-display)", color: "#1A4A5C", marginBottom: 14 }}>🔄 {t("senProposeRevision")}</h4>
      <div style={{ marginBottom: 14 }}>
        <textarea autoFocus rows={4} value={text} onChange={e => setText(e.target.value)} style={{ resize: "none" }} placeholder={it ? "Descrivi la revisione proposta al piano…" : "Describe the proposed revision to the plan…"} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>{t("cancel")}</button>
        <button className="btn" style={{ flex: 1, background: "#1A4A5C", color: "#fff", border: "none" }} onClick={() => { if (text.trim()) onSave(text.trim()); }} disabled={!text.trim()}>{t("save")}</button>
      </div>
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "36px 24px", color: "var(--muted)" }}>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{emoji}</div>
      <p style={{ fontSize: ".9rem" }}>{text}</p>
    </div>
  );
}

function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `bounce 1.2s ease ${i*.2}s infinite`, display: "inline-block" }} />)}
    </span>
  );
}
