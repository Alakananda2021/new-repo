import type { ParsedStep, StepCategory } from "./flowParser";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BacklogCategory = "accessibility" | "ai-journey" | "ai-permissions" | "gap";
export type Severity = "high" | "medium" | "low";

export interface BacklogItem {
  id: string;
  category: BacklogCategory;
  title: string;
  description: string;
  why: string;
  score: number;
  severity: Severity;
  impact: number;
  confidence: number;
  ease: number;
  stepIndex?: number;
  stepName?: string;
}

interface FindingDef {
  title: string;
  description: (subject: string) => string;
  why: string;
  impact: number; // 1-5, how much this affects users/legal risk/trust if left unaddressed
  confidence: number; // 1-5, how sure we are this applies given the step's text
  ease: number; // 1-5, how straightforward this is to design/implement
}

// Weighted rather than multiplied — a pure Impact x Confidence x Ease
// (classic ICE) formula lets low "ease" silently bury high-risk items like
// a missing consent step just because it's harder to build. Impact carries
// the most weight here on purpose: this is a risk audit, not a feature
// prioritization backlog, so "hard to fix" shouldn't crowd out "must fix."
function score(impact: number, confidence: number, ease: number): number {
  return Math.round(((impact * 0.5 + confidence * 0.3 + ease * 0.2) / 5) * 100);
}

function severityFromScore(s: number): Severity {
  if (s >= 70) return "high";
  if (s >= 45) return "medium";
  return "low";
}

let idCounter = 0;
function makeItem(
  category: BacklogCategory,
  def: FindingDef,
  subject: string,
  stepIndex?: number,
  stepName?: string
): BacklogItem {
  const s = score(def.impact, def.confidence, def.ease);
  idCounter += 1;
  return {
    id: `${category}-${idCounter}`,
    category,
    title: def.title,
    description: def.description(subject),
    why: def.why,
    score: s,
    severity: severityFromScore(s),
    impact: def.impact,
    confidence: def.confidence,
    ease: def.ease,
    stepIndex,
    stepName,
  };
}

// ─── Accessibility: WCAG-grounded, mapped to the step's UI pattern ────────────

const FORM_CATEGORIES: StepCategory[] = [
  "auth-signup", "auth-login", "email-verify", "profile-edit",
  "schedule", "commerce-checkout", "commerce-subscribe", "invite",
];
const UPLOAD_CATEGORIES: StepCategory[] = ["upload-media", "upload-file"];
const CONFIRM_CATEGORIES: StepCategory[] = ["content-create", "content-delete"];
const LIVE_REGION_CATEGORIES: StepCategory[] = [
  "social-post", "social-comment", "social-react", "messaging", "commerce-cart",
];

const A11Y_FORM: FindingDef[] = [
  {
    title: "Form errors may not be announced to screen readers",
    description: () => "Validation errors on this step need to be exposed via aria-live or role=\"alert\" so screen reader users hear them, not just see them.",
    why: "WCAG 2.1 SC 4.1.3 (Status Messages, AA) requires status changes to be programmatically determinable without moving focus.",
    impact: 5, confidence: 5, ease: 4,
  },
  {
    title: "Labels may not be programmatically linked to inputs",
    description: () => "Every input on this step needs a <label for> (or aria-label) — a visually adjacent label isn't enough for assistive tech.",
    why: "WCAG 2.1 SC 1.3.1 (Info and Relationships, A) requires visual structure to also be conveyed in code.",
    impact: 5, confidence: 4, ease: 5,
  },
  {
    title: "Focus indicator may be too subtle for this step's inputs",
    description: () => "Keyboard users need a clearly visible focus state on every field and button here, not just a color shift.",
    why: "WCAG 2.1 SC 2.4.7 (Focus Visible, AA).",
    impact: 4, confidence: 3, ease: 4,
  },
];

