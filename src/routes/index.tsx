import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
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

// Simulated live match feed — jitters every ~3s, minute ticks every ~20s.
function useLiveMatch() {
  const [state, setState] = useState(() => ({
    minute: 54,
    score: [1, 0] as [number, number],
    possession: [58, 42] as [number, number],
    shots: [4, 2] as [number, number],
    xg: [1.24, 0.61] as [number, number],
    lastUpdated: Date.now(),
  }));
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const drift = () => Math.round((Math.random() - 0.5) * 6);
        let a = Math.max(30, Math.min(70, s.possession[0] + drift()));
        let sa = s.shots[0] + (Math.random() > 0.85 ? 1 : 0);
        let sb = s.shots[1] + (Math.random() > 0.9 ? 1 : 0);
        const xa = +(s.xg[0] + Math.random() * 0.08).toFixed(2);
        const xb = +(s.xg[1] + Math.random() * 0.05).toFixed(2);
        return {
          ...s,
          possession: [a, 100 - a],
          shots: [sa, sb],
          xg: [xa, xb],
          lastUpdated: Date.now(),
        };
      });
    }, 3200);
    const tick = setInterval(() => {
      setState((s) => ({ ...s, minute: Math.min(90, s.minute + 1), lastUpdated: Date.now() }));
    }, 22000);
    return () => { clearInterval(id); clearInterval(tick); };
  }, []);
  return state;
}

