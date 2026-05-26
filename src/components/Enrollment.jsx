import React, { useState } from "react";
import { LANGS, getT } from "../i18n.js";

const ROLES = ["parent","partner","child","sibling","grandparent","caregiver","teacher","other"];
const MS_ROLES = ["child","sibling"]; // only these can have MS flag
const PIN_REQUIRED_ROLES = ["teacher"]; // PIN mandatory for these roles

const ROLE_EMOJIS = {
  parent: ["🧑‍👧‍👦","👨","👩","🧑"],
  partner: ["💛","👨","👩","🧑"],
  child: ["🌟","🎈","🦋","🌱","🎠","🐢","🦊","🐸","🐧"],
  sibling: ["🚀","🎮","🎨","⚽","🎸","🦄","🌈"],
  grandparent: ["🌻","🌿","☕","📚","🧶"],
  caregiver: ["🤝","💙","🌸","🌿"],
  teacher: ["🏫","📚","✏️","🎓","🌍"],
  other: ["✨","🌙","⭐","🍃"],
};

const ROLE_COLORS = {
  parent:      "#3D6B7D",
  partner:     "#8B5E7A",
  child:       "#6A9E7B",
  sibling:     "#4A89DC",
  grandparent: "#C4785A",
  caregiver:   "#6B8E6B",
  teacher:     "#1A4A5C",
  other:       "#8A8A8A",
};

function uid() { return Math.random().toString(36).slice(2,10); }

const DEFAULT_MEMBER = {
  id: "", name: "", role: "child", emoji: "🌟",
  color: ROLE_COLORS.child, pin: "", msFlag: false,
};

