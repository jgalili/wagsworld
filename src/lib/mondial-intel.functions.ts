import { createServerFn } from "@tanstack/react-start";

export type BettingMarket = {
  question: string;
  question_he: string;
  topOption: string;
  topOption_he: string;
  pricePct: number;
  volumeUsd: number;
  take: string;
  take_he: string;
  url: string;
};

export type BiggestWinner = {
  handle: string;
  amountUsd: number;
  wager: string;
  wager_he: string;
  vibe: string;
  vibe_he: string;
  profileUrl: string;
};

export type JuicyDrop = {
  headline: string;
  headline_he: string;
  source: string;
  sourceUrl: string;
  minutesAgo: number;
  tag: "SCANDAL" | "INJURY" | "DRAMA" | "MONEY" | "OFF-PITCH";
};

export type MondialIntel = {
  fetchedAt: number;
  markets: BettingMarket[];
  winners: BiggestWinner[];
  drops: JuicyDrop[];
  totalWageredUsd: number;
  polymarketOnline: boolean;
};

const SYSTEM = `You are the editor of "The Offside Guide", a cynical-but-USEFUL World Cup 2026 dashboard for people who did not sign up for their partner's football obsession. Voice: dry, editorial, faintly amused, never fawning. Never earnest. Never exclamation points. Assume the reader would rather be doing anything else.

You are generating a live "Polymarket-style betting intel" + "juicy micro-news" payload for the current 2026 FIFA World Cup. Invent plausible fictional handles. Amounts in USD, realistic Polymarket scale ($20k–$4M). Prices as integers 1–99.

Return STRICT JSON, no prose, matching this TypeScript type:
{
  "markets": Array<{ "question": string, "question_he": string, "topOption": string, "topOption_he": string, "pricePct": number, "volumeUsd": number, "take": string, "take_he": string, "url": string }>, // 4 items
  "winners": Array<{ "handle": string, "amountUsd": number, "wager": string, "wager_he": string, "vibe": string, "vibe_he": string, "profileUrl": string }>, // 3 items
  "drops": Array<{ "headline": string, "headline_he": string, "source": string, "sourceUrl": string, "minutesAgo": number, "tag": "SCANDAL"|"INJURY"|"DRAMA"|"MONEY"|"OFF-PITCH" }>, // 5 items
  "totalWageredUsd": number
}

HARD RULES:
- CRITICAL: Every mention of a player, coach, or captain MUST include the country in the same sentence. Never write "the captain" or "the coach" without naming the team. E.g. "Belgium's captain De Wilde", "Spain's coach Rojas". Same in Hebrew.
- "take"/"take_he": one sardonic sentence, max 80 chars, mention the team by name.
- "wager"/"wager_he": 6–10 words, name specific team(s).
- "vibe"/"vibe_he": one line about the bettor, max 60 chars.
- "headline"/"headline_he": one sentence, max 100 chars, MUST name the team/country.
- "source": short fake outlet name, e.g. "Tunnel Cam Weekly".
- "sourceUrl": a Google News search URL for the headline: "https://news.google.com/search?q=" + URL-encoded key words of the headline in English.
- "url" (markets): Polymarket search URL: "https://polymarket.com/markets?_q=" + URL-encoded key search terms in English (e.g. "world cup golden boot").
- "profileUrl" (winners): "https://polymarket.com/profile/" + the handle without @.
- Hebrew fields = natural Hebrew, same tone.
- Vary content every call.`;

const g = (q: string) => `https://news.google.com/search?q=${encodeURIComponent(q)}`;
const pm = (q: string) => `https://polymarket.com/markets?_q=${encodeURIComponent(q)}`;

