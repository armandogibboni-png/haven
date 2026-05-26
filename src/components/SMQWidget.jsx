// SMQ — Selective Mutism Questionnaire (Bergman et al., 2008)
// 10-item parent-report measure of SM symptom severity
// Scale: 0=Never, 1=Rarely, 2=Sometimes, 3=Often, 4=Always
// Higher = more severe symptoms
// Validated, freely available for clinical/research use

import React, { useState, useEffect } from "react";

const SMQ_KEY = "haven_smq_v1";

const SMQ_ITEMS_EN = [
  "Talks with family members at home",
  "Talks with friends when at home",
  "Talks with relatives (e.g. grandparents, aunts/uncles)",
  "Talks with teachers at school",
  "Talks with other children at school",
  "Talks with adults outside of home and school (e.g. at a shop, restaurant)",
  "Talks with children outside of home and school (e.g. on the playground, at a party)",
  "Talks when doing an activity with a friend (e.g. playing a game)",
  "Talks on the phone or video call with someone outside the family",
  "Talks spontaneously (without being asked) in a social situation outside the home",
];

const SMQ_ITEMS_IT = [
  "Parla con i familiari a casa",
  "Parla con gli amici quando è a casa",
  "Parla con i parenti (es. nonni, zii)",
  "Parla con gli insegnanti a scuola",
  "Parla con altri bambini a scuola",
  "Parla con adulti fuori da casa e scuola (es. negozio, ristorante)",
  "Parla con bambini fuori da casa e scuola (es. al parco, a una festa)",
  "Parla durante un'attività con un amico (es. giocando)",
  "Parla al telefono o in videochiamata con qualcuno fuori dalla famiglia",
  "Parla spontaneamente (senza essere chiesto) in una situazione sociale fuori casa",
];

const SCALE_EN = ["Never", "Rarely", "Sometimes", "Often", "Always"];
const SCALE_IT = ["Mai", "Raramente", "A volte", "Spesso", "Sempre"];

function loadSMQ() {
  try { return JSON.parse(localStorage.getItem(SMQ_KEY) || "{}"); } catch { return {}; }
}
function saveSMQ(data) { localStorage.setItem(SMQ_KEY, JSON.stringify(data)); }

function getSMQForChild(childId) {
  return loadSMQ()[childId] || { pre: null, post: null };
}
function setSMQForChild(childId, data) {
  const all = loadSMQ();
  all[childId] = data;
  saveSMQ(all);
}

export function getSMQScore(responses) {
  if (!responses || responses.length !== 10) return null;
  return responses.reduce((sum, v) => sum + v, 0);
}

export function getSMQSeverity(score, lang = "en") {
  const it = lang === "it";
  if (score === null) return null;
  if (score >= 35) return { label: it ? "Lieve" : "Mild", color: "#6A9E7B" };
  if (score >= 25) return { label: it ? "Moderato" : "Moderate", color: "#E8A838" };
  if (score >= 15) return { label: it ? "Severo" : "Severe", color: "#C4785A" };
  return { label: it ? "Molto severo" : "Very severe", color: "#B91C1C" };
}

