// Haven Engagement Metrics
// Privacy-by-design: aggregate counts only, no PII, no content, no identifiers
// All data stays in localStorage. Never sent to any server.
// GDPR: Art. 5(1)(e) — storage limitation; Art. 5(1)(c) — data minimisation

const METRICS_KEY = "haven_metrics_v1";

function load() {
  try { return JSON.parse(localStorage.getItem(METRICS_KEY) || "{}"); } catch { return {}; }
}
function save(data) {
  try { localStorage.setItem(METRICS_KEY, JSON.stringify(data)); } catch {}
}

// ── Core increment helper ─────────────────────────────────
function inc(path, amount = 1) {
  const d = load();
  const keys = path.split(".");
  let obj = d;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  const last = keys[keys.length - 1];
  obj[last] = (obj[last] || 0) + amount;
  save(d);
}

// ── ISO week key (YYYY-Www) ───────────────────────────────
function weekKey() {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2,"0")}`;
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ── Public tracking functions ─────────────────────────────

// Record a chat session (role only, no content)
export function trackChatSession(role) {
  const w = weekKey();
  inc(`chat.sessions.${w}`);
  inc(`chat.byRole.${role}.${w}`);
  inc(`chat.totalSessions`);
}

// Record a SEN Plan feedback entry
export function trackFeedbackEntry(role, studentIndex) {
  // studentIndex is 0,1,2... — no name, no ID
  const w = weekKey();
  inc(`senPlan.feedbackEntries.${w}`);
  inc(`senPlan.byRole.${role}.${w}`);
  inc(`senPlan.totalEntries`);
}

// Record goal created
export function trackGoalCreated(area) {
  inc(`senPlan.goals.created.${area}`);
  inc(`senPlan.goals.totalCreated`);
}

// Record goal status change
export function trackGoalStatusChange(toStatus) {
  inc(`senPlan.goals.statusChange.${toStatus}`);
  if (toStatus === "achieved") inc(`senPlan.goals.totalAchieved`);
}

// Record revision proposed / responded
export function trackRevision(action) { // "proposed" | "approved" | "rejected"
  inc(`senPlan.revisions.${action}`);
}

// Record SMQ completion
export function trackSMQ(type) { // "pre" | "post"
  inc(`smq.completions.${type}`);
  inc(`smq.total`);
}

// Record module opened (no content, just which module)
export function trackModuleOpen(module) {
  const w = weekKey();
  inc(`modules.${module}.${w}`);
  inc(`modules.${module}.total`);
}

// Record emotion check-in completed (no emotion data — count only)
export function trackEmotionCheckin() {
  inc(`checkins.emotion.${weekKey()}`);
  inc(`checkins.emotion.total`);
}

// Record victory logged
export function trackVictory() {
  inc(`victories.${weekKey()}`);
  inc(`victories.total`);
}

// Record inactivity prompt shown
export function trackInactivityPrompt(role) {
  inc(`inactivity.promptsShown.${role}`);
}

// Record last activity timestamp per role (aggregate — no identity link)
export function touchLastActivity(role) {
  const d = load();
  if (!d.lastActivity) d.lastActivity = {};
  d.lastActivity[role] = new Date().toISOString();
  save(d);
}

export function getLastActivity(role) {
  return load()?.lastActivity?.[role] || null;
}

// ── Fidelity calculation ──────────────────────────────────
// Fidelity = % of weeks with >= minObs observations from BOTH teacher and parent
export function getFidelityScore(studentCount = 1) {
  const d = load();
  const teacherWeeks = d?.senPlan?.byRole?.teacher || {};
  const parentWeeks  = {};
  for (const role of ["parent","partner","caregiver"]) {
    const rw = d?.senPlan?.byRole?.[role] || {};
    for (const [w, n] of Object.entries(rw)) {
      parentWeeks[w] = (parentWeeks[w] || 0) + n;
    }
  }
  const allWeeks = new Set([...Object.keys(teacherWeeks), ...Object.keys(parentWeeks)]);
  if (allWeeks.size === 0) return null;
  let compliant = 0;
  for (const w of allWeeks) {
    const tObs = teacherWeeks[w] || 0;
    const pObs = parentWeeks[w] || 0;
    if (tObs >= studentCount && pObs >= 1) compliant++;
  }
  return Math.round((compliant / allWeeks.size) * 100);
}

// ── Summary report ────────────────────────────────────────
export function getMetricsSummary() {
  const d = load();
  const w = weekKey();
  return {
    thisWeek: {
      chatSessions:    d?.chat?.sessions?.[w] || 0,
      feedbackEntries: d?.senPlan?.feedbackEntries?.[w] || 0,
      teacherObs:      d?.senPlan?.byRole?.teacher?.[w] || 0,
      emotionCheckins: d?.checkins?.emotion?.[w] || 0,
      victories:       d?.victories?.[w] || 0,
    },
    allTime: {
      totalChatSessions: d?.chat?.totalSessions || 0,
      totalFeedback:     d?.senPlan?.totalEntries || 0,
      goalsCreated:      d?.senPlan?.goals?.totalCreated || 0,
      goalsAchieved:     d?.senPlan?.goals?.totalAchieved || 0,
      smqCompleted:      d?.smq?.total || 0,
      revisionsProposed: d?.senPlan?.revisions?.proposed || 0,
      revisionsApproved: d?.senPlan?.revisions?.approved || 0,
    },
    fidelity: getFidelityScore(),
  };
}

export function clearMetrics() {
  localStorage.removeItem(METRICS_KEY);
}
