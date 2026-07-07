import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getMondialIntel } from "@/lib/mondial-intel.functions";
import { getMondialLive, type LiveMatch } from "@/lib/mondial-live.functions";

export const Route = createFileRoute("/")({
  component: Index,
});

// Target: end of the current FIFA World Cup final.
// (Placeholder date — adjust when the real fixture is set.)
const FINAL_DATE = new Date("2026-07-19T22:00:00Z");

function useCountdown(target: Date) {
  // Start at target so SSR + first client render both produce 00:00:00:00 and
  // hydration matches; then tick on the client.
  const [now, setNow] = useState<number>(() => target.getTime());
  useEffect(() => {
    setNow(Date.now());
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

// Format kickoff in the viewer's locale/timezone.
function fmtKickoff(iso: string, lang: Lang) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function relativeWhen(iso: string, lang: Lang) {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffH = (t - now) / 3_600_000;
  if (diffH < 0 && diffH > -3) return lang === "he" ? "עכשיו" : "Just now";
  if (diffH >= 0 && diffH < 6) return lang === "he" ? "היום" : "Today";
  if (diffH >= 6 && diffH < 30) return lang === "he" ? "מחר" : "Tomorrow";
  return fmtKickoff(iso, lang).split(",")[0];
}

function useAgo(ts: number) {
  // Start at ts so SSR + first client render both produce 0s and hydration
  // matches; then tick on the client.
  const [now, setNow] = useState<number>(() => ts);
  useEffect(() => {
    setNow(Date.now());
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
    proTip2: "Pro Survival Tip #2",
    proTipText2: "\"If he mentions 'xG' three times in one sentence, pour yourself a glass of wine and tune out.\"",
    fakeKit: "Fake-Conversation Kit",
    fake: [
      "\"Their midfield press is a mess.\"",
      "\"Honestly? Give me a proper number nine.\"",
      "\"You can't defend that with three at the back.\"",
    ],
    footerLinks: ["The Exit Strategy", "Mute Keywords", "Peace Protocols"],
    dLabel: "D", hLabel: "H", mLabel: "M", sLabel: "S",
    lightMode: "Light", darkMode: "Dark", langLabel: "Language",
    noLiveTitle: "No Match Live Right Now",
    noLiveBody: "Rare pocket of peace. Enjoy while it lasts.",
    nextKickoff: "Next kickoff",
    liveDataFrom: "Live data · ESPN",
    fixturesTitle: "Next Up (Live from ESPN)",
    noFixtures: "No scheduled matches in the next few days. The internet will find something else to be loud about.",
    recentTitle: "Just Finished",
    intelTitle: "Betting Intel & Juicy Feed",
    intelSub: "Live from the money — and the tunnel cameras.",
    marketsTitle: "Prediction Markets",
    marketsSub: "What the money thinks. (Money is often wrong. Loudly.)",
    winnersTitle: "Biggest Winners This Week",
    winnersSub: "People who watched the group stage so you didn't have to.",
    dropsTitle: "Juicy Micro-News",
    dropsSub: "Refreshed on every page load. You're welcome.",
    totalWagered: "Total wagered this week",
    volumeLabel: "Volume",
    priceLabel: "Yes",
    minutesAgoLabel: (n: number) => n < 1 ? "just now" : n === 1 ? "1 min ago" : `${n} min ago`,
    polymarketOn: "Polymarket · online",
    polymarketOff: "Polymarket · unreachable — using fallback",
    refreshLabel: "Refresh",
    fetchingLabel: "Fetching fresh gossip…",
    lastFetchedLabel: "Feed refreshed",
    compactIntel: "Quick Bets",
    compactWinners: "Top winner",
    compactDrops: "Juicy drops",
    gossipTitle: "The Gossip Column",
    gossipSub: "Airport fits, tunnel cams, questionable co-ords — updated live.",
    verdictHit: "HIT",
    verdictMiss: "MISS",
    verdictChaos: "CHAOS",
    socialsLabel: "From the socials",
    playingNowBadge: "Playing right now",
    editorialNote: "Editorial visual",
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
    proTip2: "טיפ הישרדות מקצועי #2",
    proTipText2: "\"אם הוא מזכיר 'xG' שלוש פעמים במשפט אחד, מזגי לך כוס יין ותנתקי.\"",
    fakeKit: "ערכת שיחה מזויפת",
    fake: [
      "\"הלחיצה שלהם בקישור בלגן מוחלט.\"",
      "\"בכנות? תני לי חלוץ מספר תשע אמיתי.\"",
      "\"אי אפשר להתגונן עם שלושה מאחור.\"",
    ],
    footerLinks: ["אסטרטגיית יציאה", "מילות השתקה", "פרוטוקולי שלום"],
    dLabel: "י", hLabel: "ש", mLabel: "ד", sLabel: "ש",
    lightMode: "בהיר", darkMode: "כהה", langLabel: "שפה",
    noLiveTitle: "אין משחק חי כרגע",
    noLiveBody: "רגע נדיר של שקט. תיהני עד שזה נגמר.",
    nextKickoff: "שריקת פתיחה הבאה",
    liveDataFrom: "נתונים חיים · ESPN",
    fixturesTitle: "הבאים בתור (חי מ-ESPN)",
    noFixtures: "אין משחקים מתוזמנים בימים הקרובים. האינטרנט ימצא במה עוד לצרוח.",
    recentTitle: "בדיוק הסתיים",
    intelTitle: "מודיעין הימורים ופיד עסיסי",
    intelSub: "ישר מהכסף — ומהמצלמות במנהרה.",
    marketsTitle: "שוקי חיזוי",
    marketsSub: "מה שהכסף חושב. (הכסף לרוב טועה. בקול.)",
    winnersTitle: "המנצחים הגדולים השבוע",
    winnersSub: "אנשים שצפו בשלב הבתים במקומך.",
    dropsTitle: "מיקרו-חדשות עסיסיות",
    dropsSub: "מתרעננות בכל טעינת עמוד. על לא דבר.",
    totalWagered: "סך ההימורים השבוע",
    volumeLabel: "מחזור",
    priceLabel: "כן",
    minutesAgoLabel: (n: number) => n < 1 ? "ממש עכשיו" : n === 1 ? "לפני דקה" : `לפני ${n} דק'`,
    polymarketOn: "פולימרקט · מחובר",
    polymarketOff: "פולימרקט · לא זמין — משתמשים בגיבוי",
    refreshLabel: "רענון",
    fetchingLabel: "מושכים רכילות טרייה…",
    lastFetchedLabel: "הפיד עודכן",
    compactIntel: "הימורים מהירים",
    compactWinners: "המנצח הגדול",
    compactDrops: "חדשות עסיסיות",
    gossipTitle: "טור הרכילות",
    gossipSub: "לוקים בשדה תעופה, מצלמות מנהרה, קומבינציות חשודות — בזמן אמת.",
    verdictHit: "פגיעה",
    verdictMiss: "פספוס",
    verdictChaos: "כאוס",
    socialsLabel: "מהסושיאל",
    playingNowBadge: "משחק כרגע",
    editorialNote: "תמונת עריכה",
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

  // Live World Cup data from ESPN — polled every 20s.
  const liveQuery = useQuery({
    queryKey: ["mondial-live"],
    queryFn: () => getMondialLive(),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
  const liveData = liveQuery.data;
  const liveMatch: LiveMatch | undefined = liveData?.live[0];
  const nextMatch: LiveMatch | undefined = liveData?.upcoming[0];
  const liveAgo = useAgo(liveData?.generatedAt ?? Date.now());

  // Live betting intel + juicy news — refreshed on every mount
  const intelQuery = useQuery({
    queryKey: ["mondial-intel"],
    queryFn: () => getMondialIntel(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const intel = intelQuery.data;
  const intelAgo = useAgo(intel?.fetchedAt ?? Date.now());

  const liveTeamNames = liveData
    ? Array.from(
        new Set(
          [...liveData.live, ...liveData.upcoming]
            .flatMap((m) => [m.home.name, m.away.name])
            .filter((team) => !/winner|round of|tbd/i.test(team)),
        ),
      )
    : [];
  const liveMicroFallback: readonly string[] = liveMatch
    ? [
        `${liveMatch.home.name} vs ${liveMatch.away.name} is live at ${liveMatch.home.score || 0}-${liveMatch.away.score || 0}. That is the actual news.`,
        nextMatch
          ? `Next: ${nextMatch.home.name} vs ${nextMatch.away.name}. No eliminated-team cosplay required.`
          : "Next fixture is still loading from ESPN. Do not trust recycled tournament gossip.",
      ]
    : nextMatch
      ? [
          `Next: ${nextMatch.home.name} vs ${nextMatch.away.name} at ${fmtKickoff(nextMatch.kickoffISO, lang)}.`,
          liveData?.recent[0]
            ? `${liveData.recent[0].home.name} ${liveData.recent[0].home.score}-${liveData.recent[0].away.score} ${liveData.recent[0].away.name} is finished. Update all takes accordingly.`
            : "Live tournament feed is loading. Stale Brazil hair news has been removed.",
        ]
      : ["Live tournament feed is loading. Stale Brazil hair news has been removed."];
  const liveOddsFallback = liveTeamNames.slice(0, 5).map((team, i) => ({
    team,
    label: team,
    pct: Math.max(6, 24 - i * 3),
  }));

  // Live-updated content pulled from grounded server data. Never fall back to
  // old hard-coded teams here; showing nothing/loading is better than stale.
  const liveMicro: readonly string[] = intel?.microTips?.length
    ? intel.microTips.map((m) => (isHe ? m.he : m.en))
    : liveMicroFallback;
  const liveOdds = intel?.odds?.length
    ? intel.odds.map((o) => ({
        team: o.team,
        label: isHe ? o.team_he || o.team : o.team,
        pct: o.pct,
      }))
    : liveOddsFallback;
  const livePeace = intel?.peaceForecast?.length
    ? intel.peaceForecast.map((p) => ({
        slot: isHe ? p.slot_he || p.slot : p.slot,
        note: isHe ? p.note_he || p.note : p.note,
        level: p.level,
      }))
    : t.peace.map((p) => ({ slot: p.slot, note: p.note, level: p.level }));
  const liveProTip1 = intel?.proTips?.[0]
    ? {
        label: isHe ? intel.proTips[0].label_he : intel.proTips[0].label,
        text: isHe ? intel.proTips[0].text_he : intel.proTips[0].text,
      }
    : { label: t.proTip, text: t.proTipText };
  const liveProTip2 = intel?.proTips?.[1]
    ? {
        label: isHe ? intel.proTips[1].label_he : intel.proTips[1].label,
        text: isHe ? intel.proTips[1].text_he : intel.proTips[1].text,
      }
    : { label: t.proTip2, text: t.proTipText2 };
  const liveFake: readonly string[] = intel?.fakeLines?.length
    ? intel.fakeLines.map((f) => (isHe ? f.he : f.en))
    : t.fake;

  // Hot Player carousel
  const [playerFilter, setPlayerFilter] = useState<"week" | "last">("week");
  const [playerIdx, setPlayerIdx] = useState(0);

  // Prefer live AI-generated hot players; fall back to static list.
  const livePlayersRaw = intel?.hotPlayers ?? [];
  const livePlayersMapped = livePlayersRaw.map((p, i) => ({
    country: p.country,
    name: p.name,
    blurb: isHe ? p.blurb_he : p.blurb,
    score: p.score,
    daysAgo: Math.max(0, Math.floor((p.hoursAgo ?? 0) / 24)),
    match: p.match,
    role: p.role,
    socialTeaser: isHe ? p.socialTeaser_he : p.socialTeaser,
    socialUrl: p.socialUrl,
    isPlayingLive: p.isPlayingLive,
    _img: p.imageUrl ?? null,
    _hasRealImg: !!p.imageUrl,
    _rank: i + 1,
  }));
  // Only use AI players that actually resolved to a real photo. Otherwise
  // show a loading/empty state — no stale invented names or scenery images.
  // Prefer players with real photos, but never leave the carousel empty —
  // fall back to the mapped list (which has a Wikipedia search URL) so the
  // section is always populated even when Wikipedia thumbnails failed to
  // resolve or when the AI feed is unavailable.
  const livePlayersWithImgs = livePlayersMapped.filter((p) => p._hasRealImg);
  const allPlayers = livePlayersWithImgs.length ? livePlayersWithImgs : livePlayersMapped;
  const filteredPlayersBase = allPlayers.filter((p) =>
    playerFilter === "week" ? p.daysAgo <= 3 : p.daysAgo >= 2,
  );
  const filteredPlayers = filteredPlayersBase.length ? filteredPlayersBase : allPlayers;
  const safeIdx = filteredPlayers.length ? playerIdx % filteredPlayers.length : 0;
  const current = filteredPlayers[safeIdx];
  // The "Hottie on the pitch" card only makes sense when a match is actually
  // live AND one of the AI-supplied hot players belongs to one of the two
  // teams currently on the pitch. Otherwise we hide the card entirely.
  const livePlayingHottie = liveMatch
    ? livePlayersRaw.find(
        (p) =>
          p.isPlayingLive &&
          (p.country?.toLowerCase() === liveMatch.home.name.toLowerCase() ||
            p.country?.toLowerCase() === liveMatch.away.name.toLowerCase()),
      )
    : undefined;
  const goPrev = () => setPlayerIdx((i) => (i - 1 + filteredPlayers.length) % filteredPlayers.length);
  const goNext = () => setPlayerIdx((i) => (i + 1) % filteredPlayers.length);
  useEffect(() => { setPlayerIdx(0); }, [playerFilter, allPlayers.length]);

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

        <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest backdrop-blur-md ${liveMatch ? "border-primary/50 bg-primary/10" : "border-border bg-background/40"}`}>
          <span className="relative flex size-2">
            {liveMatch && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />}
            <span className={`relative inline-flex rounded-full size-2 ${liveMatch ? "bg-primary" : "bg-success"}`} />
          </span>
          <span className={liveMatch ? "text-primary font-bold" : "text-muted-foreground font-bold"}>
            {liveMatch ? t.liveBadge : t.noLiveTitle}
          </span>
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
          {[...liveMicro, ...liveMicro].map((n, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-primary animate-[pulseRed_1.5s_infinite]" />
              {n}
            </span>
          ))}
        </div>
      </div>

      <motion.header {...fade(0)} className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-baseline gap-6 border-b-2 border-foreground/60 pb-8 mb-12">
        <div className="space-y-1">
          <h1 className={`text-5xl md:text-7xl tracking-tight shine-text leading-relaxed break-words overflow-visible ${isHe ? "font-hebrew italic font-semibold" : "font-display italic"}`}>{t.title}</h1>
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
              {liveMicro.map((n, i) => (
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
              {liveOdds.map((o, i) => (
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
                    {o.label}
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
              {livePeace.map((p) => (
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

          {current ? (
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
                    #{pad(current._rank)} // {current.country}{current.role ? ` · ${current.role}` : ""}
                  </p>
                  <h3 className="text-2xl font-display italic">{current.name}</h3>
                  <p className="text-sm mt-2 max-w-[36ch] text-pretty text-muted-foreground">
                    {current.blurb}
                  </p>
                  {current.socialTeaser && (
                    <a
                      href={current.socialUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block max-w-[38ch] text-[11px] italic text-primary/90 hover:text-primary transition-colors border-l-2 border-primary/50 pl-3 rtl:pl-0 rtl:pr-3 rtl:border-l-0 rtl:border-r-2"
                    >
                      <span className="font-mono not-italic text-[9px] uppercase tracking-widest mr-2 rtl:mr-0 rtl:ml-2 opacity-70">{t.socialsLabel}</span>
                      {current.socialTeaser} ↗
                    </a>
                  )}
                </div>
                <div className="text-right rtl:text-left shrink-0">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">{t.hotness}</p>
                  <p className="text-4xl font-extrabold tracking-tighter italic shine-text">{current.score}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="min-h-[420px] border border-border rounded-sm bg-surface/30 flex items-center justify-center p-8 text-center">
              <p className="max-w-[30ch] text-sm italic text-muted-foreground">
                Live player photos are loading from verified sources. No placeholders, no scenery, no fake hotties.
              </p>
            </div>
          )}

          {/* Carousel controls */}
          {filteredPlayers.length > 0 && <div className="mt-6 flex items-center justify-between gap-4">
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
          </div>}

          {/* Thumbnail rail */}
          {filteredPlayers.length > 0 && <div className="mt-6 grid grid-cols-4 gap-2">
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
          </div>}
        </motion.div>

        {/* RIGHT: fixtures + tip */}
        <motion.div {...fade(0.45)} className="md:col-span-3 space-y-12">
          {/* Live match — only renders when there IS a live match on ESPN */}
          {liveMatch ? (
            <motion.a
              href={liveMatch.espnUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="block relative overflow-hidden rounded-sm border border-primary/40 bg-gradient-to-br from-primary/10 via-background/40 to-background/40 backdrop-blur-md p-5 shadow-[0_0_50px_-15px_var(--primary)] hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                    {t.liveBadge} · {liveMatch.competition}
                  </span>
                </div>
                <span className="font-mono text-[10px] tabular-nums text-primary">
                  {liveMatch.minute ?? liveMatch.detail}
                </span>
              </div>

              <div dir="ltr" className="flex items-center justify-between gap-2 mb-5">
                <div className="text-center flex-1">
                  {liveMatch.home.logo && (
                    <img src={liveMatch.home.logo} alt="" className="w-8 h-8 mx-auto mb-1 object-contain" />
                  )}
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">{liveMatch.home.abbr}</p>
                  <motion.p
                    key={liveMatch.home.score}
                    initial={{ scale: 1.4, color: "var(--primary)" }}
                    animate={{ scale: 1, color: "var(--foreground)" }}
                    transition={{ duration: 0.4 }}
                    className="text-4xl font-extrabold tabular-nums"
                  >
                    {liveMatch.home.score || "0"}
                  </motion.p>
                </div>
                <span className="font-display text-2xl italic text-muted-foreground">—</span>
                <div className="text-center flex-1">
                  {liveMatch.away.logo && (
                    <img src={liveMatch.away.logo} alt="" className="w-8 h-8 mx-auto mb-1 object-contain" />
                  )}
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">{liveMatch.away.abbr}</p>
                  <motion.p
                    key={liveMatch.away.score}
                    initial={{ scale: 1.4, color: "var(--primary)" }}
                    animate={{ scale: 1, color: "var(--foreground)" }}
                    transition={{ duration: 0.4 }}
                    className="text-4xl font-extrabold tabular-nums"
                  >
                    {liveMatch.away.score || "0"}
                  </motion.p>
                </div>
              </div>

              <p className="text-[11px] text-center text-muted-foreground italic">
                {liveMatch.home.name} vs {liveMatch.away.name}
                {liveMatch.venue && <span className="block opacity-70 not-italic mt-1">@ {liveMatch.venue}</span>}
              </p>

              <p className="mt-4 pt-3 border-t border-border/60 text-[11px] italic text-muted-foreground">
                {t.liveVerdict}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-primary/70 tabular-nums flex justify-between">
                <span>{t.liveDataFrom}</span>
                <span>{t.updated} {t.secondsAgo(liveAgo)}</span>
              </p>
            </motion.a>
          ) : (
            <motion.section
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-sm border border-border bg-surface/40 backdrop-blur-md p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.noLiveTitle}
                </span>
                <span className="size-2 rounded-full bg-success" />
              </div>
              <p className="text-sm italic text-muted-foreground mb-4">{t.noLiveBody}</p>
              {nextMatch && (
                <div className="pt-3 border-t border-border/60">
                  <p className="font-mono text-[9px] uppercase text-primary/80 mb-1">{t.nextKickoff}</p>
                  <p className="text-sm font-bold">
                    {nextMatch.home.abbr} vs {nextMatch.away.abbr}
                  </p>
                  <p className="font-mono text-[10px] tabular-nums text-muted-foreground mt-0.5">
                    {fmtKickoff(nextMatch.kickoffISO, lang)} · {nextMatch.competition}
                  </p>
                </div>
              )}
              <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70 tabular-nums flex justify-between">
                <span>{t.liveDataFrom}</span>
                <span>{t.updated} {t.secondsAgo(liveAgo)}</span>
              </p>
            </motion.section>
          )}

          {/* Live Hottie On The Pitch — only when a match is LIVE AND we have
              a real player from one of the two teams currently on the pitch. */}
          {liveMatch && livePlayingHottie && livePlayingHottie.imageUrl && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative overflow-hidden rounded-sm border border-primary/40 bg-gradient-to-b from-background/40 to-primary/5 backdrop-blur-md shadow-[0_0_50px_-20px_var(--primary)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={livePlayingHottie.imageUrl}
                alt={livePlayingHottie.name}
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
                <h3 className="font-display italic text-2xl leading-none">
                  {livePlayingHottie?.name ?? t.liveHottie.name}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  {livePlayingHottie
                    ? `${livePlayingHottie.country} · ${livePlayingHottie.role} · ${livePlayingHottie.match}`
                    : t.liveHottie.meta}
                </p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm italic text-pretty">
                {livePlayingHottie
                  ? (isHe ? livePlayingHottie.blurb_he : livePlayingHottie.blurb)
                  : t.liveHottie.tagline}
              </p>

              {livePlayingHottie && (
                <a
                  href={livePlayingHottie.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-sm border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold mb-1">
                    {t.socialsLabel} ↗
                  </p>
                  <p className="text-xs italic text-pretty">
                    {isHe ? livePlayingHottie.socialTeaser_he : livePlayingHottie.socialTeaser}
                  </p>
                </a>
              )}

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
          )}

        </motion.div>

        {/* Full-width row: Survival Tips + Fake Conversation Kit side by side */}
        <div className="md:col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-primary rounded-sm bg-primary/5 shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
            >
              <p className="font-mono text-[10px] uppercase text-primary font-bold mb-2">
                {liveProTip1.label}
              </p>
              <p className="text-sm leading-snug font-medium italic">
                {liveProTip1.text}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-primary/70 rounded-sm bg-primary/5 shadow-[0_0_40px_-10px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
            >
              <p className="font-mono text-[10px] uppercase text-primary font-bold mb-2">
                {liveProTip2.label}
              </p>
              <p className="text-sm leading-snug font-medium italic">
                {liveProTip2.text}
              </p>
            </motion.div>

            <div className="p-6 border border-border rounded-sm bg-surface/40 backdrop-blur-sm">
              <p className="font-mono text-[10px] uppercase text-muted-foreground font-bold mb-2">
                {t.fakeKit}
              </p>
              <ul className="text-xs space-y-2 text-muted-foreground">
                {liveFake.map((f, i) => (
                  <li key={i} className="hover:text-primary transition-colors cursor-default">&mdash; {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Full-width horizontal row: Optimal Viewing — REAL fixtures from ESPN */}
        <div className="md:col-span-12">
          <section>
            <div className="flex items-baseline justify-between border-b border-border pb-2 mb-6">
              <h2 className="font-mono text-[11px] uppercase tracking-widest">
                {t.fixturesTitle}
              </h2>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {t.liveDataFrom} · {t.updated} {t.secondsAgo(liveAgo)}
              </span>
            </div>
            {liveData && liveData.upcoming.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">{t.noFixtures}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(liveData?.upcoming ?? []).slice(0, 6).map((f, i) => (
                  <motion.a
                    key={f.id}
                    href={f.espnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
                    className="block space-y-3 group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] uppercase bg-foreground text-background px-1.5 py-0.5 tabular-nums">
                        {fmtKickoff(f.kickoffISO, lang)}
                      </span>
                      <span className="text-[10px] text-primary font-bold uppercase">
                        {relativeWhen(f.kickoffISO, lang)}
                      </span>
                    </div>
                    <p className="font-bold text-lg leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors">
                      {f.home.shortName} <span className="opacity-40">vs</span> {f.away.shortName}
                    </p>
                    <div className="p-3 bg-muted/60 backdrop-blur-sm rounded-sm border border-border/60">
                      <p className="text-[10px] font-bold uppercase mb-1 text-primary">
                        {f.competition}
                      </p>
                      <p className="text-xs leading-relaxed italic text-muted-foreground">
                        {f.venue ? `@ ${f.venue}` : f.detail}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ================ LIVE BETTING INTEL + JUICY NEWS ================ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-7xl mx-auto mt-24"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-foreground/60 pb-6 mb-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold mb-2 inline-flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-primary" />
              </span>
              {intel?.polymarketOnline ? t.polymarketOn : t.polymarketOff}
            </p>
            <h2 className={`text-4xl md:text-5xl tracking-tight shine-text leading-tight ${isHe ? "font-hebrew italic font-semibold" : "font-display italic"}`}>
              {t.intelTitle}
            </h2>
            <p className="text-sm text-muted-foreground italic mt-1">{t.intelSub}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right rtl:text-left">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {t.totalWagered}
              </p>
              <p className="font-display italic text-2xl tabular-nums text-primary">
                {intel ? `$${(intel.totalWageredUsd / 1_000_000).toFixed(2)}M` : "—"}
              </p>
            </div>
            <button
              onClick={() => intelQuery.refetch()}
              disabled={intelQuery.isFetching}
              className="font-mono text-[10px] uppercase tracking-widest border border-primary/50 hover:bg-primary hover:text-primary-foreground rounded-full px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {intelQuery.isFetching ? t.fetchingLabel : `↻ ${t.refreshLabel}`}
            </button>
          </div>
        </div>

        {/* Juicy Drops */}
        <div className="mt-14 mb-14">
          <div className="flex items-baseline justify-between border-b border-border pb-3 mb-6">
            <h3 className="font-mono text-[11px] uppercase tracking-widest">{t.dropsTitle}</h3>
            <p className="text-[10px] italic text-muted-foreground">
              {intel ? `${t.lastFetchedLabel} · ${t.secondsAgo(intelAgo)}` : t.dropsSub}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(intel?.drops ?? []).map((d, i) => {
              const headline = isHe ? d.headline_he : d.headline;
              return (
                <motion.a
                  href={d.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={`${headline}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
                  className="group relative block p-4 rounded-sm border border-border bg-surface/50 backdrop-blur-md hover:bg-surface/80 hover:-translate-y-1 transition-all min-w-0"
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold">
                    {d.tag}
                  </span>
                  <p className="mt-2 text-sm leading-snug font-medium text-pretty break-words min-h-[4.5rem]">
                    {headline}
                  </p>
                  <div className="mt-3 pt-2 border-t border-border/60 flex justify-between items-center gap-2 font-mono text-[9px] uppercase text-muted-foreground tabular-nums min-w-0">
                    <span className="italic truncate group-hover:text-primary transition-colors">{d.source} ↗</span>
                    <span className="whitespace-nowrap">{t.minutesAgoLabel(d.minutesAgo)}</span>
                  </div>
                </motion.a>
              );
            })}
            {!intel && intelQuery.isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-36 rounded-sm border border-border bg-surface/40 animate-pulse" />
              ))
            )}
          </div>
        </div>

        {/* Gossip Column — fashion hits, misses, chaos */}
        <div className="mt-14 mb-14">
          <div className="flex items-baseline justify-between border-b border-border pb-3 mb-6 gap-4 flex-wrap">
            <div>
              <h3 className={`text-2xl md:text-3xl tracking-tight shine-text ${isHe ? "font-hebrew italic font-semibold" : "font-display italic"}`}>
                {t.gossipTitle}
              </h3>
              <p className="text-[11px] italic text-muted-foreground mt-1">{t.gossipSub}</p>
            </div>
            <p className="text-[10px] italic text-muted-foreground">
              {intel ? `${t.lastFetchedLabel} · ${t.secondsAgo(intelAgo)}` : t.fetchingLabel}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(intel?.gossip ?? []).map((it, i) => {
              const headline = isHe ? it.headline_he : it.headline;
              const caption = isHe ? it.caption_he : it.caption;
              const verdictLabel =
                it.verdict === "HIT" ? t.verdictHit : it.verdict === "MISS" ? t.verdictMiss : t.verdictChaos;
              const verdictClass =
                it.verdict === "HIT"
                  ? "bg-success/15 text-success ring-success/40"
                  : it.verdict === "MISS"
                  ? "bg-primary/15 text-primary ring-primary/40"
                  : "bg-foreground/10 text-foreground ring-foreground/30";
              return (
                <motion.a
                  href={it.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={`${it.imageSeed}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.55 }}
                  className="group relative block rounded-sm overflow-hidden border border-border bg-surface/60 backdrop-blur-md hover:-translate-y-1 hover:border-primary/50 transition-all"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.player}
                        loading="lazy"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-surface to-background">
                        <span className="font-mono text-4xl font-bold text-primary/60 tracking-widest">
                          {it.player
                            .split(" ")
                            .map((s) => s[0])
                            .join("")
                            .slice(0, 3)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <span className={`absolute top-3 left-3 rtl:left-auto rtl:right-3 font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-full ring-1 ${verdictClass}`}>
                      {verdictLabel}
                    </span>
                    <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 font-mono text-[8px] uppercase tracking-widest bg-background/60 backdrop-blur-sm px-2 py-1 rounded-full opacity-70">
                      {t.editorialNote}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-primary/90 font-bold">
                        {it.player} · {it.country}
                      </p>
                      <p className="text-sm font-bold leading-snug mt-1 text-pretty break-words">
                        {headline}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs italic text-muted-foreground leading-relaxed break-words">
                      &mdash; {caption}
                    </p>
                    <div className="flex justify-between items-center gap-2 pt-2 border-t border-border/60 font-mono text-[9px] uppercase tabular-nums text-muted-foreground">
                      <span className="italic truncate group-hover:text-primary transition-colors">
                        {it.source} ↗
                      </span>
                      <span className="whitespace-nowrap">{t.minutesAgoLabel(it.minutesAgo)}</span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
            {!intel && intelQuery.isLoading && (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-sm border border-border bg-surface/40 animate-pulse" />
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Prediction Markets */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-[11px] uppercase tracking-widest">
                {t.marketsTitle}
              </h3>
              <p className="text-[10px] italic text-muted-foreground">{t.marketsSub}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(intel?.markets ?? []).map((m, i) => {
                const q = isHe ? m.question_he : m.question;
                const opt = isHe ? m.topOption_he : m.topOption;
                const take = isHe ? m.take_he : m.take;
                return (
                  <motion.a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`${q}-${i}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="group relative block p-5 rounded-sm border border-border bg-surface/60 backdrop-blur-md hover:border-primary/50 transition-colors overflow-hidden min-w-0"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.pricePct}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-gradient-to-r from-primary via-primary to-foreground"
                      />
                    </div>
                    <p className="text-sm font-bold leading-snug text-pretty break-words hyphens-auto min-h-[2.5rem] pr-6 rtl:pr-0 rtl:pl-6">{q}</p>
                    <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                    <div className="mt-4 flex items-end justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] uppercase text-muted-foreground">
                          {t.priceLabel} · {opt}
                        </p>
                        <p className="text-3xl font-extrabold tabular-nums italic shine-text leading-none mt-1">
                          {m.pricePct}¢
                        </p>
                      </div>
                      <div className="text-right rtl:text-left">
                        <p className="font-mono text-[9px] uppercase text-muted-foreground">
                          {t.volumeLabel}
                        </p>
                        <p className="font-mono text-xs tabular-nums">
                          ${m.volumeUsd >= 1_000_000
                            ? `${(m.volumeUsd / 1_000_000).toFixed(2)}M`
                            : `${Math.round(m.volumeUsd / 1000)}k`}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 pt-3 border-t border-border/60 text-[11px] italic text-muted-foreground leading-relaxed break-words">
                      &mdash; {take}
                    </p>
                  </motion.a>
                );
              })}
              {!intel && intelQuery.isLoading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-sm border border-border bg-surface/40 animate-pulse" />
                ))
              )}
            </div>
          </div>

          {/* Biggest Winners */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-[11px] uppercase tracking-widest">
                {t.winnersTitle}
              </h3>
              <p className="text-[10px] italic text-muted-foreground">{t.winnersSub}</p>
            </div>
            <div className="space-y-3">
              {(intel?.winners ?? []).map((w, i) => {
                const wager = isHe ? w.wager_he : w.wager;
                const vibe = isHe ? w.vibe_he : w.vibe;
                return (
                  <motion.a
                    href={w.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`${w.handle}-${i}`}
                    initial={{ opacity: 0, x: isHe ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.55 }}
                    className="relative block p-4 rounded-sm border border-border hover:border-primary/50 bg-gradient-to-br from-surface/70 to-surface/20 backdrop-blur-md group transition-colors min-w-0"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2 min-w-0 pr-6 rtl:pr-0 rtl:pl-6">
                      <span className="font-mono text-xs font-bold text-primary group-hover:text-foreground transition-colors truncate">
                        {w.handle}
                      </span>
                      <span className="font-display italic text-2xl tabular-nums text-foreground whitespace-nowrap">
                        +${w.amountUsd >= 1_000_000
                          ? `${(w.amountUsd / 1_000_000).toFixed(2)}M`
                          : `${Math.round(w.amountUsd / 1000)}k`}
                      </span>
                    </div>
                    <p className="text-xs leading-snug break-words">{wager}</p>
                    <p className="mt-2 text-[10px] italic text-muted-foreground border-t border-border/50 pt-2 break-words">
                      &mdash; {vibe}
                    </p>
                    <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 font-mono text-[9px] tabular-nums text-muted-foreground opacity-60 group-hover:opacity-100">
                      #{pad(i + 1)} ↗
                    </span>
                  </motion.a>
                );
              })}
              {!intel && intelQuery.isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-sm border border-border bg-surface/40 animate-pulse" />
                ))
              )}
            </div>
          </div>
        </div>

      </motion.section>

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