export default function SMQWidget({ child, lang = "en", onBack }) {
  const it = lang === "it";
  const items = it ? SMQ_ITEMS_IT : SMQ_ITEMS_EN;
  const scale = it ? SCALE_IT : SCALE_EN;

  const [mode, setMode] = useState("overview"); // overview | form | results
  const [formType, setFormType] = useState("pre"); // pre | post
  const [responses, setResponses] = useState(Array(10).fill(null));
  const [saved, setSaved] = useState(getSMQForChild(child.id));

  useEffect(() => { setSaved(getSMQForChild(child.id)); }, [child.id]);

  const allAnswered = responses.every(r => r !== null);

  const saveForm = () => {
    const entry = {
      responses,
      score: getSMQScore(responses),
      completedAt: new Date().toISOString(),
      completedBy: "parent",
    };
    const current = getSMQForChild(child.id);
    const updated = { ...current, [formType]: entry };
    setSMQForChild(child.id, updated);
    setSaved(updated);
    setMode("results");
  };

  const preScore  = saved?.pre?.score  ?? null;
  const postScore = saved?.post?.score ?? null;
  const change    = preScore !== null && postScore !== null ? postScore - preScore : null;

  const preS  = getSMQSeverity(preScore, lang);
  const postS = getSMQSeverity(postScore, lang);

  if (mode === "form") return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={() => { setMode("overview"); setResponses(Array(10).fill(null)); }}>←</button>
        <div>
          <div className="header-title">SMQ — {child.name}</div>
          <div style={{ fontSize: ".7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            {formType === "pre" ? (it ? "Valutazione iniziale" : "Baseline (T0)") : (it ? "Valutazione finale" : "Follow-up (T1)")}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: ".8rem", color: "var(--muted)", fontWeight: 600 }}>
          {responses.filter(r => r !== null).length}/10
        </div>
      </div>

      <div className="content" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ background: "var(--surface2)", padding: "12px 16px", borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.6 }}>
          {it
            ? "Per ciascuna affermazione, indica quanto spesso tuo/a figlio/a parla. Rispondi pensando alle ultime 2 settimane."
            : "For each statement, indicate how often your child speaks. Answer based on the past 2 weeks."}
        </div>

        {items.map((item, i) => (
          <div key={i} className="card" style={{ marginBottom: 12, padding: "14px 16px" }}>
            <p style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12, lineHeight: 1.5 }}>
              <span style={{ color: "var(--muted)", marginRight: 8 }}>{i + 1}.</span>{item}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {scale.map((label, v) => (
                <button
                  key={v}
                  onClick={() => { const r = [...responses]; r[i] = v; setResponses(r); }}
                  className="btn btn-sm"
                  style={{
                    flex: 1, minWidth: 60,
                    background: responses[i] === v ? "#1A4A5C" : "var(--surface2)",
                    color: responses[i] === v ? "#fff" : "var(--text)",
                    border: `1.5px solid ${responses[i] === v ? "#1A4A5C" : "var(--border)"}`,
                    fontSize: ".75rem",
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        ))}

        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 8, marginBottom: 32 }}
          onClick={saveForm}
          disabled={!allAnswered}
        >
          {it ? "Salva valutazione ✓" : "Save assessment ✓"}
        </button>

        <div style={{ background: "var(--surface2)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: 32, fontSize: ".75rem", color: "var(--muted)", lineHeight: 1.5 }}>
          {it
            ? "SMQ — Bergman et al., 2008 (J Clin Child Adolesc Psychol). Questo strumento è a supporto del monitoraggio educativo. Non sostituisce una valutazione clinica professionale."
            : "SMQ — Bergman et al., 2008 (J Clin Child Adolesc Psychol). This tool supports educational monitoring. It does not replace professional clinical assessment."}
        </div>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="header-title">📊 SMQ — {child.name}</div>
      </div>

      <div className="content" style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Info box */}
        <div className="card" style={{ background: "#1A4A5C08", borderColor: "#1A4A5C33", marginBottom: 20 }}>
          <p style={{ fontSize: ".85rem", color: "var(--text)", lineHeight: 1.65 }}>
            <strong style={{ color: "#1A4A5C" }}>
              {it ? "Selective Mutism Questionnaire (SMQ)" : "Selective Mutism Questionnaire (SMQ)"}
            </strong><br />
            {it
              ? "Questionario validato in 10 domande (scala 0–4). Compilato dal genitore. Permette di confrontare la gravità dei sintomi di MS prima e dopo il piano educativo."
              : "Validated 10-item parent-report measure (0–4 scale). Compares SM symptom severity before and after the educational plan."}
          </p>
        </div>

        {/* Scores overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { key: "pre",  label: it ? "T0 — Baseline" : "T0 — Baseline", score: preScore,  sev: preS  },
            { key: "post", label: it ? "T1 — Follow-up" : "T1 — Follow-up", score: postScore, sev: postS },
          ].map(({ key, label, score, sev }) => (
            <div
              key={key}
              className="card"
              style={{ textAlign: "center", cursor: "pointer", borderColor: sev ? sev.color + "55" : "var(--border)" }}
              onClick={() => { setFormType(key); setResponses(Array(10).fill(null)); setMode("form"); }}
            >
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{label}</div>
              {score !== null ? (
                <>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: sev.color }}>{score}</div>
                  <div style={{ fontSize: ".78rem", fontWeight: 600, color: sev.color }}>{sev.label}</div>
                  <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: 4 }}>
                    {it ? "Tocca per ripetere" : "Tap to repeat"}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "1.5rem", color: "var(--muted)", marginBottom: 4 }}>—</div>
                  <div style={{ fontSize: ".8rem", color: "#1A4A5C", fontWeight: 600 }}>
                    + {it ? "Compila" : "Complete"}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Change summary */}
        {change !== null && (
          <div className="card" style={{
            textAlign: "center", marginBottom: 20,
            borderColor: change < 0 ? "#6A9E7B55" : change > 0 ? "#B91C1C55" : "var(--border)",
            background: change < 0 ? "#6A9E7B08" : change > 0 ? "#FEF2F2" : "var(--surface)",
          }}>
            <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>
              {it ? "Variazione T0→T1" : "Change T0→T1"}
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: change < 0 ? "#6A9E7B" : change > 0 ? "#B91C1C" : "var(--muted)" }}>
              {change > 0 ? "+" : ""}{change}
            </div>
            <div style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 4 }}>
              {change < -5 ? (it ? "Miglioramento significativo" : "Significant improvement")
                : change < 0 ? (it ? "Miglioramento" : "Improvement")
                : change === 0 ? (it ? "Nessun cambiamento" : "No change")
                : (it ? "Peggioramento — rivedere il piano" : "Worsening — review the plan")}
            </div>
          </div>
        )}

        <div style={{ fontSize: ".72rem", color: "var(--muted)", lineHeight: 1.6, padding: "0 4px 32px" }}>
          {it
            ? "⚠️ Lo SMQ è uno strumento di monitoraggio educativo. I punteggi non costituiscono diagnosi clinica. Per valutazione clinica rivolgersi a uno specialista."
            : "⚠️ The SMQ is an educational monitoring tool. Scores do not constitute clinical diagnosis. Refer to a specialist for clinical assessment."}
        </div>
      </div>
    </div>
  );
}
