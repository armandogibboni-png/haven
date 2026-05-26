import React from "react";
import { getT } from "../i18n.js";

const SECTIONS_EN = [
  {
    title: "Who we are",
    content: `Haven is an open-source application designed to support families navigating selective mutism. The app is operated by the individual or organisation who deployed this instance ("the Operator").\n\nThis Privacy Policy explains what data is collected, how it is used, and your rights under the General Data Protection Regulation (GDPR) and applicable law.`,
  },
  {
    title: "What data we process and where it is stored",
    content: `Haven is designed to keep your data on your device wherever possible.\n\n• Family setup (names, roles, emojis, PINs): stored only in your browser's localStorage. It never leaves your device and is not sent to any server.\n\n• Family Board notes: stored only in your browser's localStorage.\n\n• Emotion check-ins and Victories diary: stored only in your browser's localStorage.\n\n• AI chat messages: the text you type is sent to Anthropic, Inc. (USA) to generate a response. Anthropic processes this data under their own Privacy Policy (anthropic.com/privacy). Conversations are not stored on our servers.\n\nWe do not use cookies, analytics, tracking scripts, or advertising.`,
  },
  {
    title: "Legal basis for processing (GDPR Art. 6 & 9)",
    content: `Chat messages sent to the AI are processed on the basis of your explicit consent, given at first launch.\n\nAll other data (family setup, board, diary entries) is processed solely on your device under your control — it does not constitute "processing" by a controller under GDPR.\n\nBecause we process information that may relate to health (selective mutism), this falls under GDPR Art. 9 special category data. We rely on your explicit consent (Art. 9(2)(a)) for AI chat processing.`,
  },
  {
    title: "Data transfers outside the EU",
    content: `When you use the AI chat feature, your messages are transmitted to Anthropic, Inc., headquartered in the United States. This transfer is made on the basis of Anthropic's standard contractual clauses and their compliance with applicable data transfer mechanisms.\n\nNo other data is transferred outside your device.`,
  },
  {
    title: "Children and parental consent (GDPR Art. 8)",
    content: `Haven is designed for use by families, including children. Where a child under 16 years of age (or the age of digital consent in your country) uses the AI chat feature, we require that a parent or guardian provides consent on the child's behalf.\n\nThe consent screen presented at first launch must be completed by a parent or guardian for any child profile, especially profiles marked with the Selective Mutism (SM) flag.`,
  },
  {
    title: "Your rights under GDPR",
    content: `You have the following rights:\n\n• Right of access (Art. 15): all your data is in your browser's localStorage — you can inspect it at any time via browser developer tools.\n\n• Right to erasure (Art. 17): tap Settings → Reset all data to permanently delete everything stored locally.\n\n• Right to withdraw consent (Art. 7(3)): you can stop using the AI chat feature at any time. Withdrawing consent does not affect the lawfulness of processing already carried out.\n\n• Right to data portability (Art. 20): all local data is stored in JSON format in localStorage and can be exported manually.\n\n• Right to lodge a complaint: you may lodge a complaint with your national data protection authority (e.g. Garante in Italy, ICO in the UK, CNIL in France).`,
  },
  {
    title: "Data retention",
    content: `Local data (family setup, board, diary) is retained until you reset the app or clear your browser storage.\n\nChat messages sent to Anthropic are subject to Anthropic's own retention policy. We do not retain chat history on any server.`,
  },
  {
    title: "Security",
    content: `All data stored locally is protected by your device's security mechanisms. PIN protection is available for individual profiles.\n\nCommunication with Anthropic's API is encrypted in transit (TLS 1.2+).`,
  },
  {
    title: "Changes to this policy",
    content: `This policy may be updated when the app is updated. We will notify you of significant changes at next launch.`,
  },
  {
    title: "Contact",
    content: `For any privacy-related questions, please contact the Operator of this Haven instance. If you do not know who operates this instance, contact the person who shared the app with you.`,
  },
];