const A11Y_UPLOAD: FindingDef[] = [
  {
    title: "Upload drop zone may not be keyboard accessible",
    description: () => "A drag-and-drop-only zone locks out keyboard and switch-device users — pair it with a real, focusable file input.",
    why: "WCAG 2.1 SC 2.1.1 (Keyboard, A) — drag-and-drop has no keyboard equivalent by default.",
    impact: 5, confidence: 5, ease: 3,
  },
  {
    title: "Upload progress and result may not be announced live",
    description: () => "Screen reader users need to hear \"uploading,\" \"uploaded,\" or the specific error — not just see a progress bar.",
    why: "WCAG 2.1 SC 4.1.3 (Status Messages, AA).",
    impact: 4, confidence: 5, ease: 4,
  },
];

const A11Y_CONFIRM: FindingDef[] = [
  {
    title: "Confirmation dialog may not trap keyboard focus",
    description: () => "Tab should cycle only within this dialog while it's open, not escape to the page behind it.",
    why: "WCAG 2.1 SC 2.4.3 (Focus Order) and SC 2.1.2 (No Keyboard Trap, A) — the dialog needs to contain focus without becoming an actual trap.",
    impact: 5, confidence: 4, ease: 3,
  },
  {
    title: "Focus may not return to the triggering element on close",
    description: () => "Closing this dialog should send keyboard focus back to whatever opened it, or users lose their place entirely.",
    why: "Standard modal accessibility pattern (WAI-ARIA Authoring Practices) — confirmed as a common failure point in accessibility audits.",
    impact: 4, confidence: 3, ease: 4,
  },
];

const A11Y_SEARCH: FindingDef[] = [
  {
    title: "Search result count may not be announced",
    description: () => "\"12 results found\" or \"no results\" needs to reach screen reader users the moment results update, via a live region.",
    why: "WCAG 2.1 SC 4.1.3 (Status Messages, AA).",
    impact: 4, confidence: 5, ease: 4,
  },
];

const A11Y_NAV: FindingDef[] = [
  {
    title: "Page or view transitions may not be announced",
    description: () => "When this step navigates somewhere new, screen reader users need to hear where they landed.",
    why: "Common SPA accessibility gap — route changes update the DOM without a corresponding announcement.",
    impact: 4, confidence: 3, ease: 3,
  },
  {
    title: "No skip link to bypass repeated navigation",
    description: () => "Keyboard users re-tab through the same nav on every page unless there's a skip-to-content link.",
    why: "WCAG 2.1 SC 2.4.1 (Bypass Blocks, A).",
    impact: 3, confidence: 3, ease: 5,
  },
];

const A11Y_LIVE_REGION: FindingDef[] = [
  {
    title: "New content on this step may not be announced",
    description: (subject) => `New ${subject} appearing here should be exposed via a live region so screen reader users know something changed.`,
    why: "WCAG 2.1 SC 4.1.3 (Status Messages, AA).",
    impact: 4, confidence: 4, ease: 4,
  },
];

const A11Y_GENERIC: FindingDef[] = [
  {
    title: "Color contrast on this step hasn't been verified",
    description: () => "Check text and interactive elements here against a 4.5:1 (text) / 3:1 (large text, icons, borders) contrast ratio.",
    why: "WCAG 2.1 SC 1.4.3 (Contrast Minimum, AA) — flagged generically since this step's pattern wasn't specific enough to target a known issue.",
    impact: 4, confidence: 1, ease: 3,
  },
];

function accessibilityFindingsFor(category: StepCategory): FindingDef[] {
  if (FORM_CATEGORIES.includes(category)) return A11Y_FORM;
  if (UPLOAD_CATEGORIES.includes(category)) return A11Y_UPLOAD;
  if (CONFIRM_CATEGORIES.includes(category)) return A11Y_CONFIRM;
  if (category === "search") return A11Y_SEARCH;
  if (category === "navigation") return A11Y_NAV;
  if (LIVE_REGION_CATEGORIES.includes(category)) return A11Y_LIVE_REGION;
  return A11Y_GENERIC;
}

