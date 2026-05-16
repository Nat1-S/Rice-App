export type Locale = "he" | "en"

export type ScoreTierKey = "high" | "medium" | "low"

export type Dictionary = {
  meta: {
    appName: string
    tagline: string
    defaultDescription: string
  }
  nav: {
    ricePrinciples: string
    calculator: string
    list: string
    dashboard: string
    openMenu: string
  }
  language: {
    label: string
    he: string
    en: string
  }
  auth: {
    loginTitle: string
    loginSubtitle: string
    signInGoogle: string
    signingIn: string
    signOut: string
    guardTitle: string
    guardSubtitle: string
    authError: string
    notConfigured: string
  }
  common: {
    loading: string
    save: string
    saving: string
    close: string
    calculate: string
    months: string
    score: string
    name: string
    actions: string
    edit: string
    delete: string
    confirmDelete: string
    saveChanges: string
    networkError: string
    deleteFailed: string
    updateFailed: string
  }
  scoreTier: Record<
    ScoreTierKey,
    { label: string; description: string; emoji: string }
  >
  impactLabels: Record<string, string>
  calculator: {
    title: string
    subtitle: string
    ideaDetails: string
    ideaName: string
    ideaPlaceholder: string
    reach: string
    reachHint: string
    impact: string
    confidence: string
    confidenceHint: string
    effort: string
    previewFormula: string
    resultTitle: string
    thresholds: string
    savedToList: string
    saveFailed: string
    saveFailedHint: string
    saveToList: string
    missingNameOrScore: string
    notSignedIn: string
    envHint: string
    rlsHint: string
  }
  list: {
    title: string
    subtitle: string
    rank: string
    ideaName: string
    empty: string
    quickEdit: string
    notConfiguredTitle: string
    notConfiguredBody: string
    reachLabel: string
    impact: string
    confidencePercent: string
    effortPersonMonths: string
  }
  dashboard: {
    title: string
    subtitle: string
    notConfigured: string
    totalIdeas: string
    topPromise: string
    avgConfidence: string
    avgConfidenceHint: string
    valueEffortTitle: string
    valueEffortDesc: string
    distributionTitle: string
    distributionDesc: string
    barHigh: string
    barMedium: string
    barLow: string
    noData: string
    scoreLabel: string
    effortAxis: string
    valueAxis: string
    ideasCount: string
    quadrants: {
      quickWins: string
      bigBets: string
      fillIns: string
      timeWasters: string
    }
    confidenceDistTitle: string
    confidenceDistDesc: string
    confidenceDistMicrocopy: string
    roiTitle: string
    roiDesc: string
    roiMicrocopy: string
    roiAxis: string
    confidenceBuckets: {
      b100: string
      b80: string
      b50: string
      bLow: string
    }
    summary: {
      title: string
      titleBasis: string
      empty: string
      quickWin: string
      riskyOne: string
      riskyMany: string
      confidenceBias: string
      bigBet: string
      balanced: string
      balancedClosing: string
    }
  }
  principles: {
    title: string
    intro: string
    reach: {
      title: string
      what: string
      normalize: string
      q1: string
      q2: string
      q3: string
    }
    impact: {
      title: string
      what: string
      normalize: string
      q1: string
      q2: string
      q3: string
    }
    confidence: {
      title: string
      what: string
      normalize: string
      q1: string
      q2: string
      q3: string
    }
    effort: {
      title: string
      what: string
      normalize: string
      q1: string
      q2: string
      q3: string
    }
    formula: {
      title: string
      rawIntro: string
      codeRaw: string
      displayIntro: string
      codeRounded: string
      tiersIntro: string
      tierLow: string
      tierMedium: string
      tierHigh: string
      guidingQuestions: string
      whatIs: string
      normalizeInApp: string
    }
  }
}