const SECTIONS_IT = [
  {
    title: "Chi siamo",
    content: `Haven è un'applicazione open-source progettata per supportare le famiglie che affrontano il mutismo selettivo. L'app è gestita dalla persona o dall'organizzazione che ha distribuito questa istanza ("l'Operatore").\n\nQuesta Informativa sulla Privacy spiega quali dati vengono raccolti, come vengono utilizzati e i tuoi diritti ai sensi del Regolamento Generale sulla Protezione dei Dati (GDPR) e della normativa applicabile.`,
  },
  {
    title: "Quali dati trattiamo e dove vengono conservati",
    content: `Haven è progettato per mantenere i tuoi dati sul tuo dispositivo ove possibile.\n\n• Configurazione famiglia (nomi, ruoli, emoji, PIN): conservati solo nel localStorage del tuo browser. Non escono mai dal tuo dispositivo e non vengono inviati ad alcun server.\n\n• Note della Bacheca famiglia: conservate solo nel localStorage del tuo browser.\n\n• Check-in emotivi e diario delle vittorie: conservati solo nel localStorage del tuo browser.\n\n• Messaggi della chat AI: il testo che scrivi viene inviato ad Anthropic, Inc. (USA) per generare una risposta. Anthropic tratta questi dati secondo la propria Informativa sulla Privacy (anthropic.com/privacy). Le conversazioni non vengono conservate sui nostri server.\n\nNon utilizziamo cookie, analytics, script di tracciamento o pubblicità.`,
  },
  {
    title: "Base giuridica del trattamento (GDPR Art. 6 e 9)",
    content: `I messaggi di chat inviati all'AI vengono trattati sulla base del tuo consenso esplicito, fornito al primo avvio.\n\nTutti gli altri dati (configurazione famiglia, bacheca, diario) vengono trattati esclusivamente sul tuo dispositivo sotto il tuo controllo — non costituiscono "trattamento" da parte di un titolare ai sensi del GDPR.\n\nPoiché trattiamo informazioni che possono riguardare la salute (mutismo selettivo), rientrano nelle categorie particolari di dati ex Art. 9 GDPR. Ci basiamo sul tuo consenso esplicito (Art. 9(2)(a)) per il trattamento tramite chat AI.`,
  },
  {
    title: "Trasferimenti di dati fuori dall'UE",
    content: `Quando utilizzi la funzione di chat AI, i tuoi messaggi vengono trasmessi ad Anthropic, Inc., con sede negli Stati Uniti. Il trasferimento avviene sulla base delle clausole contrattuali standard di Anthropic e della loro conformità ai meccanismi di trasferimento applicabili.\n\nNessun altro dato viene trasferito al di fuori del tuo dispositivo.`,
  },
  {
    title: "Bambini e consenso genitoriale (GDPR Art. 8)",
    content: `Haven è progettato per l'uso da parte delle famiglie, compresi i bambini. Laddove un minore di 16 anni (o l'età del consenso digitale nel tuo paese, 14 anni in Italia) utilizzi la funzione di chat AI, è necessario che un genitore o tutore fornisca il consenso per conto del minore.\n\nLa schermata di consenso presentata al primo avvio deve essere completata da un genitore o tutore per qualsiasi profilo bambino, in particolare i profili contrassegnati con il flag Mutismo Selettivo (SM).`,
  },
  {
    title: "I tuoi diritti ai sensi del GDPR",
    content: `Hai i seguenti diritti:\n\n• Diritto di accesso (Art. 15): tutti i tuoi dati si trovano nel localStorage del tuo browser — puoi ispezionarli in qualsiasi momento tramite gli strumenti per sviluppatori del browser.\n\n• Diritto alla cancellazione (Art. 17): tocca Impostazioni → Reimposta tutti i dati per eliminare definitivamente tutto ciò che è memorizzato localmente.\n\n• Diritto di revocare il consenso (Art. 7(3)): puoi smettere di utilizzare la funzione di chat AI in qualsiasi momento. La revoca del consenso non pregiudica la liceità del trattamento già effettuato.\n\n• Diritto alla portabilità dei dati (Art. 20): tutti i dati locali sono memorizzati in formato JSON nel localStorage e possono essere esportati manualmente.\n\n• Diritto di proporre reclamo: puoi presentare reclamo all'autorità nazionale di protezione dei dati (Garante per la protezione dei dati personali in Italia).`,
  },
  {
    title: "Conservazione dei dati",
    content: `I dati locali (configurazione famiglia, bacheca, diario) vengono conservati fino a quando non reimposti l'app o svuoti il localStorage del browser.\n\nI messaggi di chat inviati ad Anthropic sono soggetti alla politica di conservazione di Anthropic. Non conserviamo la cronologia delle chat su alcun server.`,
  },
  {
    title: "Sicurezza",
    content: `Tutti i dati conservati localmente sono protetti dai meccanismi di sicurezza del tuo dispositivo. La protezione tramite PIN è disponibile per i singoli profili.\n\nLa comunicazione con l'API di Anthropic è crittografata in transito (TLS 1.2+).`,
  },
  {
    title: "Modifiche alla presente informativa",
    content: `Questa informativa potrà essere aggiornata in occasione degli aggiornamenti dell'app. Ti informeremo delle modifiche significative al prossimo avvio.`,
  },
  {
    title: "Contatti",
    content: `Per qualsiasi domanda relativa alla privacy, contatta l'Operatore di questa istanza di Haven. Se non sai chi gestisce questa istanza, contatta la persona che ti ha condiviso l'app.`,
  },
];

export default function PrivacyPolicy({ lang = "en", onBack }) {
  const it = lang === "it";
  const sections = it ? SECTIONS_IT : SECTIONS_EN;
  const title = it ? "Informativa sulla Privacy" : "Privacy Policy";
  const lastUpdated = it ? "Ultimo aggiornamento: maggio 2025" : "Last updated: May 2025";

  return (
    <div className="screen">
      <div className="header">
        {onBack && <button className="back-btn" onClick={onBack}>←</button>}
        <span className="header-title">🔐 {title}</span>
      </div>
      <div className="content" style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 24 }}>{lastUpdated}</p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h3 style={{
              fontFamily: "var(--font-display)", color: "var(--primary)",
              fontSize: "1.05rem", marginBottom: 10,
            }}>
              {i + 1}. {s.title}
            </h3>
            <p style={{ fontSize: ".9rem", lineHeight: 1.75, color: "var(--text)", whiteSpace: "pre-line" }}>
              {s.content}
            </p>
          </div>
        ))}

        <div style={{
          background: "var(--surface2)", borderRadius: "var(--radius-sm)",
          padding: "16px 18px", marginBottom: 32,
          border: "1px solid var(--border)",
        }}>
          <p style={{ fontSize: ".82rem", color: "var(--muted)", lineHeight: 1.6 }}>
            {it
              ? "Haven è software open-source. Puoi ispezionare il codice sorgente su GitHub per verificare in modo indipendente come vengono trattati i dati."
              : "Haven is open-source software. You can inspect the source code on GitHub to independently verify how data is handled."}
          </p>
        </div>

        {onBack && (
          <button className="btn btn-ghost" style={{ width: "100%", marginBottom: 32 }} onClick={onBack}>
            ← {it ? "Torna indietro" : "Go back"}
          </button>
        )}
      </div>
    </div>
  );
}