// ─── AI relevance detection ────────────────────────────────────────────────────

const AI_PATTERN = /\b(ai|artificial intelligence|assistant|chatbot|chat bot|recommend(?:ation|s|ed)?|suggest(?:ion|s|ed)?|predict(?:ion|s|ed)?|generat(?:e|es|ed|ion)|summari[sz](?:e|es|ation)?|analy[sz]e[sd]?|personali[sz](?:e|ed|ation)|smart|auto-?complete|machine learning|\bml\b|algorithm)\b/i;

const SENSITIVE_DATA_PATTERN = /\b(photo|image|picture|selfie|document|file|message|chat|location|health|medical|financial|payment|contacts?|camera|microphone|voice|recording|personal|biometric|face|data)\b/i;

const CONSENT_PATTERN = /\b(consent|permission|allow|agree|opt-?in)\b/i;
const FAILURE_PATTERN = /\b(fail|error|timeout|retry|unavailable|fallback|down|outage)\b/i;

function isAIRelevant(text: string): boolean {
  return AI_PATTERN.test(text);
}
function hasSensitiveData(text: string): boolean {
  return SENSITIVE_DATA_PATTERN.test(text);
}

// ─── AI Journey: Microsoft HAX / Google PAIR-grounded ─────────────────────────

const AI_JOURNEY_FINDINGS: FindingDef[] = [
  {
    title: "No visible processing state while the AI works",
    description: (subject) => `${subject} isn't instant — users need to see the system is working, not wonder if it froze.`,
    why: "Microsoft HAX Guideline 1 (\"make clear what the system can do\") and basic system-status visibility — AI latency without feedback reads as a broken interaction.",
    impact: 4, confidence: 4, ease: 4,
  },
  {
    title: "No confidence or uncertainty signal on the AI's output",
    description: (subject) => `Nothing here tells the user how much to trust ${subject} — treat it as fact and treat it as a guess look identical.`,
    why: "Microsoft HAX Guideline 2 (\"make clear how well the system can do what it can do\") — calibrating trust is one of the most cited AI UX failure points.",
    impact: 4, confidence: 4, ease: 2,
  },
  {
    title: "No way to correct, dismiss, or give feedback on the AI's output",
    description: (subject) => `If ${subject} is wrong, there's no visible escape hatch or way to tell the system so.`,
    why: "Microsoft HAX Guidelines 8 and 11 (\"support efficient dismissal,\" \"support efficient correction\") and Google PAIR's feedback-loop pattern.",
    impact: 4, confidence: 4, ease: 3,
  },
  {
    title: "No explanation of why this result was shown",
    description: (subject) => `Users have no way to understand what drove ${subject} — a one-line reason goes a long way toward trust.`,
    why: "Google PAIR's explainability pattern and HAX Guideline 11 — unexplained AI output is a leading driver of user distrust.",
    impact: 3, confidence: 3, ease: 2,
  },
];

// ─── AI Permissions: privacy-led / consent UX ─────────────────────────────────

const AI_PERMISSIONS_FINDINGS: FindingDef[] = [
  {
    title: "No explicit consent captured before AI processes this data",
    description: (subject) => `${subject} appears to feed user data to an AI system without a visible opt-in step first.`,
    why: "Privacy-led UX best practice (and GDPR/CPRA-style requirements) call for explicit, informed, specific consent before AI processing — not consent bundled into general terms.",
    impact: 5, confidence: 4, ease: 2,
  },
  {
    title: "No disclosure of what happens to this data",
    description: (subject) => `Users aren't told what ${subject} is used for, how long it's kept, or whether it trains a model.`,
    why: "Transparency is the top driver of user trust in AI features per current privacy-UX research — silence here reads as evasive even when the actual usage is benign.",
    impact: 5, confidence: 4, ease: 3,
  },
  {
    title: "No way to opt out or revoke access later",
    description: (subject) => `Consent for ${subject} looks like a one-time gate with no path back to review or withdraw it.`,
    why: "Modern consent UX treats permission as ongoing, not a one-time transaction — users need a way to revisit and revoke it.",
    impact: 4, confidence: 3, ease: 2,
  },
];

