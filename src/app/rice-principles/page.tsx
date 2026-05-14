import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  IMPACT_OPTIONS,
  MIN_EFFORT,
  REACH_MAX,
  REACH_MIN,
} from "@/lib/rice"

export const metadata: Metadata = {
  title: "כללי ה-RICE | PriorityMaster",
  description: "הסבר על מרכיבי RICE, שאלות מנחות ונוסחת הציון",
}

export default function RicePrinciplesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-2xl tracking-tight">כללי ה-RICE</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          RICE הוא מסגרת תעדוף שמאזנת בין <strong>תפוצה</strong>, <strong>השפעה</strong>,{" "}
          <strong>ביטחון בנתונים</strong> לבין <strong>מאמץ פיתוח</strong>. כאן
          מוסבר כל מרכיב, שאלות שיעזרו לכם לבחור ציון, והנוסחה כפי שהיא מיושמת
          באפליקציה — כולל נרמולים.
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">R — Reach (תפוצה)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>מה זה:</strong> עד כמה הרעיון נוגע בהיקף משתמשים רלוונטי —
            לא מספר מוחלט אלא <strong>סולם יחסי</strong> בין מיעוט לבין כל קהל היעד.
          </p>
          <p className="text-muted-foreground">
            <strong>נרמול באפליקציה:</strong> ערך שלם בין {REACH_MIN} ל־{REACH_MAX}.{" "}
            {REACH_MIN} = מיעוט קטן, {REACH_MAX} = כל המשתמשים הרלוונטיים.
          </p>
          <div>
            <p className="mb-2 font-medium">שאלות מנחות:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>כמה משתמשים (או צוותים / לקוחות) באמת יושפעו אם נשיק את זה?</li>
              <li>זה לכל המשתמשים, לרובם, לשכבה צרה, או לכמות קטנה מאוד?</li>
              <li>האם &quot;תפוצה&quot; כאן מתייחסת לשוק שלנו או לתת-קבוצה בתוך המוצר?</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">I — Impact (השפעה)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>מה זה:</strong> עוצמת ההשפעה על מטריקות שחשובות לכם (הכנסה,
            שימור, NPS, ביצועים, סיכון וכו׳) אם תספקו את הרעיון.
          </p>
          <p className="text-muted-foreground">
            <strong>נרמול באפליקציה:</strong> בחירה מתוך ערכים קבועים (מגבוה לנמוך
            בתצוגה):{" "}
            {IMPACT_OPTIONS.map((o) => `${o.value} (${o.label})`).join(" · ")}.
          </p>
          <div>
            <p className="mb-2 font-medium">שאלות מנחות:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>אם זה יצליח — מה משתנה במשמעותיות למשתמשים או לעסק?</li>
              <li>האם זה &quot;nice to have&quot; או שינוי שמרגישים ביום־יום?</li>
              <li>מה קורה אם <em>לא</em> נעשה את זה? כמה כאב נשאר?</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">C — Confidence (ביטחון)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>מה זה:</strong> עד כמה אתם בטוחים במספרים שבחרתם ב־Reach וב־Impact
            — מבוסס מדידות, ניסויים ושיחות לקוח, או בעיקר על תחושת בטן.
          </p>
          <p className="text-muted-foreground">
            <strong>נרמול באפליקציה:</strong> אחוזים בין 0 ל־100 בממשק. בנוסחה
            משתמשים ב־<strong>מספר עשרוני</strong>:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              Confidence (עשרוני) = אחוז ÷ 100
            </code>{" "}
            (למשל 80% → 0.8).
          </p>
          <div>
            <p className="mb-2 font-medium">שאלות מנחות:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>יש לנו נתונים, ניסוי A/B או ציטוטים מלקוחות שמגבים את Reach/Impact?</li>
              <li>כמה מההנחות שלנו עדיין &quot;להוכחה&quot;?</li>
              <li>אם נוריד ביטחון — האם הציון עדיין מצדיק תעדוף גבוה?</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">E — Effort (מאמץ)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong>מה זה:</strong> כמה <strong>חודשי־אדם</strong> (Person-months)
            נדרשים להשלמת העבודה — פיתוח, עיצוב, QA, השקה וליווי ראשוני, לפי
            הערכתכם.
          </p>
          <p className="text-muted-foreground">
            <strong>נרמול באפליקציה:</strong> מינימום{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {MIN_EFFORT}
            </code>{" "}
            חודשי־אדם (לא ניתן 0 — מונע חלוקה באפס ועיוות ציון).
          </p>
          <div>
            <p className="mb-2 font-medium">שאלות מנחות:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>כמה אנשים וכמה זמן לפי הידע הנוכחי?</li>
              <li>האם יש תלות בצוותים חיצוניים או בדגלים טכניים שמאריכים לו&quot;ז?</li>
              <li>מה גרסת MVP מול &quot;הכל מוכן&quot;?</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">הנוסחה והציון הסופי</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>ציון RICE גולמי</strong> (לפני עיגול) הוא המנה לפני חלוקה במאמץ:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed sm:text-sm">
            {`מונה = Reach × Impact × Confidence_עשרוני
ציון_גולמי = מונה ÷ Effort

כאשר:
  Reach הוא שלם בין ${REACH_MIN} ל-${REACH_MAX}
  Impact הוא אחד מ: ${IMPACT_OPTIONS.map((o) => o.value).join(", ")}
  Confidence_עשרוני = (אחוז ביטחון ב-UI) ÷ 100
  Effort ≥ ${MIN_EFFORT} חודשי-אדם`}
          </pre>
          <Separator />
          <p>
            <strong>ציון שמוצג ונשמר:</strong> העיגול לספרה אחת אחרי הנקודה:
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs sm:text-sm">
            {`ציון = round(ציון_גולמי × 10) / 10`}
          </pre>
          <Separator />
          <p>
            <strong>חיווי באפליקציה</strong> (לא משנה את חישוב הציון, רק את התווית ברשימה ובדאשבורד):
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              1–19 — <strong className="text-foreground">נמוך</strong> (✖️)
            </li>
            <li>
              20–39 — <strong className="text-foreground">בינוני</strong> (🤔)
            </li>
            <li>
              40 ומעלה (טווח יעד 40–60) — <strong className="text-foreground">גבוה</strong> (✅, כולל קונפטי במחשבון)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