export default function Enrollment({ onComplete }) {
  const [step, setStep] = useState(0); // 0=welcome 1=name/lang 2=members 3=done
  const [appName, setAppName] = useState("");
  const [lang, setLang] = useState("en");
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null); // member being added/edited
  const [showForm, setShowForm] = useState(false);

  const t = getT(lang);

  /* ── Member form ─────────────────────────────────── */
  const openNew = () => {
    setEditing({ ...DEFAULT_MEMBER, id: uid() });
    setShowForm(true);
  };

  const saveEditing = () => {
    if (!editing.name.trim()) return;
    setMembers(prev => {
      const exists = prev.find(m => m.id === editing.id);
      return exists
        ? prev.map(m => m.id === editing.id ? editing : m)
        : [...prev, editing];
    });
    setEditing(null);
    setShowForm(false);
  };

  const removeMember = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  const setField = (field, val) => {
    setEditing(prev => {
      const next = { ...prev, [field]: val };
      if (field === "role") {
        next.color = ROLE_COLORS[val] || "#888";
        next.emoji = (ROLE_EMOJIS[val] || ["✨"])[0];
        if (!MS_ROLES.includes(val)) next.msFlag = false;
      }
      return next;
    });
  };

  /* ── Complete enrollment ─────────────────────────── */
  const finish = () => {
    onComplete({
      appName: appName.trim() || "Haven",
      language: lang,
      members,
      createdAt: new Date().toISOString(),
    });
  };

  /* ── Render steps ────────────────────────────────── */

  // Step 0: Welcome
  if (step === 0) return (
    <div className="screen" style={{ background: "linear-gradient(160deg, #3D6B7D 0%, #2C5162 50%, #3D6B7D 100%)", justifyContent: "center", alignItems: "center", gap: 24, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: "4rem", animation: "pulse 3s infinite" }}>🏡</div>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "2.4rem", fontWeight: 400, marginBottom: 12 }}>Haven</h1>
        <p style={{ color: "rgba(255,255,255,.75)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 300 }}>
          {t("welcomeSub")}
        </p>
      </div>
      <button className="btn" onClick={() => setStep(1)} style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,.3)", fontSize: "1rem", padding: "14px 32px", marginTop: 8 }}>
        Get started →
      </button>
    </div>
  );

  // Step 1: App name + language
  if (step === 1) return (
    <div className="screen">
      <div className="header" style={{ borderBottom: "none", background: "transparent" }}>
        <button className="back-btn" onClick={() => setStep(0)}>←</button>
        <span className="header-title">{t("enrollStep1")}</span>
      </div>
      <div className="content" style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28, paddingTop: 40 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✏️</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--primary)", marginBottom: 8 }}>{t("enrollStep1")}</h2>
          <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>{t("nameSub")}</p>
        </div>

        <div>
          <label>{t("appName")}</label>
          <input
            type="text"
            placeholder={t("namePlaceholder")}
            value={appName}
            onChange={e => setAppName(e.target.value)}
            style={{ fontSize: "1.1rem" }}
            maxLength={24}
          />
        </div>

        <div>
          <label>{t("chooseLang")}</label>
          <div style={{ display: "flex", gap: 12 }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className="btn"
                style={{
                  flex: 1,
                  background: lang === l.code ? "var(--primary)" : "var(--surface2)",
                  color: lang === l.code ? "#fff" : "var(--text)",
                  border: `1.5px solid ${lang === l.code ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setStep(2)}>
          {t("next")} →
        </button>
      </div>
    </div>
  );

  // Step 2: Members
  if (step === 2) return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={() => setStep(1)}>←</button>
        <span className="header-title">{t("enrollStep2")}</span>
      </div>
      <div className="content" style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Member form overlay */}
        {showForm && editing && (
          <MemberForm
            member={editing}
            setField={setField}
            onSave={saveEditing}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            t={t}
            lang={lang}
          />
        )}

        {/* Members list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {members.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "36px 24px", color: "var(--muted)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>👨‍👩‍👧</div>
              <p style={{ fontSize: ".95rem" }}>{t("addFirst")}</p>
            </div>
          )}
          {members.map(m => (
            <div key={m.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
              <div style={{ fontSize: "2rem", width: 44, height: 44, background: m.color + "22", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {m.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{m.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span className="role-badge">{t(`roles.${m.role}`)}</span>
                  {m.msFlag && <span className="ms-badge">🔷 SM</span>}
                  {m.pin && <span className="role-badge">🔐 PIN</span>}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => removeMember(m.id)}>✕</button>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost" style={{ width: "100%", marginBottom: 16 }} onClick={openNew}>
          + {members.length === 0 ? t("addMember") : t("addAnother")}
        </button>

        {members.length > 0 && (
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setStep(3)}>
            {t("next")} →
          </button>
        )}
      </div>
    </div>
  );

  // Step 3: Done!
  return (
    <div className="screen" style={{ justifyContent: "center", alignItems: "center", gap: 24, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: "3.5rem", animation: "pulse 2s infinite" }}>🏡</div>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--primary)", marginBottom: 12 }}>
          {t("enrollDone")}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: ".95rem", maxWidth: 320, margin: "0 auto" }}>
          {t("enrollDoneSub")}
        </p>
      </div>
      {/* Mini preview */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 360 }}>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: "2rem", width: 48, height: 48, background: m.color + "22", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{m.emoji}</div>
            <span style={{ fontSize: ".75rem", color: "var(--muted)", fontWeight: 600 }}>{m.name}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }} onClick={finish}>
        {t("letsGo")}
      </button>
    </div>
  );
}

/* ── Member Form Component ───────────────────────────── */
function MemberForm({ member, setField, onSave, onCancel, t }) {
  const emojis = ROLE_EMOJIS[member.role] || ["✨","🌙","⭐"];
  const isTeacher = member.role === "teacher";
  const pinRequired = PIN_REQUIRED_ROLES.includes(member.role);
  const canMS = MS_ROLES.includes(member.role);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 520, borderRadius: "20px 20px 0 0", padding: "28px 24px", animation: "fadeUp .25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", fontSize: "1.2rem" }}>
            {t("addMember")}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label>{t("memberName")}</label>
          <input
            type="text"
            value={member.name}
            onChange={e => setField("name", e.target.value)}
            placeholder="e.g. Alice"
            autoFocus
            maxLength={32}
          />
        </div>

        {/* Role */}
        <div style={{ marginBottom: 16 }}>
          <label>{t("memberRole")}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setField("role", r)}
                className="btn btn-sm"
                style={{
                  background: member.role === r ? ROLE_COLORS[r] : "var(--surface2)",
                  color: member.role === r ? "#fff" : "var(--text)",
                  border: `1.5px solid ${member.role === r ? ROLE_COLORS[r] : "var(--border)"}`,
                }}
              >
                {t(`roles.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji */}
        <div style={{ marginBottom: 16 }}>
          <label>{t("memberEmoji")}</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {emojis.map(e => (
              <button
                key={e}
                onClick={() => setField("emoji", e)}
                style={{
                  width: 42, height: 42, fontSize: "1.5rem",
                  borderRadius: "50%", border: `2px solid ${member.emoji === e ? "var(--primary)" : "var(--border)"}`,
                  background: member.emoji === e ? "var(--primary) + 22" : "var(--surface2)",
                  cursor: "pointer",
                }}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Teacher consent notice */}
        {isTeacher && (
          <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "#1A4A5C11", border: "1.5px solid #1A4A5C44", marginBottom: 16 }}>
            <p style={{ fontSize: ".82rem", color: "#1A4A5C", lineHeight: 1.6 }}>
              🏫 {t("teacherConsentNote")}
            </p>
          </div>
        )}

        {/* PIN */}
        <div style={{ marginBottom: 16 }}>
          <label>{t("memberPin")}{pinRequired ? " *" : ""}</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="- - - -"
            value={member.pin}
            onChange={e => setField("pin", e.target.value.replace(/\D/g, "").slice(0,4))}
            style={{ letterSpacing: "0.5em", fontSize: "1.1rem", borderColor: pinRequired && !member.pin ? "#E8A838" : undefined }}
          />
          <p style={{ color: pinRequired ? "#E8A838" : "var(--muted)", fontSize: ".8rem", marginTop: 4, fontWeight: pinRequired ? 600 : 400 }}>
            {pinRequired ? t("teacherPinRequired") : t("memberPinHint")}
          </p>
        </div>

        {/* MS Flag */}
        {canMS && (
          <div
            onClick={() => setField("msFlag", !member.msFlag)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "14px 16px", borderRadius: "var(--radius-sm)",
              border: `2px solid ${member.msFlag ? "var(--ms)" : "var(--border)"}`,
              background: member.msFlag ? "#9B7BB811" : "var(--surface2)",
              cursor: "pointer", marginBottom: 20,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              border: `2px solid ${member.msFlag ? "var(--ms)" : "var(--border)"}`,
              background: member.msFlag ? "var(--ms)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1,
            }}>
              {member.msFlag && <span style={{ color: "#fff", fontSize: ".8rem" }}>✓</span>}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: ".95rem" }}>🔷 {t("msFlag")}</div>
              <div style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 3 }}>{t("msFlagHint")}</div>
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={onSave}
          disabled={!member.name.trim() || (pinRequired && member.pin.length !== 4)}
        >
          {t("save")} ✓
        </button>
      </div>
    </div>
  );
}