// ─── Flow-level gap suggestions ────────────────────────────────────────────────

const GAP_DEFS = {
  missingConsent: {
    title: "No consent step anywhere before AI touches sensitive data",
    description: () => "The flow uses AI on sensitive data but never has a dedicated step asking permission first.",
    why: "This is a structural gap, not just a missing UI detail — flagged separately from the per-step permissions findings above because it means no step in the flow is designed to do this job at all.",
    impact: 5, confidence: 4, ease: 2,
  },
  missingFailureRecovery: {
    title: "No step handles the AI failing or being unavailable",
    description: () => "Every step in this flow assumes the AI succeeds — nothing describes what happens on timeout, error, or outage.",
    why: "Microsoft HAX Guideline 8 (\"support efficient dismissal\") and general resilience design — AI services fail more often than typical CRUD operations and need an explicit fallback path.",
    impact: 4, confidence: 3, ease: 2,
  },
  missingOnboarding: {
    title: "No step sets expectations for what the AI can and can't do",
    description: () => "Users are dropped into an AI feature with no framing of its scope or limitations up front.",
    why: "Microsoft HAX Guideline 1 — the very first HAX guideline is setting accurate expectations before the user relies on the system.",
    impact: 3, confidence: 3, ease: 2,
  },
} satisfies Record<string, FindingDef>;

function buildGapSuggestions(steps: ParsedStep[]): BacklogItem[] {
  const allText = steps.map((s) => s.context).join(" ");
  const anyAIStep = steps.some((s) => isAIRelevant(s.context));
  if (!anyAIStep) return [];

  const gaps: BacklogItem[] = [];

  const anySensitive = steps.some((s) => isAIRelevant(s.context) && hasSensitiveData(s.context));
  if (anySensitive && !CONSENT_PATTERN.test(allText)) {
    gaps.push(makeItem("gap", GAP_DEFS.missingConsent, "the flow"));
  }
  if (!FAILURE_PATTERN.test(allText)) {
    gaps.push(makeItem("gap", GAP_DEFS.missingFailureRecovery, "the flow"));
  }
  const firstStepIsAI = steps.length > 0 && isAIRelevant(steps[0].context);
  if (!firstStepIsAI) {
    gaps.push(makeItem("gap", GAP_DEFS.missingOnboarding, "the flow"));
  }

  return gaps;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ExpandedAudit {
  accessibility: BacklogItem[];
  aiJourney: BacklogItem[];
  aiPermissions: BacklogItem[];
  gaps: BacklogItem[];
  all: BacklogItem[];
}

export function runExpandedAudit(steps: ParsedStep[]): ExpandedAudit {
  const accessibility: BacklogItem[] = [];
  const aiJourney: BacklogItem[] = [];
  const aiPermissions: BacklogItem[] = [];

  steps.forEach((step, i) => {
    const { context, info } = step;
    const subject = info.subject || "this";

    accessibilityFindingsFor(info.category).forEach((def) => {
      accessibility.push(makeItem("accessibility", def, subject, i, step.action));
    });

    if (isAIRelevant(context)) {
      AI_JOURNEY_FINDINGS.forEach((def) => {
        aiJourney.push(makeItem("ai-journey", def, subject, i, step.action));
      });

      if (hasSensitiveData(context)) {
        AI_PERMISSIONS_FINDINGS.forEach((def) => {
          aiPermissions.push(makeItem("ai-permissions", def, subject, i, step.action));
        });
      }
    }
  });

  const gaps = buildGapSuggestions(steps);

  const all = [...accessibility, ...aiJourney, ...aiPermissions, ...gaps].sort(
    (a, b) => b.score - a.score
  );

  return { accessibility, aiJourney, aiPermissions, gaps, all };
}
