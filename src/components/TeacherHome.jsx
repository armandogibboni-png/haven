import React, { useState } from "react";
import { getT } from "../i18n.js";
import SENPlan from "./SENPlan.jsx";
import Chat from "./Chat.jsx";
import FamilyBoard from "./FamilyBoard.jsx";

// Teacher sees: SEN Plans, Student card, Message parent, Family Board, AI chat (strategies only)
// SNA (readOnly=true) sees: SEN Plan (read-only), Family Board (post allowed), NO AI chat, NO parent contact
// Neither can access: child chat, child diary, emotion check-ins, child-generated data

const PARENT_ROLES = ["parent","partner","caregiver"];

export default function TeacherHome({ teacher, family, onBack, readOnly = false }) {
  const t   = getT(family?.language || "en");
  const it  = (family?.language || "en") === "it";
  const [screen, setScreen] = useState("home");
  const [activeChild, setActiveChild] = useState(null);
  const [activeParent, setActiveParent] = useState(null);
  const isSNA = teacher.role === "sna" || readOnly;

  // SEN-eligible: children with msFlag or senFlag
  const senStudents = family.members.filter(m =>
    (m.role === "child" || m.role === "sibling") && (m.msFlag || m.senFlag)
  );
  const parents = family.members.filter(m => PARENT_ROLES.includes(m.role));

  if (screen === "senPlan" && activeChild) {
    return <SENPlan child={activeChild} viewer={teacher} family={family} onBack={() => { setScreen("home"); setActiveChild(null); }} readOnly={isSNA} />;
  }
  if (screen === "chatParent" && activeParent && !isSNA) {
    return <Chat member={activeParent} family={family} onBack={() => { setScreen("home"); setActiveParent(null); }} teacherMode={{ teacher, restriction: it ? "Sei l'insegnante. Puoi contattare solo i genitori. Non puoi accedere ai dati del bambino." : "You are the teacher. You may contact parents only. You cannot access child data." }} />;
  }
  if (screen === "board") {
    return <FamilyBoard family={family} activeMember={teacher} onBack={() => setScreen("home")} />;
  }

  const roleLabel = isSNA
    ? (it ? "SNA" : "SNA")
    : (it ? "INSEGNANTE" : "TEACHER");
  const headerColor = isSNA ? "#2C6B4A" : "#1A4A5C";

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${headerColor} 0%, #2C3E50 100%)`, padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ background: "rgba(255,255,255,.2)", color: "#fff", fontSize: ".7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20, letterSpacing: ".06em" }}>
                {isSNA ? "🤲" : "🏫"} {roleLabel}
              </span>
              {isSNA && (
                <span style={{ background: "rgba(255,255,255,.15)", color: "#fff", fontSize: ".65rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                  {t("snaReadOnly")}
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "1.5rem", fontWeight: 400 }}>
              {it ? "Benvenuto" : "Welcome"}, {teacher.name}
            </h1>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".82rem", marginTop: 2 }}>
              {family.appName || "Haven"} · {senStudents.length} {it ? (senStudents.length === 1 ? "studente" : "studenti") : (senStudents.length === 1 ? "student" : "students")}
            </p>
          </div>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#fff", fontSize: "1rem" }}>✕</button>
        </div>
      </div>

      {/* Privacy notice bar */}
      <div style={{ background: "#1A4A5C11", borderBottom: "1px solid #1A4A5C22", padding: "8px 20px" }}>
        <p style={{ fontSize: ".75rem", color: "#1A4A5C", lineHeight: 1.5 }}>
          🔐 {it
            ? (isSNA
                ? "Accesso SNA: puoi vedere i PEI/PDP (sola lettura) e la bacheca famiglia. Chat, diari e check-in emotivi non sono accessibili."
                : "Accesso limitato: puoi consultare i PEI/PDP e contattare i genitori. Chat, diari e check-in emotivi degli studenti non sono accessibili.")
            : (isSNA
                ? "SNA access: you can view SEN Plans (read-only) and the Family Board. Student chats, diaries and emotion check-ins are not accessible."
                : "Limited access: you can view SEN Plans and contact parents. Student chats, diaries and emotion check-ins are not accessible.")}
        </p>
      </div>

      <div className="content" style={{ maxWidth: 580, margin: "0 auto" }}>

        {/* ── SEN Plans — PRIMARY ELEMENT ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel color={isSNA ? "#2C6B4A" : "#1A4A5C"}>
            📋 {t("senPlanFull")}
          </SectionLabel>
          <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
            {isSNA
              ? (it ? "Visualizza gli obiettivi e le osservazioni del piano (sola lettura)." : "View plan goals and observations (read-only).")
              : t("senPlanSub")}
          </p>

          {senStudents.length === 0
            ? (
              <div className="card" style={{ textAlign: "center", padding: "36px 24px", borderColor: "#1A4A5C44" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
                <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>{t("teacherNoStudents")}</p>
                <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 8 }}>
                  {it ? "I genitori devono aggiungere profili con flag SM o SEN nell'enrollment." : "Parents need to add profiles with SM or SEN flags during enrollment."}
                </p>
              </div>
            )
            : senStudents.map(child => (
              <SENStudentCard
                key={child.id}
                child={child}
                t={t}
                it={it}
                onClick={() => { setActiveChild(child); setScreen("senPlan"); }}
              />
            ))
          }
        </div>

        {/* ── Contact parents — teacher only, not SNA ── */}
        {!isSNA && parents.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel color="#3D6B7D">
              💬 {it ? "Contatta i genitori" : "Contact parents"}
            </SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {parents.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setActiveParent(p); setScreen("chatParent"); }}
                  className="card"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "all .1s" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: (p.color || "var(--primary)") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: ".93rem" }}>{p.name}</div>
                    <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>{t(`roles.${p.role}`)}</div>
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: "1rem" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* ── Family Board ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel color="#3D6B7D">
            📋 {t("familyBoard")}
          </SectionLabel>
          <button
            onClick={() => setScreen("board")}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer", width: "100%", textAlign: "left", transition: "all .1s" }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary)22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: ".93rem" }}>{t("familyBoard")}</div>
              <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>
                {it ? "Messaggi condivisi con la famiglia" : "Shared messages with the family"}
              </div>
            </div>
            <span style={{ color: "var(--muted)" }}>→</span>
          </button>
        </div>

        {/* Access restriction reminder */}
        <div className="card" style={{ background: "#1A4A5C08", borderColor: "#1A4A5C33", padding: "14px 16px", marginBottom: 24 }}>
          <p style={{ fontSize: ".78rem", color: "#1A4A5C", fontWeight: 600, marginBottom: 6 }}>
            🔐 {isSNA
              ? (it ? "Accesso SNA — riepilogo" : "SNA access — summary")
              : (it ? "Accesso insegnante — riepilogo" : "Teacher access — summary")}
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            {(isSNA ? [
              [it ? "PEI/PDP degli studenti (sola lettura)" : "Student SEN Plans (read-only)", true],
              [it ? "Bacheca famiglia" : "Family Board", true],
              [it ? "Contatto genitori" : "Parent contact", false],
              [it ? "Chat del bambino" : "Child chat", false],
              [it ? "Diario delle vittorie" : "Victories diary", false],
              [it ? "Check-in emotivi" : "Emotion check-ins", false],
            ] : [
              [it ? "PEI/PDP degli studenti" : "Student SEN Plans", true],
              [it ? "Contatto genitori" : "Parent contact", true],
              [it ? "Bacheca famiglia" : "Family Board", true],
              [it ? "Chat del bambino" : "Child chat", false],
              [it ? "Diario delle vittorie" : "Victories diary", false],
              [it ? "Check-in emotivi" : "Emotion check-ins", false],
            ]).map(([label, allowed]) => (
              <li key={label} style={{ fontSize: ".78rem", color: allowed ? "#065F46" : "#B91C1C", display: "flex", gap: 6 }}>
                <span>{allowed ? "✓" : "✗"}</span> {label}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

function SENStudentCard({ child, t, it, onClick }) {
  const senData = (() => {
    try {
      const plans = JSON.parse(localStorage.getItem("haven_sen_v1") || "{}");
      return plans[child.id] || null;
    } catch { return null; }
  })();
  const goalCount     = senData?.goals?.filter(g => g.status === "active").length || 0;
  const feedbackCount = senData?.feedback?.length || 0;
  const pendingCount  = senData?.revisions?.filter(r => r.status === "pending").length || 0;

  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        display: "flex", gap: 16, padding: "18px 20px",
        cursor: "pointer", textAlign: "left", width: "100%",
        borderLeft: "5px solid #1A4A5C",
        background: "linear-gradient(135deg, #1A4A5C06, transparent)",
        transition: "all .12s",
        marginBottom: 12,
      }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Avatar */}
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#1A4A5C22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
        {child.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>{child.name}</span>
          <span style={{ background: "#1A4A5C", color: "#fff", fontSize: ".68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: ".04em" }}>
            {t("senPlanBadge")}
          </span>
          {child.msFlag && <span className="ms-badge" style={{ fontSize: ".65rem" }}>🔷 SM</span>}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <StatPill value={goalCount} label={it ? "obiettivi" : "goals"} color="#1A4A5C" />
          <StatPill value={feedbackCount} label={it ? "osservazioni" : "observations"} color="#2C6B4A" />
          {pendingCount > 0 && <StatPill value={pendingCount} label={it ? "revisioni da approvare" : "pending revisions"} color="#E8A838" />}
        </div>
      </div>

      <span style={{ color: "#1A4A5C", fontSize: "1.1rem", alignSelf: "center", flexShrink: 0 }}>→</span>
    </button>
  );
}

function StatPill({ value, label, color }) {
  return (
    <span style={{ fontSize: ".75rem", color, fontWeight: 600 }}>
      <span style={{ fontSize: ".9rem", fontWeight: 700 }}>{value}</span> {label}
    </span>
  );
}

function SectionLabel({ children, color = "var(--muted)" }) {
  return (
    <h2 style={{ fontSize: ".78rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      {children}
    </h2>
  );
}
