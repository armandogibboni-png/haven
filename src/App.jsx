import React, { useState, useEffect } from "react";
import Enrollment from "./components/Enrollment.jsx";
import PinGate from "./components/PinGate.jsx";
import Chat from "./components/Chat.jsx";
import FamilyBoard from "./components/FamilyBoard.jsx";
import FriendsRelatives from "./components/FriendsRelatives.jsx";
import ConsentScreen from "./components/ConsentScreen.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import Toolbox from "./toolbox/Toolbox.jsx";
import { getT } from "./i18n.js";

const HAVEN_KEY    = "haven_family_v1";
const CONSENT_KEY  = "haven_consent_v1";
const PARENT_ROLES = ["parent","partner","caregiver"];
const SPECIAL_SHARED = ["board","friends","together","settings"];

export default function App() {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [activeMember, setActiveMember] = useState(null);
  const [pinPending, setPinPending] = useState(null);
  // GDPR consent — must be given before enrollment and any data collection
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentLang, setConsentLang] = useState("en");

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (consent) setConsentGiven(true);
      const saved = localStorage.getItem(HAVEN_KEY);
      if (saved) {
        const f = JSON.parse(saved);
        setFamily(f);
        setConsentLang(f.language || "en");
      }
    } catch {}
    setLoading(false);
  }, []);

  const saveFamily = (data) => {
    localStorage.setItem(HAVEN_KEY, JSON.stringify(data));
    setFamily(data);
  };

  const openMember = (member, target = "chat") => {
    if (member.pin) {
      setPinPending({ member, target });
    } else {
      setActiveMember(member);
      setScreen(target);
    }
  };

  const goHome = () => { setScreen("home"); setActiveMember(null); };

  if (loading) return null;

  // GDPR: show consent before anything else
  if (!consentGiven) {
    return (
      <ConsentScreen
        lang={consentLang}
        onAccept={() => {
          localStorage.setItem(CONSENT_KEY, JSON.stringify({ given: true, date: new Date().toISOString() }));
          setConsentGiven(true);
        }}
        onDecline={() => {
          // User declined — show a neutral screen, nothing stored
          document.body.innerHTML = `<div style="font-family:sans-serif;padding:40px;text-align:center;color:#666"><p>You have declined. No data has been collected.</p><p style="margin-top:16px">Close this tab to exit.</p></div>`;
        }}
      />
    );
  }

  if (!family) return <Enrollment onComplete={saveFamily} />;

  if (pinPending) return (
    <PinGate
      member={pinPending.member}
      family={family}
      onSuccess={() => {
        setActiveMember(pinPending.member);
        setScreen(pinPending.target);
        setPinPending(null);
      }}
      onCancel={() => setPinPending(null)}
    />
  );

  if (screen === "chat")    return <Chat member={activeMember} family={family} onBack={goHome} />;
  if (screen === "toolbox") return <Toolbox member={activeMember} family={family} onBack={goHome} />;
  if (screen === "board")   return <FamilyBoard family={family} activeMember={activeMember} onBack={goHome} />;
  if (screen === "friends") return <FriendsRelatives family={family} onBack={goHome} />;
  if (screen === "privacy") return <PrivacyPolicy lang={family?.language || "en"} onBack={goHome} />;
  if (screen === "settings") return <Settings family={family} onSave={saveFamily} onBack={goHome} onPrivacy={() => setScreen("privacy")} onWithdrawConsent={() => { localStorage.removeItem(CONSENT_KEY); setConsentGiven(false); }} />;

  return <Home family={family} onOpenMember={openMember} onNav={setScreen} />;
}

/* ── Home Screen ──────────────────────────────────────── */
function Home({ family, onOpenMember, onNav }) {
  const t = getT(family?.language || "en");
  const members = family.members || [];
  const hasParent = members.some(m => PARENT_ROLES.includes(m.role));
  const childrenWithTools = members.filter(m => ["child","sibling"].includes(m.role));
  const msMembers = members.filter(m => m.msFlag);
  const appName = family.appName || "Haven";

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        padding: "20px 20px 14px",
        background: "linear-gradient(160deg, var(--primary) 0%, var(--primary-d) 100%)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "1.8rem", fontWeight: 400, marginBottom: 2 }}>
              {appName}
            </h1>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".85rem" }}>
              {members.length} {members.length === 1 ? t("memberAdded") : t("membersAdded")}
            </p>
          </div>
          <button
            onClick={() => onNav("settings")}
            style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#fff", fontSize: "1rem" }}
          >⚙</button>
        </div>
      </div>

      <div className="content" style={{ paddingTop: 24 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Family members */}
          <SectionTitle>{t("homeTitle")}</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
            {members.map((m, i) => (
              <MemberCard key={m.id} member={m} family={family} onClick={() => onOpenMember(m, "chat")} delay={i * 0.06} />
            ))}
          </div>

          {/* Toolboxes */}
          {(hasParent || childrenWithTools.length > 0) && (
            <>
              <SectionTitle>🧰 Toolbox</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {members.filter(m => PARENT_ROLES.includes(m.role)).map(m => (
                  <ToolboxCard key={m.id} member={m} family={family} onClick={() => onOpenMember(m, "toolbox")} />
                ))}
                {childrenWithTools.map(m => (
                  <ToolboxCard key={m.id} member={m} family={family} onClick={() => onOpenMember(m, "toolbox")} />
                ))}
              </div>
            </>
          )}

          {/* Shared spaces */}
          <SectionTitle>{t("homeSpecial")}</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            <SpaceCard emoji="📋" label={t("familyBoard")} color="var(--primary)" onClick={() => onNav("board")} />
            <SpaceCard emoji="🤝" label={t("friendsRelatives")} color="var(--ms)" onClick={() => onNav("friends")} badge={msMembers.length > 0 ? msMembers.length : null} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
      {children}
    </h2>
  );
}