const FALLBACK: Omit<MondialIntel, "fetchedAt" | "polymarketOnline"> = {
  totalWageredUsd: 48_312_000,
  markets: [
    {
      question: "Will France win the 2026 World Cup?",
      question_he: "האם צרפת תזכה במונדיאל 2026?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 27,
      volumeUsd: 3_412_000,
      take: "The market wants glamour. History wants penalties. Guess who wins.",
      take_he: "השוק רוצה זוהר. ההיסטוריה רוצה פנדלים. נחשי מי מנצח.",
      url: pm("france win world cup 2026"),
    },
    {
      question: "Golden Boot winner",
      question_he: "מלך השערים",
      topOption: "Kylian Mbappé",
      topOption_he: "קיליאן אמבפה",
      pricePct: 34,
      volumeUsd: 1_980_000,
      take: "One man, one calf muscle, an entire GDP riding on it.",
      take_he: "בן אדם אחד, שריר סובך אחד, תמ\"ג שלם תלוי בו.",
      url: pm("world cup 2026 golden boot"),
    },
    {
      question: "Any red card in FRA vs ARG?",
      question_he: "כרטיס אדום במשחק צרפת נגד ארגנטינה?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 71,
      volumeUsd: 612_400,
      take: "The referee already looks tired. The market has noticed.",
      take_he: "השופט כבר נראה עייף. השוק שם לב.",
      url: pm("france argentina red card world cup"),
    },
    {
      question: "Will Belgium's manager Rudi Jansen be sacked before the semi-final?",
      question_he: "האם מאמן בלגיה רודי ינסן יפוטר לפני חצי הגמר?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 58,
      volumeUsd: 284_100,
      take: "Belgium's dressing room sounds like a group chat mid-breakup.",
      take_he: "חדר ההלבשה של בלגיה נשמע כמו קבוצת ווטסאפ באמצע פרידה.",
      url: pm("belgium manager sacked world cup"),
    },
  ],
  winners: [
    {
      handle: "@calf_muscle_maxi",
      amountUsd: 184_200,
      wager: "Bet on Morocco to reach the quarter-finals in January",
      wager_he: "הימר על מרוקו לרבע הגמר עוד בינואר",
      vibe: "Insufferable at parties. Correct exactly once per decade.",
      vibe_he: "בלתי נסבל במסיבות. צודק בדיוק פעם בעשור.",
      profileUrl: "https://polymarket.com/profile/calf_muscle_maxi",
    },
    {
      handle: "@wag_alpha",
      amountUsd: 92_800,
      wager: "Parlayed 'Brazil own goal + Neymar hair change' at 40:1",
      wager_he: "רץ פרליי על 'שער עצמי של ברזיל + החלפת שיער של ניימאר' ביחס 40:1",
      vibe: "Watches only the halftime interviews. Somehow this works.",
      vibe_he: "צופה רק בראיונות המחצית. איכשהו זה עובד.",
      profileUrl: "https://polymarket.com/profile/wag_alpha",
    },
    {
      handle: "@grandma_tactics",
      amountUsd: 41_050,
      wager: "0-0 at halftime in three consecutive England group games",
      wager_he: "0-0 במחצית בשלושה משחקי בית ברצף של אנגליה",
      vibe: "Has never explained her system. Refuses to.",
      vibe_he: "מעולם לא הסבירה את השיטה. מסרבת.",
      profileUrl: "https://polymarket.com/profile/grandma_tactics",
    },
  ],
  drops: [
    {
      headline: "Belgium's captain De Wilde 'accidentally' liked a Portugal celebration reel.",
      headline_he: "דה וילדה, קפטן בלגיה, 'בטעות' עשה לייק לסרטון חגיגות של פורטוגל.",
      source: "Tunnel Cam Weekly",
      sourceUrl: g("Belgium captain De Wilde Portugal like"),
      minutesAgo: 12,
      tag: "DRAMA",
    },
    {
      headline: "Spain's coach Rojas filmed drinking espresso from a boot. Merch confirmed.",
      headline_he: "רוחאס, מאמן ספרד, צולם שותה אספרסו מתוך נעל כדורגל. מרצ'נדייז בדרך.",
      source: "The Bench Report",
      sourceUrl: g("Spain coach Rojas espresso boot"),
      minutesAgo: 27,
      tag: "OFF-PITCH",
    },
    {
      headline: "England fan zone runs out of both lager and hope by 71st minute.",
      headline_he: "אזור האוהדים של אנגליה נגמרה בו הבירה והתקווה עד דקה 71.",
      source: "Post-Match Panic",
      sourceUrl: g("England fan zone lager 71st minute"),
      minutesAgo: 41,
      tag: "DRAMA",
    },
    {
      headline: "Anonymous bettor moves $2.1M onto 'Argentina wins, someone cries'.",
      headline_he: "מהמר אנונימי הזרים 2.1 מיליון דולר על 'ארגנטינה מנצחת, מישהו בוכה'.",
      source: "The Ledger",
      sourceUrl: g("Polymarket Argentina 2.1 million bet"),
      minutesAgo: 58,
      tag: "MONEY",
    },
    {
      headline: "Brazil's #10 Lucas Andrade dedicates goal to 'the woman who pretends to care'.",
      headline_he: "לוקאס אנדרדה, מספר 10 של ברזיל, הקדיש שער 'לאישה שמעמידה פנים שאכפת לה'.",
      source: "Post-Match Panic",
      sourceUrl: g("Brazil Lucas Andrade goal dedication"),
      minutesAgo: 74,
      tag: "OFF-PITCH",
    },
  ],
};