function useAgo(ts: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return Math.max(0, Math.floor((now - ts) / 1000));
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
      { country: "Spain", name: "Mateo Vidal", blurb: "The hair remains impeccable despite 90 minutes of sprinting. A miracle of modern engineering.", score: "9.8", daysAgo: 1, match: "vs Germany" },
      { country: "Korea", name: "Cho Gue-sung", blurb: "Breaks the internet every time he subs on. Jawline could cut glass. Kickoff at 12:30 GMT — set an alarm.", score: "9.4", daysAgo: 2, match: "vs Uruguay" },
      { country: "France", name: "Théo Laurent", blurb: "Emotionally available on Instagram. Cries after every match. Currently on the pitch — check the Live tile.", score: "9.1", daysAgo: 0, match: "LIVE vs Argentina" },
      { country: "Argentina", name: "Rodrigo de Paz", blurb: "Chaotic energy, elite bone structure. The scowl is a choice. A solid pick for the quarter-finals.", score: "8.7", daysAgo: 3, match: "vs Poland" },
      { country: "Brazil", name: "Lucas Andrade", blurb: "Smiles like a shampoo ad. Scored twice last week and became a meme by Monday morning.", score: "9.6", daysAgo: 6, match: "vs Serbia" },
      { country: "Portugal", name: "Diogo Vaz", blurb: "Renaissance-painting cheekbones. Last week's viral goal celebration is still on your group chat.", score: "9.3", daysAgo: 5, match: "vs Ghana" },
      { country: "Netherlands", name: "Sven de Vries", blurb: "6'4\", ponytail, sad eyes. Benched last week — the internet has not recovered.", score: "8.9", daysAgo: 4, match: "vs USA" },
      { country: "Croatia", name: "Marko Perišić", blurb: "The forearm veins alone deserve their own segment. Two assists vs Japan last week.", score: "8.6", daysAgo: 7, match: "vs Japan" },
    ],
    filterThisWeek: "This Week",
    filterLastWeek: "Last 7 Days",
    prevLabel: "Prev", nextLabel: "Next",
    daysAgoLabel: (n: number) => n === 0 ? "Today" : n === 1 ? "1 day ago" : `${n} days ago`,
    liveTitle: "Live On The Pitch Right Now",
    liveMinute: "min",
    livePossession: "Possession",
    liveShots: "Shots on target",
    liveXg: "xG",
    liveVerdict: "Verdict: still nothing has happened. Classic.",
    liveBadge: "LIVE",
    liveHottie: {
      badge: "Hottie On The Pitch (Live)",
      name: "Théo Laurent",
      meta: "France · #10 · on the pitch, minute-by-minute",
      tagline: "The one worth muting the commentary for.",
      looksLabel: "The Face Card",
      looks: [
        "Sweat-drenched curls: a personal insult to physics.",
        "Cheekbones sharp enough to open your Amazon packages.",
        "That post-tackle grimace? Rehearsed. And it's working.",
      ],
      gameLabel: "The Actual Football",
      game: [
        "Left foot like a scalpel — his cross-field switches are art.",
        "Presses the goalkeeper for fun. Chaotic. Effective.",
        "Free-kick specialist. If it's 25 yards out, look up from your phone.",
      ],
      watch: "Watch for: the set piece around minute 63. Camera always lingers.",
    },
    updated: "Updated",
    secondsAgo: (n: number) => `${n}s ago`,
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
    title: "מדריך הנבדל(ת) האינטימי",
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
      { country: "ספרד", name: "מטאו וידאל", blurb: "השיער נשאר מושלם אחרי 90 דקות של ריצות. נס של הנדסה מודרנית.", score: "9.8", daysAgo: 1, match: "נגד גרמניה" },
      { country: "קוריאה", name: "צ'ו גיה-סונג", blurb: "שובר את האינטרנט בכל פעם שהוא נכנס. קו הלסת יכול לחתוך זכוכית.", score: "9.4", daysAgo: 2, match: "נגד אורוגוואי" },
      { country: "צרפת", name: "תיאו לורן", blurb: "זמין רגשית באינסטגרם. בוכה אחרי כל משחק. כרגע על הדשא — בדקי את החלונית 'שידור חי'.", score: "9.1", daysAgo: 0, match: "חי נגד ארגנטינה" },
      { country: "ארגנטינה", name: "רודריגו דה פאס", blurb: "אנרגיה כאוטית, מבנה עצמות עילית. הזעף הוא בחירה.", score: "8.7", daysAgo: 3, match: "נגד פולין" },
      { country: "ברזיל", name: "לוקאס אנדרדה", blurb: "מחייך כמו בפרסומת לשמפו. הבקיע פעמיים בשבוע שעבר והפך למם עד יום שני.", score: "9.6", daysAgo: 6, match: "נגד סרביה" },
      { country: "פורטוגל", name: "דיוגו וז", blurb: "עצמות לחיים מציור רנסנס. חגיגת השער הוויראלית שלו עדיין בקבוצת הוואטסאפ שלך.", score: "9.3", daysAgo: 5, match: "נגד גאנה" },
      { country: "הולנד", name: "סבן דה פריס", blurb: "1.94, קוקו, עיניים עצובות. הוחלף בשבוע שעבר — האינטרנט לא התאושש.", score: "8.9", daysAgo: 4, match: "נגד ארה\"ב" },
      { country: "קרואטיה", name: "מרקו פרישיץ'", blurb: "הוורידים באמות מגיע להם קטע משלהם. שני בישולים נגד יפן בשבוע שעבר.", score: "8.6", daysAgo: 7, match: "נגד יפן" },
    ],
    filterThisWeek: "השבוע",
    filterLastWeek: "7 ימים אחרונים",
    prevLabel: "הקודם", nextLabel: "הבא",
    daysAgoLabel: (n: number) => n === 0 ? "היום" : n === 1 ? "לפני יום" : `לפני ${n} ימים`,
    liveTitle: "כרגע על הדשא, בשידור חי",
    liveMinute: "דק'",
    livePossession: "החזקת כדור",
    liveShots: "בעיטות למסגרת",
    liveXg: "xG",
    liveVerdict: "הכרעה: עדיין לא קרה כלום. קלאסי.",
    liveBadge: "חי",
    liveHottie: {
      badge: "חתיך על הדשא (שידור חי)",
      name: "תיאו לורן",
      meta: "צרפת · #10 · על הדשא, דקה־דקה",
      tagline: "זה שבשבילו שווה להשתיק את השדרן.",
      looksLabel: "כרטיס הפנים",
      looks: [
        "תלתלים ספוגי זיעה: עלבון אישי לחוקי הפיזיקה.",
        "עצמות לחיים חדות מספיק כדי לפתוח משלוחים.",
        "העוויית הכאב אחרי כל תיקול? מתורגלת. וזה עובד.",
      ],
      gameLabel: "והכדורגל עצמו",
      game: [
        "רגל שמאל כמו איזמל — החילופים לרוחב שלו זו אמנות.",
        "לוחץ על השוער בשביל הכיף. כאוטי. אפקטיבי.",
        "מומחה לבעיטות חופשיות. אם זה מ־25 מטר, תרימי מבט מהטלפון.",
      ],
      watch: "לצפות: הבעיטה החופשית סביב דקה 63. המצלמה תמיד מתעכבת.",
    },
    updated: "עודכן",
    secondsAgo: (n: number) => `לפני ${n} שניות`,
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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [lang, setLang] = useState<Lang>("en");
  const t = I18N[lang];
  const isHe = lang === "he";

  // Live match simulation
  const live = useLiveMatch();
  const liveAgo = useAgo(live.lastUpdated);

  // Hot Player carousel
  const playerImages = [player1, player2, player3, player4];
  const [playerFilter, setPlayerFilter] = useState<"week" | "last">("week");
  const [playerIdx, setPlayerIdx] = useState(0);
  const filteredPlayers = t.players
    .map((p, i) => ({ ...p, _img: playerImages[i % playerImages.length], _rank: i + 1 }))
    .filter((p) => (playerFilter === "week" ? p.daysAgo <= 3 : p.daysAgo >= 4 && p.daysAgo <= 7));
  const safeIdx = filteredPlayers.length ? playerIdx % filteredPlayers.length : 0;
  const current = filteredPlayers[safeIdx];
  const goPrev = () => setPlayerIdx((i) => (i - 1 + filteredPlayers.length) % filteredPlayers.length);
  const goNext = () => setPlayerIdx((i) => (i + 1) % filteredPlayers.length);
  useEffect(() => { setPlayerIdx(0); }, [playerFilter]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("lang", lang);
    root.setAttribute("dir", isHe ? "rtl" : "ltr");
  }, [theme, lang, isHe]);

  // Cursor spotlight
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const root = document.documentElement;
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Magnetic tilt for hero player
  const tiltRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 15 });
  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onTiltLeave = () => { mx.set(0); my.set(0); };

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 p-4 md:p-8 overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="spotlight" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto flex justify-between items-center gap-4 pb-4 mb-4 flex-wrap">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:bg-muted transition-colors backdrop-blur-md bg-background/40"
          aria-label="Toggle theme"
        >
          <span className={`size-3 rounded-full ${theme === "light" ? "bg-foreground" : "bg-background border border-foreground"}`} />
          {theme === "light" ? t.lightMode : t.darkMode}
        </button>

        <div className="inline-flex items-center gap-2 border border-primary/50 rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest bg-primary/10 backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-primary" />
          </span>
          <span className="text-primary font-bold">{t.liveBadge}</span>
          <span className="opacity-60">·</span>
          <span className="tabular-nums">{t.updated} {t.secondsAgo(liveAgo)}</span>
        </div>

        <button
          onClick={() => setLang(lang === "en" ? "he" : "en")}
          className="inline-flex items-center gap-2 border border-border rounded-full p-1 pr-3 text-[11px] font-mono uppercase tracking-widest hover:bg-muted transition-colors backdrop-blur-md bg-background/40"
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

      {/* Ticker */}
      <div dir="ltr" className="relative z-10 max-w-7xl mx-auto mb-8 border-y border-border py-2 overflow-hidden backdrop-blur-sm bg-background/30">
        <div className="flex gap-12 whitespace-nowrap animate-[marquee_45s_linear_infinite] font-mono text-[11px] uppercase tracking-widest">
          {[...t.micro, ...t.micro].map((n, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-primary animate-[pulseRed_1.5s_infinite]" />
              {n}
            </span>
          ))}
        </div>
      </div>

      <motion.header {...fade(0)} className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-baseline gap-6 border-b-2 border-foreground/60 pb-8 mb-12">
        <div className="space-y-1">
          <h1 className={`text-5xl md:text-7xl tracking-tight shine-text leading-snug break-words pb-1 ${isHe ? "font-hebrew italic font-semibold" : "font-display italic"}`}>{t.title}</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t.edition}
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative bg-foreground text-background p-6 rounded-sm min-w-[320px] shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_45%,transparent)] ring-1 ring-primary/30"
        >
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
            <motion.div
              key={seconds}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-3xl font-extrabold tabular-nums"
            >
              {pad(seconds)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">{t.sLabel}</span>
            </motion.div>
            <div className="animate-[pulseRed_1.5s_infinite] size-2 bg-primary rounded-full mb-3 ml-auto" />
          </div>
        </motion.div>
      </motion.header>

      <main className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* LEFT: intel + odds + peace */}
        <div className="md:col-span-4 space-y-12">
          <motion.section {...fade(0.1)}>
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-4">
              {t.microTitle}
            </h2>
            <div className="space-y-4">
              {t.micro.map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isHe ? 12 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                >
                  <p className="text-sm leading-relaxed">
                    <span className="text-primary font-bold mx-2 tabular-nums">
                      {pad(i + 1)}
                    </span>
                    {n}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section {...fade(0.2)}>
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
              ].map((o, i) => (
                <div key={o.team} className="flex items-center gap-4 group">
                  <span className="w-12 font-mono text-xs text-muted-foreground tabular-nums">
                    {o.pct}%
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(o.pct * 3, 100)}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-foreground via-primary to-primary"
                    />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-tight w-20 text-right rtl:text-left group-hover:text-primary transition-colors">
                    {t.teams[o.team] ?? o.team}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section {...fade(0.3)} className="bg-surface/70 backdrop-blur-md border border-border p-6 rounded-sm">
            <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6">
              {t.peaceTitle}
            </h2>
            <div className="space-y-4">
              {t.peace.map((p) => (
                <motion.div
                  key={p.slot}
                  whileHover={{ x: isHe ? -4 : 4 }}
                  className="flex justify-between items-center gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{p.slot}</p>
                    <p className="text-[11px] text-muted-foreground uppercase">{p.note}</p>
                  </div>
                  {p.level === "critical" ? (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full ring-1 ring-primary/30 whitespace-nowrap animate-[pulseRed_2s_infinite]">
                      {t.critical}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full ring-1 ring-success/30 whitespace-nowrap">
                      {t.safe}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* CENTER: Hot Player Index */}
        <motion.div {...fade(0.35)} className="md:col-span-5">
          <div className="flex items-end justify-between gap-4 mb-6 border-b-2 border-foreground/60 pb-4">
            <h2 className="font-display text-3xl italic shine-text">{t.hotTitle}</h2>
            <div className="flex gap-1 font-mono text-[10px] uppercase tracking-widest">
              {(["week", "last"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPlayerFilter(f)}
                  className={`px-3 py-1.5 rounded-full border transition-all ${
                    playerFilter === f
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_var(--primary)]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "week" ? t.filterThisWeek : t.filterLastWeek}
                </button>
              ))}
            </div>
          </div>

          {current && (
            <motion.div
              key={`${playerFilter}-${safeIdx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              ref={tiltRef}
              onMouseMove={onTilt}
              onMouseLeave={onTiltLeave}
              style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
              className="group relative"
            >
              <div className="w-full aspect-[4/5] bg-muted rounded-sm overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 ring-1 ring-primary/20 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_50%,transparent)] relative">
                <img
                  src={current._img}
                  alt={current.name}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 font-mono text-[10px] uppercase tracking-widest bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full ring-1 ring-border">
                  {t.daysAgoLabel(current.daysAgo)} · {current.match}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-start gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase text-primary font-bold">
                    #{pad(current._rank)} // {current.country}
                  </p>
                  <h3 className="text-2xl font-display italic">{current.name}</h3>
                  <p className="text-sm mt-2 max-w-[36ch] text-pretty text-muted-foreground">
                    {current.blurb}
                  </p>
                </div>
                <div className="text-right rtl:text-left shrink-0">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">{t.hotness}</p>
                  <p className="text-4xl font-extrabold tracking-tighter italic shine-text">{current.score}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Carousel controls */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={goPrev}
              className="font-mono text-[11px] uppercase tracking-widest border border-border hover:border-primary hover:text-primary rounded-full px-4 py-2 transition-colors"
            >
              ← {t.prevLabel}
            </button>
            <div dir="ltr" className="flex gap-1.5">
              {filteredPlayers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPlayerIdx(i)}
                  aria-label={`Go to ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === safeIdx ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              className="font-mono text-[11px] uppercase tracking-widest border border-border hover:border-primary hover:text-primary rounded-full px-4 py-2 transition-colors"
            >
              {t.nextLabel} →
            </button>
          </div>

          {/* Thumbnail rail */}
          <div className="mt-6 grid grid-cols-4 gap-2">
            {filteredPlayers.map((p, i) => (
              <button
                key={i}
                onClick={() => setPlayerIdx(i)}
                className={`aspect-square rounded-sm overflow-hidden ring-1 transition-all ${
                  i === safeIdx ? "ring-primary ring-2 scale-105" : "ring-border grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                }`}
              >
                <img src={p._img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: fixtures + tip */}
        <motion.div {...fade(0.45)} className="md:col-span-3 space-y-12">
          {/* Live match */}
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-sm border border-primary/40 bg-gradient-to-br from-primary/10 via-background/40 to-background/40 backdrop-blur-md p-5 shadow-[0_0_50px_-15px_var(--primary)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                  {t.liveBadge} · {t.liveTitle}
                </span>
              </div>
              <span className="font-mono text-[10px] tabular-nums text-primary">
                {live.minute}' {t.liveMinute}
              </span>
            </div>

            <div dir="ltr" className="flex items-center justify-between gap-2 mb-5">
              <div className="text-center flex-1">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">FRA</p>
                <motion.p
                  key={live.score[0]}
                  initial={{ scale: 1.4, color: "var(--primary)" }}
                  animate={{ scale: 1, color: "var(--foreground)" }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl font-extrabold tabular-nums"
                >
                  {live.score[0]}
                </motion.p>
              </div>
              <span className="font-display text-2xl italic text-muted-foreground">—</span>
              <div className="text-center flex-1">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">ARG</p>
                <motion.p
                  key={live.score[1]}
                  initial={{ scale: 1.4, color: "var(--primary)" }}
                  animate={{ scale: 1, color: "var(--foreground)" }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl font-extrabold tabular-nums"
                >
                  {live.score[1]}
                </motion.p>
              </div>
            </div>

            {/* Possession bar */}
            <div className="space-y-3 text-[11px] font-mono">
              <div>
                <div className="flex justify-between mb-1 tabular-nums">
                  <span>{live.possession[0]}%</span>
                  <span className="uppercase text-muted-foreground">{t.livePossession}</span>
                  <span>{live.possession[1]}%</span>
                </div>
                <div dir="ltr" className="flex h-1.5 rounded-full overflow-hidden bg-muted">
                  <motion.div
                    animate={{ width: `${live.possession[0]}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-primary h-full"
                  />
                  <motion.div
                    animate={{ width: `${live.possession[1]}%` }}
                    transition={{ duration: 0.8 }}
                    className="bg-foreground/50 h-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="border border-border/60 rounded-sm p-2">
                  <p className="uppercase text-muted-foreground text-[9px]">{t.liveShots}</p>
                  <p className="tabular-nums text-lg font-bold">{live.shots[0]} <span className="text-muted-foreground text-xs">/</span> {live.shots[1]}</p>
                </div>
                <div className="border border-border/60 rounded-sm p-2">
                  <p className="uppercase text-muted-foreground text-[9px]">{t.liveXg}</p>
                  <p className="tabular-nums text-lg font-bold">{live.xg[0].toFixed(2)} <span className="text-muted-foreground text-xs">/</span> {live.xg[1].toFixed(2)}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-border/60 text-[11px] italic text-muted-foreground">
              {t.liveVerdict}
            </p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-primary/70 tabular-nums">
              {t.updated} {t.secondsAgo(liveAgo)}
            </p>
          </motion.section>

          {/* Live Hottie On The Pitch */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative overflow-hidden rounded-sm border border-primary/40 bg-gradient-to-b from-background/40 to-primary/5 backdrop-blur-md shadow-[0_0_50px_-20px_var(--primary)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={player3}
                alt={t.liveHottie.name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 inline-flex items-center gap-2 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-full ring-1 ring-primary/40">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-primary" />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold">
                  {t.liveHottie.badge}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 rtl:left-4 rtl:right-4">
                <h3 className="font-display italic text-2xl leading-none">{t.liveHottie.name}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {t.liveHottie.meta}
                </p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm italic text-pretty">{t.liveHottie.tagline}</p>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
                  {t.liveHottie.looksLabel}
                </p>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  {t.liveHottie.looks.map((l, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">♡</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
                  {t.liveHottie.gameLabel}
                </p>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  {t.liveHottie.game.map((g, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] pt-3 border-t border-border/60 italic text-primary/80">
                {t.liveHottie.watch}
              </p>
            </div>
          </motion.section>

          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-6">
              {t.viewingTitle}
            </h2>
            <div className="space-y-8">
              {t.fixtures.map((f, i) => (
                <motion.div
                  key={f.match}
                  initial={{ opacity: 0, x: isHe ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="space-y-3"
                >
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
                  <div className="p-3 bg-muted/60 backdrop-blur-sm rounded-sm border border-border/60">
                    <p className="text-[10px] font-bold uppercase mb-1 text-primary">
                      {t.optimalWindow}
                    </p>
                    <p className="text-xs leading-relaxed italic text-muted-foreground">
                      {f.window}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 border-2 border-primary rounded-sm bg-primary/5 shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
          >
            <p className="font-mono text-[10px] uppercase text-primary font-bold mb-2">
              {t.proTip}
            </p>
            <p className="text-sm leading-snug font-medium italic">
              {t.proTipText}
            </p>
          </motion.div>

          <div className="p-6 border border-border rounded-sm bg-surface/40 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase text-muted-foreground font-bold mb-2">
              {t.fakeKit}
            </p>
            <ul className="text-xs space-y-2 text-muted-foreground">
              {t.fake.map((f, i) => (
                <li key={i} className="hover:text-primary transition-colors cursor-default">&mdash; {f}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto mt-20 border-t border-foreground/60 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {t.title} © {new Date().getFullYear()}
        </p>
        <div className="flex gap-8">
          {t.footerLinks.map((l, i) => (
            <a key={i} href="#" className="font-mono text-[10px] uppercase hover:text-primary transition-colors story-link">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
