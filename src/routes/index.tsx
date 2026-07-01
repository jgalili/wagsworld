import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import player1 from "@/assets/player-1.jpg";
import player2 from "@/assets/player-2.jpg";
import player3 from "@/assets/player-3.jpg";
import player4 from "@/assets/player-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

// Target: end of the current FIFA World Cup final.
// (Placeholder date — adjust when the real fixture is set.)
const FINAL_DATE = new Date("2026-07-19T22:00:00Z");

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

type Lang = "en" | "he";

const I18N = {
  en: {
    title: "The Offside Guide",
    edition: "Edition 04 // Vol. 3: Survival is the Goal",
    countdown: "Countdown to Emotional Freedom",
    microTitle: "Must-Know Micro-Intel",
    micro: [
      "Brazil's star winger dyed his hair again; use this to pretend you've been watching.",
      "VAR is currently the enemy of joy. Nod and sigh when someone mentions 'replays'.",
      "The main striker for France drinks herbal tea. Vital leverage for your next argument.",
      "Morocco is the sentimental favorite. Praising them is socially free real estate.",
      "England looked 'fine, actually'. Which, for England fans, counts as a crisis.",
    ],
    oddsTitle: "Win Probability (The Likeliest Culprits)",
    teams: { France: "France", Brazil: "Brazil", Argentina: "Argentina", England: "England", Spain: "Spain" } as Record<string, string>,
    peaceTitle: "Household Peace Forecast",
    peace: [
      { slot: "Tues 18:00", note: "Likely shouting & spilled beer", level: "critical" as const },
      { slot: "Wed 14:00", note: "Productive apathy", level: "safe" as const },
      { slot: "Thu 20:00", note: "Semi-final: brace for tears", level: "critical" as const },
      { slot: "Fri 12:00", note: "No matches. Actual daylight.", level: "safe" as const },
    ],
    critical: "Critical",
    safe: "Safe",
    hotTitle: "The Hot Player Index",
    hotness: "Hotness",
    players: [
      { country: "Spain", name: "Mateo Vidal", blurb: "The hair remains impeccable despite 90 minutes of sprinting. A miracle of modern engineering.", score: "9.8" },
      { country: "Korea", name: "Cho Gue-sung", blurb: "Breaks the internet every time he subs on. Jawline could cut glass. Kickoff at 12:30 GMT — set an alarm.", score: "9.4" },
      { country: "France", name: "Théo Laurent", blurb: "Emotionally available on Instagram. Cries after every match. Plays Thursday 19:30.", score: "9.1" },
      { country: "Argentina", name: "Rodrigo de Paz", blurb: "Chaotic energy, elite bone structure. The scowl is a choice. A solid pick for the quarter-finals.", score: "8.7" },
    ],
    viewingTitle: "Optimal Viewing",
    optimalWindow: "Optimal Window:",
    fixtures: [
      { time: "16:00 GMT", when: "Tomorrow", match: "Morocco vs Belgium", window: "The last 12 minutes. That's when the drama peaks. Skip the rest." },
      { time: "20:00 GMT", when: "Tomorrow", match: "Germany vs Spain", window: "First 20 mins for the anthem stares, then go read a book until full-time." },
      { time: "19:30 GMT", when: "Thursday", match: "France vs Argentina", window: "Skip. It will go to penalties. It always goes to penalties." },
    ],
    proTip: "Pro Survival Tip",
    proTipText: "\"When they say 'False Nine', just nod. Don't ask what it means. Nobody actually knows.\"",
    fakeKit: "Fake-Conversation Kit",
    fake: [
      "\"Their midfield press is a mess.\"",
      "\"Honestly? Give me a proper number nine.\"",
      "\"You can't defend that with three at the back.\"",
    ],
    footerLinks: ["The Exit Strategy", "Mute Keywords", "Peace Protocols"],
    dLabel: "D", hLabel: "H", mLabel: "M", sLabel: "S",
    lightMode: "Light", darkMode: "Dark", langLabel: "Language",
  },
  he: {
    title: "מדריך הנבדל",
    edition: "גיליון 04 // כרך 3: השרידות היא המטרה",
    countdown: "ספירה לאחור לחופש הרגשי",
    microTitle: "מודיעין מיקרו — חובה לדעת",
    micro: [
      "הכוכב של ברזיל צבע שוב את השיער. תשתמשי בזה כדי להעמיד פנים שצפית.",
      "ה-VAR הוא כרגע אויב השמחה. תהנהני ותאנחי כשמישהו מזכיר 'שידור חוזר'.",
      "החלוץ המרכזי של צרפת שותה תה צמחים. מנוף חיוני לוויכוח הבא שלך.",
      "מרוקו היא המועדפת הסנטימנטלית. לשבח אותה זה נדל\"ן חברתי חינם.",
      "אנגליה נראתה 'בסדר, האמת'. שזה, לאוהדי אנגליה, נחשב למשבר.",
    ],
    oddsTitle: "סיכויי זכייה (החשודים המיידיים)",
    teams: { France: "צרפת", Brazil: "ברזיל", Argentina: "ארגנטינה", England: "אנגליה", Spain: "ספרד" } as Record<string, string>,
    peaceTitle: "תחזית שלום הבית",
    peace: [
      { slot: "שלישי 18:00", note: "צעקות ובירה שנשפכת", level: "critical" as const },
      { slot: "רביעי 14:00", note: "אדישות פרודוקטיבית", level: "safe" as const },
      { slot: "חמישי 20:00", note: "חצי גמר: היכוני לדמעות", level: "critical" as const },
      { slot: "שישי 12:00", note: "אין משחקים. אור יום ממשי.", level: "safe" as const },
    ],
    critical: "קריטי",
    safe: "בטוח",
    hotTitle: "מדד השחקן החתיך",
    hotness: "חתיכות",
    players: [
      { country: "ספרד", name: "מטאו וידאל", blurb: "השיער נשאר מושלם אחרי 90 דקות של ריצות. נס של הנדסה מודרנית.", score: "9.8" },
      { country: "קוריאה", name: "צ'ו גיה-סונג", blurb: "שובר את האינטרנט בכל פעם שהוא נכנס. קו הלסת יכול לחתוך זכוכית. פתיחה ב-12:30 GMT — כווני שעון מעורר.", score: "9.4" },
      { country: "צרפת", name: "תיאו לורן", blurb: "זמין רגשית באינסטגרם. בוכה אחרי כל משחק. משחק ביום חמישי 19:30.", score: "9.1" },
      { country: "ארגנטינה", name: "רודריגו דה פאס", blurb: "אנרגיה כאוטית, מבנה עצמות עילית. הזעף הוא בחירה. בחירה מצוינת לרבע הגמר.", score: "8.7" },
    ],
    viewingTitle: "צפייה אופטימלית",
    optimalWindow: "חלון אופטימלי:",
    fixtures: [
      { time: "16:00 GMT", when: "מחר", match: "מרוקו נגד בלגיה", window: "12 הדקות האחרונות. אז הדרמה בשיאה. דלגי על השאר." },
      { time: "20:00 GMT", when: "מחר", match: "גרמניה נגד ספרד", window: "20 הדקות הראשונות למבטי ההמנון, ואז לכי לקרוא ספר עד הסוף." },
      { time: "19:30 GMT", when: "חמישי", match: "צרפת נגד ארגנטינה", window: "דלגי. זה ילך לפנדלים. זה תמיד הולך לפנדלים." },
    ],
    proTip: "טיפ הישרדות מקצועי",
    proTipText: "\"כשאומרים 'תשע כוזב', פשוט תהנהני. אל תשאלי מה זה. אף אחד באמת לא יודע.\"",
    fakeKit: "ערכת שיחה מזויפת",
    fake: [
      "\"הלחיצה שלהם בקישור בלגן מוחלט.\"",
      "\"בכנות? תני לי חלוץ מספר תשע אמיתי.\"",
      "\"אי אפשר להתגונן עם שלושה מאחור.\"",
    ],
    footerLinks: ["אסטרטגיית יציאה", "מילות השתקה", "פרוטוקולי שלום"],
    dLabel: "י", hLabel: "ש", mLabel: "ד", sLabel: "ש",
    lightMode: "בהיר", darkMode: "כהה", langLabel: "שפה",
  },
} as const;

