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
};

export type BiggestWinner = {
  handle: string;
  amountUsd: number;
  wager: string;
  wager_he: string;
  vibe: string;
  vibe_he: string;
};

export type JuicyDrop = {
  headline: string;
  headline_he: string;
  source: string;
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

const SYSTEM = `You are the editor of "The Offside Guide", a cynical-but-USEFUL World Cup 2026 dashboard for people who did not sign up for their partner's football obsession. Voice: dry, editorial, faintly amused, never fawning. Think Vogue meets a divorce lawyer. Never earnest. Never use exclamation points. Never say "exciting". Always assume the reader would rather be doing literally anything else.

You are generating a live "Polymarket-style betting intel" + "juicy micro-news" payload for the current moment of the 2026 FIFA World Cup. Invent plausible but clearly fictional player/handle names — nothing defamatory about real people. Amounts in USD, realistic Polymarket scale ($20k–$4M volumes). Prices as integers 1–99.

Return STRICT JSON, no prose, matching exactly this TypeScript type:
{
  "markets": Array<{ "question": string, "question_he": string, "topOption": string, "topOption_he": string, "pricePct": number, "volumeUsd": number, "take": string, "take_he": string }>, // 4 items
  "winners": Array<{ "handle": string, "amountUsd": number, "wager": string, "wager_he": string, "vibe": string, "vibe_he": string }>, // 3 items
  "drops": Array<{ "headline": string, "headline_he": string, "source": string, "minutesAgo": number, "tag": "SCANDAL"|"INJURY"|"DRAMA"|"MONEY"|"OFF-PITCH" }>, // 5 items
  "totalWageredUsd": number
}

Rules:
- "take" / "take_he": one short sardonic sentence (max 90 chars) explaining why the market is what it is.
- "wager" / "wager_he": what they bet on, in 6–10 words.
- "vibe" / "vibe_he": one-line cynical character note about the bettor (max 70 chars).
- "headline" / "headline_he": one juicy sentence (max 110 chars). Mix on-pitch drama, WAG gossip, coach meltdowns, fashion, tunnel-cam moments, betting scandals.
- "source": short fake outlet name, e.g. "Tunnel Cam Weekly", "The Bench Report".
- Hebrew fields must be natural Hebrew (not transliteration), same tone.
- Vary content every call. Do not repeat previous outputs.`;

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
    },
    {
      question: "Will a manager be sacked before the semi-final?",
      question_he: "האם מאמן יפוטר לפני חצי הגמר?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 58,
      volumeUsd: 284_100,
      take: "Belgium's dressing room sounds like a group chat mid-breakup.",
      take_he: "חדר ההלבשה של בלגיה נשמע כמו קבוצת ווטסאפ באמצע פרידה.",
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
    },
    {
      handle: "@wag_alpha",
      amountUsd: 92_800,
      wager: "Parlayed 'own goal + hair change' at 40:1",
      wager_he: "רץ פרליי על 'שער עצמי + החלפת שיער' ביחס 40:1",
      vibe: "Watches only the halftime interviews. Somehow this works.",
      vibe_he: "צופה רק בראיונות המחצית. איכשהו זה עובד.",
    },
    {
      handle: "@grandma_tactics",
      amountUsd: 41_050,
      wager: "0-0 at halftime in three consecutive group games",
      wager_he: "0-0 במחצית בשלושה משחקי בית ברצף",
      vibe: "Has never explained her system. Refuses to.",
      vibe_he: "מעולם לא הסבירה את השיטה. מסרבת.",
    },
  ],
  drops: [
    {
      headline: "Belgium's captain 'accidentally' liked a Portugal celebration reel.",
      headline_he: "קפטן בלגיה 'בטעות' עשה לייק לסרטון חגיגות של פורטוגל.",
      source: "Tunnel Cam Weekly",
      minutesAgo: 12,
      tag: "DRAMA",
    },
    {
      headline: "Spain's coach filmed drinking espresso from a boot. Merch confirmed.",
      headline_he: "מאמן ספרד צולם שותה אספרסו מתוך נעל כדורגל. פריטי מרצ'נדייז בדרך.",
      source: "The Bench Report",
      minutesAgo: 27,
      tag: "OFF-PITCH",
    },
    {
      headline: "England fan zone runs out of both lager and hope by 71st minute.",
      headline_he: "אזור האוהדים של אנגליה נגמרה בו הבירה והתקווה עד דקה 71.",
      source: "Post-Match Panic",
      minutesAgo: 41,
      tag: "DRAMA",
    },
    {
      headline: "Anonymous bettor moves $2.1M onto 'Argentina wins, someone cries'.",
      headline_he: "מהמר אנונימי הזרים 2.1 מיליון דולר על 'ארגנטינה מנצחת, מישהו בוכה'.",
      source: "The Ledger",
      minutesAgo: 58,
      tag: "MONEY",
    },
    {
      headline: "Brazil's #10 dedicates goal to 'the woman who pretends to care'.",
      headline_he: "מספר 10 של ברזיל הקדיש שער 'לאישה שמעמידה פנים שאכפת לה'.",
      source: "Post-Match Panic",
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

      return {
        fetchedAt: now,
        polymarketOnline,
        totalWageredUsd:
          typeof parsed.totalWageredUsd === "number"
            ? parsed.totalWageredUsd
            : FALLBACK.totalWageredUsd,
        markets: parsed.markets.slice(0, 4) as BettingMarket[],
        winners: parsed.winners.slice(0, 3) as BiggestWinner[],
        drops: parsed.drops.slice(0, 5) as JuicyDrop[],
      };
    } catch {
      return { ...FALLBACK, fetchedAt: now, polymarketOnline };
    }
  },
);