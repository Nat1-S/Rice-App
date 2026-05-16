import type { Dictionary } from "../types"

export const he: Dictionary = {
  meta: {
    appName: "PriorityMaster",
    tagline: "RICE ותעדוף",
    defaultDescription: "מחשבון RICE, רשימת תעדוף ודאשבורד תובנות",
  },
  nav: {
    ricePrinciples: "כללי ה-RICE",
    calculator: "מחשבון RICE",
    list: "רשימת תעדוף",
    dashboard: "דאשבורד תובנות",
    openMenu: "פתיחת תפריט ניווט",
  },
  language: {
    label: "שפה",
    he: "עברית",
    en: "English",
  },
  auth: {
    loginTitle: "התחברות ל-PriorityMaster",
    loginSubtitle: "התחברו עם Google כדי לשמור ולצפות ברעיונות שלכם בלבד.",
    signInGoogle: "התחברות באמצעות Google",
    signingIn: "מתחבר…",
    signOut: "התנתקות",
    guardTitle: "נדרשת התחברות",
    guardSubtitle: "התחברו כדי לגשת למחשבון, לרשימה ולדאשבורד.",
    authError: "ההתחברות נכשלה. נסו שוב.",
    notConfigured: "Supabase לא מוגדר (משתני NEXT_PUBLIC_*).",
  },
  common: {
    loading: "טוען…",
    save: "שמור",
    saving: "שומר…",
    close: "סגור",
    calculate: "חשב",
    months: "חודשים",
    score: "ציון",
    name: "שם",
    actions: "פעולות",
    edit: "עריכה",
    delete: "מחיקה",
    confirmDelete: "להסיר את הרעיון מהרשימה? (הדאשבורד יתעדכן אוטומטית)",
    saveChanges: "שמור שינויים",
    networkError: "שגיאת רשת",
    deleteFailed: "מחיקה נכשלה",
    updateFailed: "עדכון נכשל",
  },
  scoreTier: {
    high: {
      label: "גבוה",
      description: "ציון 30 ומעלה — כדאי לבצע",
      emoji: "✅",
    },
    medium: {
      label: "בינוני",
      description: "ציון 11–29 — לשקול",
      emoji: "🤔",
    },
    low: {
      label: "נמוך",
      description: "ציון 1–10 — לא לבצע כעת",
      emoji: "✖️",
    },
  },
  impactLabels: {
    "3": "עצום",
    "2": "גבוה",
    "1": "בינוני",
    "0.5": "נמוך",
    "0.25": "מזערי",
  },
  calculator: {
    title: "מחשבון RICE",
    subtitle:
      "נוסחה: (Reach × Impact × Confidence) ÷ Effort — כאשר Confidence הוא מספר עשרוני (למשל 0.8 ל־80%).",
    ideaDetails: "פרטי הרעיון",
    ideaName: "שם הרעיון / הפיצ'ר",
    ideaPlaceholder: "למשל: אינטגרציה ל-Slack",
    reach: "Reach (תפוצה)",
    reachHint: "שמאל = תפוצה רחבה ({max}), ימין = מיעוט ({min}).",
    impact: "Impact (השפעה)",
    confidence: "Confidence (ביטחון)",
    confidenceHint:
      "שמאל = ביטחון גבוה (100%), ימין = ביטחון נמוך (0%). בנוסחה משתמשים בעשרוני (למשל 80% → 0.8).",
    effort: "Effort (מאמץ, חודשי-אדם)",
    previewFormula: "({reach} × {impact} × {confidence}) ÷ {effort} =",
    resultTitle: "תוצאת RICE",
    thresholds: "ספים: 1–10 נמוך · 11–29 בינוני · 30 ומעלה גבוה.",
    savedToList: "נשמר ברשימת תעדוף.",
    saveFailed: "שמירה נכשלה — בדקו חיבור, טבלת priorities והרשאות (RLS) ב-Supabase.",
    saveFailedHint:
      "ודאו שאתם מחוברים ושמדיניות RLS מאפשרת insert עם user_id = auth.uid().",
    saveToList: "שמור לרשימה",
    missingNameOrScore: "חסר שם או ציון לא תקין.",
    notSignedIn: "יש להתחבר לפני שמירה.",
    envHint:
      "הגדירו NEXT_PUBLIC_SUPABASE_URL ו-NEXT_PUBLIC_SUPABASE_ANON_KEY ב-.env.local והפעילו מחדש את npm run dev.",
    rlsHint: "בדקו מדיניות RLS ל-authenticated על טבלת priorities.",
  },
  list: {
    title: "רשימת תעדוף",
    subtitle: "רק רעיונות שנשמרו. ממוין לפי ציון יורד.",
    rank: "מס׳",
    ideaName: "שם הרעיון",
    empty: "אין עדיין רעיונות. חשבו RICE בעמוד הבית ושמרו לרשימה.",
    quickEdit: "עריכה מהירה",
    notConfiguredTitle: "רשימת תעדוף",
    notConfiguredBody:
      "אין חיבור ל-Supabase או שאינכם מחוברים. התחברו והגדירו משתני NEXT_PUBLIC_* ב-.env.local.",
    reachLabel: "Reach",
    impact: "Impact (השפעה)",
    confidencePercent: "Confidence (%)",
    effortPersonMonths: "Effort (חודשי-אדם)",
  },
  dashboard: {
    title: "דאשבורד תובנות",
    subtitle:
      "גלו מה לעשות קודם — תובנות חדות לתעדוף חכם של כל הרעיונות שלכם.",
    notConfigured:
      "הוסיפו .env.local עם מפתחות Supabase והתחברו כדי לטעון נתונים.",
    totalIdeas: "סה״כ רעיונות",
    topPromise: "ההבטחה הגדולה",
    avgConfidence: "ביטחון ממוצע",
    avgConfidenceHint:
      "ככל שהממוצע נמוך, ייתכן שהתעדוף מבוסס יותר על הנחות מאשר על דאטה.",
    valueEffortTitle: "מטריצת Value vs Effort",
    valueEffortDesc:
      "ציר X: מאמץ (חודשי-אדם). ציר Y: ערך (Reach × Impact × Confidence%). פיצול לרבעים לפי חציון בכל ציר.",
    distributionTitle: "התפלגות לפי עדיפות",
    distributionDesc:
      "מספר רעיונות לפי חיווי: 1–10 נמוך, 11–29 בינוני, 30 ומעלה גבוה.",
    barHigh: "גבוה (30+)",
    barMedium: "בינוני (11–29)",
    barLow: "נמוך (1–10)",
    noData: "אין נתונים להצגה.",
    scoreLabel: "ציון",
    effortAxis: "Effort",
    valueAxis: "Value",
    ideasCount: "רעיונות",
    quadrants: {
      quickWins: "Quick Wins",
      bigBets: "Big Bets",
      fillIns: "Fill-ins",
      timeWasters: "Time Wasters",
    },
    confidenceDistTitle: "התפלגות רמות ביטחון",
    confidenceDistDesc:
      "כמה רעיונות נשמרו בכל טווח ביטחון (אחוזים) — מ-100% ועד מתחת ל-50%.",
    confidenceDistMicrocopy:
      "מציג את מידת האמינות של הנתונים ברשימה — האם ה-Roadmap מבוסס על דאטה מוכח או על תחושות בטן.",
    roiTitle: "מדד יעילות ו-ROI",
    roiDesc:
      "דירוג פיצ'רים לפי Impact ÷ Effort — יחס עלות-תועלת טהור (ללא Reach).",
    roiMicrocopy:
      "מבודד את יחס העלות-תועלת הטהור של הפיצ'רים כדי לאתר בקלות Quick Wins מבלי להתחשב בגודל השוק.",
    roiAxis: "Impact ÷ Effort",
    confidenceBuckets: {
      b100: "100%",
      b80: "80–99%",
      b50: "50–79%",
      bLow: "מתחת ל-50%",
    },
    summary: {
      title: "סיכום והמלצות",
      titleBasis: "(מבוסס על נתוני הרשימה שלך)",
      empty: "אין עדיין רעיונות ברשימה — הוסיפו פריטים במחשבון כדי לקבל תובנות.",
      quickWin:
        "Quick Win חם: {name} עם יחס Impact/Effort של {roi} — שווה לקדם לפני פרויקטים כבדים.",
      riskyOne:
        "אזהרה: {name} דורש מאמץ גבוה (≥2 חודשים) וביטחון נמוך (<50%) — כדאי לאמת הנחות לפני התחייבות.",
      riskyMany:
        "{count} פיצ'רים בסיכון (מאמץ גבוה + ביטחון נמוך): {names} — מומלץ לבצע מחקר משתמשים או POC לפני פיתוח מלא.",
      confidenceBias:
        "הטיית ביטחון: {pct}% מהרעיונות ({count}) ב-100% ביטחון — שקלו להוריד ציונים שאין להם דאטה מגובה.",
      bigBet:
        "Big Bet מוביל: {name} (ציון {score}) — אימפקט גבוה ומאמץ גבוה; שקלו לפצל ל-MVP או שלבים.",
      balanced:
        "מפת הדרכים נראית מאוזנת — אין חריגות בולטות בביטחון, בסיכון או ב-Quick Wins.",
      balancedClosing:
        "בסך הכל הרשימה מאוזנת — המשיכו לעדכן ביטחון ומאמץ ככל שצצים נתונים חדשים.",
    },
  },
  principles: {
    title: "כללי ה-RICE",
    intro:
      "RICE הוא מסגרת תעדוף שמאזנת בין תפוצה, השפעה, ביטחון בנתונים לבין מאמץ פיתוח. כאן מוסבר כל מרכיב, שאלות שיעזרו לכם לבחור ציון, והנוסחה כפי שהיא מיושמת באפליקציה — כולל נרמולים.",
    reach: {
      title: "R — Reach (תפוצה)",
      what: "מה זה: עד כמה הרעיון נוגע בהיקף משתמשים רלוונטי — לא מספר מוחלט אלא סולם יחסי בין מיעוט לבין כל קהל היעד.",
      normalize:
        "נרמול באפליקציה: ערך שלם בין {min} ל־{max}. {min} = מיעוט קטן, {max} = כל המשתמשים הרלוונטיים.",
      q1: "כמה משתמשים (או צוותים / לקוחות) באמת יושפעו אם נשיק את זה?",
      q2: "זה לכל המשתמשים, לרובם, לשכבה צרה, או לכמות קטנה מאוד?",
      q3: 'האם "תפוצה" כאן מתייחסת לשוק שלנו או לתת-קבוצה בתוך המוצר?',
    },
    impact: {
      title: "I — Impact (השפעה)",
      what: "מה זה: עוצמת ההשפעה על מטריקות שחשובות לכם (הכנסה, שימור, NPS, ביצועים, סיכון וכו׳) אם תספקו את הרעיון.",
      normalize: "נרמול באפליקציה: בחירה מתוך ערכים קבועים (מגבוה לנמוך בתצוגה).",
      q1: "אם זה יצליח — מה משתנה במשמעותיות למשתמשים או לעסק?",
      q2: 'האם זה "nice to have" או שינוי שמרגישים ביום־יום?',
      q3: "מה קורה אם לא נעשה את זה? כמה כאב נשאר?",
    },
    confidence: {
      title: "C — Confidence (ביטחון)",
      what: "מה זה: עד כמה אתם בטוחים במספרים שבחרתם ב־Reach וב־Impact — מבוסס מדידות, ניסויים ושיחות לקוח, או בעיקר על תחושת בטן.",
      normalize:
        "נרמול באפליקציה: אחוזים בין 0 ל־100 בממשק. בנוסחה משתמשים במספר עשרוני: Confidence (עשרוני) = אחוז ÷ 100 (למשל 80% → 0.8).",
      q1: "יש לנו נתונים, ניסוי A/B או ציטוטים מלקוחות שמגבים את Reach/Impact?",
      q2: 'כמה מההנחות שלנו עדיין "להוכחה"?',
      q3: "אם נוריד ביטחון — האם הציון עדיין מצדיק תעדוף גבוה?",
    },
    effort: {
      title: "E — Effort (מאמץ)",
      what: "מה זה: כמה חודשי־אדם נדרשים להשלמת העבודה — פיתוח, עיצוב, QA, השקה וליווי ראשוני, לפי הערכתכם.",
      normalize: "נרמול באפליקציה: בחירה מתוך ערכים קבועים (מגבוה לנמוך בתצוגה).",
      q1: "כמה אנשים וכמה זמן לפי הידע הנוכחי?",
      q2: "האם יש תלות בצוותים חיצוניים או בדגלים טכניים שמאריכים לו\"ז?",
      q3: 'מה גרסת MVP מול "הכל מוכן"?',
    },
    formula: {
      title: "הנוסחה והציון הסופי",
      rawIntro: "ציון RICE גולמי (לפני עיגול) הוא המנה לפני חלוקה במאמץ:",
      codeRaw: `מונה = Reach × Impact × Confidence_עשרוני
ציון_גולמי = מונה ÷ Effort

כאשר:
  Reach הוא שלם בין {reachMin} ל-{reachMax}
  Impact הוא אחד מ: {impactValues}
  Confidence_עשרוני = (אחוז ביטחון ב-UI) ÷ 100
  Effort הוא אחד מ: {effortValues} חודשי-אדם`,
      displayIntro: "ציון שמוצג ונשמר: העיגול לספרה אחת אחרי הנקודה.",
      codeRounded: "ציון = round(ציון_גולמי × 10) / 10",
      tiersIntro: "חיווי באפליקציה (לא משנה את חישוב הציון, רק את התווית):",
      tierLow: "1–10 — נמוך (✖️)",
      tierMedium: "11–29 — בינוני (🤔)",
      tierHigh: "30 ומעלה — גבוה (✅, כולל קונפטי במחשבון)",
      guidingQuestions: "שאלות מנחות:",
      whatIs: "מה זה:",
      normalizeInApp: "נרמול באפליקציה:",
    },
  },
}