function MemberCard({ member, family, onClick, delay }) {
  const t = getT(family?.language || "en");
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        padding: "18px 12px", cursor: "pointer", border: `1.5px solid ${member.color}33`,
        textAlign: "center", animation: `fadeUp .35s ease ${delay}s both`,
        transition: "transform .1s, box-shadow .1s",
      }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: member.color + "22", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.8rem",
      }}>
        {member.emoji}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{member.name}</div>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4, flexWrap: "wrap" }}>
          <span className="role-badge">{t(`roles.${member.role}`)}</span>
          {member.msFlag && <span className="ms-badge" style={{ fontSize: ".65rem" }}>SM</span>}
          {member.pin && <span style={{ fontSize: ".7rem" }}>🔐</span>}
        </div>
      </div>
    </button>
  );
}

function ToolboxCard({ member, family, onClick }) {
  const t = getT(family?.language || "en");
  const isParent = PARENT_ROLES.includes(member.role);
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px", cursor: "pointer", textAlign: "left",
        border: `1.5px solid ${member.color}44`,
        background: member.color + "08",
        transition: "all .1s",
      }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: member.color + "22", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.3rem", flexShrink: 0,
      }}>
        🧰
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: ".9rem", color: member.color }}>
          {isParent ? t("toolboxParent") : t("toolboxChild")}
        </div>
        <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>
          {member.emoji} {member.name}
          {member.msFlag && <span className="ms-badge" style={{ marginLeft: 6, fontSize: ".62rem" }}>SM</span>}
        </div>
      </div>
      <span style={{ color: "var(--muted)" }}>→</span>
    </button>
  );
}

function SpaceCard({ emoji, label, color, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        padding: "20px 12px", cursor: "pointer", position: "relative",
        transition: "all .1s",
      }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {badge && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: color, color: "#fff",
          width: 18, height: 18, borderRadius: "50%",
          fontSize: ".7rem", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{badge}</div>
      )}
      <span style={{ fontSize: "1.8rem" }}>{emoji}</span>
      <span style={{ fontSize: ".85rem", fontWeight: 600, color, textAlign: "center" }}>{label}</span>
    </button>
  );
}

/* ── Settings Screen ──────────────────────────────────── */
function Settings({ family, onSave, onBack, onPrivacy, onWithdrawConsent }) {
  const [appName, setAppName] = useState(family.appName || "Haven");
  const [lang, setLang] = useState(family.language || "en");
  const t = getT(lang);
  const it = lang === "it";

  const save = () => onSave({ ...family, appName: appName.trim() || "Haven", language: lang });

  const resetAll = () => {
    if (window.confirm(it ? "Cancellare tutti i dati? Questa azione è irreversibile." : "Reset all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const withdrawConsent = () => {
    if (window.confirm(it
      ? "Revocare il consenso disabiliterà la chat AI e richiederà di accettare di nuovo al prossimo avvio. Continuare?"
      : "Withdrawing consent will disable AI chat and require re-consent at next launch. Continue?")) {
      onWithdrawConsent();
    }
  };

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="header-title">⚙ {t("settings")}</span>
      </div>
      <div className="content" style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label>App name</label>
          <input value={appName} onChange={e => setAppName(e.target.value)} maxLength={24} />
        </div>
        <div>
          <label>{t("chooseLang")}</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[{code:"en",flag:"🇬🇧",label:"English"},{code:"it",flag:"🇮🇹",label:"Italiano"}].map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className="btn" style={{
                flex: 1,
                background: lang === l.code ? "var(--primary)" : "var(--surface2)",
                color: lang === l.code ? "#fff" : "var(--text)",
                border: `1.5px solid ${lang === l.code ? "var(--primary)" : "var(--border)"}`,
              }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={save}>{t("save")} ✓</button>

        {/* GDPR section */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <p style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>
            🔐 {it ? "Privacy e GDPR" : "Privacy & GDPR"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="btn btn-ghost" style={{ justifyContent: "flex-start", gap: 10 }} onClick={onPrivacy}>
              📄 {it ? "Leggi l'Informativa sulla Privacy" : "Read Privacy Policy"}
            </button>
            <button
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start", gap: 10, color: "var(--accent)", borderColor: "#E8C8B0" }}
              onClick={withdrawConsent}
            >
              🔄 {it ? "Revoca il consenso" : "Withdraw consent"}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: "#FECACA" }}>
          <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 10 }}>
            {it ? "Reimposta l'app e cancella tutti i dati locali (GDPR Art. 17 — diritto alla cancellazione)." : "Reset the app and delete all local data (GDPR Art. 17 — right to erasure)."}
          </p>
          <button className="btn" style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FECACA", width: "100%" }} onClick={resetAll}>
            🗑 {it ? "Cancella tutti i dati" : "Reset all data"}
          </button>
        </div>
      </div>
    </div>
  );
}