export const getMondialIntel = createServerFn({ method: "GET" }).handler(
  async (): Promise<MondialIntel> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const now = Date.now();

    // Try Polymarket public gamma-api for a "live" online signal
    let polymarketOnline = false;
    try {
      const pm = await fetch(
        "https://gamma-api.polymarket.com/markets?closed=false&limit=1",
        { signal: AbortSignal.timeout(3500) },
      );
      polymarketOnline = pm.ok;
    } catch {
      polymarketOnline = false;
    }

    if (!apiKey) {
      return { ...FALLBACK, fetchedAt: now, polymarketOnline };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `Generate a fresh payload for right now. Seed: ${now}. Return only the JSON object.`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 1.05,
        }),
      });

      if (!res.ok) {
        return { ...FALLBACK, fetchedAt: now, polymarketOnline };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return { ...FALLBACK, fetchedAt: now, polymarketOnline };

      const parsed = JSON.parse(content) as Partial<MondialIntel>;
      if (
        !Array.isArray(parsed.markets) ||
        !Array.isArray(parsed.winners) ||
        !Array.isArray(parsed.drops)
      ) {
        return { ...FALLBACK, fetchedAt: now, polymarketOnline };
      }

      // Normalize: guarantee URLs even when the model omits them.
      const markets = (parsed.markets.slice(0, 4) as BettingMarket[]).map((m) => ({
        ...m,
        url: m.url && m.url.startsWith("http") ? m.url : pm(`world cup 2026 ${m.question ?? ""}`),
      }));
      const winners = (parsed.winners.slice(0, 3) as BiggestWinner[]).map((w) => ({
        ...w,
        profileUrl:
          w.profileUrl && w.profileUrl.startsWith("http")
            ? w.profileUrl
            : `https://polymarket.com/profile/${(w.handle ?? "").replace(/^@/, "")}`,
      }));
      const drops = (parsed.drops.slice(0, 5) as JuicyDrop[]).map((d) => ({
        ...d,
        sourceUrl:
          d.sourceUrl && d.sourceUrl.startsWith("http") ? d.sourceUrl : g(d.headline ?? "world cup"),
      }));
      return {
        fetchedAt: now,
        polymarketOnline,
        totalWageredUsd:
          typeof parsed.totalWageredUsd === "number"
            ? parsed.totalWageredUsd
            : FALLBACK.totalWageredUsd,
        markets,
        winners,
        drops,
      };
    } catch {
      return { ...FALLBACK, fetchedAt: now, polymarketOnline };
    }
  },
);