function FlagIL({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
      <rect width="60" height="40" fill="#fff" />
      <rect y="4" width="60" height="6" fill="#0038b8" />
      <rect y="30" width="60" height="6" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="1.4">
        <polygon points="30,14 34,21 26,21" />
        <polygon points="30,26 34,19 26,19" />
      </g>
    </svg>
  );
}

function FlagGB({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
      <clipPath id="gbC"><rect width="60" height="40" /></clipPath>
      <g clipPath="url(#gbC)">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="2.5" />
        <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function Index() {
  const { days, hours, minutes, seconds } = useCountdown(FINAL_DATE);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<Lang>("en");
  const t = I18N[lang];
  const isHe = lang === "he";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("lang", lang);
    root.setAttribute("dir", isHe ? "rtl" : "ltr");
  }, [theme, lang, isHe]);

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 pb-4 mb-4 flex-wrap">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          <span className={`size-3 rounded-full ${theme === "light" ? "bg-foreground" : "bg-background border border-foreground"}`} />
          {theme === "light" ? t.lightMode : t.darkMode}
        </button>

        <button
          onClick={() => setLang(lang === "en" ? "he" : "en")}
          className="inline-flex items-center gap-2 border border-border rounded-full p-1 pr-3 text-[11px] font-mono uppercase tracking-widest hover:bg-muted transition-colors"
          aria-label="Toggle language"
        >
          <span className="w-8 h-5 overflow-hidden rounded-sm ring-1 ring-border">
            {lang === "en" ? <FlagGB className="w-full h-full" /> : <FlagIL className="w-full h-full" />}
          </span>
          <span>{lang === "en" ? "EN" : "עב"}</span>
          <span className="opacity-40">/</span>
          <span className="w-8 h-5 overflow-hidden rounded-sm ring-1 ring-border opacity-40">
            {lang === "en" ? <FlagIL className="w-full h-full" /> : <FlagGB className="w-full h-full" />}
          </span>
        </button>
      </div>

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-baseline gap-6 border-b-2 border-foreground pb-8 mb-12 animate-[slideUp_0.6s_var(--ease-out-expo)_both]">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-7xl font-display italic tracking-tight">{t.title}</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t.edition}
          </p>
        </div>

        <div className="bg-foreground text-background p-6 rounded-sm min-w-[320px]">
          <p className="font-mono text-[10px] uppercase tracking-tighter mb-2 opacity-60">
            {t.countdown}
          </p>
          <div dir="ltr" className="flex gap-4 items-end">
            <div className="text-3xl font-extrabold tabular-nums">
              {pad(days)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">{t.dLabel}</span>
            </div>
            <div className="text-3xl font-extrabold tabular-nums">
              {pad(hours)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">{t.hLabel}</span>
            </div>
            <div className="text-3xl font-extrabold tabular-nums">
              {pad(minutes)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">{t.mLabel}</span>
            </div>
            <div className="text-3xl font-extrabold tabular-nums opacity-60">
              {pad(seconds)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">{t.sLabel}</span>
            </div>
            <div className="animate-[pulseRed_1.5s_infinite] size-2 bg-primary rounded-full mb-3 ml-auto" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* LEFT: intel + odds + peace */}
        <div className="md:col-span-4 space-y-12">
          <section className="animate-[slideUp_0.6s_var(--ease-out-expo)_60ms_both]">
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-4">
              {t.microTitle}
            </h2>
            <div className="space-y-4">
              {t.micro.map((n, i) => (
                <div key={i}>
                  <p className="text-sm leading-relaxed">
                    <span className="text-primary font-bold mx-2 tabular-nums">
                      {pad(i + 1)}
                    </span>
                    {n}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-[slideUp_0.6s_var(--ease-out-expo)_120ms_both]">
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-6">
              {t.oddsTitle}
            </h2>
            <div className="space-y-5">
              {[
                { team: "France", pct: 24 },
                { team: "Brazil", pct: 21 },
                { team: "Argentina", pct: 18 },
                { team: "England", pct: 14 },
                { team: "Spain", pct: 11 },
              ].map((o) => (
                <div key={o.team} className="flex items-center gap-4">
                  <span className="w-12 font-mono text-xs text-muted-foreground tabular-nums">
                    {o.pct}%
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${o.pct * 3}%`, maxWidth: "100%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-tight w-20 text-right rtl:text-left">
                    {t.teams[o.team] ?? o.team}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface border border-border p-6 rounded-sm animate-[slideUp_0.6s_var(--ease-out-expo)_180ms_both]">
            <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6">
              {t.peaceTitle}
            </h2>
            <div className="space-y-4">
              {t.peace.map((p) => (
                <div key={p.slot} className="flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{p.slot}</p>
                    <p className="text-[11px] text-muted-foreground uppercase">{p.note}</p>
                  </div>
                  {p.level === "critical" ? (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full ring-1 ring-primary/30 whitespace-nowrap">
                      {t.critical}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full ring-1 ring-success/30 whitespace-nowrap">
                      {t.safe}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CENTER: Hot Player Index */}
        <div className="md:col-span-5 animate-[slideUp_0.6s_var(--ease-out-expo)_240ms_both]">
          <h2 className="font-display text-3xl italic mb-8 border-b-2 border-foreground pb-4">
            {t.hotTitle}
          </h2>

          <div className="space-y-8">
            <div className="group relative">
              <div className="w-full aspect-[4/5] bg-muted rounded-sm overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img
                  src={player1}
                  alt={`#1 ${t.players[0].name}`}
                  width={896}
                  height={1120}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex justify-between items-start gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase text-primary font-bold">
                    #01 // {t.players[0].country}
                  </p>
                  <h3 className="text-2xl font-display italic">{t.players[0].name}</h3>
                  <p className="text-sm mt-2 max-w-[36ch] text-pretty text-muted-foreground">
                    {t.players[0].blurb}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">
                    {t.hotness}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tighter italic">{t.players[0].score}</p>
                </div>
              </div>
            </div>

            {[player2, player3, player4].map((img, idx) => {
              const p = t.players[idx + 1];
              return (
                <div key={idx} className="grid grid-cols-5 gap-4 pt-8 border-t border-border">
                  <div className="col-span-2">
                    <div className="aspect-square bg-muted rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                      <img src={img} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="col-span-3 space-y-2">
                    <p className="font-mono text-[10px] uppercase text-primary font-bold">
                      #0{idx + 2} // {p.country}
                    </p>
                    <h3 className="text-xl font-display italic">{p.name}</h3>
                    <p className="text-xs text-muted-foreground leading-snug">{p.blurb}</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground pt-1">
                      {t.hotness} <span className="text-foreground font-extrabold not-italic mx-1">{p.score}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: fixtures + tip */}
        <div className="md:col-span-3 space-y-12 animate-[slideUp_0.6s_var(--ease-out-expo)_300ms_both]">
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-6">
              {t.viewingTitle}
            </h2>
            <div className="space-y-8">
              {t.fixtures.map((f) => (
                <div key={f.match} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase bg-foreground text-background px-1.5 py-0.5">
                      {f.time}
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase">
                      {f.when}
                    </span>
                  </div>
                  <p className="font-bold text-lg leading-tight uppercase tracking-tighter">
                    {f.match}
                  </p>
                  <div className="p-3 bg-muted rounded-sm">
                    <p className="text-[10px] font-bold uppercase mb-1 text-primary">
                      {t.optimalWindow}
                    </p>
                    <p className="text-xs leading-relaxed italic text-muted-foreground">
                      {f.window}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="p-6 border-2 border-primary rounded-sm bg-primary/5">
            <p className="font-mono text-[10px] uppercase text-primary font-bold mb-2">
              {t.proTip}
            </p>
            <p className="text-sm leading-snug font-medium italic">
              {t.proTipText}
            </p>
          </div>

          <div className="p-6 border border-border rounded-sm">
            <p className="font-mono text-[10px] uppercase text-muted-foreground font-bold mb-2">
              {t.fakeKit}
            </p>
            <ul className="text-xs space-y-2 text-muted-foreground">
              {t.fake.map((f, i) => (
                <li key={i}>&mdash; {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 border-t border-foreground py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {t.title} © {new Date().getFullYear()}
        </p>
        <div className="flex gap-8">
          {t.footerLinks.map((l, i) => (
            <a key={i} href="#" className="font-mono text-[10px] uppercase hover:text-primary transition-colors">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
