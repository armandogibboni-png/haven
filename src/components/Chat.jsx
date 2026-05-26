import React, { useState, useRef, useEffect } from "react";
import { getT } from "../i18n.js";
import { buildSystemPrompt } from "../prompts.js";

const MODEL = "claude-sonnet-4-20250514";

export default function Chat({ member, family, onBack }) {
  const t = getT(family?.language || "en");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef();
  const inputRef = useRef();

  // Warm welcome on mount
  useEffect(() => {
    const welcome = getWelcome(member, family?.language || "en");
    setMessages([{ role: "assistant", content: welcome }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: buildSystemPrompt(member, family),
          messages: newHistory,
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || data.error);
      const reply = data.content?.[0]?.text || "…";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="screen">
      {/* Header */}
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: (member.color || "#3D6B7D") + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem",
        }}>
          {member.emoji}
        </div>
        <div>
          <div className="header-title">{member.name}</div>
          {member.msFlag && <span className="ms-badge" style={{ fontSize: ".65rem" }}>🔷 SM</span>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            animation: "fadeUp .2s ease",
          }}>
            {m.role === "assistant" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: (member.color || "#3D6B7D") + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", marginRight: 8, flexShrink: 0, marginTop: 4,
              }}>🏡</div>
            )}
            <div style={{
              maxWidth: "78%",
              padding: "10px 15px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? (member.color || "var(--primary)") : "var(--surface)",
              color: m.role === "user" ? "#fff" : "var(--text)",
              fontSize: ".93rem",
              lineHeight: 1.55,
              boxShadow: "var(--shadow)",
              border: m.role === "assistant" ? "1px solid var(--border)" : "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🏡</div>
            <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: "var(--surface)", borderRadius: "18px 18px 18px 4px", border: "1px solid var(--border)" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", animation: `bounce 1.2s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: "#FEE2E2", padding: "10px 14px", borderRadius: "var(--radius-sm)", color: "#B91C1C", fontSize: ".85rem" }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: 10, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={t("chatPlaceholder")}
          rows={1}
          style={{
            flex: 1, resize: "none", minHeight: 42, maxHeight: 120,
            overflowY: "auto", lineHeight: 1.4,
            borderRadius: 21, padding: "10px 16px",
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 42, height: 42, borderRadius: "50%",
            background: input.trim() && !loading ? (member.color || "var(--primary)") : "var(--border)",
            border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background .15s",
          }}
        >↑</button>
      </div>
    </div>
  );
}

function getWelcome(member, lang) {
  const it = lang === "it";
  const name = member.name;

  if (member.msFlag) {
    return it
      ? `Ciao ${name} 🌟\n\nQui sei sempre al sicuro. Non devi parlare se non vuoi — puoi anche solo leggere, o scrivere quando ti va.\n\nCome stai oggi?`
      : `Hi ${name} 🌟\n\nThis is your safe space. You don't have to talk if you don't want to — you can just read, or write whenever you feel like it.\n\nHow are you today?`;
  }
  if (member.role === "parent" || member.role === "partner" || member.role === "caregiver") {
    return it
      ? `Ciao ${name} 🏡\n\nSono qui per supportarti nel percorso con il mutismo selettivo. Puoi chiedermi strategie, risorse, o semplicemente parlare di come stai.\n\nCosa posso fare per te oggi?`
      : `Hi ${name} 🏡\n\nI'm here to support you on your selective mutism journey. Ask me about strategies, resources, or just talk about how you're doing.\n\nWhat can I help with today?`;
  }
  if (member.role === "grandparent") {
    return it
      ? `Ciao ${name} 🌻\n\nSono qui per aiutarti a capire e supportare il bambino/a con mutismo selettivo nella tua famiglia. Come posso aiutarti?`
      : `Hi ${name} 🌻\n\nI'm here to help you understand and support the child with selective mutism in your family. How can I help?`;
  }
  return it
    ? `Ciao ${name} 👋\n\nSono il tuo spazio Haven. Come posso aiutarti oggi?`
    : `Hi ${name} 👋\n\nThis is your Haven space. How can I help you today?`;
}
