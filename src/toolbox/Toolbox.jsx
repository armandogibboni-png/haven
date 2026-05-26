import React, { useState } from "react";
import { getT } from "../i18n.js";
import EmotionCheckin from "./EmotionCheckin.jsx";
import AACBoard from "./AACBoard.jsx";
import MyVictories from "./MyVictories.jsx";

const PARENT_TOOLS = [
  { id: "exposure", emoji: "📈", key: "exposureScale" },
  { id: "weekly",   emoji: "📅", key: "weeklyCheckin" },
  { id: "diary",    emoji: "📓", key: "progressDiary" },
];

const CHILD_TOOLS_BASE = [
  { id: "emotion",   emoji: "💭", key: "emotionCheckin",  component: "EmotionCheckin" },
  { id: "victories", emoji: "🌟", key: "myVictories",     component: "MyVictories" },
];

const CHILD_TOOLS_MS = [
  { id: "emotion",   emoji: "💭", key: "emotionCheckin",  component: "EmotionCheckin" },
  { id: "aac",       emoji: "🔊", key: "aacBoard",        component: "AACBoard" },
  { id: "victories", emoji: "🌟", key: "myVictories",     component: "MyVictories" },
];

const PARENT_ROLES = ["parent","partner","caregiver","grandparent"];

export default function Toolbox({ member, family, onBack }) {
  const t = getT(family?.language || "en");
  const [activeTool, setActiveTool] = useState(null);
  const isParent = PARENT_ROLES.includes(member.role);
  const tools = isParent
    ? PARENT_TOOLS
    : (member.msFlag ? CHILD_TOOLS_MS : CHILD_TOOLS_BASE);

  if (activeTool === "EmotionCheckin") {
    return <EmotionCheckin member={member} family={family} onBack={() => setActiveTool(null)} />;
  }
  if (activeTool === "AACBoard") {
    return <AACBoard member={member} family={family} onBack={() => setActiveTool(null)} />;
  }
  if (activeTool === "MyVictories") {
    return <MyVictories member={member} family={family} onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div style={{ fontSize: "1.2rem" }}>{member.emoji}</div>
        <span className="header-title">{isParent ? t("toolboxParent") : t("toolboxChild")}</span>
      </div>

      <div className="content" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => tool.component ? setActiveTool(tool.component) : null}
              className="card"
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "18px 20px", textAlign: "left",
                cursor: tool.component ? "pointer" : "default",
                border: "1.5px solid var(--border)",
                transition: "transform .1s, box-shadow .1s",
                width: "100%",
                opacity: tool.component ? 1 : 0.6,
              }}
              onMouseOver={e => { if (tool.component) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}}
              onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: (member.color || "var(--primary)") + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", flexShrink: 0,
              }}>
                {tool.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{t(tool.key)}</div>
                {!tool.component && (
                  <div style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: 2 }}>Coming soon</div>
                )}
              </div>
              {tool.component && <div style={{ marginLeft: "auto", color: "var(--muted)" }}>→</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
