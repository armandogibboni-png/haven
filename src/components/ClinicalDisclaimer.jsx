import React from "react";
import { getT } from "../i18n.js";

// Shown as a subtle banner below the chat header for clinical-adjacent roles.
// Bible v3: limits must be declared "in every clinical context".
// Does NOT show for child profiles.

const CLINICAL_ROLES = ["parent","partner","caregiver","teacher","grandparent"];

export default function ClinicalDisclaimer({ role, lang = "en" }) {
  if (!CLINICAL_ROLES.includes(role)) return null;
  const t = getT(lang);
  return (
    <div style={{
      background: "#1A4A5C0A",
      borderBottom: "1px solid var(--border)",
      padding: "5px 16px",
      textAlign: "center",
      fontSize: ".70rem",
      color: "var(--muted)",
      letterSpacing: ".01em",
    }}>
      {t("educationalOnly")}
    </div>
  );
}
