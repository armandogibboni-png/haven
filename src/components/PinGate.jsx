import React, { useState, useRef, useEffect } from "react";
import { getT } from "../i18n.js";

export default function PinGate({ member, family, onSuccess, onCancel }) {
  const t = getT(family?.language || "en");
  const [digits, setDigits] = useState(["","","",""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleKey = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError(false);
    if (val && i < 3) refs[i+1].current?.focus();
    if (next.every(d => d !== "")) {
      const pin = next.join("");
      setTimeout(() => {
        if (pin === member.pin) { onSuccess(); }
        else {
          setShake(true);
          setTimeout(() => { setShake(false); setDigits(["","","",""]); refs[0].current?.focus(); }, 600);
          setError(true);
        }
      }, 150);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i-1].current?.focus();
  };

  return (
    <div className="screen" style={{
      justifyContent: "center", alignItems: "center",
      background: "linear-gradient(160deg, #F8F5F0 0%, #EDE8E0 100%)",
      padding: 32, gap: 28
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: (member.color || "#3D6B7D") + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.2rem", margin: "0 auto 16px"
        }}>
          {member.emoji || "🔐"}
        </div>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>{t("pinPrompt")}</p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--primary)", fontSize: "1.6rem", marginTop: 4 }}>
          {member.name}
        </h2>
      </div>

      <div style={{ display: "flex", gap: 12, animation: shake ? "shake .5s" : "none" }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleKey(i, e.target.value.slice(-1))}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 52, height: 64, textAlign: "center",
              fontSize: "1.6rem", fontWeight: 700,
              borderRadius: 12, border: `2px solid ${error ? "#E57373" : d ? "var(--primary)" : "var(--border)"}`,
              background: d ? "var(--primary)11" : "var(--surface)",
              color: "var(--text)", letterSpacing: 0,
            }}
          />
        ))}
      </div>

      {error && (
        <p style={{ color: "#E57373", fontSize: ".9rem", fontWeight: 600 }}>
          {t("wrongPin")} 🔒
        </p>
      )}

      <button className="btn btn-ghost" onClick={onCancel} style={{ marginTop: 8 }}>
        ← {t("cancel")}
      </button>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}
