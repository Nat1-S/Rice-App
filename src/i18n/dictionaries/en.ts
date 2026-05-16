import type { Dictionary } from "../types"

export const en: Dictionary = {
  meta: {
    appName: "PriorityMaster",
    tagline: "RICE prioritization",
    defaultDescription: "RICE calculator, priority list, and insights dashboard",
  },
  nav: {
    ricePrinciples: "RICE principles",
    calculator: "RICE calculator",
    list: "Priority list",
    dashboard: "Insights dashboard",
    openMenu: "Open navigation menu",
  },
  language: {
    label: "Language",
    he: "עברית",
    en: "English",
  },
  auth: {
    loginTitle: "Sign in to PriorityMaster",
    loginSubtitle: "Sign in with Google to save and view only your own ideas.",
    signInGoogle: "Sign in with Google",
    signingIn: "Signing in…",
    signOut: "Sign out",
    guardTitle: "Sign-in required",
    guardSubtitle: "Sign in to access the calculator, list, and dashboard.",
    authError: "Sign-in failed. Please try again.",
    notConfigured: "Supabase is not configured (NEXT_PUBLIC_* env vars).",
  },
  common: {
    loading: "Loading…",
    save: "Save",
    saving: "Saving…",
    close: "Close",
    calculate: "Calculate",
    months: "months",
    score: "Score",
    name: "Name",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    confirmDelete:
      "Remove this idea from the list? (The dashboard will update automatically.)",
    saveChanges: "Save changes",
    networkError: "Network error",
    deleteFailed: "Delete failed",
    updateFailed: "Update failed",
  },
  scoreTier: {
    high: {
      label: "High",
      description: "Score 30+ — worth doing",
      emoji: "✅",
    },
    medium: {
      label: "Medium",
      description: "Score 11–29 — consider carefully",
      emoji: "🤔",
    },
    low: {
      label: "Low",
      description: "Score 1–10 — not now",
      emoji: "✖️",
    },
  },
  impactLabels: {
    "3": "Massive",
    "2": "High",
    "1": "Medium",
    "0.5": "Low",
    "0.25": "Minimal",
  },
  calculator: {
    title: "RICE calculator",
    subtitle:
      "Formula: (Reach × Impact × Confidence) ÷ Effort — Confidence is a decimal (e.g. 0.8 for 80%).",
    ideaDetails: "Idea details",
    ideaName: "Idea / feature name",
    ideaPlaceholder: "e.g. Slack integration",
    reach: "Reach",
    reachHint: "Left = niche ({min}), right = broad reach ({max}).",
    impact: "Impact",
    confidence: "Confidence",
    confidenceHint:
      "Left = low (0%), right = high (100%). Formula uses decimal (e.g. 80% → 0.8).",
    effort: "Effort (person-months)",
    previewFormula: "({reach} × {impact} × {confidence}) ÷ {effort} =",
    resultTitle: "RICE result",
    thresholds: "Thresholds: 1–10 low · 11–29 medium · 30+ high.",
    savedToList: "Saved to your priority list.",
    saveFailed:
      "Save failed — check connection, priorities table, and RLS in Supabase.",
    saveFailedHint:
      "Ensure you are signed in and RLS allows insert with user_id = auth.uid().",
    saveToList: "Save to list",
    missingNameOrScore: "Missing name or invalid score.",
    notSignedIn: "You must be signed in to save.",
    envHint:
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart npm run dev.",
    rlsHint: "Check authenticated RLS policies on the priorities table.",
  },
  list: {
    title: "Priority list",
    subtitle: "Saved ideas only, sorted by score (descending).",
    rank: "#",
    ideaName: "Idea name",
    empty: "No ideas yet. Calculate RICE on the home page and save to the list.",
    quickEdit: "Quick edit",
    notConfiguredTitle: "Priority list",
    notConfiguredBody:
      "No Supabase connection or you are not signed in. Sign in and set NEXT_PUBLIC_* in .env.local.",
    reachLabel: "Reach",
    impact: "Impact",
    confidencePercent: "Confidence (%)",
    effortPersonMonths: "Effort (person-months)",
  },
  dashboard: {
    title: "Insights dashboard",
    subtitle:
      "Discover what to build first — sharp insights for smarter prioritization.",
    notConfigured:
      "Add .env.local with Supabase keys and sign in to load data.",
    totalIdeas: "Total ideas",
    topPromise: "Top pick",
    avgConfidence: "Average confidence",
    avgConfidenceHint:
      "A lower average may mean prioritization relies more on assumptions than data.",
    valueEffortTitle: "Value vs Effort matrix",
    valueEffortDesc:
      "X: effort (person-months). Y: value (Reach × Impact × Confidence%). Quadrants split by median on each axis.",
    distributionTitle: "Priority distribution",
    distributionDesc:
      "Count by tier: 1–10 low, 11–29 medium, 30+ high.",
    barHigh: "High (30+)",
    barMedium: "Medium (11–29)",
    barLow: "Low (1–10)",
    noData: "No data to display.",
    scoreLabel: "Score",
    effortAxis: "Effort",
    valueAxis: "Value",
    ideasCount: "Ideas",
    quadrants: {
      quickWins: "Quick Wins",
      bigBets: "Big Bets",
      fillIns: "Fill-ins",
      timeWasters: "Time Wasters",
    },
    confidenceDistTitle: "Confidence distribution",
    confidenceDistDesc:
      "How many ideas fall into each confidence band — from 100% down to below 50%.",
    confidenceDistMicrocopy:
      "Shows how reliable your list is — whether the roadmap is evidence-based or mostly gut feel.",
    roiTitle: "ROI efficiency score",
    roiDesc:
      "Features ranked by Impact ÷ Effort — pure cost-benefit ratio (Reach excluded).",
    roiMicrocopy:
      "Isolates pure cost-benefit of features to spot Quick Wins without market-size bias.",
    roiAxis: "Impact ÷ Effort",
    confidenceBuckets: {
      b100: "100%",
      b80: "80–99%",
      b50: "50–79%",
      bLow: "Below 50%",
    },
    summary: {
      title: "Summary & recommendations",
      titleBasis: "(based on your list data)",
      empty: "No ideas yet — add items in the calculator to unlock insights.",
      quickWin:
        "Hot Quick Win: {name} with Impact/Effort ratio {roi} — prioritize before heavier projects.",
      riskyOne:
        "Warning: {name} has high effort (≥2 months) and low confidence (<50%) — validate assumptions before committing.",
      riskyMany:
        "{count} at-risk features (high effort + low confidence): {names} — run research or a POC before full build.",
      confidenceBias:
        "Confidence bias: {pct}% of ideas ({count}) at 100% confidence — consider lowering scores without supporting data.",
      bigBet:
        "Leading Big Bet: {name} (score {score}) — high impact and effort; consider splitting into MVP or phases.",
      balanced:
        "Your roadmap looks balanced — no major outliers in confidence, risk, or Quick Wins.",
      balancedClosing:
        "Overall the list is well balanced — keep updating confidence and effort as new data arrives.",
    },
  },
  principles: {
    title: "RICE principles",
    intro:
      "RICE balances reach, impact, confidence in your estimates, and engineering effort. Each component is explained below with guiding questions and how this app normalizes inputs.",
    reach: {
      title: "R — Reach",
      what: "How many relevant users (or teams / customers) the idea touches — a relative scale, not an absolute count.",
      normalize:
        "In this app: integer from {min} to {max}. {min} = small niche, {max} = all relevant users.",
      q1: "How many users will actually be affected if we ship this?",
      q2: "Everyone, most users, a narrow segment, or a tiny group?",
      q3: "Does “reach” mean our whole market or a subset inside the product?",
    },
    impact: {
      title: "I — Impact",
      what: "Strength of effect on metrics you care about (revenue, retention, NPS, performance, risk) if delivered.",
      normalize: "In this app: pick from fixed values (high to low in the control).",
      q1: "If this succeeds — what meaningfully changes for users or the business?",
      q2: "Nice-to-have or a daily-felt improvement?",
      q3: "What pain remains if we do not do it?",
    },
    confidence: {
      title: "C — Confidence",
      what: "How sure you are about Reach and Impact — backed by data and customer input vs gut feel.",
      normalize:
        "In this app: 0–100% in the UI. Formula uses decimal: percent ÷ 100 (e.g. 80% → 0.8).",
      q1: "Do we have data, experiments, or customer quotes supporting Reach/Impact?",
      q2: "How much is still unproven?",
      q3: "If we lower confidence — is the score still high enough to prioritize?",
    },
    effort: {
      title: "E — Effort",
      what: "Person-months to complete — engineering, design, QA, launch, and initial support.",
      normalize: "In this app: pick from fixed person-month values.",
      q1: "How many people for how long, given what we know today?",
      q2: "Dependencies on other teams or technical blockers?",
      q3: "MVP scope vs “fully done”?",
    },
    formula: {
      title: "Formula and final score",
      rawIntro: "Raw RICE score (before rounding) is the numerator divided by effort:",
      codeRaw: `Numerator = Reach × Impact × confidenceDecimal
rawScore = Numerator ÷ Effort

Where:
  Reach: integer between {reachMin} and {reachMax}
  Impact: one of {impactValues}
  confidenceDecimal = (confidence % in UI) ÷ 100
  Effort: one of {effortValues} person-months`,
      displayIntro: "Displayed and stored score: rounded to one decimal place.",
      codeRounded: "score = round(rawScore × 10) / 10",
      tiersIntro: "UI tiers (labels only, not the math):",
      tierLow: "1–10 — low (✖️)",
      tierMedium: "11–29 — medium (🤔)",
      tierHigh: "30+ — high (✅, confetti in calculator)",
      guidingQuestions: "Guiding questions:",
      whatIs: "What it is:",
      normalizeInApp: "In this app:",
    },
  },
}
